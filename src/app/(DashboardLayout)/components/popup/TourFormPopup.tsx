"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Grid
} from '@/config/mui';
import { Divider, Switch, FormControlLabel } from '@mui/material';
import { IconX, IconPlus } from '@tabler/icons-react';
import { TourFormData } from '@/data/Tour';
import { convertToSlug } from '../function/TittleToSlug';

interface TourFormPopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TourFormData) => Promise<void>;
  initialData?: TourFormData;
  isEdit?: boolean;
}

const TourFormPopup: React.FC<TourFormPopupProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<TourFormData>({
    id: undefined,
    slug: '',
    name: '',
    categoryId: 1, // Default category
    country: '',
    duration: '',
    price: 0,
    originalPrice: 0,
    departure: [],
    image: '',
    gallery: [],
    rating: 0,
    reviewCount: 0,
    isHot: false,
    groupSize: { min: 1, max: 20 },
    highlights: [],
    itinerary: [],
    services: {
      included: [],
      excluded: []
    },
    terms: {
      registration: [],
      cancellation: [],
      payment: []
    },
    whyChooseUs: [],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    status: 'active'
  });

  const [departureCities, setDepartureCities] = useState<string[]>([]);
  const [newDepartureCity, setNewDepartureCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
        setDepartureCities(initialData.departure || []);
      } else {
        setFormData({
          id: undefined, // Không có ID khi tạo mới
          slug: '',
          name: '',
          categoryId: 1, // Default category
          country: '',
          duration: '',
          price: 0,
          originalPrice: 0,
          departure: [],
          image: '',
          gallery: [],
          rating: 0,
          reviewCount: 0,
          isHot: false,
          groupSize: { min: 1, max: 20 },
          highlights: [],
          itinerary: [],
          services: {
            included: [],
            excluded: []
          },
          terms: {
            registration: [],
            cancellation: [],
            payment: []
          },
          whyChooseUs: [],
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
          status: 'active'
        });
        setDepartureCities([]);
      }
    }
  }, [open, initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTitleChange = (value: string) => {
    // Cập nhật cả name và slug cùng lúc
    const slug = convertToSlug(value);
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: slug
    }));
  };

  const handleAddDepartureCity = () => {
    if (newDepartureCity.trim() && !departureCities.includes(newDepartureCity.trim())) {
      const updatedCities = [...departureCities, newDepartureCity.trim()];
      setDepartureCities(updatedCities);
      setNewDepartureCity('');
    }
  };

  const handleRemoveDepartureCity = (cityToRemove: string) => {
    const updatedCities = departureCities.filter(city => city !== cityToRemove);
    setDepartureCities(updatedCities);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const dataToSubmit = {
        ...formData,
        departure: departureCities
      };
      await onSubmit(dataToSubmit);
      setSnackbar({
        open: true,
        message: isEdit ? 'Cập nhật tour thành công' : 'Tạo tour thành công',
        severity: 'success'
      });
      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi lưu tour',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {isEdit ? 'Chỉnh sửa tour' : 'Thêm tour mới'}
            </Typography>
            <IconButton onClick={handleClose} disabled={loading}>
              <IconX />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Basic Information */}
            <Typography variant="h6">Thông tin cơ bản</Typography>
            
            <TextField
              fullWidth
              label="Tên tour"
              value={formData.name}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Slug"
              value={formData.slug}
              disabled={true}
              helperText="Tự động tạo từ tên tour"
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Quốc gia"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Thời gian"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="VD: 3 ngày 2 đêm"
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
              </Select>
            </FormControl>

            {/* Pricing */}
            <Divider />
            <Typography variant="h6">Giá cả</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Giá hiện tại"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <Typography variant="body2">VNĐ</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Giá gốc"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange('originalPrice', parseInt(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <Typography variant="body2">VNĐ</Typography>
                  }}
                />
              </Grid>
            </Grid>

            {/* Group Size */}
            <Typography variant="subtitle1">Số lượng khách</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Tối thiểu"
                  type="number"
                  value={formData.groupSize?.min || 1}
                  onChange={(e) => handleInputChange('groupSize', {
                    ...formData.groupSize,
                    min: parseInt(e.target.value) || 1
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Tối đa"
                  type="number"
                  value={formData.groupSize?.max || 20}
                  onChange={(e) => handleInputChange('groupSize', {
                    ...formData.groupSize,
                    max: parseInt(e.target.value) || 20
                  })}
                />
              </Grid>
            </Grid>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1">Đánh giá:</Typography>
              <TextField
                label="Điểm đánh giá"
                type="number"
                value={formData.rating}
                onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                size="small"
                sx={{ width: 120 }}
                inputProps={{
                  step: 0.1,
                  min: 0,
                  max: 5
                }}
              />
              <TextField
                label="Số lượt đánh giá"
                type="number"
                value={formData.reviewCount}
                onChange={(e) => handleInputChange('reviewCount', parseInt(e.target.value) || 0)}
                size="small"
                sx={{ width: 150 }}
                inputProps={{
                  min: 0
                }}
              />
            </Box>

            {/* Departure Cities */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Điểm khởi hành
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TextField
                  label="Thêm điểm khởi hành"
                  value={newDepartureCity}
                  onChange={(e) => setNewDepartureCity(e.target.value)}
                  size="small"
                />
                <Button
                  variant="outlined"
                  onClick={handleAddDepartureCity}
                  disabled={!newDepartureCity.trim()}
                  startIcon={<IconPlus />}
                  size="small"
                >
                  Thêm
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {departureCities.map((city, index) => (
                  <Chip
                    key={index}
                    label={city}
                    onDelete={() => handleRemoveDepartureCity(city)}
                    deleteIcon={<IconX />}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
            </Box>

            <TextField
              fullWidth
              label="URL hình ảnh"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
            />

            {/* Hot Tour */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isHot}
                  onChange={(e) => handleInputChange('isHot', e.target.checked)}
                />
              }
              label="Tour nổi bật"
            />

            <Divider />

            {/* SEO */}
            <Typography variant="h6">SEO</Typography>
            
            <TextField
              fullWidth
              label="Meta Title"
              value={formData.metaTitle}
              onChange={(e) => handleInputChange('metaTitle', e.target.value)}
              helperText="Tiêu đề SEO (tối đa 60 ký tự)"
            />

            <TextField
              fullWidth
              label="Meta Description"
              multiline
              rows={3}
              value={formData.metaDescription}
              onChange={(e) => handleInputChange('metaDescription', e.target.value)}
              helperText="Mô tả SEO (tối đa 160 ký tự)"
            />

            <TextField
              fullWidth
              label="Meta Keywords"
              value={formData.metaKeywords}
              onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
              helperText="Từ khóa SEO, phân cách bằng dấu phẩy"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || !formData.name}
          >
            {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default TourFormPopup;
