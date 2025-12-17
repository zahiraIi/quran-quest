"""
Security utilities for authentication and authorization.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from uuid import uuid4
import hashlib

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    subject: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a JWT access token.

    Args:
        subject: The subject (typically user ID) for the token.
        expires_delta: Optional custom expiration time.

    Returns:
        Encoded JWT token string.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "sub": subject,
        "exp": expire,
        "type": "access",
        "iat": datetime.now(timezone.utc),
    }

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str) -> tuple[str, str]:
    """
    Create a JWT refresh token.

    Args:
        subject: The subject (typically user ID) for the token.

    Returns:
        Tuple of (token string, token hash for storage).
    """
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    token_id = str(uuid4())

    to_encode = {
        "sub": subject,
        "exp": expire,
        "type": "refresh",
        "jti": token_id,
        "iat": datetime.now(timezone.utc),
    }

    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    # Hash for storage
    token_hash = hashlib.sha256(token_id.encode()).hexdigest()

    return token, token_hash


def verify_access_token(token: str) -> Optional[dict[str, Any]]:
    """
    Verify and decode an access token.

    Args:
        token: The JWT token to verify.

    Returns:
        Decoded token payload or None if invalid.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None


def verify_refresh_token(token: str) -> Optional[dict[str, Any]]:
    """
    Verify and decode a refresh token.

    Args:
        token: The JWT token to verify.

    Returns:
        Decoded token payload or None if invalid.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            return None

        # Hash the jti for comparison with stored hash
        jti = payload.get("jti")
        if jti:
            payload["jti"] = hashlib.sha256(jti.encode()).hexdigest()

        return payload
    except JWTError:
        return None

