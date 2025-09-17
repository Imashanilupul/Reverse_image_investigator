import requests
import logging
from typing import List, Dict
from ..models.schemas import ReverseSearchResult
import http.client
import json


logger = logging.getLogger(__name__)

class ReverseSearchAgent:
    def __init__(self):
        self.search_engines = ['google']
    
    async def search(self, image_path: str) -> List[Dict]:
        """Perform reverse image search using multiple engines"""
        results = []
        
        try:
            # Google Images reverse search
            google_results = await self._search_google_images(image_path)
            results.extend(google_results)
        
            
        except Exception as e:
            logger.error(f"Reverse search failed: {str(e)}")
        
        return results
    
    async def _search_google_images(self, image_path: str) -> List[Dict]:
        """Search Google Images (placeholder implementation)"""
        conn = http.client.HTTPSConnection("google.serper.dev")
        payload = json.dumps({
            "url": image_path
        })
        headers = {
            'X-API-KEY': '63254f8be49158aeafef96be85d0b01d40284a39',
            'Content-Type': 'application/json'
        }
        conn.request("POST", "/lens", payload, headers)
        res = conn.getresponse()
        data = res.read()
        try:
            json_data = json.loads(data)
        except json.JSONDecodeError:
            return []

        # Extract results from the "organic" key
        results = []
        for item in json_data.get("organic", []):
            results.append({
                "source": item.get("source", "Google Images"),
                "url": item.get("link"),
                "title": item.get("title"),
                "similarity_score": 0.85  
            })

        return results
    
