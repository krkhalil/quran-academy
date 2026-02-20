"""PKCE helpers for OAuth2 Authorization Code flow."""
import os
import base64
import hashlib


def base64url(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode().rstrip("=")


def generate_pkce_pair():
    code_verifier = base64url(os.urandom(32))
    code_challenge = base64url(hashlib.sha256(code_verifier.encode()).digest())
    return code_verifier, code_challenge


def random_string(bytes_len=16):
    return base64url(os.urandom(bytes_len))
