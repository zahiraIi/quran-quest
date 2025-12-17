"""
API v1 router aggregation.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, recitation, gamification, social, quran

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(quran.router, prefix="/quran", tags=["Quran Content"])
api_router.include_router(recitation.router, prefix="/recitation", tags=["Recitation"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["Gamification"])
api_router.include_router(social.router, prefix="/social", tags=["Social"])

