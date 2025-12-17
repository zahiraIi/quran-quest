"""
User profile endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.api.deps import get_current_user
from app.models import User, UserProgress
from app.schemas.user import UserResponse, UserUpdate, UserProgressResponse
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> dict:
    """Get the current user's profile."""
    return {
        "success": True,
        "data": UserResponse.model_validate(current_user),
    }


@router.patch("/me", response_model=ApiResponse[UserResponse])
async def update_current_user_profile(
    update_data: UserUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Update the current user's profile."""
    if update_data.display_name is not None:
        current_user.display_name = update_data.display_name
    if update_data.avatar_url is not None:
        current_user.avatar_url = update_data.avatar_url

    await db.commit()
    await db.refresh(current_user)

    return {
        "success": True,
        "data": UserResponse.model_validate(current_user),
    }


@router.get("/me/progress", response_model=ApiResponse[UserProgressResponse])
async def get_current_user_progress(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Get the current user's progress and stats."""
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == current_user.id)
    )
    progress = result.scalar_one_or_none()

    if not progress:
        # Create initial progress if missing
        progress = UserProgress(user_id=current_user.id)
        db.add(progress)
        await db.commit()
        await db.refresh(progress)

    return {
        "success": True,
        "data": UserProgressResponse(
            user_id=progress.user_id,
            level=progress.level,
            total_xp=progress.total_xp,
            current_streak=progress.current_streak,
            longest_streak=progress.longest_streak,
            streak_freezes=progress.streak_freezes,
            hearts=progress.hearts,
            max_hearts=progress.max_hearts,
            hearts_regen_at=progress.hearts_regen_at,
            league=progress.league.value,
            league_rank=progress.league_rank,
            lessons_completed=progress.lessons_completed,
            verses_memorized=progress.verses_memorized,
            total_recitation_time=progress.total_recitation_seconds,
        ),
    }


@router.get("/{user_id}", response_model=ApiResponse[UserResponse])
async def get_user_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Get another user's public profile."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "success": True,
        "data": UserResponse.model_validate(user),
    }

