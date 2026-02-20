# UK Quran Academy — Server Deployment Guide

Complete instructions for deploying UK Quran Academy on a Linux server (Ubuntu/Debian).

---

## 1. Server Requirements

| Requirement | Version |
|-------------|---------|
| Ubuntu/Debian | 20.04+ |
| Python | 3.9+ |
| Node.js | 18+ |
| Nginx | Latest |
| Redis | Optional (for caching) |

---

## 2. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python, Node, Nginx, Git
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx git

# Optional: Install Redis for API caching
sudo apt install -y redis-server
```

---

## 3. Clone and Prepare the Project

```bash
# Create app directory
sudo mkdir -p /var/www/quran-reading
sudo chown $USER:$USER /var/www/quran-reading
cd /var/www/quran-reading

# Clone repository (or upload your project)
git clone https://github.com/your-username/quran-academy.git .
# Or: scp -r ./quran-academy/* user@server:/var/www/quran-reading/
```

---

## 4. Backend (Django) Setup

```bash
cd /var/www/quran-reading/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
nano .env
```

**Edit `.env` with production values:**

```env
# Required
SECRET_KEY=your-very-long-random-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# API
QURAN_API_BASE=https://api.quran.com/api/v4

# Optional: Redis cache
REDIS_URL=redis://127.0.0.1:6379/1

# CSRF for HTTPS (required for OAuth/session)
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Quran Foundation OAuth2
QF_ENV=production
QF_CLIENT_ID=your_client_id
QF_CLIENT_SECRET=your_client_secret
```

**Generate a secure SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

```bash
# Run migrations
python manage.py migrate

# Create superuser (optional, for Django admin)
python manage.py createsuperuser
```

---

## 5. Frontend (React) Build

```bash
cd /var/www/quran-reading/frontend

# Install dependencies
npm install

# Set API base (use /api for same-domain deployment)
echo "VITE_API_BASE=/api" > .env.production

# Build for production
npm run build
```

---

## 6. Copy React Build to Django

```bash
cd /var/www/quran-reading

# Create directories
mkdir -p backend/static backend/templates

# Copy React build (Vite uses base: /static/ for production)
cp frontend/dist/index.html backend/templates/
mkdir -p backend/static
cp -r frontend/dist/assets backend/static/
cp frontend/dist/manifest.webmanifest frontend/dist/vite.svg backend/static/ 2>/dev/null || true

# Collect static files
cd backend && source venv/bin/activate
python manage.py collectstatic --noinput
```

---

## 7. Django Production Settings

Create `backend/config/settings_production.py` or update `config/settings.py` to read from env:

Add to `backend/config/settings.py` (at the top, after imports):

```python
# Production overrides from env
import os
if os.getenv('DJANGO_ENV') == 'production':
    DEBUG = False
    ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')
    SECRET_KEY = os.getenv('SECRET_KEY', '')
    CORS_ALLOWED_ORIGINS = [os.getenv('FRONTEND_URL', '')]
```

Or use a separate settings file and run with `DJANGO_SETTINGS_MODULE=config.settings_production`.

---

## 8. Add SPA Fallback Route

Update `backend/config/urls.py` to serve React for non-API routes:

```python
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/users/', include('users.urls')),
    # SPA fallback - serve React for all other routes
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]
```

---

## 9. Gunicorn Systemd Service

Create `/etc/systemd/system/quran-reading.service`:

```ini
[Unit]
Description=UK Quran Academy Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/quran-reading/backend
Environment="PATH=/var/www/quran-reading/backend/venv/bin"
Environment="DJANGO_ENV=production"
EnvironmentFile=/var/www/quran-reading/backend/.env
ExecStart=/var/www/quran-reading/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/var/www/quran-reading/gunicorn.sock \
    config.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Reload systemd and start
sudo systemctl daemon-reload
sudo systemctl enable quran-reading
sudo systemctl start quran-reading
sudo systemctl status quran-reading
```

---

## 10. Nginx Configuration

Create `/etc/nginx/sites-available/quran-reading`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (after SSL is set up)
    # return 301 https://$server_name$request_uri;

    location /static/ {
        alias /var/www/quran-reading/backend/staticfiles/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/quran-reading/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/quran-reading /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 11. SSL with Let's Encrypt (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (Certbot adds this automatically)
sudo certbot renew --dry-run
```

---

## 12. Frontend API Base URL

For same-domain deployment (recommended), use relative URL in `.env.production`:

```
VITE_API_BASE=/api
```

For separate frontend hosting, use your API domain:

```
VITE_API_BASE=https://api.yourdomain.com/api
```

Rebuild after changing:
```bash
cd frontend && npm run build
```

---

## 13. File Permissions

```bash
sudo chown -R www-data:www-data /var/www/quran-reading
sudo chmod -R 755 /var/www/quran-reading
sudo chmod 600 /var/www/quran-reading/backend/.env
```

---

## 14. Quran Foundation OAuth Redirect URI

If using "Sign in with Quran.com", register this redirect URI with Quran Foundation:

```
https://yourdomain.com/api/oauth/callback/
```

---

## 15. Quick Deploy Script

A `deploy.sh` script is included in the project root. Run from project root:

```bash
./deploy.sh
```

Or run the steps manually (see `deploy.sh` for the full sequence).

---

## 16. Troubleshooting

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check Gunicorn: `sudo journalctl -u quran-reading -f` |
| Static files 404 | Run `collectstatic`, check Nginx `alias` path |
| API CORS errors | Add your domain to `CORS_ALLOWED_ORIGINS` |
| Blank page | Check browser console; verify `VITE_API_BASE` and asset paths |

---

## 17. Alternative: Separate Frontend Hosting

Instead of Django serving the React build, you can:

1. **Host frontend on Vercel/Netlify** — Build and deploy React separately
2. **Set `VITE_API_BASE`** to your Django API URL (e.g. `https://api.yourdomain.com`)
3. **Configure CORS** on Django to allow your frontend domain
4. **Use a subdomain** — e.g. `app.yourdomain.com` (frontend) and `api.yourdomain.com` (Django)

---

© EncoderUnlimited
