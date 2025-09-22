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
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%)',
        padding: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {/* Main content container */}
      <Container
        maxWidth="lg"
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '95%', md: '90%', lg: '1200px' },
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* Title */}
        <Box textAlign="center" mb={{ xs: 2, sm: 3, md: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
              fontWeight: 700,
              color: 'primary.main',
              mb: { xs: 1, sm: 2 },
            }}
          >
            Image OSINT Analysis Tool
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: { xs: '100%', sm: '80%', md: '650px' },
              mx: 'auto',
              fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.05rem' },
              px: { xs: 1, sm: 0 },
            }}
          >
            Advanced image analysis with a multi-agent AI system — including
            optional face recognition
          </Typography>
        </Box>

        {/* Upload Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 3,
              textAlign: 'center',
              bgcolor: '#ffffff',
              width: '100%',
              maxWidth: { xs: '100%', sm: '600px', md: '700px' },
            }}
          >
            <ImageUpload onImageUpload={handleImageUpload} loading={loading} />
          </Paper>
        </Box>

        {/* Error Handling */}
        {error && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: { xs: 2, sm: 3 },
            }}
          >
            <Paper
              elevation={2}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                bgcolor: 'error.light',
                width: '100%',
                maxWidth: { xs: '100%', sm: '600px', md: '700px' },
              }}
            >
              <Typography
                color="error"
                sx={{
                  fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                  textAlign: 'center',
                  fontWeight: 500,
                }}
              >
                ⚠️ Error: {error}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Results Section */}
        {results && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: '1200px' }}>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* Main analysis results */}
                <Grid item xs={12} lg={8}>
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
                <Grid item xs={12} lg={4}>
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
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;
