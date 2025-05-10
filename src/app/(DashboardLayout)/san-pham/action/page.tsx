"use client";

import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useState, useEffect } from 'react';
import { ProductAttributes } from '@/data/ProductAttributes';
import { ActionType, useAppContext } from '@/contexts/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductForm from '../../components/forms/ProductForm';
import { Snackbar, Alert } from '@/config/mui';

const initialFormData: ProductAttributes = {
  id: 0,
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  status: "draft",
  categoryId: 0,
  avatarUrl: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [],
  media: []
};

export default function ProductAction() { 
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams?.get('mode') || 'create';
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  
  const [formData, setFormData] = useState<ProductAttributes>(initialFormData);
  
  const {
    selectedProduct,
    loading,
    createProduct,
    updateProduct,
    setCurrentAction,
  } = useAppContext();

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Move useEffect outside of render functions to prevent recreation on each render
  useEffect(() => {
    if (selectedProduct && (isEdit || isView)) {
      setFormData(selectedProduct);
      
      if (isEdit) {
        setCurrentAction(ActionType.EDIT, 'product');
      } else if (isView) {
        setCurrentAction(ActionType.VIEW, 'product');
      }
    }
  }, [selectedProduct, isEdit, isView, setCurrentAction]);

  const handleSubmit = async (data: ProductAttributes, isEdit: boolean) => {
    try {
      if (isEdit) {
        if (!data.id) {
          throw new Error('Missing product ID');
        }
        await updateProduct(data.id, data);
        setSnackbar({
          open: true,
          message: 'Đã cập nhật sản phẩm thành công!',
          severity: 'success'
        });
      } else {
        await createProduct(data);
        setSnackbar({
          open: true,
          message: 'Đã tạo sản phẩm mới thành công!',
          severity: 'success'
        });
      }
      router.push('/san-pham');
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({
        open: true,
        message: 'Không thể lưu sản phẩm. Vui lòng thử lại sau.',
        severity: 'error'
      });
    }
  };

  const handleCancel = () => {
    router.push('/san-pham');
  };

  return (
    <PageContainer 
      title={isView ? 'Chi tiết sản phẩm' : isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'} 
      description="Quản lý sản phẩm"
    >
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                Đang tải dữ liệu...
              </div>
            ) : (
              <ProductForm
                formData={formData}
                isView={isView}
                isEdit={isEdit}
                onSubmit={(data) => handleSubmit(data, isEdit)}
                onCancel={handleCancel}
              />
            )}
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
}