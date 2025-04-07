'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useState, useEffect } from 'react';
import { ProductCategory } from '@/data/ProductCategory';
import { Button, Space, message, Form, Input, Select, Card, Spin } from 'antd';
import { ActionType, useAppContext } from '@/contexts/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmPopup from '../../components/popup/ConfirmPopup';

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

  const [confirmingPopup, setConfirmingPopup] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSelectChange = (value: number | null) => {
    setFormData(prev => ({
      ...prev,
      parentId: value,
    }));
  };

  const handleSubmit = () => {
    setConfirmingPopup(true);
  };

  const handleConfirm = async () => {
    try {
      if (isEdit && id) {
        await updateProductCategory(id, formData);
        message.success('Đã cập nhật danh mục thành công!');
      } else {
        await createProductCategory(formData);
        message.success('Đã tạo danh mục mới thành công!');
      }
      router.push('/danh-muc-san-pham');
    } catch (error) {
      console.error('Error saving category:', error);
      message.error('Không thể lưu danh mục. Vui lòng thử lại sau.');
    }
    setConfirmingPopup(false);
  };

  return (
    <PageContainer title={isView ? 'Chi tiết danh mục' : isEdit ? 'Cập nhật danh mục' : 'Thêm danh mục mới'} 
      description="Quản lý danh mục sản phẩm">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <Form layout="vertical" style={{ maxWidth: 800, margin: '0 auto' }}>
                <Form.Item label="Tên danh mục" required>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isView}
                    placeholder="Nhập tên danh mục"
                  />
                </Form.Item>
                <Form.Item label="Slug" required>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    disabled={isView}
                    placeholder="Nhập slug"
                  />
                </Form.Item>
                <Form.Item label="Danh mục cha">
                  <Select
                    allowClear
                    placeholder="Chọn danh mục cha (nếu có)"
                    value={formData.parentId}
                    onChange={handleSelectChange}
                    disabled={isView}
                    options={productCategories
                      .filter(cat => cat.id !== formData.id) // Loại bỏ danh mục hiện tại
                      .map(category => ({
                        value: category.id,
                        label: category.name
                      }))}
                  />
                </Form.Item>
                <Form.Item label="Mô tả">
                  {isView ? (
                    <div dangerouslySetInnerHTML={{ __html: formData.description || '' }} />
                  ) : (
                    <Input.TextArea
                      rows={6}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      disabled={isView}
                      placeholder="Nhập mô tả"
                    />
                  )}
                </Form.Item>
                <Form.Item>
                  <Space>
                    {isView ? (
                      <Button type="primary" onClick={() => router.push('/danh-muc-san-pham')}>
                        Quay lại
                      </Button>
                    ) : (
                      <>
                        <Button onClick={() => router.push('/danh-muc-san-pham')}>
                          Hủy
                        </Button>
                        <Button type="primary" onClick={handleSubmit}>
                          {isEdit ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                      </>
                    )}
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <ConfirmPopup
        open={confirmingPopup}
        onClose={() => setConfirmingPopup(false)}
        onSubmit={handleConfirm}
        Content={isEdit 
          ? "Xác nhận cập nhật danh mục này?"
          : "Xác nhận tạo danh mục mới?"
        }
      />
    </PageContainer>
  )
}

export default ProductCategoryAction; 