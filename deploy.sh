#!/bin/bash
# UK Quran Academy - Production deploy script
# Run from project root: ./deploy.sh

set -e
cd "$(dirname "$0")"

echo "==> Backend"
cd backend
source venv/bin/activate
pip install -r requirements.txt --quiet
python manage.py migrate
python manage.py collectstatic --noinput --clear 2>/dev/null || true

echo "==> Frontend"
cd ../frontend
npm install --silent
npm run build

echo "==> Copy build to Django"
cd ..
mkdir -p backend/static backend/templates
cp frontend/dist/index.html backend/templates/
cp -r frontend/dist/assets backend/static/
cp frontend/dist/manifest.webmanifest frontend/dist/vite.svg backend/static/ 2>/dev/null || true

cd backend
python manage.py collectstatic --noinput

echo "==> Restart Gunicorn (if systemd service exists)"
sudo systemctl restart quran-reading 2>/dev/null || echo "  (skipped - run: sudo systemctl restart quran-reading)"

echo "==> Deployment complete!"
