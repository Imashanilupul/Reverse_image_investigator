from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import exifread
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class MetadataExtractorAgent:
    async def extract(self, image_path: str) -> dict:
        """Extract EXIF and other metadata from image"""
        metadata = {}
        
        try:
            # Extract EXIF data
            with open(image_path, 'rb') as f:
                tags = exifread.process_file(f)
                metadata['exif'] = self._process_exif_tags(tags)
            
            # Extract basic image info
            with Image.open(image_path) as img:
                metadata['image_size'] = {'width': img.width, 'height': img.height}
                metadata['format'] = img.format
                metadata['mode'] = img.mode
                
                # Extract additional EXIF data using PIL
                exif_dict = img._getexif()
                if exif_dict:
                    metadata.update(self._process_pil_exif(exif_dict))
        
        except Exception as e:
            logger.error(f"Metadata extraction failed: {str(e)}")
            metadata['error'] = str(e)
        
        return metadata
    
    def _process_exif_tags(self, tags: dict) -> dict:
        """Process EXIF tags into structured format"""
        processed = {}
        
        for tag, value in tags.items():
            tag_str = str(tag)
            if 'GPS' in tag_str:
                processed[tag_str] = self._process_gps_data(tag_str, value)
            else:
                processed[tag_str] = str(value)
        
        return processed
    
    def _process_pil_exif(self, exif_dict: dict) -> dict:
        """Process PIL EXIF data"""
        processed = {}
        
        for tag_id, value in exif_dict.items():
            tag = TAGS.get(tag_id, tag_id)
            
            if tag == 'Make':
                processed['camera_make'] = str(value)
            elif tag == 'Model':
                processed['camera_model'] = str(value)
            elif tag == 'DateTime':
                try:
                    processed['date_taken'] = datetime.strptime(str(value), '%Y:%m:%d %H:%M:%S')
                except:
                    processed['date_taken'] = str(value)
            elif tag == 'Software':
                processed['software'] = str(value)
            elif tag == 'GPSInfo':
                processed['gps_coordinates'] = self._process_gps_info(value)
        
        return processed
    
    def _process_gps_data(self, tag: str, value) -> str:
        """Process GPS coordinate data"""
        try:
            return str(value)
        except:
            return "Unable to process GPS data"
    
    def _process_gps_info(self, gps_info: dict) -> dict:
        """Process GPS information from EXIF"""
        try:
            if not gps_info:
                return {}
            
            gps_data = {}
            for key, value in gps_info.items():
                decoded = GPSTAGS.get(key, key)
                gps_data[decoded] = value
            
            # Convert to decimal degrees if coordinates are present
            lat = self._convert_to_decimal_degrees(
                gps_data.get('GPSLatitude'),
                gps_data.get('GPSLatitudeRef')
            )
            lon = self._convert_to_decimal_degrees(
                gps_data.get('GPSLongitude'),
                gps_data.get('GPSLongitudeRef')
            )
            
            if lat and lon:
                return {'latitude': lat, 'longitude': lon}
            
            return {}
        except Exception as e:
            logger.error(f"GPS processing failed: {str(e)}")
            return {}
    
    def _convert_to_decimal_degrees(self, coords, ref):
        """Convert GPS coordinates to decimal degrees"""
        try:
            if not coords or not ref:
                return None
            
            decimal_degrees = coords[0] + coords[1]/60 + coords[2]/3600
            if ref in ['S', 'W']:
                decimal_degrees = -decimal_degrees
            
            return decimal_degrees
        except:
            return None