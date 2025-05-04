'use client'
import React, { useState, useEffect, Suspense } from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { BlogCategory } from '@/data/blogCategory';
import { ActionType, useAppContext } from '@/contexts/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import BlogCategoryForm from '../../components/forms/BlogCategoryForm';
import { Snackbar, Alert } from '@/config/mui';

const initialFormData: BlogCategory = {
  id: 0,
  name: "",
  slug: "",
  avatarUrl: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  status: "active"
};

const BlogCategoryAction = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') ? Number(searchParams.get('id')) : null;
  const mode = searchParams?.get('mode') || 'create';
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const [formData, setFormData] = useState<BlogCategory>(initialFormData);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const {
    selectedBlogCategory,
    loading,
    fetchBlogCategories,
    createBlogCategory,
    updateBlogCategory,
    setLoadingState,
    setCurrentAction,
  } = useAppContext();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (id) {
          setLoadingState(true);
          await fetchBlogCategories();
          setLoadingState(false);
        } else {
          setCurrentAction(ActionType.CREATE, 'blogCategory');
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        setSnackbar({
          open: true,
          message: 'Không thể tải dữ liệu danh mục',
          severity: 'error'
        });
      }
    };
    
    loadData();
  }, [id, fetchBlogCategories, setLoadingState, setCurrentAction]);

  useEffect(() => {
    if (selectedBlogCategory && (isEdit || isView)) {
      setFormData(selectedBlogCategory);
      if (isEdit) {
        setCurrentAction(ActionType.EDIT, 'blogCategory', id || undefined);
      } else if (isView) {
        setCurrentAction(ActionType.VIEW, 'blogCategory', id || undefined);
      }
    }
  }, [selectedBlogCategory, isEdit, isView, id, setCurrentAction]);

  const handleChange = (data: { name: string; value: any }) => {
    setFormData(prev => ({
      ...prev,
      [data.name]: data.value,
    }));
    console.log(data, formData);
  };

  const handleSubmit = () => {
    setConfirmingPopup(true);
  };

  const handleConfirm = async () => {
    try {
      if (isEdit && id) {
        await updateBlogCategory(formData);
        setSnackbar({
          open: true,
          message: 'Đã cập nhật danh mục thành công!',
          severity: 'success'
        });
      } else {
        await createBlogCategory(formData);
        setSnackbar({
          open: true,
          message: 'Đã tạo danh mục mới thành công!',
          severity: 'success'
        });
      }
      router.push('/danh-muc-bai-viet');
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbar({
        open: true,
        message: 'Không thể lưu danh mục. Vui lòng thử lại sau.',
        severity: 'error'
      });
    }
    setConfirmingPopup(false);
  };

  return (
    <Suspense fallback={<div>Đang tải thông tin...</div>}>
        <PageContainer title={isView ? 'Chi tiết danh mục' : isEdit ? 'Cập nhật danh mục' : 'Thêm danh mục mới'} 
      description="Quản lý danh mục bài viết">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <BlogCategoryForm
            />
          </Grid>
          {formData.avatarUrl && (
            <div className="mb-4">
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL || ''}${formData.avatarUrl}` || '/placeholder.png'} 
                alt="Category Avatar" 
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}
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
    </Suspense>
  );
};

export default BlogCategoryAction;
