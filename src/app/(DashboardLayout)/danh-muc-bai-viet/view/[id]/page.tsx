'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useEffect } from 'react';
import { BlogCategory } from '@/data/blogCategory';
import { Button, Space, message, Descriptions, Card, Spin, Image } from 'antd';
import { ActionType, useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';

const BlogCategoryView = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const id = Number(params.id);
  
  const {
    // BlogCategory State
    selectedBlogCategory,
    
    // Shared State
    loading,
    
    // BlogCategory Actions
    fetchBlogCategoryById,
    
    // Shared Actions
    setLoadingState,
    setCurrentAction,
  } = useAppContext();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingState(true);
        await fetchBlogCategoryById(id);
        setCurrentAction(ActionType.VIEW, 'blogCategory', id);
        setLoadingState(false);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        message.error('Không thể tải thông tin danh mục');
      }
    };
    
    loadData();
  }, [id, fetchBlogCategoryById, setLoadingState, setCurrentAction]);

  return (
    <PageContainer title="Chi tiết danh mục" description="Xem thông tin danh mục bài viết">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                </div>
              ) : selectedBlogCategory ? (
                <>
                  <Descriptions title="Thông tin danh mục" bordered layout="vertical">
                    <Descriptions.Item label="ID">{selectedBlogCategory.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên danh mục">{selectedBlogCategory.name}</Descriptions.Item>
                    <Descriptions.Item label="Slug">{selectedBlogCategory.slug}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      {selectedBlogCategory.createdAt 
                        ? new Date(selectedBlogCategory.createdAt).toLocaleString() 
                        : 'Chưa có'
                      }
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật">
                      {selectedBlogCategory.updatedAt 
                        ? new Date(selectedBlogCategory.updatedAt).toLocaleString() 
                        : 'Chưa có'
                      }
                    </Descriptions.Item>
                    <Descriptions.Item label="Hình ảnh" span={3}>
                      {selectedBlogCategory.avatarUrl ? (
                        <Image 
                          src={selectedBlogCategory.avatarUrl} 
                          alt={selectedBlogCategory.name}
                          style={{ maxWidth: '300px' }}
                        />
                      ) : (
                        'Không có hình ảnh'
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Space>
                      <Button onClick={() => router.push('/danh-muc-bai-viet')}>
                        Quay lại
                      </Button>
                      <Button type="primary" onClick={() => router.push(`/danh-muc-bai-viet/action?id=${id}&mode=edit`)}>
                        Chỉnh sửa
                      </Button>
                    </Space>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <p>Không tìm thấy thông tin danh mục</p>
                  <Button onClick={() => router.push('/danh-muc-bai-viet')}>
                    Quay lại danh sách
                  </Button>
                </div>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default BlogCategoryView; 