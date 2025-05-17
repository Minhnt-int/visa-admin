"use client";

import React, { useState, useEffect } from 'react';
import { 
  TextField,
  FormControl,
  InputLabel,
  Select as MuiSelect, // Đổi tên để tránh xung đột
  MenuItem,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material'; // Thay vì '@/config/mui'
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
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isView ? "Chi tiết danh mục" : isEdit ? "Cập nhật danh mục" : "Tạo mới danh mục"}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Tên danh mục */}
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Tên danh mục"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập tên danh mục"
              required
            />
          </Grid>
          
          {/* Slug */}
          <Grid item xs={12}>
            <TextField
              name="slug"
              label="Slug"
              fullWidth
              value={formData.slug}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập slug (vd: danh-muc-moi)"
              helperText="Định dạng URL thân thiện cho danh mục"
            />
          </Grid>
          
          {/* Danh mục cha */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink style={{backgroundColor:'white'}} id="parent-category-label">Danh mục cha</InputLabel>
              <MuiSelect // Sử dụng tên mới
                labelId="parent-category-label"
                value={formData.parentId}
                onChange={handleSelectChange}
                disabled={isView}
              >
                <MenuItem value="">
                  <em>Không có</em>
                </MenuItem>
                {productCategories
                  .filter(cat => cat.id !== formData.id) // Loại bỏ danh mục hiện tại
                  .map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
              </MuiSelect>
            </FormControl>
          </Grid>
          
          {/* Mô tả */}
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Mô tả"
              fullWidth
              multiline
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập mô tả cho danh mục này"
            />
          </Grid>
          
          {/* Hình ảnh */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Hình ảnh đại diện
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  name="avatarUrl"
                  fullWidth
                  value={formData.avatarUrl || ''}
                  onChange={(e) => handleChange({ target: { name: 'avatarUrl', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
                  disabled={isView}
                  placeholder="URL hình ảnh"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => setMediaPopupOpen(true)} 
                  disabled={isView}
                  fullWidth
                >
                  Chọn hình ảnh
                </Button>
              </Grid>
            </Grid>
            {formData.avatarUrl && (
              <Box mt={2} sx={{ textAlign: 'center' }}>
                <img 
                  src={formData.avatarUrl.startsWith('http') 
                    ? formData.avatarUrl 
                    : `${process.env.NEXT_PUBLIC_API_URL}${formData.avatarUrl}`} 
                  alt="Category thumbnail" 
                  style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                />
              </Box>
            )}
          </Grid>
          
          {/* Thời gian tạo và cập nhật */}
          {(formData.createdAt || formData.updatedAt) && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Thông tin thời gian
              </Typography>
              <Grid container spacing={2}>
                {formData.createdAt && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ngày tạo"
                      value={dayjs(formData.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                )}
                {formData.updatedAt && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ngày cập nhật"
                      value={dayjs(formData.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
        </Grid>

        {/* Nút điều khiển */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            {isView ? "Quay lại" : "Hủy"}
          </Button>
          {!isView && (
            <Button variant="contained" color="primary" onClick={handleSubmitClick}>
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          )}
        </Box>
      </CardContent>

      <MediaPopup
        open={mediaPopupOpen}
        onClose={() => setMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
        onSubmit={() => {}}
        listMedia={[]}
      />

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