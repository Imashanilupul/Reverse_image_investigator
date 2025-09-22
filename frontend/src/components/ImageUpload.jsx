import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';
import { CloudUpload, Image as ImageIcon } from '@mui/icons-material';

const ImageUpload = ({ onImageUpload, loading }) => {
  const [enableFaceRecognition, setEnableFaceRecognition] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [consentData, setConsentData] = useState(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisSteps] = useState([
    'Uploading Image',
    'Analyzing Content',
    'Extracting Metadata',
    'Face Recognition',
    'Reverse Image Search',
    'Geolocation Analysis',
    'Generating Report'
  ]);

  // Mock function to simulate step progression
  const simulateAnalysisProgress = async () => {
    for (let i = 0; i < analysisSteps.length; i++) {
      setAnalysisStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
    }
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);

        if (enableFaceRecognition) {
          setShowConsentModal(true);
        } else {
          handleAnalysis(file, false, null);
        }
      }
    },
    [enableFaceRecognition]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    disabled: loading,
    maxSize: 10 * 1024 * 1024
  });

  const handleConsent = async (consentFormData) => {
    setConsentData(consentFormData);
    setShowConsentModal(false);
    handleAnalysis(selectedFile, true, consentFormData);
  };

  const handleAnalysis = async (file, faceRecognitionEnabled, consent) => {
    setAnalysisStep(0);

    // Start the progress simulation
    simulateAnalysisProgress();

    // Call the actual analysis function
    await onImageUpload(file, faceRecognitionEnabled, consent);

    // Reset step after completion
    setAnalysisStep(0);
  };

  const handleFaceRecognitionToggle = (event) => {
    setEnableFaceRecognition(event.target.checked);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ width: '100%', mx: 'auto', p: { xs: 1, sm: 2 } }}>
      <Card elevation={0} sx={{ boxShadow: 'none' }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            align="center"
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              mb: { xs: 2, sm: 3 },
            }}
          >
            Image Upload & Analysis
          </Typography>

          {/* Analysis Progress Stepper */}
          {loading && (
            <Box sx={{ mb: { xs: 3, sm: 4 } }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                align="center"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  mb: { xs: 2, sm: 3 },
                }}
              >
                Analyzing Image...
              </Typography>

              <Stepper 
                activeStep={analysisStep} 
                alternativeLabel
                sx={{
                  '& .MuiStepLabel-labelContainer': {
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    },
                  },
                }}
              >
                {analysisSteps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {index === analysisStep ? (
                            <CircularProgress size={24} />
                          ) : index < analysisStep ? (
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: 'success.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                              }}
                            >
                              ✓
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: 'grey.300'
                              }}
                            />
                          )}
                        </Box>
                      )}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              <LinearProgress
                variant="determinate"
                value={(analysisStep / (analysisSteps.length - 1)) * 100}
                sx={{ mt: { xs: 2, sm: 3 } }}
              />

              <Typography 
                variant="body2" 
                align="center" 
                sx={{ 
                  mt: { xs: 1, sm: 2 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                Step {analysisStep + 1} of {analysisSteps.length}: {analysisSteps[analysisStep]}
              </Typography>
            </Box>
          )}

          {/* File Upload Area */}
          {!loading && (
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: { xs: 3, sm: 4, md: 5 },
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                minHeight: { xs: 150, sm: 200 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload 
                sx={{ 
                  fontSize: { xs: 36, sm: 48, md: 56 }, 
                  color: 'primary.main', 
                  mb: { xs: 1, sm: 2 } 
                }} 
              />

              {isDragActive ? (
                <Typography 
                  variant="h6" 
                  color="primary"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                >
                  Drop the image here...
                </Typography>
              ) : (
                <>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                  >
                    Drag & drop an image here, or click to select
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      maxWidth: '90%',
                    }}
                  >
                    Supported formats: JPEG, PNG, GIF, BMP, WebP (Max: 10MB)
                  </Typography>
                </>
              )}
            </Box>
          )}

          {/* Face Recognition Toggle */}
          {!loading && (
            <Box sx={{ mt: { xs: 2, sm: 3 } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={enableFaceRecognition}
                    onChange={handleFaceRecognitionToggle}
                    color="primary"
                  />
                }
                label={
                  <Typography 
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' } 
                    }}
                  >
                    Enable Face Recognition Analysis
                  </Typography>
                }
              />
              <Typography 
                variant="caption" 
                display="block" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  mt: 0.5,
                }}
              >
                Requires additional consent for privacy compliance
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImageUpload;
