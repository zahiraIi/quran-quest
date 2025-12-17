"""
Social features endpoints - friends, challenges.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.api.deps import get_current_user
from app.models import (
    User,
    UserProgress,
    Friendship,
    FriendshipStatus,
    Challenge,
    ChallengeType,
    ChallengeStatus,
)
from app.schemas.common import ApiResponse
from pydantic import BaseModel

router = APIRouter()


class FriendResponse(BaseModel):
    """Friend response schema."""

    id: str
    user_id: str
    username: str
    display_name: str
    avatar_url: Optional[str]
    status: str
    current_streak: int
    level: int
    last_active_at: Optional[datetime]


class FriendRequestCreate(BaseModel):
    """Friend request creation schema."""

    friend_username: str


class ChallengeResponse(BaseModel):
    """Challenge response schema."""

    id: str
    type: str
    title: str
    description: Optional[str]
    challenger_id: str
    challenger_name: str
    opponent_id: str
    opponent_name: str
    status: str
    challenger_score: Optional[float]
    opponent_score: Optional[float]
    winner_id: Optional[str]
    expires_at: datetime
    created_at: datetime


class ChallengeCreate(BaseModel):
    """Challenge creation schema."""

    opponent_id: str
    type: str
    title: str
    description: Optional[str] = None


@router.get("/friends", response_model=ApiResponse[list[FriendResponse]])
async def get_friends(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Get the current user's friends list.
    """
    # Get friendships where user is either sender or receiver
    query = select(Friendship).where(
        or_(
            Friendship.user_id == current_user.id,
            Friendship.friend_id == current_user.id,
        )
    )

    if status_filter:
        try:
            fs = FriendshipStatus(status_filter)
            query = query.where(Friendship.status == fs)
        except ValueError:
            pass

    result = await db.execute(query)
    friendships = result.scalars().all()

    friends = []
    for friendship in friendships:
        # Get the other user in the friendship
        other_user_id = (
            friendship.friend_id
            if friendship.user_id == current_user.id
            else friendship.user_id
        )

        # Get user details
        user_result = await db.execute(select(User).where(User.id == other_user_id))
        other_user = user_result.scalar_one_or_none()

        if not other_user:
            continue

        # Get progress
        progress_result = await db.execute(
            select(UserProgress).where(UserProgress.user_id == other_user_id)
        )
        progress = progress_result.scalar_one_or_none()

        friends.append(
            FriendResponse(
                id=friendship.id,
                user_id=other_user.id,
                username=other_user.username,
                display_name=other_user.display_name,
                avatar_url=other_user.avatar_url,
                status=friendship.status.value,
                current_streak=progress.current_streak if progress else 0,
                level=progress.level if progress else 1,
                last_active_at=other_user.last_active_at,
            )
        )

    return {
        "success": True,
        "data": friends,
    }


@router.post("/friends", response_model=ApiResponse[FriendResponse])
async def send_friend_request(
    request: FriendRequestCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Send a friend request to another user.
    """
    # Find the user by username
    result = await db.execute(
        select(User).where(User.username == request.friend_username)
    )
    friend = result.scalar_one_or_none()

    if not friend:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if friend.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send friend request to yourself",
        )

    # Check if friendship already exists
    result = await db.execute(
        select(Friendship).where(
            or_(
                and_(
                    Friendship.user_id == current_user.id,
                    Friendship.friend_id == friend.id,
                ),
                and_(
                    Friendship.user_id == friend.id,
                    Friendship.friend_id == current_user.id,
                ),
            )
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Friendship already exists",
        )

    # Create friend request
    friendship = Friendship(
        user_id=current_user.id,
        friend_id=friend.id,
        status=FriendshipStatus.PENDING,
    )
    db.add(friendship)
    await db.commit()
    await db.refresh(friendship)

    # Get friend's progress
    progress_result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == friend.id)
    )
    progress = progress_result.scalar_one_or_none()

    return {
        "success": True,
        "data": FriendResponse(
            id=friendship.id,
            user_id=friend.id,
            username=friend.username,
            display_name=friend.display_name,
            avatar_url=friend.avatar_url,
            status=friendship.status.value,
            current_streak=progress.current_streak if progress else 0,
            level=progress.level if progress else 1,
            last_active_at=friend.last_active_at,
        ),
    }


@router.post("/friends/{friendship_id}/accept")
async def accept_friend_request(
    friendship_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Accept a pending friend request.
    """
    result = await db.execute(
        select(Friendship).where(
            Friendship.id == friendship_id,
            Friendship.friend_id == current_user.id,
            Friendship.status == FriendshipStatus.PENDING,
        )
    )
    friendship = result.scalar_one_or_none()

    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend request not found",
        )

    friendship.status = FriendshipStatus.ACCEPTED
    friendship.accepted_at = datetime.now(timezone.utc)

    await db.commit()

    return {"success": True, "message": "Friend request accepted"}


@router.get("/challenges", response_model=ApiResponse[list[ChallengeResponse]])
async def get_challenges(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Get the current user's challenges.
    """
    query = select(Challenge).where(
        or_(
            Challenge.challenger_id == current_user.id,
            Challenge.opponent_id == current_user.id,
        )
    )

    if status_filter:
        try:
            cs = ChallengeStatus(status_filter)
            query = query.where(Challenge.status == cs)
        except ValueError:
            pass

    query = query.order_by(Challenge.created_at.desc())

    result = await db.execute(query)
    challenges = result.scalars().all()

    challenge_list = []
    for challenge in challenges:
        # Get challenger name
        challenger_result = await db.execute(
            select(User).where(User.id == challenge.challenger_id)
        )
        challenger = challenger_result.scalar_one()

        # Get opponent name
        opponent_result = await db.execute(
            select(User).where(User.id == challenge.opponent_id)
        )
        opponent = opponent_result.scalar_one()

        challenge_list.append(
            ChallengeResponse(
                id=challenge.id,
                type=challenge.type.value,
                title=challenge.title,
                description=challenge.description,
                challenger_id=challenge.challenger_id,
                challenger_name=challenger.display_name,
                opponent_id=challenge.opponent_id,
                opponent_name=opponent.display_name,
                status=challenge.status.value,
                challenger_score=challenge.challenger_score,
                opponent_score=challenge.opponent_score,
                winner_id=challenge.winner_id,
                expires_at=challenge.expires_at,
                created_at=challenge.created_at,
            )
        )

    return {
        "success": True,
        "data": challenge_list,
    }


@router.post("/challenges", response_model=ApiResponse[ChallengeResponse])
async def create_challenge(
    request: ChallengeCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Create a new challenge against a friend.
    """
    # Validate opponent
    result = await db.execute(select(User).where(User.id == request.opponent_id))
    opponent = result.scalar_one_or_none()

    if not opponent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opponent not found",
        )

    # Validate challenge type
    try:
        challenge_type = ChallengeType(request.type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid challenge type",
        )

    # Create challenge
    challenge = Challenge(
        challenger_id=current_user.id,
        opponent_id=request.opponent_id,
        type=challenge_type,
        title=request.title,
        description=request.description,
        status=ChallengeStatus.PENDING,
        expires_at=datetime.now(timezone.utc) + timedelta(days=1),
    )
    db.add(challenge)
    await db.commit()
    await db.refresh(challenge)

    return {
        "success": True,
        "data": ChallengeResponse(
            id=challenge.id,
            type=challenge.type.value,
            title=challenge.title,
            description=challenge.description,
            challenger_id=challenge.challenger_id,
            challenger_name=current_user.display_name,
            opponent_id=challenge.opponent_id,
            opponent_name=opponent.display_name,
            status=challenge.status.value,
            challenger_score=challenge.challenger_score,
            opponent_score=challenge.opponent_score,
            winner_id=challenge.winner_id,
            expires_at=challenge.expires_at,
            created_at=challenge.created_at,
        ),
    }

