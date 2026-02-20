"""
Quran Foundation Content API client.
Uses OAuth2 client_credentials for tafsir and other content.
"""
import os
import time
import threading
import requests
from dotenv import load_dotenv  # type: ignore

load_dotenv()

_token_cache = {"token": None, "expires_at": 0}
_token_lock = threading.Lock()

ENV_CONFIG = {
    "prelive": {
        "auth_base_url": "https://prelive-oauth2.quran.foundation",
        "api_base_url": "https://apis-prelive.quran.foundation",
    },
    "production": {
        "auth_base_url": "https://oauth2.quran.foundation",
        "api_base_url": "https://apis.quran.foundation",
    },
}


def _get_config():
    client_id = os.getenv("QF_CLIENT_ID")
    client_secret = os.getenv("QF_CLIENT_SECRET")
    env = os.getenv("QF_ENV", "prelive")
    if not client_id or not client_secret:
        return None
    cfg = ENV_CONFIG.get(env, ENV_CONFIG["prelive"])
    return {
        "client_id": client_id,
        "client_secret": client_secret,
        "auth_base_url": cfg["auth_base_url"],
        "api_base_url": cfg["api_base_url"],
    }


def _get_access_token():
    config = _get_config()
    if not config:
        return None
    buffer_seconds = 30
    if _token_cache["token"] and time.time() < _token_cache["expires_at"] - buffer_seconds:
        return _token_cache["token"]
    with _token_lock:
        if _token_cache["token"] and time.time() < _token_cache["expires_at"] - buffer_seconds:
            return _token_cache["token"]
        try:
            response = requests.post(
                f"{config['auth_base_url']}/oauth2/token",
                auth=(config["client_id"], config["client_secret"]),
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data="grant_type=client_credentials&scope=content",
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()
            _token_cache["token"] = data["access_token"]
            _token_cache["expires_at"] = time.time() + data.get("expires_in", 3600)
            return _token_cache["token"]
        except Exception:
            _token_cache["token"] = None
            return None


def _call_qf_api(endpoint, params=None):
    config = _get_config()
    if not config:
        return None
    token = _get_access_token()
    if not token:
        return None
    headers = {
        "x-auth-token": token,
        "x-client-id": config["client_id"],
    }
    try:
        response = requests.get(
            f"{config['api_base_url']}{endpoint}",
            headers=headers,
            params=params or {},
            timeout=15,
        )
        if response.status_code == 401:
            _token_cache["token"] = None
            token = _get_access_token()
            if token:
                headers["x-auth-token"] = token
                response = requests.get(
                    f"{config['api_base_url']}{endpoint}",
                    headers=headers,
                    params=params or {},
                    timeout=15,
                )
        response.raise_for_status()
        return response.json()
    except Exception:
        return None


def get_verses_uthmani_tajweed(chapter_number=None, page_number=None, verse_key=None):
    """Fetch verses with HTML tajweed from Quran Foundation. Returns dict with verses array or None."""
    params = {}
    if chapter_number:
        params["chapter_number"] = chapter_number
    elif page_number:
        params["page_number"] = page_number
    elif verse_key:
        params["verse_key"] = verse_key
    else:
        return None
    return _call_qf_api("/content/api/v4/quran/verses/uthmani_tajweed", params=params)


def get_tafsir_by_verse(tafsir_id, verse_key=None, chapter_number=None):
    """Fetch tafsir from Quran Foundation API. Returns None if credentials missing or request fails."""
    params = {}
    if verse_key:
        params["verse_key"] = verse_key
    if chapter_number:
        params["chapter_number"] = chapter_number
    if not params:
        return None
    return _call_qf_api(f"/content/api/v4/quran/tafsirs/{tafsir_id}", params=params)
