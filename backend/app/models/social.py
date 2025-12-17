"""
Social features database models.

Includes friendships, challenges, and study circles.
"""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import uuid4
import enum

from sqlalchemy import Boolean, DateTime, Integer, String, Text, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class FriendshipStatus(str, enum.Enum):
    """Friendship request status."""

    PENDING = "pending"
    ACCEPTED = "accepted"
    BLOCKED = "blocked"


class ChallengeType(str, enum.Enum):
    """Types of challenges between users."""

    RECITATION = "recitation"
    QUIZ = "quiz"
    STREAK = "streak"


class ChallengeStatus(str, enum.Enum):
    """Challenge status."""

    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class Friendship(Base):
    """Friendship connections between users."""

    __tablename__ = "friendships"

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
    friend_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    status: Mapped[FriendshipStatus] = mapped_column(
        SQLEnum(FriendshipStatus),
        default=FriendshipStatus.PENDING,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="friendships_initiated",
    )
    friend: Mapped["User"] = relationship(
        "User",
        foreign_keys=[friend_id],
        back_populates="friendships_received",
    )


class Challenge(Base):
    """Head-to-head challenges between users."""

    __tablename__ = "challenges"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    challenger_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    opponent_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    # Challenge details
    type: Mapped[ChallengeType] = mapped_column(SQLEnum(ChallengeType), nullable=False)
    status: Mapped[ChallengeStatus] = mapped_column(
        SQLEnum(ChallengeStatus),
        default=ChallengeStatus.PENDING,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Scores
    challenger_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    opponent_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    winner_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    # XP rewards
    winner_xp: Mapped[int] = mapped_column(Integer, default=50)
    loser_xp: Mapped[int] = mapped_column(Integer, default=10)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    challenger: Mapped["User"] = relationship(
        "User",
        foreign_keys=[challenger_id],
        back_populates="challenges_sent",
    )
    opponent: Mapped["User"] = relationship(
        "User",
        foreign_keys=[opponent_id],
        back_populates="challenges_received",
    )


class StudyCircle(Base):
    """Study groups for collaborative learning."""

    __tablename__ = "study_circles"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)
    max_members: Mapped[int] = mapped_column(Integer, default=50)

    # Creator
    created_by: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Stats
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    weekly_xp: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relationships
    members: Mapped[list["StudyCircleMember"]] = relationship(
        "StudyCircleMember",
        back_populates="circle",
        cascade="all, delete-orphan",
    )


class StudyCircleMember(Base):
    """Membership in study circles."""

    __tablename__ = "study_circle_members"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    circle_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("study_circles.id", ondelete="CASCADE"),
        index=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    role: Mapped[str] = mapped_column(String(20), default="member")  # admin, moderator, member
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    contribution_xp: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    circle: Mapped["StudyCircle"] = relationship("StudyCircle", back_populates="members")

