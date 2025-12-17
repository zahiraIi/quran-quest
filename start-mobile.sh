#!/bin/bash
# Start Quran Quest Mobile App

cd "$(dirname "$0")/mobile"

echo "📱 Starting Quran Quest Mobile App..."
echo "📍 Expo will be available at: http://localhost:8081"
echo ""

npx expo start

