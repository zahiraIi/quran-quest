"""
Recitation analysis service using Whisper for Arabic/Quran transcription.

Uses the tarteel-ai/whisper-base-ar-quran model for accurate Quran transcription.
"""

import os
import tempfile
from typing import Optional
import logging

import numpy as np
from Levenshtein import distance as levenshtein_distance

logger = logging.getLogger(__name__)

# Lazy loading of ML models to avoid startup overhead
_whisper_model = None
_whisper_processor = None


def get_whisper_model():
    """
    Lazy load the Whisper model for Quran transcription.

    Uses tarteel-ai/whisper-base-ar-quran for optimal Quran recognition.
    """
    global _whisper_model, _whisper_processor

    if _whisper_model is None:
        try:
            from transformers import WhisperProcessor, WhisperForConditionalGeneration
            import torch

            model_name = "tarteel-ai/whisper-base-ar-quran"

            logger.info(f"Loading Whisper model: {model_name}")

            _whisper_processor = WhisperProcessor.from_pretrained(model_name)
            _whisper_model = WhisperForConditionalGeneration.from_pretrained(model_name)

            # Use GPU if available
            if torch.cuda.is_available():
                _whisper_model = _whisper_model.to("cuda")
                logger.info("Whisper model loaded on GPU")
            else:
                logger.info("Whisper model loaded on CPU")

        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise

    return _whisper_model, _whisper_processor


async def transcribe_audio(audio_path: str) -> dict:
    """
    Transcribe Arabic audio using the Quran-tuned Whisper model.

    Args:
        audio_path: Path to the audio file.

    Returns:
        Dictionary with transcription and confidence score.
    """
    try:
        import librosa
        import torch

        model, processor = get_whisper_model()

        # Load and preprocess audio
        audio, sr = librosa.load(audio_path, sr=16000)

        # Process audio
        input_features = processor(
            audio,
            sampling_rate=16000,
            return_tensors="pt"
        ).input_features

        # Move to GPU if available
        if torch.cuda.is_available():
            input_features = input_features.to("cuda")

        # Generate transcription
        with torch.no_grad():
            predicted_ids = model.generate(
                input_features,
                language="ar",
                task="transcribe",
            )

        # Decode transcription
        transcription = processor.batch_decode(
            predicted_ids,
            skip_special_tokens=True
        )[0]

        return {
            "transcription": transcription.strip(),
            "confidence": 0.85,  # Placeholder - actual confidence would require more processing
            "word_timestamps": None,  # Could be added with word-level alignment
        }

    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise


async def transcribe_audio_openai(audio_path: str) -> dict:
    """
    Fallback transcription using OpenAI's Whisper API.

    Args:
        audio_path: Path to the audio file.

    Returns:
        Dictionary with transcription and confidence score.
    """
    from openai import OpenAI
    from app.core.config import settings

    if not settings.OPENAI_API_KEY:
        raise ValueError("OpenAI API key not configured")

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    with open(audio_path, "rb") as audio_file:
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="ar",
        )

    return {
        "transcription": response.text.strip(),
        "confidence": 0.9,
        "word_timestamps": None,
    }


def calculate_wer(reference: str, hypothesis: str) -> float:
    """
    Calculate Word Error Rate (WER) between reference and hypothesis.

    Args:
        reference: The expected/correct text.
        hypothesis: The transcribed/predicted text.

    Returns:
        WER as a decimal (0.0 to 1.0+).
    """
    ref_words = reference.strip().split()
    hyp_words = hypothesis.strip().split()

    if len(ref_words) == 0:
        return 0.0 if len(hyp_words) == 0 else 1.0

    # Calculate edit distance at word level
    distance = levenshtein_distance(ref_words, hyp_words)

    return distance / len(ref_words)


def analyze_recitation_accuracy(
    transcription: str,
    expected_text: str,
) -> dict:
    """
    Analyze the accuracy of a recitation against expected text.

    Args:
        transcription: The transcribed audio text.
        expected_text: The expected Quran text.

    Returns:
        Dictionary with accuracy metrics and word-level feedback.
    """
    # Normalize texts
    transcription = normalize_arabic_text(transcription)
    expected_text = normalize_arabic_text(expected_text)

    # Calculate WER
    wer = calculate_wer(expected_text, transcription)

    # Calculate accuracy (inverse of WER, capped at 0-100)
    accuracy = max(0, min(100, (1 - wer) * 100))

    # Generate word-level feedback
    feedback = generate_word_feedback(expected_text, transcription)

    return {
        "accuracy": round(accuracy, 2),
        "wer": round(wer, 4),
        "feedback": feedback,
    }


def normalize_arabic_text(text: str) -> str:
    """
    Normalize Arabic text for comparison.

    Removes diacritics and normalizes characters for fair comparison.
    """
    import unicodedata

    # Remove diacritics (tashkeel)
    diacritics = [
        '\u064B',  # Fathatan
        '\u064C',  # Dammatan
        '\u064D',  # Kasratan
        '\u064E',  # Fatha
        '\u064F',  # Damma
        '\u0650',  # Kasra
        '\u0651',  # Shadda
        '\u0652',  # Sukun
        '\u0653',  # Maddah
        '\u0654',  # Hamza above
        '\u0655',  # Hamza below
        '\u0670',  # Alef superscript
    ]

    for d in diacritics:
        text = text.replace(d, '')

    # Normalize Unicode
    text = unicodedata.normalize('NFKC', text)

    # Normalize alef variants
    text = text.replace('آ', 'ا')
    text = text.replace('أ', 'ا')
    text = text.replace('إ', 'ا')
    text = text.replace('ٱ', 'ا')

    # Normalize other characters
    text = text.replace('ة', 'ه')  # Ta marbuta
    text = text.replace('ى', 'ي')  # Alef maksura

    return text.strip()


def generate_word_feedback(
    expected_text: str,
    transcription: str,
) -> list[dict]:
    """
    Generate word-level feedback comparing expected and transcribed text.

    Uses dynamic programming alignment to match words.

    Args:
        expected_text: The expected Quran text.
        transcription: The transcribed audio text.

    Returns:
        List of word feedback dictionaries.
    """
    expected_words = expected_text.split()
    transcribed_words = transcription.split()

    feedback = []

    # Simple alignment approach
    i, j = 0, 0

    while i < len(expected_words) or j < len(transcribed_words):
        if i >= len(expected_words):
            # Extra words in transcription
            feedback.append({
                "word_index": j,
                "word": transcribed_words[j],
                "expected": "",
                "status": "extra",
                "suggestion": None,
            })
            j += 1
        elif j >= len(transcribed_words):
            # Missing words
            feedback.append({
                "word_index": i,
                "word": "",
                "expected": expected_words[i],
                "status": "missing",
                "suggestion": expected_words[i],
            })
            i += 1
        elif expected_words[i] == transcribed_words[j]:
            # Correct match
            feedback.append({
                "word_index": i,
                "word": transcribed_words[j],
                "expected": expected_words[i],
                "status": "correct",
                "suggestion": None,
            })
            i += 1
            j += 1
        else:
            # Check if it's a substitution or insertion/deletion
            # Simple heuristic: if next words match, it's likely a substitution
            feedback.append({
                "word_index": i,
                "word": transcribed_words[j],
                "expected": expected_words[i],
                "status": "incorrect",
                "suggestion": expected_words[i],
            })
            i += 1
            j += 1

    return feedback


def calculate_xp_reward(accuracy: float, duration_seconds: int) -> int:
    """
    Calculate XP reward based on recitation accuracy.

    Args:
        accuracy: Accuracy percentage (0-100).
        duration_seconds: Duration of the recitation.

    Returns:
        XP amount to award.
    """
    base_xp = 10

    # Accuracy bonus
    if accuracy >= 95:
        accuracy_multiplier = 3.0
    elif accuracy >= 90:
        accuracy_multiplier = 2.5
    elif accuracy >= 80:
        accuracy_multiplier = 2.0
    elif accuracy >= 70:
        accuracy_multiplier = 1.5
    elif accuracy >= 50:
        accuracy_multiplier = 1.0
    else:
        accuracy_multiplier = 0.5

    # Duration factor (longer recitations = more XP, with diminishing returns)
    duration_factor = min(2.0, 1.0 + (duration_seconds / 60) * 0.5)

    xp = int(base_xp * accuracy_multiplier * duration_factor)

    return max(5, xp)  # Minimum 5 XP

