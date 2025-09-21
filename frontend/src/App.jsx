import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Grid } from '@mui/material';
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
    console.log('Generating anonymized version...');
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}
    >
      {/* Title */}
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        align="center"
        sx={{ 
          fontSize: { xs: '1.6rem', sm: '2rem', md: '2.5rem' },
          fontWeight: 600 
        }}
      >
        Image OSINT Analysis Tool
      </Typography>
      
      <Typography 
        variant="body1" 
        align="center" 
        color="text.secondary" 
        sx={{ mb: { xs: 2, sm: 3, md: 4 }, fontSize: { xs: '0.9rem', md: '1rem' } }}
      >
        Advanced image analysis with multi-agent AI system including optional face recognition
      </Typography>
      
      {/* Upload Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: { xs: 2, sm: 3, md: 4 } 
        }}
      >
        <ImageUpload 
          onImageUpload={handleImageUpload}
          loading={loading}
        />
      </Paper>

      {/* Error Handling */}
      {error && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            mb: { xs: 2, sm: 3 }, 
            bgcolor: 'error.light' 
          }}
        >
          <Typography 
            color="error" 
            sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}
          >
            Error: {error}
          </Typography>
        </Paper>
      )}

      {/* Results Section */}
      {results && (
        <Grid container spacing={3}>
          {/* Main analysis results (takes more space on desktop) */}
          <Grid item xs={12} md={8}>
            <AnalysisResults results={results} />
          </Grid>

          {/* Face recognition results (sits beside on desktop, below on mobile) */}
          <Grid item xs={12} md={4}>
            {results.image_analysis?.face_recognition && (
              <Box sx={{ mt: { xs: 2, md: 0 } }}>
                <FaceRecognitionResults 
                  results={results.image_analysis.face_recognition}
                  onAnonymize={handleAnonymization}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default App;
