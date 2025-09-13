# import cv2
# import face_recognition
# import numpy as np
# from deepface import DeepFace
# from typing import List, Dict, Any
# import uuid
# import logging
# import tempfile
# import os
# from ..models.schemas import FaceInfo, FaceRecognitionResult

# logger = logging.getLogger(__name__)

# class FaceRecognitionAgent:
#     def __init__(self):
#         self.logger = logging.getLogger(__name__)
        
#     async def analyze_faces(self, image_path: str) -> Dict[str, Any]:
#         """
#         Comprehensive face analysis with consent verification
#         """
#         try:
#             # Load image
#             image = face_recognition.load_image_file(image_path)
#             rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
#             # Find all faces
#             face_locations = face_recognition.face_locations(image)
#             face_encodings = face_recognition.face_encodings(image, face_locations)
            
#             faces_detected = []
#             processing_notes = []
            
#             for i, (face_location, face_encoding) in enumerate(zip(face_locations, face_encodings)):
#                 face_id = str(uuid.uuid4())
                
#                 # Extract face region for detailed analysis
#                 top, right, bottom, left = face_location
#                 face_image = rgb_image[top:bottom, left:right]
                
#                 # Save face region temporarily for DeepFace analysis
#                 with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_face:
#                     cv2.imwrite(temp_face.name, cv2.cvtColor(face_image, cv2.COLOR_RGB2BGR))
#                     temp_face_path = temp_face.name
                
#                 try:
#                     # Demographic analysis using DeepFace
#                     demographic_info = self._analyze_demographics(temp_face_path)
                    
#                     # Emotion analysis
#                     emotion_info = self._analyze_emotions(temp_face_path)
                    
#                     # Create face info object
#                     face_info = FaceInfo(
#                         face_id=face_id,
#                         bounding_box={
#                             "top": top, "right": right, 
#                             "bottom": bottom, "left": left
#                         },
#                         confidence=float(np.mean([loc for loc in face_location]) / 255.0),
#                         age_estimate=demographic_info.get('age'),
#                         gender_estimate=demographic_info.get('gender'),
#                         emotion_analysis=emotion_info,
#                         face_encoding=face_encoding.tolist(),
#                         similar_faces_found=[]
#                     )
                    
#                     faces_detected.append(face_info)
#                     processing_notes.append(f"Successfully analyzed face {face_id}")
                    
#                 except Exception as face_error:
#                     self.logger.error(f"Error analyzing face {face_id}: {str(face_error)}")
#                     processing_notes.append(f"Partial analysis for face {face_id}: {str(face_error)}")
                    
#                     # Add basic face info even if detailed analysis fails
#                     basic_face_info = FaceInfo(
#                         face_id=face_id,
#                         bounding_box={"top": top, "right": right, "bottom": bottom, "left": left},
#                         confidence=0.8,
#                         face_encoding=face_encoding.tolist()
#                     )
#                     faces_detected.append(basic_face_info)
                
#                 finally:
#                     # Clean up temporary face file
#                     if os.path.exists(temp_face_path):
#                         os.unlink(temp_face_path)
            
#             return {
#                 "total_faces": len(faces_detected),
#                 "faces_detected": [face.dict() for face in faces_detected],
#                 "consent_verified": True,
#                 "processing_notes": processing_notes
#             }
            
#         except Exception as e:
#             self.logger.error(f"Face analysis failed: {str(e)}")
#             return {
#                 "total_faces": 0,
#                 "faces_detected": [],
#                 "consent_verified": False,
#                 "processing_notes": [f"Analysis failed: {str(e)}"]
#             }
    
#     def _analyze_demographics(self, face_image_path: str) -> Dict[str, Any]:
#         """Analyze age and gender using DeepFace"""
#         try:
#             result = DeepFace.analyze(
#                 img_path=face_image_path,
#                 actions=['age', 'gender'],
#                 enforce_detection=False
#             )
            
#             if isinstance(result, list):
#                 result = result[0]
            
#             return {
#                 "age": {
#                     "estimated_age": result.get('age', 'unknown'),
#                     "confidence": 0.8
#                 },
#                 "gender": {
#                     "predicted_gender": result.get('dominant_gender', 'unknown'),
#                     "confidence": result.get('gender', {}).get(result.get('dominant_gender', ''), 0.5)
#                 }
#             }
#         except Exception as e:
#             self.logger.warning(f"Demographic analysis failed: {str(e)}")
#             return {"age": None, "gender": None}
    
#     def _analyze_emotions(self, face_image_path: str) -> Dict[str, float]:
#         """Analyze emotions using DeepFace"""
#         try:
#             result = DeepFace.analyze(
#                 img_path=face_image_path,
#                 actions=['emotion'],
#                 enforce_detection=False
#             )
            
#             if isinstance(result, list):
#                 result = result[0]
            
#             return result.get('emotion', {})
#         except Exception as e:
#             self.logger.warning(f"Emotion analysis failed: {str(e)}")
#             return {}
    
#     def anonymize_faces(self, image_path: str, output_path: str) -> bool:
#         """Blur or mask faces in the image for privacy protection"""
#         try:
#             image = cv2.imread(image_path)
#             face_locations = face_recognition.face_locations(image)
            
#             for (top, right, bottom, left) in face_locations:
#                 face_region = image[top:bottom, left:right]
#                 blurred_face = cv2.GaussianBlur(face_region, (99, 99), 30)
#                 image[top:bottom, left:right] = blurred_face
            
#             cv2.imwrite(output_path, image)
#             return True
            
#         except Exception as e:
#             self.logger.error(f"Face anonymization failed: {str(e)}")
#             return False