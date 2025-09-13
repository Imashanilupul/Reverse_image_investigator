# import os
# import pytest
# import asyncio
# import cv2
# import numpy as np
# from ..Backend.app.agents.face_recognition_agent import FaceRecognitionAgent

# # Fixture: create a dummy image with a rectangle that looks like a face
# @pytest.fixture(scope="module")
# def dummy_image(tmp_path_factory):
#     tmp_path = tmp_path_factory.mktemp("data")
#     img_path = os.path.join(tmp_path, "test_face.jpg")
    
#     # Create a plain image with random content (just for testing)
#     image = np.zeros((200, 200, 3), dtype=np.uint8)
#     cv2.rectangle(image, (60, 50), (140, 150), (255, 255, 255), -1)  # white square like a face
#     cv2.imwrite(img_path, image)
    
#     return img_path


# @pytest.mark.asyncio
# async def test_analyze_faces(dummy_image):
#     agent = FaceRecognitionAgent()
#     result = await agent.analyze_faces(dummy_image)
    
#     assert isinstance(result, dict)
#     assert "total_faces" in result
#     assert "faces_detected" in result
#     assert "processing_notes" in result
#     assert "consent_verified" in result


# def test_anonymize_faces(dummy_image, tmp_path):
#     agent = FaceRecognitionAgent()
#     output_path = os.path.join(tmp_path, "anonymized.jpg")
    
#     success = agent.anonymize_faces(dummy_image, output_path)
    
#     assert success is True
#     assert os.path.exists(output_path)
#     img = cv2.imread(output_path)
#     assert img is not None


# def test_demographics_and_emotions(dummy_image):
#     agent = FaceRecognitionAgent()
    
#     # Directly call helper methods
#     demographics = agent._analyze_demographics(dummy_image)
#     emotions = agent._analyze_emotions(dummy_image)
    
#     assert isinstance(demographics, dict)
#     assert "age" in demographics
#     assert "gender" in demographics
    
#     assert isinstance(emotions, dict)  # may be empty if DeepFace can't detect
