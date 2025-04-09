'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useState, useEffect } from 'react';
import { BlogCategory } from '@/data/blogCategory';
import { message } from 'antd';
import { ActionType, useAppContext } from '@/contexts/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmPopup from '../../components/popup/ConfirmPopup';
import BlogCategoryForm from '../../components/forms/BlogCategoryForm';

const initialFormData: BlogCategory = {
  id: 0,
  name: "",
  slug: "",
  avatarUrl: "",
  createdAt: new Date(),
  updatedAt: new Date(),
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
        message.error('Không thể tải dữ liệu danh mục');
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
        message.success('Đã cập nhật danh mục thành công!');
      } else {
        await createBlogCategory(formData);
        message.success('Đã tạo danh mục mới thành công!');
      }
      router.push('/danh-muc-bai-viet');
    } catch (error) {
      console.error('Error saving category:', error);
      message.error('Không thể lưu danh mục. Vui lòng thử lại sau.');
    }
    setConfirmingPopup(false);
  };

  return (
    <PageContainer title={isView ? 'Chi tiết danh mục' : isEdit ? 'Cập nhật danh mục' : 'Thêm danh mục mới'} 
      description="Quản lý danh mục bài viết">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <BlogCategoryForm
            />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default BlogCategoryAction;
