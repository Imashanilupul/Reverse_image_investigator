import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  Alert,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Security, Visibility, Psychology, Face } from '@mui/icons-material';

const ConsentModal = ({ open, onClose, onConsent }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    purpose: '',
    consentTypes: [],
    agreedToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleConsentTypeChange = (type, checked) => {
    setFormData(prev => ({
      ...prev,
      consentTypes: checked 
        ? [...prev.consentTypes, type]
        : prev.consentTypes.filter(t => t !== type)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }
    
    if (formData.consentTypes.length === 0) {
      newErrors.consentTypes = 'Please select at least one consent type';
    }
    
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onConsent({
        user_id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        full_name: formData.fullName,
        email: formData.email,
        purpose: formData.purpose,
        consent_types: formData.consentTypes,
        agreed_to_terms: formData.agreedToTerms,
        duration_days: 30
      });
    } catch (error) {
      setErrors({ submit: 'Failed to process consent. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const consentOptions = [
    {
      value: 'face_detection',
      label: 'Face Detection',
      description: 'Detect and count faces in the image',
      icon: <Face />
    },
    {
      value: 'demographic_analysis',
      label: 'Demographic Analysis',
      description: 'Estimate age and gender (approximate)',
      icon: <Visibility />
    },
    {
      value: 'emotion_analysis',
      label: 'Emotion Analysis',
      description: 'Analyze facial expressions and emotions',
      icon: <Psychology />
    }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Security sx={{ mr: 1, color: 'primary.main' }} />
          Face Recognition Consent Required
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Face recognition analysis requires explicit consent due to privacy regulations.
          Your data will be processed securely and automatically deleted after analysis.
        </Alert>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          
          <TextField
            fullWidth
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            error={!!errors.fullName}
            helperText={errors.fullName}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Purpose of Analysis"
            placeholder="e.g., Security investigation, Academic research, Digital forensics, etc."
            value={formData.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            error={!!errors.purpose}
            helperText={errors.purpose || "Please specify the legitimate purpose for face recognition analysis"}
          />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <FormControl error={!!errors.consentTypes} fullWidth>
            <FormLabel component="legend">
              <Typography variant="h6">
                Types of Face Analysis (Select all that apply)
              </Typography>
            </FormLabel>
            
            <List>
              {consentOptions.map((option) => (
                <ListItem key={option.value} sx={{ pl: 0 }}>
                  <ListItemIcon>
                    {option.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.consentTypes.includes(option.value)}
                            onChange={(e) => handleConsentTypeChange(option.value, e.target.checked)}
                          />
                        }
                        label={option.label}
                      />
                    }
                    secondary={option.description}
                  />
                </ListItem>
              ))}
            </List>
            
            {errors.consentTypes && (
              <Typography color="error" variant="caption">
                {errors.consentTypes}
              </Typography>
            )}
          </FormControl>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Privacy Notice
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Your image and face data will be processed locally and securely
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • All temporary files are automatically deleted after analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • No face data is stored permanently or shared with third parties
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • You can request deletion of any processing logs at any time
          </Typography>
        </Box>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.agreedToTerms}
              onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              I understand and agree to the privacy policy and consent to face recognition 
              analysis for the stated purpose. I confirm this is for legitimate use only.
            </Typography>
          }
        />
        {errors.agreedToTerms && (
          <Typography color="error" variant="caption" display="block">
            {errors.agreedToTerms}
          </Typography>
        )}
        
        {errors.submit && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.submit}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{ minWidth: 200 }}
        >
          {loading ? 'Processing...' : 'Provide Consent & Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsentModal;