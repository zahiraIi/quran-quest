"""
Common Pydantic schemas used across the API.
"""

from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiError(BaseModel):
    """Schema for API error details."""

    code: str
    message: str
    details: Optional[dict[str, list[str]]] = None


class ApiResponse(BaseModel, Generic[T]):
    """Generic API response wrapper."""

    success: bool = True
    data: Optional[T] = None
    error: Optional[ApiError] = None
    meta: Optional[dict[str, Any]] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated list response."""

    success: bool = True
    data: list[T]
    meta: dict[str, Any]


class PaginationMeta(BaseModel):
    """Pagination metadata."""

    page: int
    limit: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool

