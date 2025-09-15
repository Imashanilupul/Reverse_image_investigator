from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import TypedDict, List
import time
import logging
from ..agents.image_analyzer import ImageAnalyzerAgent
from ..agents.metadata_extractor import MetadataExtractorAgent
from ..agents.reverse_search import ReverseSearchAgent
from ..agents.geolocator import GeolocatorAgent
from ..agents.face_recognition_agent import FaceRecognitionAgent
from ..agents.report_generator import ReportGeneratorAgent
from ..models.schemas import OSINTResult, ImageAnalysis, MetadataInfo, GeolocationInfo, FaceRecognitionResult
from ..config import settings

logger = logging.getLogger(__name__)

class OSINTState(TypedDict):
    image_path: str
    enable_face_recognition: bool
    image_analysis: dict
    metadata: dict
    reverse_search_results: list
    geolocation: dict
    face_recognition_results: dict
    report_summary: str
    processing_time: float
    errors: list
    privacy_compliance: dict

class OSINTWorkflow:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0,
            convert_system_message_to_human=True,
            api_key="AIzaSyDZxIlGDZgu7jiBJJaTa_6B1-n8zMHq7Wk"
        )
        self.setup_agents()
        self.setup_workflow()
    
    def setup_agents(self):
        """Initialize all agents"""
        self.image_analyzer = ImageAnalyzerAgent(self.llm)
        self.metadata_extractor = MetadataExtractorAgent()
        self.reverse_search_agent = ReverseSearchAgent()
        self.geolocator = GeolocatorAgent(self.llm)
        self.face_recognition_agent = FaceRecognitionAgent()
        self.report_generator = ReportGeneratorAgent(self.llm)
    
    def setup_workflow(self):
        """Setup the LangGraph workflow"""
        workflow = StateGraph(OSINTState)
        
        # Add nodes
        workflow.add_node("analyze_image", self.analyze_image_node)
        workflow.add_node("extract_metadata", self.extract_metadata_node)
        workflow.add_node("face_recognition", self.face_recognition_node)
        workflow.add_node("reverse_search", self.reverse_search_node)
        workflow.add_node("geolocate", self.geolocate_node)
        workflow.add_node("generate_report", self.generate_report_node)
        
        # Define workflow with conditional face recognition
        workflow.set_entry_point("analyze_image")
        workflow.add_edge("analyze_image", "extract_metadata")
        workflow.add_conditional_edges(
            "extract_metadata",
            self._should_run_face_recognition,
            {
                "face_recognition": "face_recognition",
                "reverse_search": "reverse_search"
            }
        )
        workflow.add_edge("face_recognition", "reverse_search")
        workflow.add_edge("reverse_search", "geolocate")
        workflow.add_edge("geolocate", "generate_report")
        workflow.add_edge("generate_report", END)
        
        self.workflow = workflow.compile()
    
    def _should_run_face_recognition(self, state: OSINTState) -> str:
        """Determine if face recognition should be run"""
        return "face_recognition" if state.get("enable_face_recognition", False) else "reverse_search"
    
    async def analyze_image_node(self, state: OSINTState) -> OSINTState:
        """Analyze image content using Gemini vision model"""
        try:
            logger.info("Starting image analysis...")
            analysis = await self.image_analyzer.analyze(state["image_path"])
            state["image_analysis"] = analysis
            logger.info("Image analysis completed successfully")
        except Exception as e:
            logger.error(f"Image analysis failed: {str(e)}")
            state["errors"].append(f"Image analysis failed: {str(e)}")
        return state
    
    async def extract_metadata_node(self, state: OSINTState) -> OSINTState:
        """Extract EXIF and other metadata"""
        try:
            logger.info("Extracting metadata...")
            metadata = await self.metadata_extractor.extract(state["image_path"])
            state["metadata"] = metadata
            logger.info("Metadata extraction completed")
        except Exception as e:
            logger.error(f"Metadata extraction failed: {str(e)}")
            state["errors"].append(f"Metadata extraction failed: {str(e)}")
        return state
    
    async def face_recognition_node(self, state: OSINTState) -> OSINTState:
        """Perform face recognition analysis"""
        try:
            if state.get("enable_face_recognition", False):
                logger.info("Starting face recognition analysis...")
                face_results = await self.face_recognition_agent.analyze_faces(
                    state["image_path"]
                )
                state["face_recognition_results"] = face_results
                state["privacy_compliance"]["face_recognition_performed"] = True
                logger.info("Face recognition analysis completed")
            else:
                state["face_recognition_results"] = {}
                state["privacy_compliance"]["face_recognition_performed"] = False
        except Exception as e:
            logger.error(f"Face recognition failed: {str(e)}")
            state["errors"].append(f"Face recognition failed: {str(e)}")
        return state
    
    async def reverse_search_node(self, state: OSINTState) -> OSINTState:
        """Perform reverse image search"""
        try:
            logger.info("Starting reverse image search...")
            results = await self.reverse_search_agent.search(state["image_path"])
            state["reverse_search_results"] = results
            logger.info("Reverse search completed")
        except Exception as e:
            logger.error(f"Reverse search failed: {str(e)}")
            state["errors"].append(f"Reverse search failed: {str(e)}")
        return state
    
    async def geolocate_node(self, state: OSINTState) -> OSINTState:
        """Attempt to geolocate the image"""
        try:
            logger.info("Starting geolocation analysis...")
            location = await self.geolocator.locate(
                state["image_path"], 
                state.get("metadata", {}),
                state.get("image_analysis", {})
            )
            state["geolocation"] = location
            logger.info("Geolocation analysis completed")
        except Exception as e:
            logger.error(f"Geolocation failed: {str(e)}")
            state["errors"].append(f"Geolocation failed: {str(e)}")
        return state
    
    async def generate_report_node(self, state: OSINTState) -> OSINTState:
        """Generate final OSINT report"""
        try:
            logger.info("Generating final report...")
            report = await self.report_generator.generate(state)
            state["report_summary"] = report
            logger.info("Report generation completed")
        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            state["errors"].append(f"Report generation failed: {str(e)}")
        return state
    
    async def run_analysis(self, image_path: str, enable_face_recognition: bool = False) -> OSINTResult:
        """Run the complete OSINT analysis workflow"""
        start_time = time.time()
        logger.info(f"Starting OSINT analysis for image: {image_path}")
        
        initial_state = OSINTState(
            image_path=image_path,
            enable_face_recognition=enable_face_recognition,
            image_analysis={},
            metadata={},
            reverse_search_results=[],
            geolocation={},
            face_recognition_results={},
            report_summary="",
            processing_time=0.0,
            errors=[],
            privacy_compliance={}
        )
        
        # Run the workflow
        final_state = await self.workflow.ainvoke(initial_state)
        final_state["processing_time"] = time.time() - start_time
        
        logger.info(f"OSINT analysis completed in {final_state['processing_time']:.2f} seconds")
        
        # Convert to response model
        return self._convert_to_result(final_state)
    
    def _convert_to_result(self, state: OSINTState) -> OSINTResult:
        """Convert workflow state to API response model"""
        # Create face recognition result if available
        face_recognition_result = None
        if state["face_recognition_results"]:
            face_recognition_result = FaceRecognitionResult(**state["face_recognition_results"])
        
        # Create image analysis result
        image_analysis = ImageAnalysis(
            objects_detected=state["image_analysis"].get("objects_detected", []),
            faces_count=state["face_recognition_results"].get("total_faces", 0),
            text_extracted=state["image_analysis"].get("text_extracted", []),
            scene_description=state["image_analysis"].get("scene_description", ""),
            image_quality=state["image_analysis"].get("image_quality", "unknown"),
            face_recognition=face_recognition_result
        )
        
        # Create metadata info
        metadata_info = MetadataInfo(
            camera_make=state["metadata"].get("camera_make"),
            camera_model=state["metadata"].get("camera_model"),
            date_taken=state["metadata"].get("date_taken"),
            gps_coordinates=state["metadata"].get("gps_coordinates"),
            software=state["metadata"].get("software"),
            image_size=state["metadata"].get("image_size")
        )
        
        # Create geolocation info
        geolocation_info = GeolocationInfo(
            latitude=state["geolocation"].get("latitude"),
            longitude=state["geolocation"].get("longitude"),
            address=state["geolocation"].get("address"),
            landmarks=state["geolocation"].get("landmarks", []),
            confidence=state["geolocation"].get("confidence")
        )
        
        return OSINTResult(
            image_analysis=image_analysis,
            metadata=metadata_info,
            reverse_search_results=state["reverse_search_results"],
            geolocation=geolocation_info,
            risk_assessment=state.get("risk_assessment", {}),
            processing_time=state["processing_time"],
            report_summary=state["report_summary"],
            privacy_compliance=state["privacy_compliance"]
        )