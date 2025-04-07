'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useState, useEffect } from 'react';
import { ProductCategory } from '@/data/ProductCategory';
import { Button, Space, message, Form, Descriptions, Card, Spin } from 'antd';
import { ActionType, useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';

const ProductCategoryView = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const id = Number(params.id);
  
  const {
    // ProductCategory State
    productCategories,
    selectedProductCategory,
    
    // Shared State
    loading,
    
    // ProductCategory Actions
    fetchProductCategories,
    fetchProductCategoryById,
    
    // Shared Actions
    setLoadingState,
    setCurrentAction,
  } = useAppContext();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingState(true);
        await fetchProductCategories(); // Tải danh sách để có tên danh mục cha
        await fetchProductCategoryById(id);
        setCurrentAction(ActionType.VIEW, 'productCategory', id);
        setLoadingState(false);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        message.error('Không thể tải thông tin danh mục');
      }
    };
    
    loadData();
  }, [id, fetchProductCategoryById, fetchProductCategories, setLoadingState, setCurrentAction]);

  // Tìm tên danh mục cha nếu có
  const getParentCategoryName = () => {
    if (!selectedProductCategory?.parentId) return 'Không có';
    const parentCategory = productCategories.find(cat => cat.id === selectedProductCategory.parentId);
    return parentCategory ? parentCategory.name : 'Không tìm thấy';
  };

  return (
    <PageContainer title="Chi tiết danh mục" description="Xem thông tin danh mục sản phẩm">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                </div>
              ) : selectedProductCategory ? (
                <>
                  <Descriptions title="Thông tin danh mục" bordered layout="vertical">
                    <Descriptions.Item label="ID">{selectedProductCategory.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên danh mục">{selectedProductCategory.name}</Descriptions.Item>
                    <Descriptions.Item label="Slug">{selectedProductCategory.slug}</Descriptions.Item>
                    <Descriptions.Item label="Danh mục cha">{getParentCategoryName()}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      {selectedProductCategory.createdAt 
                        ? new Date(selectedProductCategory.createdAt).toLocaleString() 
                        : 'Chưa có'
                      }
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật">
                      {selectedProductCategory.updatedAt 
                        ? new Date(selectedProductCategory.updatedAt).toLocaleString() 
                        : 'Chưa có'
                      }
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả" span={3}>
                      <div dangerouslySetInnerHTML={{ __html: selectedProductCategory.description || 'Không có mô tả' }} />
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Space>
                      <Button onClick={() => router.push('/danh-muc-san-pham')}>
                        Quay lại
                      </Button>
                      <Button type="primary" onClick={() => router.push(`/danh-muc-san-pham/action?id=${id}&mode=edit`)}>
                        Chỉnh sửa
                      </Button>
                    </Space>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <p>Không tìm thấy thông tin danh mục</p>
                  <Button onClick={() => router.push('/danh-muc-san-pham')}>
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

export default ProductCategoryView; 