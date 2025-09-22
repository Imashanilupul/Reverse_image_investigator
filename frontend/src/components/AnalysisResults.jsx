import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Image as ImageIcon,
  Info,
  LocationOn,
  Search,
  Assessment,
  Timer
} from '@mui/icons-material';
import MetadataDisplay from './MetadataDisplay';
import GeolocationDisplay from './GeolocationDisplay';
import ReportView from './ReportView';

const AnalysisResults = ({ results }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatProcessingTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds.toFixed(2)} seconds`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ paddingTop: '1rem' }}>
      {value === index && children}
    </div>
  );

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
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
          <Assessment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography 
            variant="h6"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            Analysis Results
          </Typography>
        </Box>
        {results.processing_time && (
          <Box sx={{ ml: { xs: 0, sm: 'auto' }, mt: { xs: 1, sm: 0 } }}>
            <Chip
              icon={<Timer />}
              label={`Processed in ${formatProcessingTime(results.processing_time)}`}
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </Box>

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ 
          mb: { xs: 2, sm: 3 },
          '& .MuiTab-root': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            minHeight: { xs: 48, sm: 64 },
          },
        }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab icon={<ImageIcon />} label="Image Analysis" />
        <Tab icon={<Info />} label="Metadata" />
        <Tab icon={<LocationOn />} label="Geolocation" />
        <Tab icon={<Search />} label="Reverse Search" />
        <Tab icon={<Assessment />} label="Full Report" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Objects Detected
                </Typography>
                {results.image_analysis.objects_detected.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {results.image_analysis.objects_detected.map((object, index) => (
                      <Chip key={index} label={object} variant="outlined" />
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary">No objects detected</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Text Extracted
                </Typography>
                {results.image_analysis.text_extracted.length > 0 ? (
                  <List dense>
                    {results.image_analysis.text_extracted.map((text, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={text} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">No text detected</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Scene Description
                </Typography>
                <Typography variant="body1">
                  {results.image_analysis.scene_description || 'No description available'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Image Quality
                </Typography>
                <Chip 
                  label={results.image_analysis.image_quality || 'Unknown'} 
                  color="primary" 
                  variant="outlined" 
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Faces Detected
                </Typography>
                <Chip 
                  label={`${results.image_analysis.faces_count} face(s)`} 
                  color={results.image_analysis.faces_count > 0 ? 'warning' : 'default'}
                  variant="outlined" 
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <MetadataDisplay metadata={results.metadata} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <GeolocationDisplay geolocation={results.geolocation} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Reverse Search Results
      </Typography>
      {results.reverse_search_results.length > 0 ? (
        <List>
          {results.reverse_search_results.map((result, index) => (
            <ListItem key={index} divider>
              <ListItemIcon>
                <Search />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    component="a"
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      textDecoration: "none", 
                      color: "primary.main", 
                      "&:hover": { textDecoration: "underline" } 
                    }}
                  >
                    {result.title || "Untitled"}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Source: {result.source}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="a"
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: "block",
                        color: "secondary.main",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {result.url}
                    </Typography>
                    
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info">
          No reverse search results found. This could indicate the image is
          unique or not widely distributed online.
        </Alert>
      )}
    </CardContent>
  </Card>
</TabPanel>


      <TabPanel value={tabValue} index={4}>
        <ReportView 
          report={results.report_summary}
          metadata={results}
        />
      </TabPanel>

      {results.privacy_compliance && (
        <Box sx={{ mt: 3 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">Privacy Compliance Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 2 }}>
                This analysis was performed in compliance with privacy regulations.
              </Alert>
              <Typography variant="body2">
                Face Recognition: {results.privacy_compliance.face_recognition_performed ? 'Performed with consent' : 'Not performed'}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Paper>
  );
};

export default AnalysisResults;