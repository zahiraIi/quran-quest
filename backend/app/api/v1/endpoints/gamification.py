"""
Gamification endpoints - XP, streaks, leaderboards, achievements.
"""

from datetime import datetime, timezone, date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.api.deps import get_current_user
from app.models import User, UserProgress, Achievement, UserAchievement, DailyXP, League
from app.schemas.common import ApiResponse
from pydantic import BaseModel

router = APIRouter()


class LeaderboardEntry(BaseModel):
    """Leaderboard entry schema."""

    rank: int
    user_id: str
    username: str
    display_name: str
    avatar_url: Optional[str]
    xp: int
    is_current_user: bool


class DailyGoalResponse(BaseModel):
    """Daily goal response schema."""

    target_xp: int
    current_xp: int
    completed: bool
    date: date


class AchievementResponse(BaseModel):
    """Achievement response schema."""

    id: str
    name: str
    description: str
    icon_url: str
    xp_reward: int
    unlocked_at: Optional[datetime]
    progress: int
    rarity: str


@router.get("/leaderboard", response_model=ApiResponse[list[LeaderboardEntry]])
async def get_leaderboard(
    league: Optional[str] = Query(None, description="Filter by league"),
    scope: str = Query("weekly", description="weekly or all_time"),
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Get the leaderboard for the current week or all time.
    """
    query = (
        select(
            UserProgress.user_id,
            UserProgress.weekly_xp if scope == "weekly" else UserProgress.total_xp,
            User.username,
            User.display_name,
            User.avatar_url,
        )
        .join(User, User.id == UserProgress.user_id)
        .where(User.is_active == True)
    )

    if league:
        try:
            league_enum = League(league)
            query = query.where(UserProgress.league == league_enum)
        except ValueError:
            pass

    xp_column = UserProgress.weekly_xp if scope == "weekly" else UserProgress.total_xp
    query = query.order_by(desc(xp_column)).limit(limit)

    result = await db.execute(query)
    rows = result.all()

    entries = []
    for rank, row in enumerate(rows, 1):
        entries.append(
            LeaderboardEntry(
                rank=rank,
                user_id=row[0],
                xp=row[1],
                username=row[2],
                display_name=row[3],
                avatar_url=row[4],
                is_current_user=row[0] == current_user.id,
            )
        )

    return {
        "success": True,
        "data": entries,
    }


@router.get("/daily-goal", response_model=ApiResponse[DailyGoalResponse])
async def get_daily_goal(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Get the current user's daily XP goal progress.
    """
    today = datetime.now(timezone.utc).date()

    result = await db.execute(
        select(DailyXP).where(
            DailyXP.user_id == current_user.id,
            DailyXP.date == today,
        )
    )
    daily_xp = result.scalar_one_or_none()

    if daily_xp:
        return {
            "success": True,
            "data": DailyGoalResponse(
                target_xp=daily_xp.goal_target,
                current_xp=daily_xp.xp_earned,
                completed=daily_xp.goal_completed,
                date=daily_xp.date,
            ),
        }
    else:
        return {
            "success": True,
            "data": DailyGoalResponse(
                target_xp=50,  # Default daily goal
                current_xp=0,
                completed=False,
                date=today,
            ),
        }


@router.get("/achievements", response_model=ApiResponse[list[AchievementResponse]])
async def get_achievements(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Get all achievements with user's unlock status.
    """
    # Get all achievements
    result = await db.execute(
        select(Achievement).where(Achievement.is_hidden == False)
    )
    all_achievements = result.scalars().all()

    # Get user's unlocked achievements
    result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == current_user.id)
    )
    user_achievements = {ua.achievement_id: ua for ua in result.scalars().all()}

    # Get user progress for calculating achievement progress
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == current_user.id)
    )
    progress = result.scalar_one_or_none()

    achievements_list = []
    for achievement in all_achievements:
        user_achievement = user_achievements.get(achievement.id)

        # Calculate progress based on requirement type
        achievement_progress = 0
        if progress:
            if achievement.requirement_type == "streak":
                achievement_progress = min(
                    100,
                    int((progress.current_streak / achievement.requirement_value) * 100),
                )
            elif achievement.requirement_type == "lessons":
                achievement_progress = min(
                    100,
                    int((progress.lessons_completed / achievement.requirement_value) * 100),
                )
            elif achievement.requirement_type == "verses":
                achievement_progress = min(
                    100,
                    int((progress.verses_memorized / achievement.requirement_value) * 100),
                )
            elif achievement.requirement_type == "xp":
                achievement_progress = min(
                    100,
                    int((progress.total_xp / achievement.requirement_value) * 100),
                )

        if user_achievement:
            achievement_progress = 100

        achievements_list.append(
            AchievementResponse(
                id=achievement.id,
                name=achievement.name,
                description=achievement.description,
                icon_url=achievement.icon_url,
                xp_reward=achievement.xp_reward,
                unlocked_at=user_achievement.unlocked_at if user_achievement else None,
                progress=user_achievement.progress if user_achievement else achievement_progress,
                rarity=achievement.rarity,
            )
        )

    return {
        "success": True,
        "data": achievements_list,
    }


@router.post("/use-heart")
async def use_heart(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Use a heart (life). Returns false if no hearts available.
    """
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == current_user.id)
    )
    progress = result.scalar_one_or_none()

    if not progress or progress.hearts <= 0:
        return {
            "success": False,
            "error": {
                "code": "NO_HEARTS",
                "message": "No hearts available",
            },
        }

    progress.hearts -= 1

    # Start regeneration timer if this is the first heart used
    if progress.hearts < progress.max_hearts and not progress.hearts_regen_at:
        from datetime import timedelta
        from app.core.config import settings

        progress.hearts_regen_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.HEART_REGEN_MINUTES
        )

    await db.commit()

    return {
        "success": True,
        "data": {
            "hearts": progress.hearts,
            "hearts_regen_at": progress.hearts_regen_at.isoformat() if progress.hearts_regen_at else None,
        },
    }


@router.post("/use-streak-freeze")
async def use_streak_freeze(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Use a streak freeze to protect the current streak.
    """
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == current_user.id)
    )
    progress = result.scalar_one_or_none()

    if not progress or progress.streak_freezes <= 0:
        return {
            "success": False,
            "error": {
                "code": "NO_FREEZES",
                "message": "No streak freezes available",
            },
        }

    progress.streak_freezes -= 1
    progress.last_practice_date = datetime.now(timezone.utc).date()

    await db.commit()

    return {
        "success": True,
        "data": {
            "streak_freezes": progress.streak_freezes,
            "current_streak": progress.current_streak,
        },
    }

