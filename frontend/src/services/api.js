import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for image analysis
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

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
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Analysis failed');
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
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

export const revokeConsent = async (userId, consentId) => {
  try {
    const response = await api.post('/api/consent/revoke', {
      user_id: userId,
      consent_id: consentId
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Consent revocation failed');
    }
    throw new Error('Consent revocation request failed');
  }
};

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Health check failed');
  }
};