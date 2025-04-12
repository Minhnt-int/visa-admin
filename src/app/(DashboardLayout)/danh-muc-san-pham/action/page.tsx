'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useState, useEffect } from 'react';
import { ProductCategory } from '@/data/ProductCategory';
import { message } from 'antd';
import { ActionType, useAppContext } from '@/contexts/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCategoryForm from '../../components/forms/ProductCategoryForm';

const initialFormData: ProductCategory = {
  id: 0,
  name: "",
  slug: "",
  description: "",
  parentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const ProductCategoryAction = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') ? Number(searchParams.get('id')) : null;
  const mode = searchParams?.get('mode') || 'create';
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState<ProductCategory>(initialFormData);
  
  const {
    // ProductCategory State
    productCategories,
    selectedProductCategory,
    
    // Shared State
    loading,
    
    // ProductCategory Actions
    fetchProductCategories,
    fetchProductCategoryById,
    createProductCategory,
    updateProductCategory,
    
    // Shared Actions
    setLoadingState,
    setCurrentAction,
  } = useAppContext();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Tải danh sách danh mục để có danh mục cha
        await fetchProductCategories();
        
        if (id) {
          setLoadingState(true);
          await fetchProductCategoryById(id);
          setLoadingState(false);
        } else {
          setCurrentAction(ActionType.CREATE, 'productCategory');
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        message.error('Không thể tải dữ liệu danh mục');
      }
    };
    
    loadData();
  }, [id, fetchProductCategoryById, fetchProductCategories, setLoadingState, setCurrentAction]);

  useEffect(() => {
    if (selectedProductCategory && (isEdit || isView)) {
      setFormData(selectedProductCategory);
      if (isEdit) {
        setCurrentAction(ActionType.EDIT, 'productCategory', id || undefined);
      } else if (isView) {
        setCurrentAction(ActionType.VIEW, 'productCategory', id || undefined);
      }
    }
  }, [selectedProductCategory, isEdit, isView, id, setCurrentAction]);

  const handleSubmit = async (data: ProductCategory) => {
    try {
      if (isEdit && id) {
        await updateProductCategory(id, data);
        message.success('Đã cập nhật danh mục thành công!');
      } else {
        await createProductCategory(data);
        message.success('Đã tạo danh mục mới thành công!');
      }
      router.push('/danh-muc-san-pham');
    } catch (error) {
      console.error('Error saving category:', error);
      message.error('Không thể lưu danh mục. Vui lòng thử lại sau.');
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
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                Đang tải dữ liệu...
              </div>
            ) : (
              <ProductCategoryForm
                formData={formData}
                isView={isView}
                isEdit={isEdit}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            )}
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default ProductCategoryAction; 