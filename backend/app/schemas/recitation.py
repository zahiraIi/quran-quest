"""
Pydantic schemas for recitation and Quran content.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SurahResponse(BaseModel):
    """Schema for surah response."""

    id: int
    name: str
    name_transliteration: str
    name_translation: str
    verses_count: int
    revelation_type: str
    order: int

    model_config = {"from_attributes": True}


class WordResponse(BaseModel):
    """Schema for word response."""

    id: int
    ayah_id: int
    position: int
    text: str
    transliteration: Optional[str] = None
    translation: Optional[str] = None
    audio_url: Optional[str] = None
    start_time_ms: Optional[int] = None
    end_time_ms: Optional[int] = None

    model_config = {"from_attributes": True}


class AyahResponse(BaseModel):
    """Schema for ayah response."""

    id: int
    surah_id: int
    number_in_surah: int
    text: str
    text_uthmani: str
    translation_en: Optional[str] = None
    transliteration: Optional[str] = None
    audio_url: Optional[str] = None
    words: list[WordResponse] = []

    model_config = {"from_attributes": True}


class AyahSimpleResponse(BaseModel):
    """Simplified ayah response without words."""

    id: int
    surah_id: int
    number_in_surah: int
    text: str
    translation_en: Optional[str] = None
    transliteration: Optional[str] = None
    audio_url: Optional[str] = None

    model_config = {"from_attributes": True}


# Recitation submission schemas
class RecitationSubmitRequest(BaseModel):
    """Schema for submitting a recitation (metadata only, audio via multipart)."""

    ayah_id: Optional[int] = None
    word_id: Optional[int] = None


class WordFeedback(BaseModel):
    """Feedback for a single word in recitation."""

    word_index: int
    word: str
    expected: str
    status: str = Field(..., pattern=r"^(correct|incorrect|missing|extra)$")
    suggestion: Optional[str] = None


class RecitationResultResponse(BaseModel):
    """Schema for recitation result response."""

    id: str
    user_id: str
    ayah_id: Optional[int] = None
    word_id: Optional[int] = None
    audio_url: str
    transcription: str
    expected_text: str
    accuracy: float = Field(..., ge=0, le=100)
    wer: float = Field(..., ge=0, le=1)
    feedback: list[WordFeedback] = []
    xp_earned: int
    duration_ms: int
    created_at: datetime

    model_config = {"from_attributes": True}


class TranscriptionResponse(BaseModel):
    """Schema for transcription-only response."""

    transcription: str
    confidence: float
    word_timestamps: Optional[list[dict]] = None


class AccuracyAnalysisRequest(BaseModel):
    """Schema for accuracy analysis request."""

    transcription: str
    expected_text: str


class AccuracyAnalysisResponse(BaseModel):
    """Schema for accuracy analysis response."""

    accuracy: float
    wer: float
    feedback: list[WordFeedback]

