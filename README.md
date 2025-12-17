# 📖 Quran Quest

> A gamified, intuitive app for learning to read and recite the Quran - Duolingo-style!

![React Native](https://img.shields.io/badge/React_Native-Expo-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![AI](https://img.shields.io/badge/AI-Whisper_Quran-purple)

## ✨ Features

### 🎯 Core Learning
- **Progressive Lessons**: Learn Arabic letters → words → verses → full surahs
- **Voice Recognition**: Real-time recitation accuracy using AI (Tarteel-trained Whisper)
- **Tajweed Guidance**: Visual feedback on pronunciation rules
- **Word-by-Word Learning**: Synchronized audio with highlighted text

### 🎮 Gamification (Duolingo-Style)
- **XP Points**: Earn experience for completing lessons and challenges
- **Streaks**: Daily practice streaks with streak freezes
- **Hearts/Lives**: Limited attempts that regenerate over time
- **Leagues**: Weekly competitive leaderboards (Bronze → Diamond)
- **Achievements**: Unlock badges for milestones
- **Level System**: Progress from Beginner to Hafiz

### 👥 Social & Multiplayer
- **Friend Challenges**: Head-to-head recitation battles
- **Study Circles**: Join or create learning groups
- **Leaderboards**: Global, friends, and local rankings
- **Share Progress**: Social media integration

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MOBILE APP                               │
│                    (React Native + Expo)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Lessons   │  │  Recitation │  │   Social    │              │
│  │   Module    │  │   Module    │  │   Module    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                       │
│              ┌──────────────────────┐                            │
│              │   Audio Recording    │                            │
│              │   (expo-audio)       │                            │
│              └──────────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                                │
│                      (FastAPI + Nginx)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Auth     │  │   Lessons   │  │   Social    │              │
│  │   Service   │  │   Service   │  │   Service   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Audio    │  │ Gamification│  │   Quran     │              │
│  │   Service   │  │   Service   │  │   Content   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  PostgreSQL │   │    Redis    │   │   AWS S3    │
│  (Primary)  │   │   (Cache)   │   │   (Audio)   │
└─────────────┘   └─────────────┘   └─────────────┘
                           │
                           ▼
              ┌──────────────────────┐
              │   AI/ML Services     │
              │  ┌────────────────┐  │
              │  │ Whisper Quran  │  │
              │  │  (Recitation)  │  │
              │  └────────────────┘  │
              │  ┌────────────────┐  │
              │  │ Tajweed Model  │  │
              │  │  (Optional)    │  │
              │  └────────────────┘  │
              └──────────────────────┘
```

## 📱 App Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Onboarding │───▶│  Assessment  │───▶│   Home Feed  │
│              │    │    Quiz      │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
         ┌────────────────┬────────────────────┼─────────────────┐
         ▼                ▼                    ▼                 ▼
  ┌────────────┐  ┌────────────┐      ┌────────────┐    ┌────────────┐
  │   Learn    │  │  Practice  │      │   Social   │    │   Profile  │
  │  (Lessons) │  │ (Recite)   │      │  (Friends) │    │  (Stats)   │
  └────────────┘  └────────────┘      └────────────┘    └────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React Native** with **Expo** (SDK 52+)
- **Expo Router** for navigation
- **Zustand** for state management
- **React Query** for server state
- **expo-audio** for recording
- **Reanimated** for animations

### Backend
- **FastAPI** (Python 3.10+)
- **PostgreSQL** with SQLAlchemy
- **Redis** for caching & real-time
- **Celery** for background jobs
- **WebSockets** for multiplayer

### AI/ML
- **Whisper** (tarteel-ai/whisper-base-ar-quran) for transcription
- **Custom scoring** for accuracy assessment
- **QUL** (Quranic Universal Library) for content

### Infrastructure
- **Docker** + **Docker Compose**
- **AWS S3** for audio storage
- **Firebase** for push notifications
- **Supabase** alternative option

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- Expo CLI

### Setup

```bash
# Clone the repository
git clone https://github.com/zahiraIi/quran-quest.git
cd quran-quest

# Install frontend dependencies
cd mobile
npm install

# Install backend dependencies
cd ../backend
poetry install

# Start services with Docker
docker-compose up -d

# Run the mobile app
cd ../mobile
npx expo start
```

## 📂 Project Structure

```
quran-quest/
├── mobile/                    # React Native Expo app
│   ├── app/                   # Expo Router screens
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API & audio services
│   ├── stores/                # Zustand stores
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
│
├── backend/                   # FastAPI backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── core/              # Config, security
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── ml/                # ML/AI services
│   ├── tests/                 # Test suite
│   └── alembic/               # DB migrations
│
├── ml/                        # ML models & scripts
│   ├── models/                # Model files
│   └── scripts/               # Training scripts
│
└── docker/                    # Docker configs
```
