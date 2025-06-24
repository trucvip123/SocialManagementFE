import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram
} from '@mui/icons-material';
import axios from 'axios';

const getPlatformIcon = (platform) => {
  switch (platform) {
    case 'facebook':
      return <Facebook color="primary" />;
    case 'twitter':
      return <Twitter color="primary" />;
    case 'instagram':
      return <Instagram color="primary" />;
    default:
      return null;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'posted':
      return 'success';
    case 'failed':
      return 'error';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

const PostHistory = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/posts');
      setPosts(res.data.posts || []);
    } catch (err) {
      setError('Error loading post history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Post history
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : posts.length === 0 ? (
        <Typography color="textSecondary">No posts yet</Typography>
      ) : (
        posts.map((post) => (
          <Card key={post._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                {post.content}
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                {Object.entries(post.platforms).map(([platform, data]) => (
                  data.enabled && (
                    <Box key={platform} display="flex" alignItems="center">
                      {getPlatformIcon(platform)}
                      <Typography
                        variant="caption"
                        color={`${getStatusColor(data.status)}.main`}
                        sx={{ ml: 0.5 }}
                      >
                        {data.status}
                      </Typography>
                      {data.status === 'failed' && data.error && (
                        <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                          Lỗi: {data.error}
                        </Typography>
                      )}
                    </Box>
                  )
                ))}
              </Box>
              <Typography variant="caption" color="textSecondary">
                {new Date(post.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })}
              </Typography>
              {post.scheduledFor && (
                <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                  Scheduled for: {new Date(post.scheduledFor).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
};

export default PostHistory; 