import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for image analysis
});

export const analyzeImage = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('enable_face_recognition', options.enableFaceRecognition || false);
  formData.append('consent_provided', options.consentProvided || false);
  
  if (options.analysisPurpose) {
    formData.append('analysis_purpose', options.analysisPurpose);
  }
  
  if (options.userId) {
    formData.append('user_id', options.userId);
  }

  try {
    const response = await api.post('/api/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Analysis failed');
    } else if (error.request) {
      throw new Error('No response from server');
    } else {
      throw new Error('Request failed');
    }
  }
};

export const validateConsent = async (consentData) => {
  try {
    const response = await api.post('/api/consent/validate', consentData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Consent validation failed');
    }
    throw new Error('Consent validation request failed');
  }
};