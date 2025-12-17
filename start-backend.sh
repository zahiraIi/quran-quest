#!/bin/bash
# Start Quran Quest Backend Server

cd "$(dirname "$0")/backend"

echo "🚀 Starting Quran Quest Backend..."
echo "📍 API will be available at: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/api/docs"
echo ""

python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

