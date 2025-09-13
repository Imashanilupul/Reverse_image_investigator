from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class MetadataInfo(BaseModel):
    camera_make: Optional[str] = None
    camera_model: Optional[str] = None
    date_taken: Optional[datetime] = None
    gps_coordinates: Optional[Dict[str, float]] = None
    software: Optional[str] = None
    image_size: Optional[Dict[str, int]] = None

class ReverseSearchResult(BaseModel):
    source: str
    url: str
    title: Optional[str] = None
    similarity_score: Optional[float] = None

class GeolocationInfo(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    landmarks: List[str] = []
    confidence: Optional[float] = None

class FaceInfo(BaseModel):
    face_id: str
    bounding_box: Dict[str, int]
    confidence: float
    age_estimate: Optional[Dict[str, Any]] = None
    gender_estimate: Optional[Dict[str, Any]] = None
    emotion_analysis: Optional[Dict[str, float]] = None
    face_encoding: Optional[List[float]] = None
    similar_faces_found: List[str] = []

class FaceRecognitionResult(BaseModel):
    total_faces: int
    faces_detected: List[FaceInfo] = []
    consent_verified: bool
    processing_notes: List[str] = []

class ImageAnalysis(BaseModel):
    objects_detected: List[str] = []
    faces_count: int = 0
    text_extracted: List[str] = []
    scene_description: Optional[str] = None
    image_quality: Optional[str] = None
    face_recognition: Optional[FaceRecognitionResult] = None

class ConsentForm(BaseModel):
    user_id: str
    full_name: str
    email: str
    purpose: str
    consent_types: List[str]
    duration_days: int = 30
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    agreed_to_terms: bool
    timestamp: Optional[datetime] = None

class OSINTResult(BaseModel):
    image_analysis: ImageAnalysis
    metadata: MetadataInfo
    reverse_search_results: List[ReverseSearchResult] = []
    geolocation: GeolocationInfo
    risk_assessment: Dict[str, Any] = {}
    processing_time: float
    report_summary: str
    privacy_compliance: Dict[str, Any] = {}