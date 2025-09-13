import React, { useState } from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import ImageUpload from './components/ImageUpload';
import AnalysisResults from './components/AnalysisResults';
import FaceRecognitionResults from './components/FaceRecognitionResults';
import { analyzeImage } from './services/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = async (file, options = {}) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const analysisResults = await analyzeImage(file, options);
      setResults(analysisResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymization = async () => {
    // This would call an API endpoint to generate an anonymized version
    console.log('Generating anonymized version...');
    // Implementation would depend on your backend anonymization service
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Image OSINT Analysis Tool
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Advanced image analysis with multi-agent AI system including optional face recognition
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <ImageUpload 
          onImageUpload={handleImageUpload}
          loading={loading}
        />
      </Paper>

      {error && (
        <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
          <Typography color="error">
            Error: {error}
          </Typography>
        </Paper>
      )}

      {results && (
        <Box sx={{ space: 2 }}>
          <AnalysisResults results={results} />
          
          {results.image_analysis?.face_recognition && (
            <Box sx={{ mt: 3 }}>
              <FaceRecognitionResults 
                results={results.image_analysis.face_recognition}
                onAnonymize={handleAnonymization}
              />
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}

export default App;