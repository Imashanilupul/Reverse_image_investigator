import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Alert
} from '@mui/material';
import {
  CameraAlt,
  DateRange,
  Memory,
  AspectRatio,
  LocationOn,
  Code
} from '@mui/icons-material';
import moment from 'moment';

const MetadataDisplay = ({ metadata }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return moment(dateString).format('LLLL');
  };

  const formatCoordinates = (coords) => {
    if (!coords || (!coords.latitude && !coords.longitude)) return null;
    return `${coords.latitude?.toFixed(6)}, ${coords.longitude?.toFixed(6)}`;
  };

  const hasGPSData = metadata.gps_coordinates && 
    (metadata.gps_coordinates.latitude || metadata.gps_coordinates.longitude);

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {/* Camera Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: { xs: 1, sm: 2 } 
              }}
            >
              <CameraAlt sx={{ mr: 1, color: 'primary.main' }} />
              <Typography 
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                Camera Information
              </Typography>
            </Box>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Make"
                  secondary={metadata.camera_make || 'Unknown'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Model"
                  secondary={metadata.camera_model || 'Unknown'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Software"
                  secondary={metadata.software || 'Unknown'}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Date and Time */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DateRange sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Date & Time</Typography>
            </Box>
            <Typography variant="body1">
              {formatDate(metadata.date_taken)}
            </Typography>
            {metadata.date_taken && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Captured: {moment(metadata.date_taken).fromNow()}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Image Properties */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AspectRatio sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Image Properties</Typography>
            </Box>
            <List dense>
              {metadata.image_size && (
                <ListItem>
                  <ListItemText
                    primary="Dimensions"
                    secondary={`${metadata.image_size.width} × ${metadata.image_size.height} pixels`}
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemText
                  primary="Format"
                  secondary={metadata.format || 'Unknown'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Color Mode"
                  secondary={metadata.mode || 'Unknown'}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* GPS Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">GPS Information</Typography>
            </Box>
            {hasGPSData ? (
              <Box>
                <Typography variant="body1" gutterBottom>
                  {formatCoordinates(metadata.gps_coordinates)}
                </Typography>
                <Chip 
                  label="GPS Data Available" 
                  color="success" 
                  size="small"
                  variant="outlined"
                />
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    GPS coordinates found in image metadata. This can be used for geolocation analysis.
                  </Typography>
                </Alert>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" color="text.secondary">
                  No GPS data available
                </Typography>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    No location data found in image metadata. Location analysis will rely on visual cues.
                  </Typography>
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Technical Details */}
      {metadata.exif && Object.keys(metadata.exif).length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Code sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Technical EXIF Data</Typography>
              </Box>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List dense>
                  {Object.entries(metadata.exif).slice(0, 20).map(([key, value]) => (
                    <ListItem key={key} divider>
                      <ListItemText
                        primary={key}
                        secondary={String(value)}
                        primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
                {Object.keys(metadata.exif).length > 20 && (
                  <Typography variant="caption" color="text.secondary" sx={{ p: 2 }}>
                    Showing first 20 of {Object.keys(metadata.exif).length} EXIF entries
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default MetadataDisplay;