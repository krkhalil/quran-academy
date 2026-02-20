"""
Quran Foundation OAuth2 - auth URL, callback, token exchange.
"""
import requests
from urllib.parse import urlencode
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .qf_oauth import get_qf_config
from .pkce import generate_pkce_pair, random_string


@api_view(["GET"])
@permission_classes([AllowAny])
def oauth_login(request):
    """Redirect to Quran Foundation OAuth2 login."""
    try:
        cfg = get_qf_config()
    except ValueError as e:
        return Response({"error": str(e)}, status=503)

    redirect_uri = request.build_absolute_uri("/api/oauth/callback/")
    code_verifier, code_challenge = generate_pkce_pair()
    state = random_string()
    nonce = random_string()

    request.session["qf_oauth"] = {
        "state": state,
        "nonce": nonce,
        "code_verifier": code_verifier,
        "redirect_uri": redirect_uri,
    }

    params = {
        "response_type": "code",
        "client_id": cfg["client_id"],
        "redirect_uri": redirect_uri,
        "scope": "openid offline_access user collection",
        "state": state,
        "nonce": nonce,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    }
    auth_url = f"{cfg['auth_base_url']}/oauth2/auth?{urlencode(params)}"
    return redirect(auth_url)


@api_view(["GET"])
@permission_classes([AllowAny])
def oauth_callback(request):
    """Exchange code for tokens and redirect to frontend."""
    code = request.GET.get("code")
    state = request.GET.get("state")
    error = request.GET.get("error")

    if error:
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        return redirect(f"{frontend_url}/?oauth_error={error}")

    stored = request.session.get("qf_oauth")
    if not stored or state != stored.get("state"):
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        return redirect(f"{frontend_url}/?oauth_error=invalid_state")

    cfg = get_qf_config()
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": stored["redirect_uri"],
        "code_verifier": stored["code_verifier"],
    }
    if cfg.get("client_secret"):
        auth = (cfg["client_id"], cfg["client_secret"])
    else:
        auth = None
        data["client_id"] = cfg["client_id"]
    if not auth:
        data["client_id"] = cfg["client_id"]

    resp = requests.post(
        f"{cfg['auth_base_url']}/oauth2/token",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        auth=auth,
    )

    if resp.status_code != 200:
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        return redirect(f"{frontend_url}/?oauth_error=token_exchange_failed")

    tokens = resp.json()
    token_data = {
        "access_token": tokens.get("access_token"),
        "refresh_token": tokens.get("refresh_token"),
        "id_token": tokens.get("id_token"),
        "expires_in": tokens.get("expires_in"),
    }
    request.session["qf_tokens"] = token_data
    del request.session["qf_oauth"]

    # One-time code for frontend to fetch tokens (avoids cookie cross-origin issues)
    import secrets
    exchange_code = secrets.token_urlsafe(32)
    request.session["qf_exchange"] = {"code": exchange_code, "tokens": token_data}

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    return redirect(f"{frontend_url}/oauth/callback?code={exchange_code}")


@api_view(["GET"])
@permission_classes([AllowAny])
def oauth_exchange(request):
    """Exchange one-time code for tokens (called by frontend after redirect)."""
    code = request.GET.get("code")
    stored = request.session.get("qf_exchange")
    if not code or not stored or stored.get("code") != code:
        return Response({"error": "Invalid or expired code"}, status=400)
    tokens = stored.get("tokens", {})
    del request.session["qf_exchange"]
    return Response({
        "access_token": tokens.get("access_token"),
        "refresh_token": tokens.get("refresh_token"),
        "id_token": tokens.get("id_token"),
        "expires_in": tokens.get("expires_in"),
    })


@api_view(["GET"])
def oauth_me(request):
    """Return current session tokens (for frontend to store)."""
    tokens = request.session.get("qf_tokens")
    if not tokens:
        return Response({"authenticated": False}, status=401)
    return Response({
        "authenticated": True,
        "access_token": tokens.get("access_token"),
        "id_token": tokens.get("id_token"),
    })


@api_view(["POST"])
def oauth_logout(request):
    """Clear session."""
    request.session.pop("qf_tokens", None)
    return Response({"ok": True})
