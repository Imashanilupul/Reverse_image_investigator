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
                # Ensure coordinates are properly formatted as floats
                lat = float(gps_coords['latitude'])
                lon = float(gps_coords['longitude'])
                
                # Use reverse geocoding service to get address
                address = await self._reverse_geocode(lat, lon)
                
                return {
                    'latitude': lat,
                    'longitude': lon,
                    'address': address,
                    'confidence': 0.95,
                    'source': 'GPS_EXIF',
                    'landmarks': []
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
- Estimated coordinates (latitude, longitude) if you can determine a specific location
- Confidence level (0-1)
- Key visual indicators that led to this conclusion

Return as JSON:
{
    "estimated_location": "Country/Region, City if identifiable",
    "latitude": null or estimated_latitude_as_number,
    "longitude": null or estimated_longitude_as_number,
    "confidence": 0.0-1.0,
    "indicators": ["list of visual clues"],
    "landmarks": ["any recognizable landmarks"]
}

Note: Only provide latitude/longitude if you can identify a specific landmark or location with reasonable confidence. Otherwise, leave as null."""
            
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
        """Convert coordinates to address using a geocoding service"""
        try:
            # Placeholder for actual reverse geocoding service
            # You would implement this with a service like:
            # - OpenStreetMap Nominatim API (free)
            # - Google Maps Geocoding API
            # - Here Geocoding API
            # etc.
            
            # For now, return a formatted coordinate string
            return f"Location: {lat:.6f}, {lon:.6f}"
            
            # Example implementation with requests (uncomment to use):
            # import aiohttp
            # async with aiohttp.ClientSession() as session:
            #     url = f"https://nominatim.openstreetmap.org/reverse"
            #     params = {
            #         'lat': lat,
            #         'lon': lon,
            #         'format': 'json',
            #         'addressdetails': 1
            #     }
            #     async with session.get(url, params=params) as resp:
            #         data = await resp.json()
            #         return data.get('display_name', f"Location: {lat:.6f}, {lon:.6f}")
            
        except Exception as e:
            logger.error(f"Reverse geocoding failed: {str(e)}")
            return f"Location: {lat:.6f}, {lon:.6f}"
    
    def _parse_geolocation_response(self, response: str) -> dict:
        """Parse AI geolocation response"""
        try:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            else:
                json_str = response
            
            parsed_data = json.loads(json_str)
            
            # Build response ensuring proper coordinate handling
            result = {
                'address': parsed_data.get('estimated_location', 'Unknown'),
                'confidence': float(parsed_data.get('confidence', 0.0)),
                'landmarks': parsed_data.get('landmarks', []),
                'source': 'Visual_Analysis'
            }
            
            # Only include coordinates if they were provided by the AI
            if parsed_data.get('latitude') is not None and parsed_data.get('longitude') is not None:
                try:
                    result['latitude'] = float(parsed_data['latitude'])
                    result['longitude'] = float(parsed_data['longitude'])
                except (ValueError, TypeError):
                    logger.warning("Invalid coordinates provided by AI, skipping coordinate data")
            
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse geolocation response as JSON: {str(e)}")
            return {}
        except Exception as e:
            logger.error(f"Error parsing geolocation response: {str(e)}")
            return {}