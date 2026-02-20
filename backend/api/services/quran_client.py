"""
Quran.com API client - proxies requests to api.quran.com
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

QURAN_API_BASE = os.getenv("QURAN_API_BASE", "https://api.quran.com/api/v4")


def get_chapters(language="en"):
    """Fetch all 114 chapters (surahs)."""
    r = requests.get(f"{QURAN_API_BASE}/chapters", params={"language": language})
    r.raise_for_status()
    return r.json()


def get_chapter(chapter_id, language="en"):
    """Fetch single chapter metadata."""
    r = requests.get(f"{QURAN_API_BASE}/chapters/{chapter_id}", params={"language": language})
    r.raise_for_status()
    return r.json()


def get_verses(chapter_id, translations="131", audio=1, words=False, tafsirs=None, page=1, per_page=20):
    """Fetch verses for a chapter with translations, audio, optional word-by-word and tafsir."""
    params = {
        "translations": translations,
        "audio": audio,
        "words": "true" if words else "false",
        "page": page,
        "per_page": per_page,
        "fields": "text_uthmani,translations" + (",words" if words else ""),
    }
    if tafsirs:
        params["tafsirs"] = tafsirs
    r = requests.get(
        f"{QURAN_API_BASE}/verses/by_chapter/{chapter_id}",
        params=params,
    )
    r.raise_for_status()
    return r.json()


def get_verses_by_juz(juz_number, translations="131", page=1, per_page=20):
    """Fetch verses by Juz number."""
    params = {
        "translations": translations,
        "page": page,
        "per_page": per_page,
        "fields": "text_uthmani,translations",
    }
    r = requests.get(
        f"{QURAN_API_BASE}/verses/by_juz/{juz_number}",
        params=params,
    )
    r.raise_for_status()
    return r.json()


def get_translations(language="en"):
    """Fetch available translations."""
    r = requests.get(f"{QURAN_API_BASE}/resources/translations", params={"language": language})
    r.raise_for_status()
    return r.json()


def get_recitations():
    """Fetch available reciters."""
    r = requests.get(f"{QURAN_API_BASE}/resources/recitations")
    r.raise_for_status()
    return r.json()


def get_juzs():
    """Fetch 30 Juz list."""
    r = requests.get(f"{QURAN_API_BASE}/juzs")
    r.raise_for_status()
    return r.json()


def get_verse_by_key(verse_key, translations="131"):
    """Fetch single verse by key (e.g. 1:1)."""
    r = requests.get(
        f"{QURAN_API_BASE}/verses/by_key/{verse_key}",
        params={"translations": translations},
    )
    r.raise_for_status()
    return r.json()


def get_tafsirs():
    """Fetch available tafsirs."""
    r = requests.get(f"{QURAN_API_BASE}/resources/tafsirs")
    r.raise_for_status()
    return r.json()


def get_tafsir_by_verse(tafsir_id, verse_key=None, chapter_number=None):
    """Fetch tafsir for verse(s)."""
    params = {}
    if verse_key:
        params["verse_key"] = verse_key
    if chapter_number:
        params["chapter_number"] = chapter_number
    r = requests.get(
        f"{QURAN_API_BASE}/quran/tafsirs/{tafsir_id}",
        params=params,
    )
    r.raise_for_status()
    return r.json()
