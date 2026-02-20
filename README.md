# UK Quran Academy

A Quran reading and study platform built with **Django** (backend) and **React** (frontend), powered by the [Quran.com API](https://api.quran.com/).

**© EncoderUnlimited** — All rights reserved.

## Features

- **Surah List** — Browse all 114 surahs with sort options (Surah order, Revelation order, By Juz)
- **Verse Reading** — Arabic Uthmani text + translations (multi-language selector)
- **Audio Recitation** — Verse-by-verse playback with reciter selector + progress bar
- **Word-by-Word** — Transliteration and translation per word with optional audio
- **Tafsir** — Expandable tafsir (Ibn Kathir) per verse
- **Juz Navigation** — Browse by 30 Juz with sidebar + pagination
- **Full-Text Search** — Search surahs and verses (first 3 surahs)
- **Continue Reading** — Last read verse saved in localStorage
- **Popular Surahs** — Quick links (Al-Fatihah, Yaseen, Al-Mulk, etc.)
- **Bookmarks** — Save verses (localStorage + optional Django auth/DB)
- **Dark/Light Theme** — Toggle with system preference support
- **PWA** — Installable app with manifest
- **Responsive Design** — RTL support for Arabic, Amiri font

## Tech Stack

- **Backend:** Django 4.x, Django REST Framework, django-cors-headers
- **Frontend:** React 18+, Vite, Tailwind CSS, React Router, TanStack Query, Axios

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or pnpm

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

Backend runs at **http://localhost:8000**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

### Usage

1. Start the Django backend first (port 8000)
2. Start the React frontend (port 5173)
3. Open http://localhost:5173 in your browser
4. Click any surah to read its verses

## Project Structure

```
quran-academy/
├── backend/           # Django API proxy
│   ├── api/           # Quran API proxy views & services
│   └── config/        # Django settings
├── frontend/          # React SPA
│   └── src/
│       ├── api/       # API client
│       ├── components/
│       └── pages/
└── DEVELOPMENT_PLAN.md
```

## API Endpoints (via Django proxy)

| Endpoint | Description |
|----------|-------------|
| `GET /api/chapters/` | List all 114 chapters |
| `GET /api/chapters/{id}/` | Chapter metadata |
| `GET /api/chapters/{id}/verses/` | Verses with translations |
| `GET /api/translations/` | Available translations |
| `GET /api/recitations/` | Available reciters |
| `GET /api/juzs/` | 30 Juz list |
| `GET /api/juzs/{n}/verses/` | Verses by Juz |
| `GET /api/verses/by_key/{key}/` | Single verse by key (e.g. 1:1) |
| `GET /api/tafsirs/` | Available tafsirs |
| `GET /api/tafsirs/{id}/` | Tafsir for verse/chapter |
| `GET /api/users/bookmarks/` | User bookmarks (auth required) |
| `POST /api/users/token/` | JWT login |

## Production

- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md) for full server deployment instructions (Ubuntu, Nginx, Gunicorn, SSL)
- **Redis cache**: Set `REDIS_URL=redis://localhost:6379/1` for API caching
- **Django auth**: Use `/api/users/token/` for JWT; bookmarks can sync to DB when logged in

## License

© EncoderUnlimited. Quran text and translations from [Quran.com](https://quran.com).
