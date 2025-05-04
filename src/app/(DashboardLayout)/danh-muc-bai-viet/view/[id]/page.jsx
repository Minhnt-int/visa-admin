'use client';
export const dynamic = 'force-static';

import {
  Grid,
  Box,
  Button,
  Stack,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useEffect, useState } from 'react';
import { ActionType, useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const BlogCategoryView = ({ params }) => {
  const router = useRouter();
  const id = Number(params.id);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const {
    selectedBlogCategory,
    loading,
    fetchBlogCategoryById,
    setLoadingState,
    setCurrentAction,
  } = useAppContext();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingState(true);
        await fetchBlogCategoryById(id);
        setCurrentAction(ActionType.VIEW, 'blogCategory', id);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        setSnackbar({
          open: true,
          message: 'Không thể tải thông tin danh mục',
          severity: 'error'
        });
      } finally {
        setLoadingState(false);
      }
    };
    
    loadData();
  }, [id, fetchBlogCategoryById, setLoadingState, setCurrentAction]);

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleString() : 'Chưa có';
  };

  return (
    <PageContainer title="Chi tiết danh mục" description="Xem thông tin danh mục bài viết">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                  </Box>
                ) : selectedBlogCategory ? (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Thông tin danh mục
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText primary="ID" secondary={selectedBlogCategory.id} />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText primary="Tên danh mục" secondary={selectedBlogCategory.name} />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText primary="Slug" secondary={selectedBlogCategory.slug} />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Ngày tạo" 
                          secondary={formatDate(selectedBlogCategory.createdAt)} 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Ngày cập nhật" 
                          secondary={formatDate(selectedBlogCategory.updatedAt)} 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Hình ảnh" 
                          secondary={
                            selectedBlogCategory.avatarUrl ? (
                              <Box mt={1}>
                                <Image
                                  src={selectedBlogCategory.avatarUrl}
                                  alt={selectedBlogCategory.name}
                                  width={300}
                                  height={200}
                                  style={{ objectFit: 'contain' }}
                                />
                              </Box>
                            ) : 'Không có hình ảnh'
                          }
                        />
                      </ListItem>
                    </List>
                    
                    <Box mt={3} display="flex" justifyContent="flex-end">
                      <Stack direction="row" spacing={2}>
                        <Button 
                          variant="outlined" 
                          onClick={() => router.push('/danh-muc-bai-viet')}
                        >
                          Quay lại
                        </Button>
                        <Button 
                          variant="contained" 
                          onClick={() => router.push(`/danh-muc-bai-viet/action?id=${id}&mode=edit`)}
                        >
                          Chỉnh sửa
                        </Button>
                      </Stack>
                    </Box>
                  </>
                ) : (
                  <Box textAlign="center" py={6}>
                    <Typography variant="body1" gutterBottom>
                      Không tìm thấy thông tin danh mục
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => router.push('/danh-muc-bai-viet')}
                      sx={{ mt: 2 }}
                    >
                      Quay lại danh sách
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default BlogCategoryView; 