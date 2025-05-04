"use client";

import React, { useState, useEffect } from 'react';
import { 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Snackbar,
  Alert,
  Button,
  Card,
  CardContent,
  Grid
} from '@/config/mui';
import { ProductCategory } from '@/data/ProductCategory';
import { useAppContext } from '@/contexts/AppContext';
import dayjs from 'dayjs';
import ConfirmPopup from '../popup/ConfirmPopup';
import MediaPopup from '../popup/MediaPopup';
import { ProductMedia } from '@/data/ProductAttributes';
import { SelectChangeEvent } from '@mui/material';

interface ProductCategoryFormProps {
  formData: ProductCategory;
  isView?: boolean;
  isEdit?: boolean;
  onSubmit: (data: ProductCategory) => Promise<void>;
  onCancel: () => void;
}

const ProductCategoryForm: React.FC<ProductCategoryFormProps> = ({
  formData: initialFormData,
  isView = false,
  isEdit = false,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<ProductCategory>(initialFormData);
  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const [mediaPopupOpen, setMediaPopupOpen] = useState(false);
  
  const { productCategories, selectedProductCategory } = useAppContext();

  useEffect(() => {
    setFormData(selectedProductCategory || initialFormData);
  }, [selectedProductCategory, initialFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSelectChange = (event: SelectChangeEvent<number | null>) => {
    setFormData(prev => ({
      ...prev,
      parentId: event.target.value as number | null,
    }));
  };

  const handleMediaSelect = (media: ProductMedia) => {
    setFormData(prev => ({
      ...prev,
      avatarUrl: media.url
    }));
  };

  const handleSubmitClick = () => {
    setConfirmingPopup(true);
  };

  const handleConfirm = async () => {
    try {
      await onSubmit(formData);
    } finally {
      setConfirmingPopup(false);
    }
  };

  return (
    <Card style={{ padding: 16 }}>
      <FormControl fullWidth style={{ marginTop: 16 }}>
        <label>Tên danh mục</label>
        <TextField
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isView}
          placeholder="Nhập tên danh mục"
        />
      </FormControl>
      
      <FormControl fullWidth style={{ marginTop: 16 }}>
        <label>Slug</label>
        <TextField
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          disabled={isView}
          placeholder="Nhập slug"
        />
      </FormControl>
      
      <FormControl fullWidth style={{ marginTop: 16 }}>
        <label>Danh mục cha</label>
        <Select
          value={formData.parentId}
          onChange={handleSelectChange}
          disabled={isView}
        >
          {productCategories
            .filter(cat => cat.id !== formData.id) // Loại bỏ danh mục hiện tại
            .map(category => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      
      <FormControl fullWidth style={{ marginTop: 16 }}>
        <label>Hình ảnh</label>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="avatarUrl"
              value={formData.avatarUrl || ''}
              onChange={(e) => handleChange({ target: { name: 'avatarUrl', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
              disabled={isView}
              placeholder="URL hình ảnh"
              style={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={4}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setMediaPopupOpen(true)} 
              disabled={isView}
            >
              Chọn hình ảnh
            </Button>
          </Grid>
        </Grid>
        {formData.avatarUrl && (
          <div style={{ marginTop: 16 }}>
            <img 
              src={`${process.env.NEXT_PUBLIC_API_URL}${formData.avatarUrl}`} 
              alt="Category thumbnail" 
              style={{ maxWidth: '100%', maxHeight: 200 }}
            />
          </div>
        )}
      </FormControl>
      
      <MediaPopup
        open={mediaPopupOpen}
        onClose={() => setMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
        onSubmit={() => {}}
        listMedia={[]}
      />

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Hủy
        </Button>
        {!isView && (
          <Button variant="contained" color="primary" onClick={handleSubmitClick}>
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        )}
      </Box>

      <ConfirmPopup
        open={confirmingPopup}
        onClose={() => setConfirmingPopup(false)}
        onConfirm={handleConfirm}
        title={isEdit ? "Xác nhận cập nhật" : "Xác nhận tạo mới"}
        content={isEdit ? "Bạn có chắc chắn muốn cập nhật danh mục này?" : "Bạn có chắc chắn muốn tạo danh mục mới?"}
      />
    </Card>
  );
};

export default ProductCategoryForm; 