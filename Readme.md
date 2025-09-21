# Reverse Image Investigator

An advanced Image OSINT (Open Source Intelligence) Analysis Tool powered by a multi-agent AI system. This application performs comprehensive image analysis including content recognition, metadata extraction, face detection, reverse image search, and geolocation analysis.

## 🚀 Features

- **Image Content Analysis**: AI-powered image description and object detection using Google Gemini Vision
- **Metadata Extraction**: Extract EXIF data, GPS coordinates, camera information, and technical details
- **Face Recognition**: Detect faces, analyze demographics (age, gender), and emotions with consent management
- **Reverse Image Search**: Find similar images across the web using Google Lens API
- **Geolocation Analysis**: Map GPS coordinates and provide location context
- **Privacy Compliance**: Built-in consent management system for face recognition
- **Interactive Reports**: Comprehensive analysis reports with visualizations
- **Real-time Progress**: Step-by-step analysis progress indication

## 🏗️ Architecture

### Backend (Python + FastAPI)
- **Multi-Agent System**: Specialized agents for different analysis tasks
- **LangGraph Workflow**: Orchestrates the analysis pipeline
- **Privacy-First**: Consent management and audit trails
- **Async Processing**: Non-blocking analysis operations

### Frontend (React + Vite)
- **Modern UI**: Material-UI components with responsive design
- **Interactive Maps**: Leaflet integration for geolocation display
- **Progress Tracking**: Real-time analysis step visualization
- **File Upload**: Drag-and-drop image upload with validation

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**
- **API Keys** (see Configuration section)

## 🛠️ Installation

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd Backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Create `.env` file in Backend directory:
   ```env
   GOOGLE_API_KEY=your_google_gemini_api_key
   SERP_API_KEY=your_serper_api_key
   IMGBB_API_KEY=your_imgbb_api_key
   ```

5. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload
   ```
   Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install additional UI dependencies**
   ```bash
   npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## ⚙️ Configuration

### Required API Keys

1. **Google Gemini API**: For image content analysis
   - Get from: [Google AI Studio](https://makersuite.google.com/app/apikey)

2. **Serper API**: For reverse image search
   - Get from: [Serper.dev](https://serper.dev/)

3. **ImgBB API**: For image hosting (optional)
   - Get from: [ImgBB API](https://api.imgbb.com/)

### Environment Variables

Create a `.env` file in the Backend directory:
```env
# AI Models
GOOGLE_API_KEY=your_google_gemini_api_key

# Search APIs
SERP_API_KEY=your_serper_api_key

# Image Hosting
IMGBB_API_KEY=your_imgbb_api_key

# Application Settings
DEBUG=True
CORS_ORIGINS=["http://localhost:5173"]
```



## 📁 Project Structure

```
Image_Investigator/
├── Backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── face_recognition_agent.py
│   │   │   ├── image_analyzer.py
│   │   │   ├── metadata_extractor.py
│   │   │   ├── reverse_search.py
│   │   │   └── geolocator.py
│   │   ├── config/
│   │   │   └── settings.py
│   │   ├── graphs/
│   │   │   └── osint_workflow.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   ├── utils/
│   │   │   ├── consent_manager.py
│   │   │   └── image_utils.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── AnalysisResults.jsx
│   │   │   ├── ConsentModal.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
├── Test_images/
├── Documents/
└── README.md
```

## 🔄 Workflow Process

1. **Image Upload**: User uploads image via drag-and-drop interface
2. **Content Analysis**: AI analyzes image content and objects
3. **Metadata Extraction**: Extract EXIF data and technical information
4. **Face Recognition** (Optional): Detect and analyze faces with consent
5. **Reverse Search**: Find similar images across the web
6. **Geolocation**: Map GPS coordinates if available
7. **Report Generation**: Compile comprehensive analysis report



## 📊 Progress Tracking

The application features real-time progress tracking with visual indicators:

- **Step-by-step progress** using Material-UI Stepper
- **Linear progress bar** showing completion percentage
- **Current step display** with descriptive text
- **Visual indicators** (loading spinner, checkmarks)

## 🔒 Privacy & Consent

- **Consent Management**: Required for face recognition features
- **Audit Trails**: All consent decisions are logged
- **Data Protection**: Images processed locally when possible
- **Compliance**: GDPR-aware consent collection


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI-powered image analysis
- **Serper.dev** for reverse image search capabilities
- **Material-UI** for beautiful React components
- **FastAPI** for high-performance backend framework
- **LangGraph** for workflow orchestration

## 📞 Support

If you encounter any issues:

1. Check the [Common Issues & Solutions](#common-issues--solutions) section
2. Review the error logs in both frontend and backend
3. Ensure all API keys are correctly configured
4. Verify all dependencies are installed

For additional support, please open an issue on GitHub.