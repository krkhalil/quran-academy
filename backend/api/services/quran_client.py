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


def get_verses(chapter_id, translations="131", audio=1, words=False, tafsirs=None, page=1, per_page=20, tajweed=False):
    """Fetch verses for a chapter with translations, audio, optional word-by-word, tafsir, and tajweed."""
    fields = "text_uthmani,translations"
    if words:
        fields += ",words"
    if tajweed:
        fields += ",text_uthmani_tajweed"
    params = {
        "translations": translations,
        "audio": audio,
        "words": "true" if words else "false",
        "page": page,
        "per_page": per_page,
        "fields": fields,
    }
    if tafsirs:
        params["tafsirs"] = tafsirs
    r = requests.get(
        f"{QURAN_API_BASE}/verses/by_chapter/{chapter_id}",
        params=params,
    )
    r.raise_for_status()
    data = r.json()

    if tajweed:
        try:
            from .qf_api_client import get_verses_uthmani_tajweed

            qf_data = get_verses_uthmani_tajweed(chapter_number=chapter_id)
            if qf_data and qf_data.get("verses"):
                qf_by_key = {v["verse_key"]: v.get("text_uthmani_tajweed") for v in qf_data["verses"]}
                for v in data.get("verses", []):
                    key = v.get("verse_key")
                    if key and qf_by_key.get(key) and ("<tajweed" in str(qf_by_key[key]) or "<span" in str(qf_by_key[key])):
                        v["text_uthmani_tajweed"] = qf_by_key[key]
        except Exception:
            pass

    return data


def get_verses_by_juz(juz_number, translations="131", page=1, per_page=20, tajweed=False):
    """Fetch verses by Juz number."""
    fields = "text_uthmani,translations"
    if tajweed:
        fields += ",text_uthmani_tajweed"
    params = {
        "translations": translations,
        "page": page,
        "per_page": per_page,
        "fields": fields,
    }
    r = requests.get(
        f"{QURAN_API_BASE}/verses/by_juz/{juz_number}",
        params=params,
    )
    r.raise_for_status()
    data = r.json()

    # QF API does not support juz_number; uses api.quran.com tajweed for juz view

    return data


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


def get_verses_by_page(page_number, translations="131", per_page=20, audio=1, words=False):
    """Fetch verses by Mushaf page number (1-604)."""
    fields = "text_uthmani,translations,text_uthmani_tajweed,audio"
    if words:
        fields += ",words"
    params = {
        "translations": translations,
        "audio": audio,
        "per_page": per_page,
        "fields": fields,
    }
    r = requests.get(
        f"{QURAN_API_BASE}/verses/by_page/{page_number}",
        params=params,
    )
    r.raise_for_status()
    data = r.json()

    try:
        from .qf_api_client import get_verses_uthmani_tajweed

        qf_data = get_verses_uthmani_tajweed(page_number=page_number)
        if qf_data and qf_data.get("verses"):
            qf_by_key = {v["verse_key"]: v.get("text_uthmani_tajweed") for v in qf_data["verses"]}
            for v in data.get("verses", []):
                key = v.get("verse_key")
                if key and qf_by_key.get(key) and ("<tajweed" in str(qf_by_key[key]) or "<span" in str(qf_by_key[key])):
                    v["text_uthmani_tajweed"] = qf_by_key[key]
    except Exception:
        pass

    return data


def search_verses(query, page=1, size=20, language="en"):
    """Full-text search across the Quran."""
    r = requests.get(
        f"{QURAN_API_BASE}/search",
        params={"q": query, "page": page, "size": size, "language": language},
    )
    r.raise_for_status()
    return r.json()


def get_tafsir_by_verse(tafsir_id, verse_key=None, chapter_number=None):
    """Fetch tafsir for verse(s). Tries Quran Foundation API first (when credentials exist), then api.quran.com."""
    try:
        from .qf_api_client import get_tafsir_by_verse as qf_get_tafsir

        qf_data = qf_get_tafsir(tafsir_id, verse_key=verse_key, chapter_number=chapter_number)
        if qf_data and qf_data.get("tafsirs"):
            return qf_data
    except Exception:
        pass

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
