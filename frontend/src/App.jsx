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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%)',
      }}
    >
      {/* Main content container */}
      <Container
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          py: { xs: 3, sm: 4, md: 6 },
          px: { xs: 2, sm: 3, md: 6 },
        }}
      >
        {/* Title */}
        <Box textAlign="center" mb={{ xs: 3, sm: 5 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            Image OSINT Analysis Tool
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: '650px',
              mx: 'auto',
              fontSize: { xs: '0.9rem', md: '1.05rem' },
            }}
          >
            Advanced image analysis with a multi-agent AI system — including
            optional face recognition
          </Typography>
        </Box>

        {/* Upload Section */}
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mb: { xs: 3, sm: 5 },
            borderRadius: 3,
            textAlign: 'center',
            bgcolor: '#ffffff',
          }}
        >
          <ImageUpload onImageUpload={handleImageUpload} loading={loading} />
        </Paper>

        {/* Error Handling */}
        {error && (
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: { xs: 3, sm: 4 },
              borderRadius: 2,
              bgcolor: 'error.light',
            }}
          >
            <Typography
              color="error"
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              ⚠️ Error: {error}
            </Typography>
          </Paper>
        )}

        {/* Results Section */}
        {results && (
          <Grid container spacing={3}>
            {/* Main analysis results */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  height: '100%',
                  bgcolor: '#ffffff',
                }}
              >
                <AnalysisResults results={results} />
              </Paper>
            </Grid>

            {/* Face recognition results */}
            <Grid item xs={12} md={4}>
              {results.image_analysis?.face_recognition && (
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    height: '100%',
                    bgcolor: '#ffffff',
                  }}
                >
                  <FaceRecognitionResults
                    results={results.image_analysis.face_recognition}
                    onAnonymize={handleAnonymization}
                  />
                </Paper>
              )}
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default App;
