"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Box,
  IconButton,
  Tooltip,
  Paper
} from '@/config/mui';
import { Divider } from '@mui/material';
import { IconUpload, IconTrash, IconEdit, IconLink } from '@tabler/icons-react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from "dayjs";
import Editor from "../editor/Editor";
import { NewsAttributes } from "@/data/News";
import { initNewsData } from "@/data/initData";
import { useAppContext, ActionType } from "@/contexts/AppContext";
import MediaPopup from "../popup/MediaPopup";
import { useRouter } from "next/navigation";
import ConfirmPopup from "../popup/ConfirmPopup";
import { convertToSlug } from "../function/TittleToSlug";
import ApiService from "@/services/ApiService";

interface NewsFormProps {
  isView?: boolean;
  onChange?: ({ name, value }: { name: string; value: any }) => void;
  onCancel?: () => void;
  slug?: string; // Sử dụng slug để GET data
  action?: string;
}

const NewsForm: React.FC<NewsFormProps> = ({
  isView = false,
  onChange,
  onCancel,
  slug,
  action
}) => {
  const {
    selectedNews,
    setSelectedNews,
    updateNews,
    createNews,
    getNewsBySlug,
    generateAIContent,
    currentAction
  } = useAppContext();
  
  const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false);
  const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [editorContent, setEditorContent] = useState('');
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const formTitle = currentAction.type === ActionType.EDIT ? "Edit News" : "Add News";
  const [form, setForm] = useState<NewsAttributes>(initNewsData);
  const [autoSlugMode, setAutoSlugMode] = useState(true); // Chế độ tự điền slug
  const router = useRouter();
  
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: React.ReactNode;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sync editorContent với form.content khi form thay đổi
  useEffect(() => {
    if (form && form.content !== undefined) {
      setEditorContent(form.content || '');
    }
  }, [form.content]);


  useEffect(() => {
    if (action === 'create') {
      setSelectedNews(null);
    }
  }, [action, setSelectedNews]);

  // Reset form khi action thay đổi
  useEffect(() => {
    if (action === ActionType.CREATE) {
      setForm(initNewsData);
      setEditorContent(''); // Reset editor content
      setLoadedSlug(null); // Reset loaded slug
    }
  }, [action]);

  // Load news data when editing
  useEffect(() => {
    const loadNewsData = async () => {
      if (slug) {
        try {
          const newsData = await getNewsBySlug(slug);
          setForm(newsData);
          setLoadedSlug(slug);
        } catch (error) {
          console.error('Error loading news data:', error);
        }
      }
    };

    loadNewsData();
  }, [action, slug, getNewsBySlug, loadedSlug]);

  useEffect(() => {
    if (onChange) {
      onChange({ name: 'content', value: editorContent });
    }
  }, [editorContent, onChange]);

  const handleInputChange = (field: string, value: any) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    
    if (onChange) {
      onChange({ name: field, value });
    }
  };

  const handleTitleChange = (value: string) => {
    // Cập nhật title
    setForm(prevForm => ({
      ...prevForm,
      title: value,
      // Chỉ tự động tạo slug khi autoSlugMode = true
      slug: autoSlugMode ? convertToSlug(value) : prevForm.slug
    }));
    
    // Gọi onChange để update parent
    if (onChange) {
      onChange({ name: 'title', value });
      if (autoSlugMode) {
        onChange({ name: 'slug', value: convertToSlug(value) });
      }
    }
  };

  const handleMediaSelect = (item: any) => {
    handleInputChange('imageUrl', item.url);
    setIsMediaPopupOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      if (action === 'edit') {
        await updateNews(form);
        router.push("/tin-tuc");
      } else {
        await createNews(form);
        router.push("/tin-tuc");
      }
      setConfirmPopupOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleErrorDisplay = (error: any) => {
    const errorResult = ApiService.handleError(error);
    setSnackbar({
      open: true,
      message: errorResult.message,
      severity: 'error'
    });
  };

  const handleSubmit = () => {
    setConfirmPopupOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {formTitle}
          </Typography>

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Tiêu đề"
                value={form.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                disabled={isView}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Slug"
                  value={form.slug || ''}
                  disabled={autoSlugMode}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  helperText={autoSlugMode ? "Tự động tạo từ tiêu đề" : "Có thể chỉnh sửa"}
                />
                <IconButton
                  onClick={() => setAutoSlugMode(!autoSlugMode)}
                  color={autoSlugMode ? 'primary' : 'default'}
                  title={autoSlugMode ? 'Tắt tự động tạo slug' : 'Bật tự động tạo slug'}
                >
                  {autoSlugMode ? <IconLink /> : <IconEdit />}
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tác giả"
                value={form.author || ''}
                onChange={(e) => handleInputChange('author', e.target.value)}
                disabled={isView}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Thời gian đọc (phút)"
                type="number"
                value={form.readTime || 0}
                onChange={(e) => handleInputChange('readTime', parseInt(e.target.value) || 0)}
                disabled={isView}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={form.status || 'active'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={isView}
                >
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Không hoạt động</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả ngắn"
                multiline
                rows={3}
                value={form.excerpt || ''}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                disabled={isView}
                helperText="Tóm tắt ngắn gọn về bài viết"
              />
            </Grid>

            {/* Featured Image */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Hình ảnh đại diện
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  fullWidth
                  label="URL hình ảnh"
                  value={form.imageUrl || ''}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  disabled={isView}
                />
                <Button
                  variant="outlined"
                  startIcon={<IconUpload />}
                  onClick={() => setIsMediaPopupOpen(true)}
                  disabled={isView}
                >
                  Chọn từ thư viện
                </Button>
              </Box>
              {form.imageUrl && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={form.imageUrl}
                    alt="Featured image"
                    style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                  />
                </Box>
              )}
            </Grid>

            {/* Content */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Nội dung
              </Typography>
              <Editor
                value={editorContent}
                onChange={(content) => {
                  setEditorContent(content);
                  handleInputChange('content', content);
                }}
                disabled={isView}
              />
            </Grid>

            {/* SEO */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                SEO
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Title"
                value={form.metaTitle || ''}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                disabled={isView}
                helperText="Tiêu đề SEO (tối đa 60 ký tự)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Description"
                multiline
                rows={3}
                value={form.metaDescription || ''}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                disabled={isView}
                helperText="Mô tả SEO (tối đa 160 ký tự)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Keywords"
                value={form.metaKeywords || ''}
                onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                disabled={isView}
                helperText="Từ khóa SEO, phân cách bằng dấu phẩy"
              />
            </Grid>

            {/* Published Date */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Ngày xuất bản
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={form.publishedAt ? dayjs(form.publishedAt) : dayjs()}
                  onChange={(newValue) => {
                    if (newValue) {
                      handleInputChange('publishedAt', newValue.toISOString());
                    }
                  }}
                  disabled={isView}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          {!isView && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {action === 'edit' ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button
                variant="outlined"
                onClick={onCancel || (() => router.push('/tin-tuc'))}
              >
                Hủy
              </Button>
            </Box>
          )}

          <MediaPopup
            open={isMediaPopupOpen}
            onClose={() => setIsMediaPopupOpen(false)}
            onSelect={handleMediaSelect}
            onSubmit={() => {}}
            listMedia={[]}
          />
        </CardContent>
      </Card>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        style={{ marginTop: '60px' }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <ConfirmPopup
        open={confirmPopupOpen}
        onClose={() => setConfirmPopupOpen(false)}
        content={`Bạn có chắc chắn muốn ${action === 'edit' ? 'cập nhật' : 'đăng'} tin tức này?`}
        onConfirm={async () => {
          try {
            await handleConfirmSubmit();
          } catch (error) {
            handleErrorDisplay(error);
            setConfirmPopupOpen(false);
          }
        }}
        title={action === 'edit' ? "Cập nhật tin tức" : "Đăng tin tức mới"}
      />
    </>
  );
};

export default NewsForm;
