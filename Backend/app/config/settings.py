import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Keys
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    SERP_API_KEY = os.getenv("SERP_API_KEY")
    
    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    
    # Face Recognition
    FACE_RECOGNITION_ENABLED = os.getenv("FACE_RECOGNITION_ENABLED", "true").lower() == "true"
    CONSENT_RETENTION_DAYS = int(os.getenv("CONSENT_RETENTION_DAYS", "30"))
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()