import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography
} from '@/config/mui';
import { ProductAttributes, ProductItemAttributes, ProductMedia } from '@/data/ProductAttributes';
import { useAppContext } from '@/contexts/AppContext';
import { ProductCategory } from '@/data/ProductCategory';
import { SelectChangeEvent } from '@mui/material';

interface AddProductFormPopupProps {
  open: boolean;
  isView: boolean;
  onClose: () => void;
  onChange: (data: { name: string; value: any }) => void;
  onSubmit: (data: ProductAttributes) => void;
  formData: ProductAttributes;
  slug?: string;
  categories: ProductCategory[];
}

const AddProductFormPopup: React.FC<AddProductFormPopupProps> = ({
  open,
  isView,
  onClose,
  onChange,
  onSubmit,
  formData,
  slug,
  categories
}) => {
  const [isAIResultOpen, setIsAIResultOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localFormData, setLocalFormData] = useState<ProductAttributes | null>(null);
  const [formState, setFormState] = useState<ProductAttributes>({
    id: 0,
    name: '',
    description: '',
    categoryId: 0,
    slug: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    media: [],
    items: []
  });

  const {
    selectedProduct,
    fetchProductBySlug
  } = useAppContext();

  useEffect(() => {
    if (open && slug) {
      setLoading(true);
      fetchProductBySlug(slug)
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, slug, fetchProductBySlug]);

  useEffect(() => {
    if (selectedProduct) {
      setLocalFormData(selectedProduct);
    } else if (formData) {
      setLocalFormData(formData);
    }
  }, [selectedProduct, formData]);

  useEffect(() => {
    if (formData) {
      setFormState(formData);
    }
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<number | string>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formState);
    onClose();
  };

  // Hàm để xử lý thay đổi trong mảng items
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...(formData.items || [])];

    if (!updatedItems[index]) {
      updatedItems[index] = {} as ProductItemAttributes;
    }

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    onChange({
      name: 'items',
      value: updatedItems
    });
  };

  // Hàm để thêm một item mới vào mảng items
  const handleAddItem = () => {
    const newItem: ProductItemAttributes = {
      name: '',
      color: '',
      price: 0,
      originalPrice: 0,
      status: 'available',
      id: 0
    };

    onChange({
      name: 'items',
      value: [...(formData.items || []), newItem]
    });
  };

  // Hàm để xóa một item khỏi mảng items
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems.splice(index, 1);

    onChange({
      name: 'items',
      value: updatedItems
    });
  };

  // Hàm để xử lý thay đổi trong mảng media
  const handleMediaChange = (index: number, field: string, value: any) => {
    const updatedMedia = [...(formData.media || [])];

    if (!updatedMedia[index]) {
      updatedMedia[index] = {} as ProductMedia;
    }

    updatedMedia[index] = {
      ...updatedMedia[index],
      [field]: value
    };

    onChange({
      name: 'media',
      value: updatedMedia
    });
  };

  // Hàm để thêm một media mới vào mảng media
  const handleAddMedia = () => {
    const newMedia: ProductMedia = {
      type: 'image',
      url: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: 0,
      productId: 0,
      mediaId: 0,
      altText: '',
      name: ''
    };

    onChange({
      name: 'media',
      value: [...(formData.media || []), newMedia]
    });
  };

  // Hàm để xóa một media khỏi mảng media
  const handleRemoveMedia = (index: number) => {
    const updatedMedia = [...(formData.media || [])];
    updatedMedia.splice(index, 1);

    onChange({
      name: 'media',
      value: updatedMedia
    });
  };

  // Trong component cha
  const handleEditorChange = (content: string) => {
    onChange({ name: 'description', value: content });
  };

  const title = isView ? "View Product" : selectedProduct?.id ? "Edit Product" : "Add Product";

  const handleAISuggestion = () => {
    setIsAIResultOpen(true);
  };

  const productToDisplay = localFormData || formData;

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Loading...</DialogTitle>
        <DialogContent style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div>Loading product data...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isView ? 'Xem chi tiết sản phẩm' : formData ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên sản phẩm"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  disabled={isView}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Slug"
                  name="slug"
                  value={formState.slug}
                  onChange={handleInputChange}
                  disabled={isView}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  disabled={isView}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Giá"
                  name="price"
                  type="number"
                  value={formState?.items[0]?.price}
                  onChange={handleInputChange}
                  disabled={isView}
                  required
                  InputProps={{
                    startAdornment: <Typography>₫</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    name="categoryId"
                    value={formState.categoryId || ''}
                    onChange={handleSelectChange}
                    disabled={isView}
                    label="Danh mục"
                  >
                    <MenuItem value="">Chọn danh mục</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="status"
                    value={formState.status}
                    onChange={handleSelectChange}
                    disabled={isView}
                    label="Trạng thái"
                  >
                    <MenuItem value="active">Hoạt động</MenuItem>
                    <MenuItem value="inactive">Không hoạt động</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          {!isView && (
            <Button onClick={handleSubmit} color="primary" variant="contained">
              {formData ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddProductFormPopup;
