"""
Pydantic schemas for request/response validation.
"""

from app.schemas.common import ApiResponse, ApiError, PaginatedResponse
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserProgressResponse,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
)
from app.schemas.recitation import (
    SurahResponse,
    AyahResponse,
    WordResponse,
    RecitationResultResponse,
    TranscriptionResponse,
    AccuracyAnalysisRequest,
    AccuracyAnalysisResponse,
)

__all__ = [
    "ApiResponse",
    "ApiError",
    "PaginatedResponse",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserProgressResponse",
    "LoginRequest",
    "TokenResponse",
    "RefreshTokenRequest",
    "SurahResponse",
    "AyahResponse",
    "WordResponse",
    "RecitationResultResponse",
    "TranscriptionResponse",
    "AccuracyAnalysisRequest",
    "AccuracyAnalysisResponse",
]

