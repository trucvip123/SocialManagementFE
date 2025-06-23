import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';
import axios from 'axios';

const PostCreator = () => {
  const [formData, setFormData] = useState({
    content: '',
    media: [],
    platforms: {
      facebook: false,
      instagram: false,
      twitter: false
    },
    scheduledFor: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlatformChange = (platform) => {
    setFormData({
      ...formData,
      platforms: {
        ...formData.platforms,
        [platform]: !formData.platforms[platform]
      }
    });
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const mediaUrls = files.map(file => URL.createObjectURL(file));
    
    setFormData({
      ...formData,
      media: [...formData.media, ...mediaUrls]
    });
  };

  const removeMedia = (index) => {
    const newMedia = formData.media.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      media: newMedia
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setMessage({ type: 'error', text: 'Post content is required' });
      return;
    }

    const selectedPlatforms = Object.values(formData.platforms).some(Boolean);
    if (!selectedPlatforms) {
      setMessage({ type: 'error', text: 'Please select at least one social network' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    // Gửi trực tiếp giá trị ISO từ input, không chuyển đổi
    let scheduledForVN = formData.scheduledFor || null;

    try {
      const response = await axios.post('/posts', { ...formData, scheduledFor: scheduledForVN });
      setMessage({ type: 'success', text: 'Post created successfully!' });
      
      // Reset form
      setFormData({
        content: '',
        media: [],
        platforms: {
          facebook: false,
          instagram: false,
          twitter: false
        },
        scheduledFor: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        // text: error.response?.data?.message || 'Lỗi khi tạo bài đăng' 
        text: error.response?.data?.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Create new post
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Post content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            margin="normal"
            required
            helperText={`${formData.content.length}/2000 characters`}
            inputProps={{ maxLength: 2000 }}
          />

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Select social networks
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.platforms.facebook}
                      onChange={() => handlePlatformChange('facebook')}
                      icon={<Facebook />}
                      checkedIcon={<Facebook color="primary" />}
                    />
                  }
                  label="Facebook"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.platforms.twitter}
                      onChange={() => handlePlatformChange('twitter')}
                      icon={<Twitter />}
                      checkedIcon={<Twitter color="primary" />}
                    />
                  }
                  label="Twitter"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.platforms.instagram}
                      onChange={() => handlePlatformChange('instagram')}
                      icon={<Instagram />}
                      checkedIcon={<Instagram color="primary" />}
                    />
                  }
                  label="Instagram"
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add image/video
            </Typography>
            <input
              accept="image/*,video/*"
              style={{ display: 'none' }}
              id="media-upload"
              multiple
              type="file"
              onChange={handleMediaUpload}
            />
            <label htmlFor="media-upload">
              <Button variant="outlined" component="span">
                Choose file
              </Button>
            </label>
          </Box>

          {formData.media.length > 0 && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {formData.media.map((url, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={url}
                      alt={`Media ${index + 1}`}
                    />
                    <CardContent>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeMedia(index)}
                      >
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <TextField
            fullWidth
            type="datetime-local"
            label="Schedule post (optional)"
            name="scheduledFor"
            value={formData.scheduledFor}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Post'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PostCreator; 