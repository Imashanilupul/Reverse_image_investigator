import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  TextField,
  Alert,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { CloudUpload, Image as ImageIcon, Security } from '@mui/icons-material';
import ConsentModal from './ConsentModal';
import { validateConsent } from '../services/api';

const ImageUpload = ({ onImageUpload, loading }) => {
  const [enableFaceRecognition, setEnableFaceRecognition] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [consentData, setConsentData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      
      if (enableFaceRecognition) {
        setShowConsentModal(true);
      } else {
        handleAnalysis(file, false, null);
      }
    }
  }, [enableFaceRecognition]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    disabled: loading,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleConsent = async (consentFormData) => {
    try {
      const consentResult = await validateConsent(consentFormData);
      if (consentResult.valid) {
        setConsentData(consentResult);
        setShowConsentModal(false);
        
        if (selectedFile) {
          handleAnalysis(selectedFile, true, consentFormData);
        }
      }
    } catch (error) {
      console.error('Consent validation failed:', error);
    }
  };

  const handleAnalysis = (file, faceRecognitionEnabled, consent) => {
    const options = {
      enableFaceRecognition: faceRecognitionEnabled,
      consentProvided: !!consent,
      analysisPurpose: consent?.purpose,
      userId: consent?.user_id
    };
    
    onImageUpload(file, options);
  };

  const handleFaceRecognitionToggle = (event) => {
    setEnableFaceRecognition(event.target.checked);
    if (!event.target.checked) {
      setConsentData(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Analysis Options
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={enableFaceRecognition}
              onChange={handleFaceRecognitionToggle}
              disabled={loading}
              color="secondary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Security sx={{ mr: 1 }} />
              Enable Face Recognition Analysis
            </Box>
          }
        />
        
        {enableFaceRecognition && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            Face recognition analysis requires explicit consent and should only be used for 
            legitimate purposes such as security, research, or investigation.
          </Alert>
        )}
        
        {consentData && (
          <Alert severity="success" sx={{ mt: 1 }}>
            ✓ Consent provided and validated. Face recognition analysis will be included.
          </Alert>
        )}
      </Box>

      {selectedFile && !loading && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1">Selected File:</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </Typography>
          </CardContent>
        </Card>
      )}

      <Paper
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 6,
          textAlign: 'center',
          cursor: loading ? 'not-allowed' : 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: loading ? 'grey.300' : 'primary.main',
            bgcolor: loading ? 'background.paper' : 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        
        {loading ? (
          <Box>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Analyzing Image...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This may take a few minutes depending on the complexity of the analysis
            </Typography>
            <LinearProgress sx={{ width: '100%', maxWidth: 400, mx: 'auto' }} />
          </Box>
        ) : (
          <Box>
            <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
            </Typography>
            <Typography variant="body1" color="primary" sx={{ mb: 1 }}>
              or click to select a file
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: JPEG, PNG, GIF, BMP, WebP (Max: 10MB)
            </Typography>
          </Box>
        )}
      </Paper>

      <ConsentModal
        open={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onConsent={handleConsent}
      />
    </>
  );
};

export default ImageUpload;