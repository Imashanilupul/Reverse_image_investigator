from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from .graphs.osint_workflow import OSINTWorkflow
from .models.schemas import OSINTResult, ConsentForm
from .utils.consent_manager import ConsentManager
import aiofiles
import tempfile
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Image OSINT Tool", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the OSINT workflow and consent manager
osint_workflow = OSINTWorkflow()
consent_manager = ConsentManager()

@app.post("/api/analyze-image", response_model=OSINTResult)
async def analyze_image(
    file: UploadFile = File(...),
    enable_face_recognition: bool = Form(False),
    consent_provided: bool = Form(False),
    analysis_purpose: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None)
):
    """Analyze uploaded image using multi-agent OSINT system"""
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Validate consent for face recognition
    if enable_face_recognition:
        if not consent_provided:
            raise HTTPException(
                status_code=400, 
                detail="Consent required for face recognition analysis"
            )
        if not analysis_purpose:
            raise HTTPException(
                status_code=400, 
                detail="Analysis purpose required for face recognition"
            )
        
        # Log consent
        consent_manager.log_consent({
            "user_id": user_id,
            "purpose": analysis_purpose,
            "timestamp": consent_manager.get_current_timestamp(),
            "ip_address": "127.0.0.1",  # Get from request in production
            "consent_provided": True
        })
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name
    
    try:
        # Run the OSINT workflow
        result = await osint_workflow.run_analysis(
            tmp_file_path, 
            enable_face_recognition=enable_face_recognition
        )
        return result
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)

@app.post("/api/consent/validate")
async def validate_consent(consent_form: ConsentForm):
    """Validate and store user consent for face recognition"""
    return consent_manager.validate_consent(consent_form)

@app.post("/api/consent/revoke")
async def revoke_consent(user_id: str, consent_id: str):
    """Revoke user consent"""
    success = consent_manager.revoke_consent(user_id, consent_id)
    if success:
        return {"message": "Consent revoked successfully"}
    else:
        raise HTTPException(status_code=400, detail="Failed to revoke consent")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Image OSINT Tool"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)