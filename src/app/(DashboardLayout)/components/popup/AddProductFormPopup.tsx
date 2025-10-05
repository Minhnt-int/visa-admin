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
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<ProductAttributes>(formData);

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
      setFormState(selectedProduct);
    } else if (formData) {
      setFormState(formData);
    }
  }, [selectedProduct, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    onChange({ name, value });
  };

  const handleSelectChange = (e: SelectChangeEvent<number | string>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    onChange({ name, value });
  };

  const handleSubmit = () => {
    onSubmit(formState);
    onClose();
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...(formState.items || [])];

    if (!updatedItems[index]) {
      updatedItems[index] = {} as ProductItemAttributes;
    }

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setFormState(prev => ({
      ...prev,
      items: updatedItems
    }));
    onChange({
      name: 'items',
      value: updatedItems
    });
  };

  const handleAddItem = () => {
    const newItem: ProductItemAttributes = {
      name: '',
      color: '',
      price: 0,
      originalPrice: 0,
      status: 'available',
      id: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mediaIds: [],
      mediaIndex: []
    };

    const updatedItems = [...(formState.items || []), newItem];
    setFormState(prev => ({
      ...prev,
      items: updatedItems
    }));
    onChange({
      name: 'items',
      value: updatedItems
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...(formState.items || [])];
    updatedItems.splice(index, 1);

    setFormState(prev => ({
      ...prev,
      items: updatedItems
    }));
    onChange({
      name: 'items',
      value: updatedItems
    });
  };

  const handleMediaChange = (index: number, field: string, value: any) => {
    const updatedMedia = [...(formState.media || [])];

    if (!updatedMedia[index]) {
      updatedMedia[index] = {} as ProductMedia;
    }

    updatedMedia[index] = {
      ...updatedMedia[index],
      [field]: value
    };

    setFormState(prev => ({
      ...prev,
      media: updatedMedia
    }));
    onChange({
      name: 'media',
      value: updatedMedia
    });
  };

  const handleAddMedia = () => {
    const newMedia: ProductMedia = {
      type: 'image',
      url: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: 0,
      productId: 0,
      altText: '',
      name: ''
    };

    const updatedMedia = [...(formState.media || []), newMedia];
    setFormState(prev => ({
      ...prev,
      media: updatedMedia
    }));
    onChange({
      name: 'media',
      value: updatedMedia
    });
  };

  const handleRemoveMedia = (index: number) => {
    const updatedMedia = [...(formState.media || [])];
    updatedMedia.splice(index, 1);

    setFormState(prev => ({
      ...prev,
      media: updatedMedia
    }));
    onChange({
      name: 'media',
      value: updatedMedia
    });
  };

  const handleEditorChange = (content: string) => {
    setFormState(prev => ({
      ...prev,
      description: content
    }));
    onChange({ name: 'description', value: content });
  };

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isView ? 'Xem chi tiết sản phẩm' : formData.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
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
            {formData.id ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddProductFormPopup;
