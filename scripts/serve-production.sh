#!/bin/bash
# Production deployment script - Django serves React build
set -e
cd "$(dirname "$0")/.."

echo "Building React frontend..."
cd frontend && npm run build && cd ..

echo "Copying React build to Django..."
mkdir -p backend/templates backend/static
cp frontend/dist/index.html backend/templates/
cp -r frontend/dist/assets backend/static/

echo "Collecting static files..."
cd backend && python manage.py collectstatic --noinput

echo "Done. Run: cd backend && gunicorn config.wsgi:application"
