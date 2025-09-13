from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema.messages import HumanMessage
import base64
from PIL import Image
import json
import logging

logger = logging.getLogger(__name__)

class ImageAnalyzerAgent:
    def __init__(self, llm: ChatGoogleGenerativeAI):
        self.llm = llm
    
    async def analyze(self, image_path: str) -> dict:
        """Analyze image using Gemini vision model"""
        try:
            # Encode image to base64
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode()
            
            # Create vision prompt for Gemini
            prompt = """Analyze this image for OSINT purposes. Provide detailed information about:

1. Objects and items detected in the image
2. People present (count only, no identification)
3. Text visible in the image (signs, documents, etc.)
4. Scene description and context
5. Notable features for identification purposes
6. Image quality assessment
7. Potential location indicators (architecture, landscape, signs)
8. Time/season indicators if visible
9. Any suspicious or notable elements

Return the analysis as a JSON object with the following structure:
{
    "objects_detected": ["list of objects"],
    "people_count": number,
    "text_extracted": ["list of visible text"],
    "scene_description": "detailed description",
    "location_indicators": ["list of location clues"],
    "time_indicators": ["list of time/date clues"],
    "image_quality": "assessment",
    "notable_features": ["list of distinctive elements"],
    "potential_risks": ["list of privacy/security concerns"]
}"""
            
            # For Gemini, we need to handle the image differently
            response = await self.llm.ainvoke([
                HumanMessage(content=[
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}
                ])
            ])
            
            return self._parse_analysis_response(response.content)
        except Exception as e:
            logger.error(f"Image analysis failed: {str(e)}")
            return {"error": f"Analysis failed: {str(e)}"}
    
    def _parse_analysis_response(self, response: str) -> dict:
        """Parse the Gemini response into structured format"""
        try:
            # Try to extract JSON from response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            else:
                json_str = response
            
            parsed_data = json.loads(json_str)
            return parsed_data
        except json.JSONDecodeError:
            # Fallback to basic parsing if JSON parsing fails
            return {
                "objects_detected": [],
                "people_count": 0,
                "text_extracted": [],
                "scene_description": response[:500] if response else "Analysis failed",
                "location_indicators": [],
                "time_indicators": [],
                "image_quality": "unknown",
                "notable_features": [],
                "potential_risks": [],
                "raw_response": response
            }