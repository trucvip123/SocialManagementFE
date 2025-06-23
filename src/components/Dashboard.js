import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  Create,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPosts: 0,
    connectedPlatforms: 0,
    recentPosts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [postsResponse, socialResponse] = await Promise.all([
        axios.get('/posts?limit=5'),
        axios.get('/social/status')
      ]);

      const connectedPlatforms = Object.values(socialResponse.data.socialAccounts)
        .filter(platform => platform.isConnected).length;

      setStats({
        totalPosts: postsResponse.data.total || 0,
        connectedPlatforms,
        recentPosts: postsResponse.data.posts || []
      });
    } catch (error) {
      setError('Lỗi khi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

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
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Thống kê tổng quan */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.totalPosts}</Typography>
                  <Typography color="textSecondary">Tổng số bài đăng</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Create color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.connectedPlatforms}</Typography>
                  <Typography color="textSecondary">Mạng xã hội đã kết nối</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trạng thái kết nối
              </Typography>
              <Box>
                {Object.entries(user?.socialAccounts || {}).map(([platform, data]) => (
                  <Box key={platform} display="flex" alignItems="center" mb={1}>
                    {getPlatformIcon(platform)}
                    <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={data.isConnected ? 'success.main' : 'error.main'}
                    >
                      {data.isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Nút tạo bài đăng nhanh */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hành động nhanh
              </Typography>
              <Button
                variant="contained"
                startIcon={<Create />}
                onClick={() => navigate('/create')}
                sx={{ mr: 2 }}
              >
                Tạo bài đăng mới
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/connections')}
              >
                Quản lý kết nối
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Bài đăng gần đây */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bài đăng gần đây
              </Typography>
              {stats.recentPosts.length === 0 ? (
                <Typography color="textSecondary">
                  Chưa có bài đăng nào
                </Typography>
              ) : (
                <Box>
                  {stats.recentPosts.map((post) => (
                    <Box key={post._id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body1" gutterBottom>
                        {post.content}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
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
                            </Box>
                          )
                        ))}
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(post.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 