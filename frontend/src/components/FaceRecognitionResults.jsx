import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button
} from '@mui/material';
import { ExpandMore, Face, Visibility, VisibilityOff } from '@mui/icons-material';

const FaceRecognitionResults = ({ results, onAnonymize }) => {
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  if (!results || !results.consent_verified) {
    return (
      <Alert severity="warning">
        Face recognition analysis was not performed due to missing consent.
      </Alert>
    );
  }

  const toggleSensitiveData = () => {
    setShowSensitiveData(!showSensitiveData);
  };

  const getEmotionColor = (emotion, confidence) => {
    if (confidence > 0.7) return 'success';
    if (confidence > 0.4) return 'warning';
    return 'default';
  };

  const getGenderColor = (gender) => {
    return gender === 'Man' ? 'primary' : gender === 'Woman' ? 'secondary' : 'default';
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 0 } }}>
          <Face sx={{ mr: 1 }} />
          <Typography 
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Face Recognition Analysis
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={showSensitiveData ? <VisibilityOff /> : <Visibility />}
          onClick={toggleSensitiveData}
          sx={{ ml: { xs: 0, sm: 'auto' }, mt: { xs: 1, sm: 0 } }}
        >
          {showSensitiveData ? 'Hide' : 'Show'} Details
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: { xs: 2, sm: 3 } }}>
        {results.total_faces} face(s) detected. Analysis performed with user consent.
      </Alert>

      {results.processing_notes && results.processing_notes.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">Processing Notes</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {results.processing_notes.map((note, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  • {note}
                </Typography>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 1, sm: 2 } }}>
        {results.faces_detected.map((face, index) => (
          <Grid item xs={12} md={6} key={face.face_id || index}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2 }}>
                    <Face />
                  </Avatar>
                  <Typography variant="h6">
                    Face {index + 1}
                  </Typography>
                  <Chip 
                    label={`${(face.confidence * 100).toFixed(1)}%`}
                    size="small"
                    color="primary"
                    sx={{ ml: 'auto' }}
                  />
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Location:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Top: {face.bounding_box.top}, Left: {face.bounding_box.left}, 
                  Width: {face.bounding_box.right - face.bounding_box.left}, 
                  Height: {face.bounding_box.bottom - face.bounding_box.top}
                </Typography>

                {showSensitiveData && (
                  <>
                    {face.age_estimate && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Estimated Age:
                        </Typography>
                        <Chip 
                          label={`~${face.age_estimate.estimated_age} years`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    )}

                    {face.gender_estimate && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Gender Estimation:
                        </Typography>
                        <Chip 
                          label={face.gender_estimate.predicted_gender}
                          size="small"
                          color={getGenderColor(face.gender_estimate.predicted_gender)}
                          variant="outlined"
                        />
                      </Box>
                    )}

                    {face.emotion_analysis && Object.keys(face.emotion_analysis).length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Emotion Analysis:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Object.entries(face.emotion_analysis)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 3)
                            .map(([emotion, confidence]) => (
                            <Chip
                              key={emotion}
                              label={`${emotion}: ${(confidence * 100).toFixed(0)}%`}
                              size="small"
                              color={getEmotionColor(emotion, confidence)}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {face.similar_faces_found && face.similar_faces_found.length > 0 && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Similar faces found online. This information is sensitive 
                        and should be handled with care.
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {onAnonymize && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="warning"
            onClick={onAnonymize}
            startIcon={<VisibilityOff />}
          >
            Generate Anonymized Version
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Create a copy of the image with faces blurred for privacy protection
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FaceRecognitionResults;