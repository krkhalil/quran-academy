# Quran Academy - Development Plan

## Project Overview

Build a Quran reading and study platform similar to [Quran.com](https://quran.com/) using **Django** (backend) and **ReactJS** (frontend), powered entirely by the **Quran.com API** ([api.quran.com](https://api.quran.com/api/v4/)).

---

## 1. Quran.com Site Features (Target Functionality)

| Feature | Description | API Support |
|---------|-------------|-------------|
| **Surah List** | 114 chapters with Arabic names, translations, verse counts, revelation order | ✅ `/chapters` |
| **Verse Reading** | Arabic Uthmani text + translations per verse | ✅ `/verses/by_chapter/{id}` |
| **Multi-language** | 80+ translations (English, Urdu, Arabic, etc.) | ✅ `/resources/translations` |
| **Audio Recitation** | Multiple reciters (AbdulBaset, Sudais, etc.) with verse-level playback | ✅ `audio` param + `/resources/recitations` |
| **Word-by-Word** | Transliteration + translation per word with audio | ✅ `words=true` |
| **Search** | Full-text search across Arabic & translations | ✅ Search API (api-docs.quran.foundation) |
| **Juz/Hizb Navigation** | Navigate by Juz (30 parts) | ✅ `/juzs`, `/verses` by juz |
| **Tafsir** | Quranic interpretation/commentary | ✅ Tafsir endpoints |
| **Bookmarks/Notes** | User-specific (requires OAuth2 - optional) | ⚠️ Quran.Foundation OAuth2 |

---

## 2. Quran.com API Reference

**Base URL:** `https://api.quran.com/api/v4/`

### Core Endpoints

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `GET /chapters` | List all 114 surahs | `?language=en` |
| `GET /verses/by_chapter/{chapter_id}` | Verses with translations, audio, words | `?translations=131,20&audio=1&words=true&per_page=10&page=1` |
| `GET /quran/verses/uthmani` | Arabic text only | `?chapter_number=1` |
| `GET /resources/translations` | Available translations | `?language=en` |
| `GET /resources/recitations` | Available reciters | - |
| `GET /juzs` | 30 Juz list | - |
| `GET /verses/by_juz/{juz_number}` | Verses by Juz | - |

### Audio Base URL
- Verse audio: `https://verses.quran.com/{recitation_path}` (e.g., `AbdulBaset/Mujawwad/mp3/001001.mp3`)
- Word-by-word: `https://verses.quran.com/wbw/{path}` (e.g., `001_001_001.mp3`)

### Key Translation IDs (English)
- `131` - Sahih International
- `20` - Saheeh International  
- `22` - Yusuf Ali
- `85` - Abdel Haleem

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Django 5.x + Django REST Framework | API proxy, caching, optional auth |
| **Frontend** | React 18+ (Vite) | SPA with routing, state |
| **State** | React Query (TanStack Query) | API caching, mutations |
| **Routing** | React Router v6 | Client-side routing |
| **Styling** | Tailwind CSS or styled-components | RTL support for Arabic |
| **HTTP** | Axios | API requests |

---

## 4. Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React SPA     │────▶│  Django Backend  │────▶│  Quran.com API  │
│   (Frontend)    │     │  (Proxy/Cache)   │     │  api.quran.com   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                         │
        │                         │
        ▼                         ▼
   LocalStorage            Redis (optional)
   (bookmarks,              (response cache)
    preferences)
```

**Why Django?**
- Proxy API requests (avoid CORS, add rate limiting)
- Optional: Cache responses in Redis/DB for performance
- User auth & bookmarks (if not using OAuth2)
- Serve React build in production

---

## 5. Project Structure

```
quran-academy/
├── backend/                 # Django
│   ├── config/              # Settings, URLs
│   ├── api/                 # API proxy views
│   │   ├── views.py         # Proxy to api.quran.com
│   │   ├── urls.py
│   │   └── services/        # Quran API client
│   ├── users/               # Optional: auth, bookmarks
│   └── manage.py
├── frontend/                # React (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── SurahList/
│   │   │   ├── VerseView/
│   │   │   ├── AudioPlayer/
│   │   │   ├── SearchBar/
│   │   │   └── WordByWord/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── SurahPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   └── JuzPage.jsx
│   │   ├── hooks/
│   │   │   ├── useQuranApi.js
│   │   │   └── useAudio.js
│   │   ├── api/
│   │   │   └── quran.js     # API client
│   │   └── App.jsx
│   └── package.json
├── DEVELOPMENT_PLAN.md
└── README.md
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Django project setup with DRF, CORS
- [ ] React + Vite setup with Tailwind, React Router
- [ ] API proxy service in Django (forward requests to api.quran.com)
- [ ] Basic layout: header, sidebar, RTL support

### Phase 2: Core Reading (Week 2)
- [ ] **Surah List Page**: Fetch `/chapters`, display with sort (Surah order, Juz, Revelation)
- [ ] **Surah Detail Page**: Fetch verses with translations (`/verses/by_chapter/{id}`)
- [ ] Verse display: Arabic (Uthmani) + selected translation
- [ ] Translation selector dropdown
- [ ] Pagination for long surahs (per_page=20)

### Phase 3: Audio & Word-by-Word (Week 3)
- [ ] Reciter selector (from `/resources/recitations`)
- [ ] Audio player: play/pause, verse-by-verse, progress
- [ ] Word-by-word view: `words=true` in API, show transliteration + translation on hover
- [ ] Word audio playback (optional)

### Phase 4: Navigation & Search (Week 4)
- [ ] Juz navigation: list 30 Juz, verses by Juz
- [ ] Search: integrate Search API (if available) or client-side filter
- [ ] "Continue reading" / last read verse (localStorage)
- [ ] Popular surahs quick links (Yaseen, Al-Mulk, etc.)

### Phase 5: Polish & Optional Features (Week 5+)
- [ ] Tafsir integration
- [ ] Bookmarks (localStorage or Django auth)
- [ ] Dark/light theme
- [ ] Responsive design, PWA (optional)
- [ ] OAuth2 for Quran.com sync (advanced)

---

## 7. Django API Proxy Design

**Purpose:** Avoid CORS, centralize API base URL, add caching.

```python
# backend/api/services/quran_client.py
import requests

QURAN_API_BASE = "https://api.quran.com/api/v4"

def get_chapters(language="en"):
    r = requests.get(f"{QURAN_API_BASE}/chapters", params={"language": language})
    return r.json()

def get_verses(chapter_id, translations="131", audio=1, words=False, page=1, per_page=20):
    params = {
        "translations": translations,
        "audio": audio,
        "words": "true" if words else "false",
        "page": page,
        "per_page": per_page,
    }
    r = requests.get(f"{QURAN_API_BASE}/verses/by_chapter/{chapter_id}", params=params)
    return r.json()
```

**Django View:**
```python
# backend/api/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services.quran_client import get_chapters, get_verses

@api_view(['GET'])
def chapters(request):
    data = get_chapters(request.GET.get('language', 'en'))
    return Response(data)

@api_view(['GET'])
def verses(request, chapter_id):
    data = get_verses(
        chapter_id,
        translations=request.GET.get('translations', '131'),
        audio=request.GET.get('audio', 1),
        words=request.GET.get('words', 'false') == 'true',
        page=request.GET.get('page', 1),
        per_page=request.GET.get('per_page', 20),
    )
    return Response(data)
```

---

## 8. React Key Components

| Component | Responsibility |
|-----------|----------------|
| `SurahList` | Grid/list of 114 surahs, sortable, links to `/surah/:id` |
| `VerseView` | Single verse: Arabic, translation, verse number |
| `VerseList` | Scrollable list of verses with AudioPlayer per verse |
| `AudioPlayer` | Play/pause, reciter select, verse highlighting |
| `WordByWord` | Expandable word breakdown with transliteration |
| `TranslationSelector` | Dropdown to change translation (persist in localStorage) |
| `SearchBar` | Search input, debounced, calls search API |
| `JuzSidebar` | Quick nav by Juz |

---

## 9. RTL & Arabic Styling

- Use `dir="rtl"` for Arabic text containers
- Font: **Amiri**, **Noto Naskh Arabic**, or **Scheherazade New** (Google Fonts)
- Ensure verse numbers and translations align correctly in RTL layout

---

## 10. Environment Variables

```env
# Backend (.env)
QURAN_API_BASE=https://api.quran.com/api/v4
CACHE_TTL=3600  # Optional Redis cache TTL
ALLOWED_HOSTS=localhost,127.0.0.1

# Frontend (.env)
VITE_API_BASE=http://localhost:8000/api  # Django proxy
```

---

## 11. API Rate Limits & Best Practices

- Quran.com API is **free** and generally does not require authentication for content APIs
- Implement **client-side caching** (React Query) with staleTime: 1 hour for chapters, 30 min for verses
- Consider **Django cache** for chapters (rarely change) - cache for 24h
- Use `per_page` wisely: 20–50 verses per request for balance

---

## 12. Project Requirements (What You Need to Build)

### 12.1 System & Tools

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Python** | 3.10+ | Django backend |
| **Node.js** | 18+ (LTS) | React build tooling, npm |
| **npm** or **pnpm** | Latest | Frontend package manager |
| **Git** | Any | Version control |
| **Code Editor** | VS Code / Cursor | Recommended |

### 12.2 Backend Dependencies (Python)

```
# requirements.txt
Django>=5.0
djangorestframework>=3.14
django-cors-headers>=4.3
requests>=2.31
python-dotenv>=1.0
gunicorn>=21.0          # Production WSGI server
django-redis>=5.4       # Optional: response caching
```

| Package | Purpose |
|---------|---------|
| `Django` | Web framework, ORM, admin |
| `djangorestframework` | REST API views, serializers |
| `django-cors-headers` | Allow React to call Django (CORS) |
| `requests` | HTTP client to call Quran.com API |
| `python-dotenv` | Load `.env` variables |
| `django-redis` | Optional: cache API responses |

### 12.3 Frontend Dependencies (Node)

```
# package.json (key dependencies)
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI library |
| `react-router-dom` | Client-side routing |
| `@tanstack/react-query` | Server state, caching, loading states |
| `axios` | HTTP client for API calls |
| `vite` | Build tool, dev server, HMR |
| `tailwindcss` | Utility-first CSS |

### 12.4 Optional / Nice-to-Have

| Tool | Purpose |
|------|---------|
| **Redis** | Server-side API response cache |
| **PostgreSQL** | If adding user accounts, bookmarks in DB |
| **Docker** | Containerized deployment |
| **Nginx** | Reverse proxy in production |

### 12.5 Development Workflow

1. **Backend**: `python manage.py runserver` (port 8000)
2. **Frontend**: `npm run dev` (port 5173)
3. **Production**: Django serves React build from `frontend/dist` or use separate static hosting

---

## 13. Quran API Utilization (What We Use from the API)

### 13.1 Complete API Endpoint Usage Map

| # | Endpoint | Full URL | Parameters We Use | Data We Extract |
|---|----------|----------|-------------------|-----------------|
| 1 | Chapters | `GET /chapters` | `language` (en, ar, etc.) | `id`, `name_simple`, `name_arabic`, `name_complex`, `verses_count`, `revelation_place`, `revelation_order`, `translated_name.name`, `pages`, `bismillah_pre` |
| 2 | Verses by Chapter | `GET /verses/by_chapter/{id}` | `translations`, `audio`, `words`, `per_page`, `page`, `fields` | `verses[]` with `text_uthmani`, `verse_key`, `verse_number`, `translations[]`, `audio.url`, `audio.segments`, `words[]` |
| 3 | Quran Uthmani | `GET /quran/verses/uthmani` | `chapter_number` | `verses[].text_uthmani`, `verse_key` (lightweight Arabic-only) |
| 4 | Translations | `GET /resources/translations` | `language` | `id`, `name`, `author_name`, `language_name`, `slug` for translation selector |
| 5 | Recitations | `GET /resources/recitations` | - | `id`, `reciter_name`, `style`, `translated_name` for reciter selector |
| 6 | Juzs | `GET /juzs` | - | `juz_number`, `verse_mapping` (chapter:verse ranges) |
| 7 | Verses by Juz | `GET /verses/by_juz/{juz_number}` | `translations`, `per_page`, `page` | Same structure as verses by chapter |
| 8 | Verse by Key | `GET /verses/by_key/{verse_key}` | `translations` (e.g. 1:1) | Single verse for "jump to verse" |
| 9 | Chapter Info | `GET /chapters/{id}` | `language` | Full chapter metadata for surah header |
| 10 | Search | Search API (api-docs.quran.foundation) | `q`, `size`, `page`, `language`, `translations` | `verse_key`, `text`, `highlighted`, `translations` |

### 13.2 API Response Structures (What We Parse)

#### Chapters Response (`/chapters`)

```json
{
  "chapters": [
    {
      "id": 1,
      "revelation_place": "makkah",
      "revelation_order": 5,
      "bismillah_pre": false,
      "name_simple": "Al-Fatihah",
      "name_complex": "Al-Fātiĥah",
      "name_arabic": "الفاتحة",
      "verses_count": 7,
      "pages": [1, 1],
      "translated_name": { "language_name": "english", "name": "The Opener" }
    }
  ]
}
```

**We use:** `id`, `name_simple`, `name_arabic`, `verses_count`, `translated_name.name`, `revelation_place`, `revelation_order`, `bismillah_pre`, `pages`

---

#### Verses Response (`/verses/by_chapter/1?translations=131&audio=1&words=true`)

```json
{
  "verses": [
    {
      "id": 1,
      "verse_number": 1,
      "verse_key": "1:1",
      "text_uthmani": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      "juz_number": 1,
      "page_number": 1,
      "translations": [
        { "id": 96343, "resource_id": 20, "text": "In the name of Allāh..." }
      ],
      "audio": {
        "url": "AbdulBaset/Mujawwad/mp3/001001.mp3",
        "segments": [[0, 1, 0, 960], [1, 2, 970, 1420]]
      },
      "words": [
        {
          "id": 1,
          "position": 1,
          "text": "ﭑ",
          "translation": { "text": "In (the) name", "language_name": "english" },
          "transliteration": { "text": "bis'mi", "language_name": "english" },
          "audio_url": "wbw/001_001_001.mp3"
        }
      ]
    }
  ],
  "pagination": { "per_page": 10, "current_page": 1, "total_pages": 1, "total_records": 7 }
}
```

**We use:**
- **Verse:** `verse_key`, `verse_number`, `text_uthmani`, `juz_number`, `page_number`
- **Translations:** `translations[].text`, `translations[].resource_id`
- **Audio:** `audio.url` (prepend `https://verses.quran.com/`), `audio.segments` for timing
- **Words:** `words[].text`, `words[].translation.text`, `words[].transliteration.text`, `words[].audio_url` (prepend `https://verses.quran.com/`)

---

#### Recitations Response (`/resources/recitations`)

```json
{
  "recitations": [
    { "id": 1, "reciter_name": "AbdulBaset AbdulSamad", "style": "Mujawwad" },
    { "id": 2, "reciter_name": "AbdulBaset AbdulSamad", "style": "Murattal" }
  ]
}
```

**We use:** `id` (for `audio=1` param), `reciter_name`, `style` for display

---

#### Translations Response (`/resources/translations?language=en`)

```json
{
  "translations": [
    { "id": 131, "name": "Sahih International", "author_name": "Sahih International", "language_name": "english" },
    { "id": 20, "name": "Saheeh International", "author_name": "Saheeh International", "language_name": "english" }
  ]
}
```

**We use:** `id` (for `translations=131,20` param), `name`, `author_name`, `language_name`

---

### 13.3 External Audio URLs (We Construct)

| Type | Base URL | Example Path from API | Full URL We Build |
|------|----------|------------------------|-------------------|
| Verse audio | `https://verses.quran.com/` | `AbdulBaset/Mujawwad/mp3/001001.mp3` | `https://verses.quran.com/AbdulBaset/Mujawwad/mp3/001001.mp3` |
| Word audio | `https://verses.quran.com/` | `wbw/001_001_001.mp3` | `https://verses.quran.com/wbw/001_001_001.mp3` |

### 13.4 API Parameters We Use (Summary)

| Endpoint | Parameter | Our Usage |
|----------|-----------|-----------|
| `verses/by_chapter` | `translations` | Comma-separated IDs: `131,20` (user-selected) |
| `verses/by_chapter` | `audio` | Recitation ID: `1` (AbdulBaset Mujawwad) or user-selected |
| `verses/by_chapter` | `words` | `true` when word-by-word view is enabled |
| `verses/by_chapter` | `per_page` | `20` or `50` |
| `verses/by_chapter` | `page` | Pagination for long surahs |
| `verses/by_chapter` | `fields` | `text_uthmani,translations` when we need minimal data |
| `chapters` | `language` | `en`, `ar`, etc. for translated names |

### 13.5 API Endpoints We Do NOT Use (Out of Scope)

| Endpoint | Reason |
|----------|--------|
| `tafsirs/*` | Phase 5 optional |
| `foot_note` | Optional for footnote handling |
| `rub_el_hizb`, `ruku`, `manzil` | Advanced navigation; optional |
| OAuth2 / User APIs | User accounts optional |

---

## 14. References

- [Quran.com](https://quran.com/)
- [Quran.com Developers](https://quran.com/developers)
- [API Documentation](https://api-docs.quran.foundation/)
- [Quran.com API (GitHub)](https://github.com/quran/quran.com-api)
- [Quran.com Frontend (Next.js reference)](https://github.com/quran/quran.com-frontend-next)

---

## Next Steps

1. Run `django-admin startproject` and `npm create vite@latest frontend -- --template react`
2. Implement Phase 1 (Django proxy + React shell)
3. Build Phase 2 (Surah list + verse reading)
4. Iterate through remaining phases

Good luck with your Quran Academy project! 🌙
