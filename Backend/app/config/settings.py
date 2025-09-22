import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Keys
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    SERPER_API_KEY = os.getenv("SERPER_API_KEY")
    IMG_BB_API_KEY = os.getenv("IMG_BB_API_KEY")
    

    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()