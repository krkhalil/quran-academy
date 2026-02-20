# Quran Foundation OAuth2 Setup

To enable "Sign in with Quran.com" and sync bookmarks with Quran.com:

## 1. Add credentials to `.env`

Copy `backend/.env.example` to `backend/.env` and add your credentials:

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your Quran Foundation credentials:

```env
# Pre-Production (Test) - limited data, all features
QF_ENV=prelive
QF_CLIENT_ID=37dfae75-cc2f-4dcf-8063-60ca1e8ba518
QF_CLIENT_SECRET=<your_prelive_secret>

# OR Production (Live) - full content
# QF_ENV=production
# QF_CLIENT_ID=d5b6a976-46fb-4a5b-b66a-774cb038784e
# QF_CLIENT_SECRET=<your_production_secret>
```

**Never commit `.env` to git.** Add it to `.gitignore`.

## 2. Register redirect URI

When you requested access from Quran Foundation, you provided redirect URIs. Ensure this exact URI is registered:

- **Local dev:** `http://localhost:8000/api/oauth/callback/`
- **Production:** `https://yourdomain.com/api/oauth/callback/`

## 3. Environment URLs

| Env | Auth Endpoint | API Base |
|-----|---------------|----------|
| prelive | https://prelive-oauth2.quran.foundation | https://apis-prelive.quran.foundation |
| production | https://oauth2.quran.foundation | https://apis.quran.foundation |

## 4. Flow

1. User clicks "Sign in with Quran.com"
2. Redirects to Quran Foundation login
3. After login, redirects to our callback
4. We exchange code for tokens, redirect to frontend with one-time code
5. Frontend exchanges code for tokens, stores in localStorage
