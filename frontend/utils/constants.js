export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FACE_RECOGNITION_CONSENT_TYPES = [
  {
    value: 'face_detection',
    label: 'Face Detection',
    description: 'Detect and count faces in the image'
  },
  {
    value: 'demographic_analysis',
    label: 'Demographic Analysis', 
    description: 'Estimate age and gender (approximate)'
  },
  {
    value: 'emotion_analysis',
    label: 'Emotion Analysis',
    description: 'Analyze facial expressions and emotions'
  }
];

export const ANALYSIS_STAGES = [
  'Uploading image...',
  'Analyzing image content...',
  'Extracting metadata...',
  'Performing reverse search...',
  'Analyzing geolocation...',
  'Generating report...'
];