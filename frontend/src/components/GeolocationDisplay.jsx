import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Button,
  Grid
} from '@mui/material';
import {
  LocationOn,
  Map,
  Landscape,
  OpenInNew
} from '@mui/icons-material';

const GeolocationDisplay = ({ geolocation }) => {
  const hasLocation = geolocation && (geolocation.latitude || geolocation.address);
  const hasCoordinates = geolocation && geolocation.latitude && geolocation.longitude;
  
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.5) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  const openInOpenStreetMap = () => {
    if (hasCoordinates) {
      const url = `https://www.openstreetmap.org/?mlat=${geolocation.latitude}&mlon=${geolocation.longitude}&zoom=15`;
      window.open(url, '_blank');
    }
  };

  if (!hasLocation) {
    return (
      <Alert severity="info">
        <Typography variant="body1">
          No location information could be determined from the image.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          This could be because:
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>No GPS data in image metadata</li>
          <li>No recognizable location landmarks visible</li>
          <li>Insufficient visual cues for geolocation</li>
        </ul>
      </Alert>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {/* Location Information */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: { xs: 1, sm: 2 } 
              }}
            >
              <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
              <Typography 
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                Location Information
              </Typography>
            </Box>

            <List>
              {geolocation.address && (
                <ListItem>
                  <ListItemIcon>
                    <Map />
                  </ListItemIcon>
                  <ListItemText
                    primary="Address/Location"
                    secondary={geolocation.address}
                  />
                </ListItem>
              )}

              {hasCoordinates && (
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary="Coordinates"
                    secondary={`${geolocation.latitude.toFixed(6)}, ${geolocation.longitude.toFixed(6)}`}
                  />
                </ListItem>
              )}

              {geolocation.confidence !== undefined && (
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary="Confidence Level"
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={`${getConfidenceLabel(geolocation.confidence)} (${(geolocation.confidence * 100).toFixed(1)}%)`}
                          color={getConfidenceColor(geolocation.confidence)}
                          size="small"
                        />
                      </Box>
                    }
                  />
                </ListItem>
              )}
            </List>

            {hasCoordinates && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<OpenInNew />}
                  onClick={openInOpenStreetMap}
                >
                  View in OpenStreetMap
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Landmarks and Additional Info */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Landscape sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Landmarks</Typography>
            </Box>

            {geolocation.landmarks && geolocation.landmarks.length > 0 ? (
              <List dense>
                {geolocation.landmarks.map((landmark, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={landmark} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No landmarks identified
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Analysis Method Info */}
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analysis Method
            </Typography>
            <Chip 
              label={geolocation.source || 'Unknown'}
              variant="outlined"
              size="small"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {geolocation.source === 'GPS_EXIF' && 
                'Location determined from GPS coordinates embedded in image metadata.'}
              {geolocation.source === 'Visual_Analysis' && 
                'Location estimated using AI analysis of visual elements in the image.'}
              {!geolocation.source && 
                'Location analysis method not specified.'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Privacy Warning */}
      <Grid item xs={12}>
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Privacy Notice:</strong> Location data can be highly sensitive. 
            If this image contains GPS coordinates, consider the privacy implications 
            before sharing or using this information.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );
};

export default GeolocationDisplay;