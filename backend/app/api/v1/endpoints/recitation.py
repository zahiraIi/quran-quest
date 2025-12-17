"""
Recitation analysis endpoints.
"""

import os
import tempfile
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.api.deps import get_current_user
from app.models import User, Ayah, Word, RecitationResult, UserProgress, DailyXP
from app.schemas.recitation import (
    RecitationResultResponse,
    TranscriptionResponse,
    AccuracyAnalysisRequest,
    AccuracyAnalysisResponse,
    WordFeedback,
)
from app.schemas.common import ApiResponse
from app.services.recitation_service import (
    transcribe_audio,
    transcribe_audio_openai,
    analyze_recitation_accuracy,
    calculate_xp_reward,
)

router = APIRouter()


@router.post("/transcribe", response_model=ApiResponse[TranscriptionResponse])
async def transcribe_recitation(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Transcribe an audio recording of Quran recitation.

    Returns the transcribed Arabic text.
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an audio file",
        )

    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_path = temp_file.name

    try:
        # Transcribe audio
        result = await transcribe_audio(temp_path)

        return {
            "success": True,
            "data": TranscriptionResponse(
                transcription=result["transcription"],
                confidence=result["confidence"],
                word_timestamps=result.get("word_timestamps"),
            ),
        }
    except Exception as e:
        # Try OpenAI fallback
        try:
            result = await transcribe_audio_openai(temp_path)
            return {
                "success": True,
                "data": TranscriptionResponse(
                    transcription=result["transcription"],
                    confidence=result["confidence"],
                    word_timestamps=result.get("word_timestamps"),
                ),
            }
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Transcription failed: {str(e)}",
            )
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.unlink(temp_path)


@router.post("/analyze", response_model=ApiResponse[AccuracyAnalysisResponse])
async def analyze_accuracy(
    request: AccuracyAnalysisRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Analyze the accuracy of transcribed text against expected text.
    """
    result = analyze_recitation_accuracy(
        transcription=request.transcription,
        expected_text=request.expected_text,
    )

    feedback = [
        WordFeedback(
            word_index=f["word_index"],
            word=f["word"],
            expected=f["expected"],
            status=f["status"],
            suggestion=f.get("suggestion"),
        )
        for f in result["feedback"]
    ]

    return {
        "success": True,
        "data": AccuracyAnalysisResponse(
            accuracy=result["accuracy"],
            wer=result["wer"],
            feedback=feedback,
        ),
    }


@router.post("/submit", response_model=ApiResponse[RecitationResultResponse])
async def submit_recitation(
    file: UploadFile = File(...),
    ayah_id: int = Form(...),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Submit a recitation for analysis and XP reward.

    Transcribes the audio, analyzes accuracy, and awards XP.
    """
    # Get the ayah
    result = await db.execute(select(Ayah).where(Ayah.id == ayah_id))
    ayah = result.scalar_one_or_none()

    if not ayah:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ayah not found",
        )

    # Validate file type
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an audio file",
        )

    # Save uploaded file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_path = temp_file.name

    try:
        # Transcribe audio
        transcription_result = await transcribe_audio(temp_path)

        # Analyze accuracy
        accuracy_result = analyze_recitation_accuracy(
            transcription=transcription_result["transcription"],
            expected_text=ayah.text,
        )

        # Calculate XP
        # Estimate duration from file size (rough approximation)
        duration_seconds = len(content) // 4000  # ~4KB per second for m4a
        xp_earned = calculate_xp_reward(accuracy_result["accuracy"], duration_seconds)

        # TODO: Upload audio to S3 and get URL
        audio_url = f"local://{temp_path}"  # Placeholder

        # Create recitation result
        recitation = RecitationResult(
            user_id=current_user.id,
            ayah_id=ayah_id,
            audio_url=audio_url,
            duration_ms=duration_seconds * 1000,
            transcription=transcription_result["transcription"],
            expected_text=ayah.text,
            accuracy=accuracy_result["accuracy"],
            wer=accuracy_result["wer"],
            confidence=transcription_result["confidence"],
            feedback=accuracy_result["feedback"],
            xp_earned=xp_earned,
        )
        db.add(recitation)

        # Update user progress
        progress_result = await db.execute(
            select(UserProgress).where(UserProgress.user_id == current_user.id)
        )
        progress = progress_result.scalar_one_or_none()

        if progress:
            progress.total_xp += xp_earned
            progress.total_recitation_seconds += duration_seconds

            # Update daily XP
            today = datetime.now(timezone.utc).date()
            daily_result = await db.execute(
                select(DailyXP).where(
                    DailyXP.user_id == current_user.id,
                    DailyXP.date == today,
                )
            )
            daily_xp = daily_result.scalar_one_or_none()

            if daily_xp:
                daily_xp.xp_earned += xp_earned
                daily_xp.practice_xp += xp_earned
                if daily_xp.xp_earned >= daily_xp.goal_target:
                    daily_xp.goal_completed = True
            else:
                daily_xp = DailyXP(
                    user_id=current_user.id,
                    date=today,
                    xp_earned=xp_earned,
                    practice_xp=xp_earned,
                )
                db.add(daily_xp)

        await db.commit()
        await db.refresh(recitation)

        # Build response
        feedback = [
            WordFeedback(
                word_index=f["word_index"],
                word=f["word"],
                expected=f["expected"],
                status=f["status"],
                suggestion=f.get("suggestion"),
            )
            for f in accuracy_result["feedback"]
        ]

        return {
            "success": True,
            "data": RecitationResultResponse(
                id=recitation.id,
                user_id=recitation.user_id,
                ayah_id=recitation.ayah_id,
                audio_url=recitation.audio_url,
                transcription=recitation.transcription,
                expected_text=recitation.expected_text,
                accuracy=recitation.accuracy,
                wer=recitation.wer,
                feedback=feedback,
                xp_earned=recitation.xp_earned,
                duration_ms=recitation.duration_ms,
                created_at=recitation.created_at,
            ),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recitation submission failed: {str(e)}",
        )
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.unlink(temp_path)


@router.get("/history", response_model=ApiResponse[list[RecitationResultResponse]])
async def get_recitation_history(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Get user's recitation history.
    """
    result = await db.execute(
        select(RecitationResult)
        .where(RecitationResult.user_id == current_user.id)
        .order_by(RecitationResult.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    recitations = result.scalars().all()

    data = []
    for r in recitations:
        feedback = [
            WordFeedback(
                word_index=f["word_index"],
                word=f["word"],
                expected=f["expected"],
                status=f["status"],
                suggestion=f.get("suggestion"),
            )
            for f in (r.feedback or [])
        ]

        data.append(
            RecitationResultResponse(
                id=r.id,
                user_id=r.user_id,
                ayah_id=r.ayah_id,
                audio_url=r.audio_url,
                transcription=r.transcription,
                expected_text=r.expected_text,
                accuracy=r.accuracy,
                wer=r.wer,
                feedback=feedback,
                xp_earned=r.xp_earned,
                duration_ms=r.duration_ms,
                created_at=r.created_at,
            )
        )

    return {
        "success": True,
        "data": data,
        "meta": {"limit": limit, "offset": offset},
    }

