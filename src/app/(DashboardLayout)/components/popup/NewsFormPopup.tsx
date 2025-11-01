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
  IconButton
} from '@/config/mui';
import Divider from '@mui/material/Divider';
import { IconX } from '@tabler/icons-react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from "dayjs";
import { NewsFormData } from '@/data/News';
import { convertToSlug } from '../function/TittleToSlug';

interface NewsFormPopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewsFormData) => Promise<void>;
  initialData?: NewsFormData;
  isEdit?: boolean;
}

const NewsFormPopup: React.FC<NewsFormPopupProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<NewsFormData>({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    author: '',
    publishedAt: new Date().toISOString(),
    readTime: 0,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    status: 'active'
  });

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
      } else {
        setFormData({
          slug: '',
          title: '',
          excerpt: '',
          content: '',
          imageUrl: '',
          author: '',
          publishedAt: new Date().toISOString(),
          readTime: 0,
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
          status: 'active'
        });
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
    // Cập nhật cả title và slug cùng lúc
    const slug = convertToSlug(value);
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: slug
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const dataToSubmit = {
        ...formData
      };
      await onSubmit(dataToSubmit);
      setSnackbar({
        open: true,
        message: isEdit ? 'Cập nhật tin tức thành công' : 'Tạo tin tức thành công',
        severity: 'success'
      });
      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi lưu tin tức',
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
              {isEdit ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}
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
              label="Tiêu đề"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Slug"
              value={formData.slug}
              disabled={true}
              helperText="Tự động tạo từ tiêu đề"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Tác giả"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
              />
              <TextField
                fullWidth
                label="Thời gian đọc (phút)"
                type="number"
                value={formData.readTime}
                onChange={(e) => handleInputChange('readTime', parseInt(e.target.value) || 0)}
              />
            </Box>

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

            <TextField
              fullWidth
              label="Mô tả ngắn"
              multiline
              rows={3}
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              helperText="Tóm tắt ngắn gọn về bài viết"
            />

            <TextField
              fullWidth
              label="URL hình ảnh"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
            />

            {/* Published Date */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Ngày xuất bản"
                  value={dayjs(formData.publishedAt)}
                  onChange={(newValue) => {
                    if (newValue) {
                      handleInputChange('publishedAt', newValue.toISOString());
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>

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
            disabled={loading || !formData.title}
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

export default NewsFormPopup;
