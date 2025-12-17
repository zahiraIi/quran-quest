"""
Recitation and Quran content related database models.
"""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import DateTime, Integer, String, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Surah(Base):
    """Quran surah (chapter) metadata."""

    __tablename__ = "surahs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)  # 1-114
    name: Mapped[str] = mapped_column(String(50), nullable=False)  # Arabic name
    name_transliteration: Mapped[str] = mapped_column(String(50), nullable=False)
    name_translation: Mapped[str] = mapped_column(String(100), nullable=False)
    verses_count: Mapped[int] = mapped_column(Integer, nullable=False)
    revelation_type: Mapped[str] = mapped_column(String(10), nullable=False)  # meccan/medinan
    order: Mapped[int] = mapped_column(Integer, nullable=False)  # Revelation order

    # Relationships
    ayahs: Mapped[list["Ayah"]] = relationship("Ayah", back_populates="surah")


class Ayah(Base):
    """Quran ayah (verse) with text and metadata."""

    __tablename__ = "ayahs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    surah_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("surahs.id", ondelete="CASCADE"),
        index=True,
    )
    number_in_surah: Mapped[int] = mapped_column(Integer, nullable=False)

    # Text variants
    text: Mapped[str] = mapped_column(Text, nullable=False)  # Simple Arabic
    text_uthmani: Mapped[str] = mapped_column(Text, nullable=False)  # Uthmani script
    text_imlaei: Mapped[str | None] = mapped_column(Text, nullable=True)  # Imlaei spelling

    # Translations and transliteration
    translation_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    transliteration: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Audio
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Relationships
    surah: Mapped["Surah"] = relationship("Surah", back_populates="ayahs")
    words: Mapped[list["Word"]] = relationship("Word", back_populates="ayah")
    recitations: Mapped[list["RecitationResult"]] = relationship(
        "RecitationResult",
        back_populates="ayah",
    )


class Word(Base):
    """Individual word within an ayah with timestamps."""

    __tablename__ = "words"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ayah_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ayahs.id", ondelete="CASCADE"),
        index=True,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)  # Word position in ayah

    # Text
    text: Mapped[str] = mapped_column(String(100), nullable=False)
    transliteration: Mapped[str | None] = mapped_column(String(100), nullable=True)
    translation: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Audio timestamps (for word-by-word recitation)
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    start_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    end_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Relationships
    ayah: Mapped["Ayah"] = relationship("Ayah", back_populates="words")


class RecitationResult(Base):
    """User recitation attempt with accuracy analysis."""

    __tablename__ = "recitation_results"

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
    ayah_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("ayahs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    word_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("words.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Audio
    audio_url: Mapped[str] = mapped_column(String(500), nullable=False)
    duration_ms: Mapped[int] = mapped_column(Integer, nullable=False)

    # Transcription
    transcription: Mapped[str] = mapped_column(Text, nullable=False)
    expected_text: Mapped[str] = mapped_column(Text, nullable=False)

    # Accuracy metrics
    accuracy: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100
    wer: Mapped[float] = mapped_column(Float, nullable=False)  # Word Error Rate
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Detailed feedback (JSON array of word-level feedback)
    feedback: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # XP earned from this recitation
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relationships
    ayah: Mapped["Ayah"] = relationship("Ayah", back_populates="recitations")

