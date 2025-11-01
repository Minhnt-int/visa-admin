'use client'
import { Grid, Box, Card, CardContent, Typography, Button, Chip, CircularProgress, Alert } from '@mui/material';
import { IconPlane, IconArticle, IconNews, IconTrendingUp, IconUsers, IconEye, IconRefresh } from '@tabler/icons-react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import Link from 'next/link';
import { useDashboardStats } from '@/hooks/useDashboardStats';
// components
import ScoringNews from './components/score/ScoringBlog';

const Dashboard = () => {
  const { stats, loading, error, refetch } = useDashboardStats();

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={refetch}>
                <IconRefresh size={16} />
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Navigation Cards */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent sx={{ color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconPlane size={32} />
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                    Tour Du Lịch
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Quản lý các tour du lịch và gói nghỉ dưỡng
                </Typography>
                <Button 
                  component={Link} 
                  href="/tour-du-lich"
                  variant="contained" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Quản lý Tour
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <CardContent sx={{ color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconArticle size={32} />
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                    Tin Tức
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Quản lý bài viết tin tức và blog
                </Typography>
                <Button 
                  component={Link} 
                  href="/tin-tuc"
                  variant="contained" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Quản lý Tin Tức
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <CardContent sx={{ color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconNews size={32} />
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                    Dịch Vụ Visa
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Quản lý các dịch vụ visa theo quốc gia
                </Typography>
                <Button 
                  component={Link} 
                  href="/dich-vu-visa"
                  variant="contained" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Quản lý Visa
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistics Cards */}
          <Grid item xs={12} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconTrendingUp size={24} color="#4caf50" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Tổng Tour
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                  {loading ? <CircularProgress size={24} /> : stats?.totals.tours || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tour du lịch
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconArticle size={24} color="#2196f3" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Tổng Tin Tức
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                  {loading ? <CircularProgress size={24} /> : stats?.totals.news || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bài viết tin tức
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconNews size={24} color="#ff9800" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Tổng Visa
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                  {loading ? <CircularProgress size={24} /> : stats?.totals.visaServices || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dịch vụ visa
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconUsers size={24} color="#9c27b0" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Tuần này
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                  {loading ? <CircularProgress size={24} /> : stats?.weekly.total || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tours + News mới
                </Typography>
                {!loading && stats && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 2, fontSize: '0.75rem' }}>
                    <Typography variant="caption" color="text.secondary">
                      Tours: {stats.weekly.tours}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      News: {stats.weekly.news}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Data Info Card */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconEye size={24} color="#607d8b" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Thông Tin Dữ Liệu
                  </Typography>
                </Box>
                {!loading && stats && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Cập nhật lần cuối:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
                      {new Date(stats.lastUpdated).toLocaleString('vi-VN')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Tổng quan:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={`${stats.totals.tours} Tours`} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`${stats.totals.news} News`} 
                        size="small" 
                        color="info" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`${stats.totals.visaServices} Visa`} 
                        size="small" 
                        color="warning" 
                        variant="outlined" 
                      />
                    </Box>
                  </Box>
                )}
                {loading && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Đang tải dữ liệu...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '100%', opacity: 0.7 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconUsers size={24} color="#607d8b" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Analytics
                  </Typography>
                  <Chip label="Sắp ra mắt" size="small" sx={{ ml: 2 }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Thống kê chi tiết và báo cáo
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Existing ScoringNews Component */}
          <Grid item xs={12} lg={12}>
            <ScoringNews/>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default Dashboard;
