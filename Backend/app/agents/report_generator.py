from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema.messages import HumanMessage
import json
import logging

logger = logging.getLogger(__name__)

class ReportGeneratorAgent:
    def __init__(self, llm: ChatGoogleGenerativeAI):
        self.llm = llm
    
    async def generate(self, state: dict) -> str:
        """Generate comprehensive OSINT report"""
        try:
            # Prepare data summary for the LLM
            analysis_summary = self._prepare_analysis_summary(state)
            
            prompt = f"""Generate a comprehensive OSINT analysis report based on the following data:

{analysis_summary}

Create a professional report that includes:

1. Executive Summary
2. Image Analysis Results
3. Technical Metadata Findings
4. Geolocation Assessment
5. Face Recognition Results (if performed)
6. Reverse Search Findings
7. Risk Assessment
8. Privacy and Ethical Considerations
9. Recommendations

Format the report in a clear, professional manner suitable for investigators or researchers.
Focus on factual findings and avoid speculation beyond what can be reasonably inferred from the data.

Include confidence levels for various findings and note any limitations in the analysis.
"""
            
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            return response.content
            
        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            return "Report generation failed. Please check the analysis results manually."
    
    def _prepare_analysis_summary(self, state: dict) -> str:
        """Prepare analysis summary for report generation"""
        summary = []
        
        # Image Analysis
        if state.get('image_analysis'):
            summary.append("IMAGE ANALYSIS:")
            summary.append(f"- Objects detected: {state['image_analysis'].get('objects_detected', [])}")
            summary.append(f"- Scene description: {state['image_analysis'].get('scene_description', 'N/A')}")
            summary.append(f"- Text extracted: {state['image_analysis'].get('text_extracted', [])}")
            summary.append("")
        
        # Metadata
        if state.get('metadata'):
            summary.append("METADATA:")
            summary.append(f"- Camera make: {state['metadata'].get('camera_make', 'N/A')}")
            summary.append(f"- Camera model: {state['metadata'].get('camera_model', 'N/A')}")
            summary.append(f"- Date taken: {state['metadata'].get('date_taken', 'N/A')}")
            summary.append(f"- GPS coordinates: {state['metadata'].get('gps_coordinates', 'N/A')}")
            summary.append("")
        
        # Face Recognition
        if state.get('face_recognition_results'):
            face_data = state['face_recognition_results']
            summary.append("FACE RECOGNITION:")
            summary.append(f"- Total faces detected: {face_data.get('total_faces', 0)}")
            summary.append(f"- Consent verified: {face_data.get('consent_verified', False)}")
            summary.append("")
        
        # Geolocation
        if state.get('geolocation'):
            summary.append("GEOLOCATION:")
            summary.append(f"- Address: {state['geolocation'].get('address', 'N/A')}")
            summary.append(f"- Confidence: {state['geolocation'].get('confidence', 'N/A')}")
            summary.append(f"- Landmarks: {state['geolocation'].get('landmarks', [])}")
            summary.append("")
        
        # Processing info
        summary.append("PROCESSING INFO:")
        summary.append(f"- Processing time: {state.get('processing_time', 0):.2f} seconds")
        summary.append(f"- Errors encountered: {len(state.get('errors', []))}")
        
        return "\n".join(summary)