"""
Quran Foundation User API - collections, bookmarks (requires OAuth2 tokens).
"""
import requests
from django.conf import settings


def get_qf_api_headers(access_token):
    """Build headers for QF User API."""
    from api.qf_oauth import get_qf_config
    cfg = get_qf_config()
    return {
        "x-auth-token": access_token,
        "x-client-id": cfg["client_id"],
    }


def qf_get(access_token, path, params=None):
    """GET request to QF User API."""
    from api.qf_oauth import get_qf_config
    cfg = get_qf_config()
    url = f"{cfg['api_base_url']}/auth/v1{path}"
    r = requests.get(url, headers=get_qf_api_headers(access_token), params=params)
    r.raise_for_status()
    return r.json()


def qf_post(access_token, path, json_data=None):
    """POST request to QF User API."""
    from api.qf_oauth import get_qf_config
    cfg = get_qf_config()
    url = f"{cfg['api_base_url']}/auth/v1{path}"
    r = requests.post(url, headers=get_qf_api_headers(access_token), json=json_data)
    r.raise_for_status()
    return r.json() if r.content else {}


def qf_delete(access_token, path):
    """DELETE request to QF User API."""
    from api.qf_oauth import get_qf_config
    cfg = get_qf_config()
    url = f"{cfg['api_base_url']}/auth/v1{path}"
    r = requests.delete(url, headers=get_qf_api_headers(access_token))
    r.raise_for_status()
    return r.json() if r.content else {}
