import re
from typing import Dict, Any

FILLER_WORDS = [
    "um", "uh", "umm", "uhh", "like", "actually", "basically",
    "literally", "you know", "i mean", "sort of", "kind of", "right"
]

POSITIVE_INDICATORS = [
    "effectively", "implemented", "optimized", "scalable", "architecture",
    "achieved", "solved", "designed", "collaborated", "managed", "structured",
    "ensured", "streamlined", "enhanced", "analyzed", "delivered", "robust"
]

HESITATION_INDICATORS = [
    "maybe", "probably", "i guess", "i think maybe", "not sure", "dont know", "don't know",
    "forgot", "blank"
]

def analyze_speech_metrics(transcript: str, duration_seconds: float = 0.0) -> Dict[str, Any]:
    """
    Analyzes spoken or written candidate response for:
    - Filler word count & percentage
    - Words per minute (WPM) fluency
    - Hesitation markers
    - Confidence index (0 - 100)
    - Communication clarity score (0 - 100)
    """
    if not transcript or not transcript.strip():
        return {
            "word_count": 0,
            "wpm": 0,
            "filler_count": 0,
            "filler_ratio": 0.0,
            "detected_fillers": [],
            "confidence_score": 30.0,
            "clarity_score": 30.0,
            "pace_rating": "Too Brief",
            "sentiment": "Neutral / Incomplete"
        }
    
    clean_text = transcript.lower()
    words = re.findall(r'\b[a-zA-Z\']+\b', clean_text)
    total_words = len(words)
    
    # 1. Filler detection
    detected_fillers = []
    filler_count = 0
    for filler in FILLER_WORDS:
        matches = len(re.findall(r'\b' + re.escape(filler) + r'\b', clean_text))
        if matches > 0:
            detected_fillers.append(f"{filler} ({matches}x)")
            filler_count += matches

    filler_ratio = round((filler_count / total_words) * 100, 1) if total_words > 0 else 0.0

    # 2. Words Per Minute (WPM)
    wpm = 0
    if duration_seconds and duration_seconds > 5:
        wpm = int((total_words / duration_seconds) * 60)
    else:
        # Fallback estimation assuming typical conversational rate
        wpm = 130 if total_words > 20 else 80

    if wpm < 90:
        pace_rating = "A bit slow or hesitant"
    elif 90 <= wpm <= 160:
        pace_rating = "Optimal & natural cadence"
    else:
        pace_rating = "Rushed / Fast paced"

    # 3. Hesitations vs Strong keywords
    hesitation_count = sum(len(re.findall(r'\b' + re.escape(h) + r'\b', clean_text)) for h in HESITATION_INDICATORS)
    positive_count = sum(len(re.findall(r'\b' + re.escape(p) + r'\b', clean_text)) for p in POSITIVE_INDICATORS)

    # 4. Confidence Score Calculation
    # Baseline 75, penalized for high fillers and hesitations, rewarded for structure and length
    confidence = 75.0
    if total_words < 15:
        confidence -= 25.0
    elif total_words >= 45:
        confidence += 10.0

    confidence -= min(filler_count * 3.5, 25.0)
    confidence -= min(hesitation_count * 4.0, 20.0)
    confidence += min(positive_count * 2.5, 15.0)
    confidence = max(20.0, min(98.0, round(confidence, 1)))

    # 5. Clarity & Communication Score
    clarity = 70.0
    if total_words >= 30:
        clarity += 12.0
    elif total_words < 10:
        clarity -= 30.0
    
    if filler_ratio < 4.0:
        clarity += 8.0
    else:
        clarity -= min(filler_ratio * 1.5, 20.0)
    
    clarity = max(25.0, min(95.0, round(clarity, 1)))

    sentiment = "Professional & Confident"
    if hesitation_count > 2 or filler_ratio > 8.0:
        sentiment = "Nervous / Needs Polish"
    elif positive_count >= 2:
        sentiment = "Highly Articulate & Confident"

    return {
        "word_count": total_words,
        "wpm": wpm,
        "filler_count": filler_count,
        "filler_ratio": filler_ratio,
        "detected_fillers": detected_fillers,
        "confidence_score": confidence,
        "clarity_score": clarity,
        "pace_rating": pace_rating,
        "sentiment": sentiment
    }
