"""
Authentication endpoints.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db_session
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_refresh_token,
)
from app.models import User, UserProgress, RefreshToken
from app.schemas.user import (
    UserCreate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
)
from app.schemas.common import ApiResponse

router = APIRouter()


@router.post("/register", response_model=ApiResponse[UserResponse])
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Register a new user account.

    Creates user with initial progress and returns user data.
    """
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Check if username already exists
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username,
        display_name=user_data.display_name,
        hashed_password=get_password_hash(user_data.password),
    )
    db.add(user)
    await db.flush()

    # Create initial progress
    progress = UserProgress(user_id=user.id)
    db.add(progress)

    await db.commit()
    await db.refresh(user)

    return {
        "success": True,
        "data": UserResponse.model_validate(user),
    }


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Authenticate user and return access tokens.
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Create tokens
    access_token = create_access_token(subject=user.id)
    refresh_token, token_hash = create_refresh_token(subject=user.id)

    # Store refresh token
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(db_refresh_token)

    # Update last active
    user.last_active_at = datetime.now(timezone.utc)

    await db.commit()

    return {
        "success": True,
        "data": TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        ),
    }


@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Refresh access token using refresh token.
    """
    # Verify and decode refresh token
    payload = verify_refresh_token(request.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = payload.get("sub")
    token_hash = payload.get("jti")

    # Check if token exists and is valid
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.token_hash == token_hash,
            RefreshToken.is_revoked == False,
            RefreshToken.expires_at > datetime.now(timezone.utc),
        )
    )
    db_token = result.scalar_one_or_none()

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    # Revoke old token
    db_token.is_revoked = True

    # Create new tokens
    access_token = create_access_token(subject=user_id)
    new_refresh_token, new_token_hash = create_refresh_token(subject=user_id)

    # Store new refresh token
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    new_db_token = RefreshToken(
        user_id=user_id,
        token_hash=new_token_hash,
        expires_at=expires_at,
    )
    db.add(new_db_token)

    await db.commit()

    return {
        "success": True,
        "data": TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        ),
    }


@router.post("/logout")
async def logout(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Logout user by revoking refresh token.
    """
    payload = verify_refresh_token(request.refresh_token)
    if payload:
        token_hash = payload.get("jti")
        result = await db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        db_token = result.scalar_one_or_none()
        if db_token:
            db_token.is_revoked = True
            await db.commit()

    return {"success": True, "message": "Logged out successfully"}

