from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema.messages import HumanMessage
import base64
import json
import logging

logger = logging.getLogger(__name__)

class GeolocatorAgent:
    def __init__(self, llm: ChatGoogleGenerativeAI):
        self.llm = llm
    
    async def locate(self, image_path: str, metadata: dict, image_analysis: dict) -> dict:
        """Attempt to geolocate the image using various techniques"""
        location_info = {}
        
        # First, check if GPS coordinates are available in metadata
        if 'gps_coordinates' in metadata and metadata['gps_coordinates']:
            location_info = await self._process_gps_coordinates(metadata['gps_coordinates'])
        
        # If no GPS data, try visual geolocation using LLM
        if not location_info.get('latitude'):
            location_info = await self._visual_geolocation(image_path, image_analysis)
        
        return location_info
    
    async def _process_gps_coordinates(self, gps_coords: dict) -> dict:
        """Process GPS coordinates from metadata"""
        try:
            if 'latitude' in gps_coords and 'longitude' in gps_coords:
                # Use reverse geocoding service to get address
                address = await self._reverse_geocode(
                    gps_coords['latitude'], 
                    gps_coords['longitude']
                )
                
                return {
                    'latitude': gps_coords['latitude'],
                    'longitude': gps_coords['longitude'],
                    'address': address,
                    'confidence': 0.95,
                    'source': 'GPS_EXIF'
                }
        except Exception as e:
            logger.error(f"GPS processing failed: {str(e)}")
        
        return {}
    
    async def _visual_geolocation(self, image_path: str, image_analysis: dict) -> dict:
        """Use AI to identify location from visual cues"""
        try:
            # Encode image to base64
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode()
            
            prompt = """Analyze this image for geolocation clues. Look for:

1. Architectural styles and building types
2. Street signs, license plates, or text in specific languages
3. Landscape features (mountains, coastlines, vegetation)
4. Cultural indicators (clothing, vehicles, infrastructure)
5. Climate and weather indicators
6. Any visible landmarks or recognizable locations

Based on your analysis, provide:
- Most likely country/region
- Possible city or area (if identifiable)
- Confidence level (0-1)
- Key visual indicators that led to this conclusion

Return as JSON:
{
    "estimated_location": "Country/Region",
    "possible_city": "City if identifiable",
    "confidence": 0.0-1.0,
    "indicators": ["list of visual clues"],
    "landmarks": ["any recognizable landmarks"]
}"""
            
            response = await self.llm.ainvoke([
                HumanMessage(content=[
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}
                ])
            ])
            
            return self._parse_geolocation_response(response.content)
            
        except Exception as e:
            logger.error(f"Visual geolocation failed: {str(e)}")
            return {}
    
    async def _reverse_geocode(self, lat: float, lon: float) -> str:
        """Convert coordinates to address (placeholder)"""
        # This would use a geocoding service like Google Maps API
        return f"Approximate location: {lat:.4f}, {lon:.4f}"
    
    def _parse_geolocation_response(self, response: str) -> dict:
        """Parse AI geolocation response"""
        try:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            else:
                json_str = response
            
            parsed_data = json.loads(json_str)
            
            return {
                'address': parsed_data.get('estimated_location', 'Unknown'),
                'confidence': parsed_data.get('confidence', 0.0),
                'landmarks': parsed_data.get('landmarks', []),
                'source': 'Visual_Analysis'
            }
        except:
            return {}