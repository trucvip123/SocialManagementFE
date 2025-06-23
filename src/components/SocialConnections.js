import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  Link as LinkIcon,
  LinkOff as LinkOffIcon
} from '@mui/icons-material';
import axios from 'axios';

const SocialConnections = () => {
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [formData, setFormData] = useState({});
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await axios.get('/social/status');
      setConnections(response.data.socialAccounts);
    } catch (error) {
      setError('Error loading connection status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platform) => {
    setSelectedPlatform(platform);
    setFormData({});
    setDialogOpen(true);
  };

  const handleDisconnect = async (platform) => {
    try {
      await axios.post(`/social/disconnect/${platform}`);
      setSuccess(`Successfully disconnected ${platform}`);
      fetchConnections();
    } catch (error) {
      setError('Error disconnecting');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedPlatform('');
    setFormData({});
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleConnectSubmit = async () => {
    setConnecting(true);
    try {
      await axios.post(`/social/connect/${selectedPlatform}`, formData);
      setSuccess(`Successfully connected ${selectedPlatform}`);
      handleDialogClose();
      fetchConnections();
    } catch (error) {
      setError(error.response?.data?.message || 'Error connecting');
    } finally {
      setConnecting(false);
    }
  };

  const getPlatformConfig = (platform) => {
    switch (platform) {
      case 'facebook':
        return {
          title: 'Connect Facebook',
          icon: <Facebook color="primary" />,
          fields: [
            { name: 'accessToken', label: 'Access Token', type: 'text', required: true },
            { name: 'pageId', label: 'Page ID (tùy chọn)', type: 'text', required: false }
          ]
        };
      case 'twitter':
        return {
          title: 'Connect Twitter',
          icon: <Twitter color="primary" />,
          fields: [
            { name: 'apiKey', label: 'API Key', type: 'text', required: true },
            { name: 'apiSecret', label: 'API Secret', type: 'password', required: true },
            { name: 'accessToken', label: 'Access Token', type: 'text', required: true },
            { name: 'accessTokenSecret', label: 'Access Token Secret', type: 'password', required: true }
          ]
        };
      case 'instagram':
        return {
          title: 'Connect Instagram',
          icon: <Instagram color="primary" />,
          fields: [
            { name: 'username', label: 'Username', type: 'text', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true }
          ]
        };
      default:
        return null;
    }
  };

  const platformConfig = getPlatformConfig(selectedPlatform);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Social Connections
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Object.entries(connections).map(([platform, data]) => {
          const config = getPlatformConfig(platform);
          return (
            <Grid item xs={12} md={4} key={platform}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    {config.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {config.title}
                    </Typography>
                  </Box>
                  
                  <Typography
                    variant="body2"
                    color={data.isConnected ? 'success.main' : 'error.main'}
                    sx={{ mb: 2 }}
                  >
                    {data.isConnected ? 'Connected' : 'Not connected'}
                  </Typography>

                  {data.isConnected ? (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<LinkOffIcon />}
                      onClick={() => handleDisconnect(platform)}
                      fullWidth
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<LinkIcon />}
                      onClick={() => handleConnect(platform)}
                      fullWidth
                    >
                      Connect
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Dialog kết nối */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            {platformConfig?.icon}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {platformConfig?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {platformConfig?.fields.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                margin="normal"
                label={field.label}
                name={field.name}
                type={field.type}
                value={formData[field.name] || ''}
                onChange={handleFormChange}
                required={field.required}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleConnectSubmit}
            variant="contained"
            disabled={connecting}
          >
            {connecting ? <CircularProgress size={20} /> : 'Connect'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SocialConnections; 