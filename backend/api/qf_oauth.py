"""
Quran Foundation OAuth2 configuration.
Credentials from env vars - NEVER hardcode client_secret.
"""
import os

from dotenv import load_dotenv  # type: ignore

load_dotenv()

QF_ENV = os.getenv("QF_ENV", "prelive")
QF_CLIENT_ID = os.getenv("QF_CLIENT_ID")
QF_CLIENT_SECRET = os.getenv("QF_CLIENT_SECRET")

ENVS = {
    "prelive": {
        "auth_base": "https://prelive-oauth2.quran.foundation",
        "api_base": "https://apis-prelive.quran.foundation",
    },
    "production": {
        "auth_base": "https://oauth2.quran.foundation",
        "api_base": "https://apis.quran.foundation",
    },
}


def get_qf_config():
    if not QF_CLIENT_ID:
        raise ValueError(
            "Missing Quran Foundation API credentials. "
            "Set QF_CLIENT_ID and QF_CLIENT_SECRET in .env. "
            "Request access: https://api-docs.quran.foundation/request-access"
        )
    env_config = ENVS.get(QF_ENV, ENVS["prelive"])
    return {
        "env": QF_ENV,
        "client_id": QF_CLIENT_ID,
        "client_secret": QF_CLIENT_SECRET,
        "auth_base_url": env_config["auth_base"],
        "api_base_url": env_config["api_base"],
    }
