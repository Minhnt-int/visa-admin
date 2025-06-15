'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useState, useEffect, Suspense } from 'react';
import { ProductCategory } from '@/data/ProductCategory';
import { ActionType, useAppContext } from '@/contexts/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCategoryForm from '../../components/forms/ProductCategoryForm';
import { Snackbar, Alert } from '@/config/mui';
import ApiService from '@/services/ApiService';

const initialFormData: ProductCategory = {
  id: 0,
  name: "",
  slug: "",
  description: "",
  parentId: null,
  status: "active",
  avatarUrl: "",
  createdAt: new Date(),
  updatedAt: new Date()
};

const ProductCategoryActionContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams?.get('mode') || 'create';
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState<ProductCategory>(initialFormData);
  
  const {
    productCategories,
    selectedProductCategory,
    loading,
    fetchProductCategories,
    createProductCategory,
    updateProductCategory,
    setLoadingState,
    setCurrentAction,
  } = useAppContext();

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (selectedProductCategory && (isEdit || isView)) {
      setFormData(selectedProductCategory);
      if (isEdit) {
        setCurrentAction(ActionType.EDIT, 'productCategory');
      } else if (isView) {
        setCurrentAction(ActionType.VIEW, 'productCategory');
      }
    }
  }, [selectedProductCategory, isEdit, isView, setCurrentAction]);

  const handleSubmit = async (data: ProductCategory) => {
    try {
      if (isEdit) {
        if (!data.id) {
          throw new Error('Missing product category ID');
        }
        await updateProductCategory(data.id, data);
        setSnackbar({
          open: true,
          message: 'Đã cập nhật danh mục thành công!',
          severity: 'success'
        });
        // Chỉ chuyển hướng khi thành công
        setTimeout(() => router.push('/danh-muc-san-pham'), 1500);
      } else {
        const success = await createProductCategory(data);
        if (success) {
          setSnackbar({
            open: true,
            message: 'Đã tạo danh mục mới thành công!',
            severity: 'success'
          });
          // Chỉ chuyển hướng khi thành công
          setTimeout(() => router.push('/danh-muc-san-pham'), 1500);
        } else {
          // Xử lý khi không thành công
          setSnackbar({
            open: true,
            message: 'Không thể tạo danh mục. Vui lòng thử lại',
            severity: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      
      // Sử dụng ApiService.handleError để lấy thông báo lỗi
      const errorResult = ApiService.handleError(error);
      
      setSnackbar({
        open: true,
        message: errorResult.message,
        severity: 'error'
      });
    }
  };

  const handleCancel = () => {
    router.push('/danh-muc-san-pham');
  };

  return (
    <PageContainer title={isView ? 'Chi tiết danh mục' : isEdit ? 'Cập nhật danh mục' : 'Thêm danh mục mới'} 
      description="Quản lý danh mục sản phẩm">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ProductCategoryForm
                formData={formData}
                isView={isView}
                isEdit={isEdit}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
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

const ProductCategoryAction = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductCategoryActionContent />
    </Suspense>
  );
};

export default ProductCategoryAction;