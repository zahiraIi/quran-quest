"""
Gamification related database models.

Includes XP, streaks, achievements, and league system.
"""

from datetime import datetime, date
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Date, Integer, String, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class League(str, enum.Enum):
    """League tiers for competitive leaderboards."""

    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    SAPPHIRE = "sapphire"
    RUBY = "ruby"
    EMERALD = "emerald"
    AMETHYST = "amethyst"
    PEARL = "pearl"
    OBSIDIAN = "obsidian"
    DIAMOND = "diamond"


class UserProgress(Base):
    """User progress and gamification stats."""

    __tablename__ = "user_progress"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )

    # Level and XP
    level: Mapped[int] = mapped_column(Integer, default=1)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    weekly_xp: Mapped[int] = mapped_column(Integer, default=0)  # Reset weekly for leaderboards

    # Streak
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    streak_freezes: Mapped[int] = mapped_column(Integer, default=2)  # Available freezes
    last_practice_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Hearts (lives)
    hearts: Mapped[int] = mapped_column(Integer, default=5)
    max_hearts: Mapped[int] = mapped_column(Integer, default=5)
    hearts_regen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # League
    league: Mapped[League] = mapped_column(
        SQLEnum(League),
        default=League.BRONZE,
    )
    league_rank: Mapped[int] = mapped_column(Integer, default=0)

    # Stats
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0)
    verses_memorized: Mapped[int] = mapped_column(Integer, default=0)
    total_recitation_seconds: Mapped[int] = mapped_column(Integer, default=0)
    perfect_lessons: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="progress")


class Achievement(Base):
    """Achievement definitions."""

    __tablename__ = "achievements"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon_url: Mapped[str] = mapped_column(String(500), nullable=False)
    xp_reward: Mapped[int] = mapped_column(Integer, default=0)

    # Requirement
    requirement_type: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., "streak", "lessons", "verses"
    requirement_value: Mapped[int] = mapped_column(Integer, nullable=False)

    # Metadata
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False)
    rarity: Mapped[str] = mapped_column(String(20), default="common")  # common, rare, epic, legendary

    # Relationships
    user_achievements: Mapped[list["UserAchievement"]] = relationship(
        "UserAchievement",
        back_populates="achievement",
        cascade="all, delete-orphan",
    )


class UserAchievement(Base):
    """User achievement unlocks."""

    __tablename__ = "user_achievements"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    achievement_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("achievements.id", ondelete="CASCADE"),
        index=True,
    )
    unlocked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    progress: Mapped[int] = mapped_column(Integer, default=0)  # Progress toward unlocking (0-100)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="achievements")
    achievement: Mapped["Achievement"] = relationship("Achievement", back_populates="user_achievements")


class DailyXP(Base):
    """Daily XP tracking for goals and analytics."""

    __tablename__ = "daily_xp"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    goal_target: Mapped[int] = mapped_column(Integer, default=50)
    goal_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    # Activity breakdown
    lesson_xp: Mapped[int] = mapped_column(Integer, default=0)
    practice_xp: Mapped[int] = mapped_column(Integer, default=0)
    challenge_xp: Mapped[int] = mapped_column(Integer, default=0)
    bonus_xp: Mapped[int] = mapped_column(Integer, default=0)

