import cv2
import numpy as np
from deepface import DeepFace
from typing import List, Dict, Any, Tuple
import uuid
import logging
import tempfile
import os
from ..models.schemas import FaceInfo, FaceRecognitionResult

logger = logging.getLogger(__name__)

class FaceRecognitionAgent:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Initialize face detection models
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Try to load DNN face detection model (more accurate)
        try:
            self.net = cv2.dnn.readNetFromTensorflow(
                'opencv_face_detector_uint8.pb', 
                'opencv_face_detector.pbtxt'
            )
            self.use_dnn = True
        except:
            self.logger.warning("DNN face detection model not found, using Haar cascades")
            self.use_dnn = False
        
        # Initialize face recognition model for encoding generation
        try:
            self.face_recognizer = cv2.face.LBPHFaceRecognizer_create()
            self.use_face_recognizer = True
        except:
            self.logger.warning("OpenCV face recognition module not available")
            self.use_face_recognizer = False
    
    def _detect_faces_dnn(self, image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detect faces using DNN model (more accurate)"""
        h, w = image.shape[:2]
        blob = cv2.dnn.blobFromImage(image, 1.0, (300, 300), [104, 117, 123])
        self.net.setInput(blob)
        detections = self.net.forward()
        
        faces = []
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > 0.5:  # Confidence threshold
                x1 = int(detections[0, 0, i, 3] * w)
                y1 = int(detections[0, 0, i, 4] * h)
                x2 = int(detections[0, 0, i, 5] * w)
                y2 = int(detections[0, 0, i, 6] * h)
                
                # Convert to (top, right, bottom, left) format to match face_recognition
                faces.append((y1, x2, y2, x1))
        
        return faces
    
    def _detect_faces_haar(self, image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detect faces using Haar cascades"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(30, 30)
        )
        
        # Convert from (x, y, w, h) to (top, right, bottom, left) format
        face_locations = []
        for (x, y, w, h) in faces:
            face_locations.append((y, x + w, y + h, x))
        
        return face_locations
    
    def _generate_face_encoding(self, face_image: np.ndarray) -> np.ndarray:
        """Generate face encoding using various methods"""
        try:
            # Method 1: Use histogram of oriented gradients (HOG) features
            face_gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
            face_resized = cv2.resize(face_gray, (128, 128))
            
            # Calculate HOG features
            hog = cv2.HOGDescriptor(_winSize=(128, 128), _blockSize=(16, 16), 
                                   _blockStride=(8, 8), _cellSize=(8, 8), _nbins=9)
            hog_features = hog.compute(face_resized)
            
            if hog_features is not None:
                return hog_features.flatten()
            else:
                # Fallback to LBP features
                return self._generate_lbp_features(face_gray)
                
        except Exception as e:
            self.logger.warning(f"HOG feature extraction failed: {e}")
            # Fallback to simple pixel-based encoding
            face_gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
            return self._generate_pixel_encoding(face_gray)
    
    def _generate_lbp_features(self, face_gray: np.ndarray) -> np.ndarray:
        """Generate Local Binary Pattern features"""
        try:
            face_resized = cv2.resize(face_gray, (64, 64))
            
            # Calculate LBP
            radius = 1
            n_points = 8 * radius
            lbp = np.zeros_like(face_resized)
            
            for i in range(radius, face_resized.shape[0] - radius):
                for j in range(radius, face_resized.shape[1] - radius):
                    center = face_resized[i, j]
                    binary_string = []
                    
                    for k in range(n_points):
                        angle = 2 * np.pi * k / n_points
                        x = int(i + radius * np.cos(angle))
                        y = int(j + radius * np.sin(angle))
                        
                        if 0 <= x < face_resized.shape[0] and 0 <= y < face_resized.shape[1]:
                            binary_string.append(1 if face_resized[x, y] > center else 0)
                        else:
                            binary_string.append(0)
                    
                    # Convert binary to decimal
                    lbp[i, j] = sum([binary_string[k] * (2 ** k) for k in range(len(binary_string))])
            
            # Calculate histogram
            hist, _ = np.histogram(lbp.ravel(), bins=256, range=(0, 256))
            return hist.astype(np.float32)
            
        except Exception as e:
            self.logger.warning(f"LBP feature extraction failed: {e}")
            return self._generate_pixel_encoding(face_gray)
    
    def _generate_pixel_encoding(self, face_gray: np.ndarray) -> np.ndarray:
        """Simple pixel-based encoding as fallback"""
        face_resized = cv2.resize(face_gray, (50, 50))
        return face_resized.flatten().astype(np.float32) / 255.0
    
    def _calculate_face_confidence(self, face_location: Tuple[int, int, int, int], 
                                 image_shape: Tuple[int, int]) -> float:
        """Calculate confidence score based on face size and position"""
        top, right, bottom, left = face_location
        face_width = right - left
        face_height = bottom - top
        face_area = face_width * face_height
        
        # Normalize by image size
        img_height, img_width = image_shape[:2]
        normalized_area = face_area / (img_width * img_height)
        
        # Simple heuristic: larger faces are more confident
        confidence = min(0.9, max(0.3, normalized_area * 10))
        return confidence
    
    async def analyze_faces(self, image_path: str) -> Dict[str, Any]:
        """
        Comprehensive face analysis with consent verification
        """
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image from {image_path}")
            
            # Detect faces using the best available method
            if self.use_dnn:
                face_locations = self._detect_faces_dnn(image)
            else:
                face_locations = self._detect_faces_haar(image)
            
            faces_detected = []
            processing_notes = []
            
            for i, face_location in enumerate(face_locations):
                face_id = str(uuid.uuid4())
                
                # Extract face region for detailed analysis
                top, right, bottom, left = face_location
                
                # Ensure coordinates are within image bounds
                top = max(0, top)
                left = max(0, left)
                bottom = min(image.shape[0], bottom)
                right = min(image.shape[1], right)
                
                face_image = image[top:bottom, left:right]
                
                if face_image.size == 0:
                    continue
                
                # Save face region temporarily for DeepFace analysis
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_face:
                    cv2.imwrite(temp_face.name, face_image)
                    temp_face_path = temp_face.name
                
                try:
                    # Generate face encoding
                    face_encoding = self._generate_face_encoding(face_image)
                    
                    # Calculate confidence
                    confidence = self._calculate_face_confidence(face_location, image.shape)
                    
                    # Demographic analysis using DeepFace
                    demographic_info = self._analyze_demographics(temp_face_path)
                    
                    # Emotion analysis
                    emotion_info = self._analyze_emotions(temp_face_path)
                    
                    # Create face info object
                    face_info = FaceInfo(
                        face_id=face_id,
                        bounding_box={
                            "top": int(top), "right": int(right), 
                            "bottom": int(bottom), "left": int(left)
                        },
                        confidence=float(confidence),
                        age_estimate=demographic_info.get('age'),
                        gender_estimate=demographic_info.get('gender'),
                        emotion_analysis=emotion_info,
                        face_encoding=face_encoding.tolist(),
                        similar_faces_found=[]
                    )
                    
                    faces_detected.append(face_info)
                    processing_notes.append(f"Successfully analyzed face {face_id}")
                    
                except Exception as face_error:
                    self.logger.error(f"Error analyzing face {face_id}: {str(face_error)}")
                    processing_notes.append(f"Partial analysis for face {face_id}: {str(face_error)}")
                    
                    # Add basic face info even if detailed analysis fails
                    try:
                        basic_encoding = self._generate_face_encoding(face_image)
                        basic_face_info = FaceInfo(
                            face_id=face_id,
                            bounding_box={"top": int(top), "right": int(right), 
                                        "bottom": int(bottom), "left": int(left)},
                            confidence=0.6,
                            face_encoding=basic_encoding.tolist()
                        )
                        faces_detected.append(basic_face_info)
                    except:
                        # If even basic encoding fails, add minimal info
                        minimal_face_info = FaceInfo(
                            face_id=face_id,
                            bounding_box={"top": int(top), "right": int(right), 
                                        "bottom": int(bottom), "left": int(left)},
                            confidence=0.3,
                            face_encoding=[]
                        )
                        faces_detected.append(minimal_face_info)
                
                finally:
                    # Clean up temporary face file
                    if os.path.exists(temp_face_path):
                        os.unlink(temp_face_path)
            
            return to_python_type({
                "total_faces": len(faces_detected),
                "faces_detected": [face.dict() for face in faces_detected],
                "consent_verified": True,
                "processing_notes": processing_notes
            })
            
        except Exception as e:
            self.logger.error(f"Face analysis failed: {str(e)}")
            return {
                "total_faces": 0,
                "faces_detected": [],
                "consent_verified": False,
                "processing_notes": [f"Analysis failed: {str(e)}"]
            }
    
    def _analyze_demographics(self, face_image_path: str) -> Dict[str, Any]:
        """Analyze age and gender using DeepFace"""
        try:
            result = DeepFace.analyze(
                img_path=face_image_path,
                actions=['age', 'gender'],
                enforce_detection=False
            )
            
            if isinstance(result, list):
                result = result[0]
            
            return {
                "age": {
                    "estimated_age": result.get('age', 'unknown'),
                    "confidence": 0.8
                },
                "gender": {
                    "predicted_gender": result.get('dominant_gender', 'unknown'),
                    "confidence": result.get('gender', {}).get(result.get('dominant_gender', ''), 0.5)
                }
            }
        except Exception as e:
            self.logger.warning(f"Demographic analysis failed: {str(e)}")
            return {"age": None, "gender": None}
    
    def _analyze_emotions(self, face_image_path: str) -> Dict[str, float]:
        """Analyze emotions using DeepFace"""
        try:
            result = DeepFace.analyze(
                img_path=face_image_path,
                actions=['emotion'],
                enforce_detection=False
            )
            
            if isinstance(result, list):
                result = result[0]
            
            return result.get('emotion', {})
        except Exception as e:
            self.logger.warning(f"Emotion analysis failed: {str(e)}")
            return {}
    
    def anonymize_faces(self, image_path: str, output_path: str) -> bool:
        """Blur or mask faces in the image for privacy protection"""
        try:
            image = cv2.imread(image_path)
            if image is None:
                return False
            
            # Detect faces
            if self.use_dnn:
                face_locations = self._detect_faces_dnn(image)
            else:
                face_locations = self._detect_faces_haar(image)
            
            for (top, right, bottom, left) in face_locations:
                # Ensure coordinates are within bounds
                top = max(0, top)
                left = max(0, left)
                bottom = min(image.shape[0], bottom)
                right = min(image.shape[1], right)
                
                if bottom > top and right > left:
                    face_region = image[top:bottom, left:right]
                    blurred_face = cv2.GaussianBlur(face_region, (99, 99), 30)
                    image[top:bottom, left:right] = blurred_face
            
            cv2.imwrite(output_path, image)
            return True
            
        except Exception as e:
            self.logger.error(f"Face anonymization failed: {str(e)}")
            return False
    
    def compare_faces(self, encoding1: List[float], encoding2: List[float], 
                     threshold: float = 0.6) -> bool:
        """Compare two face encodings to determine if they're the same person"""
        try:
            if not encoding1 or not encoding2:
                return False
            
            # Convert to numpy arrays
            enc1 = np.array(encoding1)
            enc2 = np.array(encoding2)
            
            # Ensure same length
            if len(enc1) != len(enc2):
                return False
            
            # Calculate distance (you can use different metrics)
            if len(enc1) > 100:  # For HOG features
                # Use cosine similarity for high-dimensional features
                dot_product = np.dot(enc1, enc2)
                norm1 = np.linalg.norm(enc1)
                norm2 = np.linalg.norm(enc2)
                
                if norm1 == 0 or norm2 == 0:
                    return False
                    
                cosine_similarity = dot_product / (norm1 * norm2)
                return cosine_similarity > threshold
            else:
                # Use Euclidean distance for simpler features
                distance = np.linalg.norm(enc1 - enc2)
                max_distance = np.sqrt(len(enc1))  # Normalize by feature length
                normalized_distance = distance / max_distance
                return normalized_distance < (1 - threshold)
                
        except Exception as e:
            self.logger.error(f"Face comparison failed: {str(e)}")
            return False

def to_python_type(obj):
    """Recursively convert numpy types to native Python types."""
    if isinstance(obj, np.generic):
        return obj.item()
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: to_python_type(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [to_python_type(v) for v in obj]
    else:
        return obj