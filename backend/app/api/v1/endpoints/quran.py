"""
Quran content endpoints.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db_session
from app.models import Surah, Ayah, Word
from app.schemas.recitation import SurahResponse, AyahResponse, AyahSimpleResponse, WordResponse
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("/surahs", response_model=ApiResponse[list[SurahResponse]])
async def get_all_surahs(
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Get all surahs (chapters) of the Quran.
    """
    result = await db.execute(select(Surah).order_by(Surah.id))
    surahs = result.scalars().all()

    return {
        "success": True,
        "data": [SurahResponse.model_validate(s) for s in surahs],
    }


@router.get("/surahs/{surah_id}", response_model=ApiResponse[SurahResponse])
async def get_surah(
    surah_id: int,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Get a specific surah by ID.
    """
    result = await db.execute(select(Surah).where(Surah.id == surah_id))
    surah = result.scalar_one_or_none()

    if not surah:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Surah not found",
        )

    return {
        "success": True,
        "data": SurahResponse.model_validate(surah),
    }


@router.get("/surahs/{surah_id}/ayahs", response_model=ApiResponse[list[AyahSimpleResponse]])
async def get_surah_ayahs(
    surah_id: int,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Get all ayahs (verses) for a specific surah.
    """
    result = await db.execute(
        select(Ayah)
        .where(Ayah.surah_id == surah_id)
        .order_by(Ayah.number_in_surah)
    )
    ayahs = result.scalars().all()

    if not ayahs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Surah not found or has no ayahs",
        )

    return {
        "success": True,
        "data": [AyahSimpleResponse.model_validate(a) for a in ayahs],
    }


@router.get("/ayahs/{ayah_id}", response_model=ApiResponse[AyahResponse])
async def get_ayah(
    ayah_id: int,
    include_words: bool = Query(True, description="Include word-by-word data"),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Get a specific ayah with optional word-by-word data.
    """
    query = select(Ayah).where(Ayah.id == ayah_id)

    if include_words:
        query = query.options(selectinload(Ayah.words))

    result = await db.execute(query)
    ayah = result.scalar_one_or_none()

    if not ayah:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ayah not found",
        )

    words = []
    if include_words and ayah.words:
        words = [
            WordResponse(
                id=w.id,
                ayah_id=w.ayah_id,
                position=w.position,
                text=w.text,
                transliteration=w.transliteration,
                translation=w.translation,
                audio_url=w.audio_url,
                start_time_ms=w.start_time_ms,
                end_time_ms=w.end_time_ms,
            )
            for w in sorted(ayah.words, key=lambda x: x.position)
        ]

    return {
        "success": True,
        "data": AyahResponse(
            id=ayah.id,
            surah_id=ayah.surah_id,
            number_in_surah=ayah.number_in_surah,
            text=ayah.text,
            text_uthmani=ayah.text_uthmani,
            translation_en=ayah.translation_en,
            transliteration=ayah.transliteration,
            audio_url=ayah.audio_url,
            words=words,
        ),
    }


@router.get("/search")
async def search_quran(
    query: str = Query(..., min_length=2, description="Search query"),
    language: str = Query("ar", description="Search language: ar, en"),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Search the Quran by text.
    """
    if language == "ar":
        # Search in Arabic text
        result = await db.execute(
            select(Ayah)
            .where(Ayah.text.ilike(f"%{query}%"))
            .limit(limit)
        )
    else:
        # Search in English translation
        result = await db.execute(
            select(Ayah)
            .where(Ayah.translation_en.ilike(f"%{query}%"))
            .limit(limit)
        )

    ayahs = result.scalars().all()

    return {
        "success": True,
        "data": [AyahSimpleResponse.model_validate(a) for a in ayahs],
        "meta": {"query": query, "language": language, "count": len(ayahs)},
    }

