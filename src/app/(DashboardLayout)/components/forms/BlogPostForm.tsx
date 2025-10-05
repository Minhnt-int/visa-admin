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
  CircularProgress,
  Tooltip,
  Paper
} from '@/config/mui';
import { Divider } from '@mui/material';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Editor from "../editor/Editor";
import { BlogPostAttributes, initBlog } from '@/data/BlogPost';
import { useAppContext } from '@/contexts/AppContext';
import MediaPopup from '../popup/MediaPopup';
import { ProductMedia } from '@/data/ProductAttributes';
import { useRouter } from 'next/navigation';
import { convertToSlug } from "../function/TittleToSlug";
import ApiService from '@/services/ApiService';
import ConfirmPopup from "../popup/ConfirmPopup";
interface BlogPostFormProps {
  isView?: boolean;
  onChange: (data: { name: string; value: any }) => void;
  onCancel?: () => void;
  formData: BlogPostAttributes;
  action?: string;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  isView = false,
  onChange,
  onCancel,
  formData,
  action
}) => {
  const {
    selectedBlogPost,
    setSelectedBlogPost,
    updateBlogPost,
    createBlogPost,
    generateAIContent
  } = useAppContext();
  const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false);
  const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [editorContent, setEditorContent] = useState('');
  const formTitle = formData && formData?.id ? "Edit Blog Post" : "Add Blog Post";
  const [form, setForm] = useState<BlogPostAttributes>(formData);
  const { blogCategories, fetchBlogCategories } = useAppContext();
  const router = useRouter();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: React.ReactNode; // Thay đổi từ string sang ReactNode
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetchBlogCategories();
  }, [fetchBlogCategories]);

  useEffect(() => {
    if (form) {
      setEditorContent(form.content || '');
    }
  }, [form]);

  useEffect(() => {
    // Nếu đang ở chế độ tạo mới, reset selectedBlogPost về null
    if (action === 'create') {
      setSelectedBlogPost(null);
    }
  }, [action, setSelectedBlogPost]);

  useEffect(() => {
    // Tự động cập nhật slug khi tiêu đề bài viết thay đổi
    if (form?.title) {
      setForm(prev => ({
        ...prev,
        slug: convertToSlug(form.title)
      }));
      // Cập nhật cả onChange prop để đảm bảo parent component cũng nhận được thay đổi
      onChange({ name: 'slug', value: convertToSlug(form.title) });
    }
  }, [form?.title]);

  // Hàm xử lý thay đổi cho tất cả các trường input thông thường
  const handleInputChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Nếu cần callback cho component cha
    if (typeof onChange === 'function') {
      onChange({ name: field, value: value });
    }
  };

  // Hàm xử lý riêng cho editor nếu cần
  const handleEditorChange = (content: string) => {
    handleInputChange('content', content);
  };


  // Check if required fields are filled
  const isFormValid = () => {
    return Boolean(
      form?.title &&
      form?.content &&
      form?.slug &&
      form?.author &&
      form?.blogCategoryId &&
      form?.metaTitle &&
      form?.metaDescription &&
      form?.metaKeywords
    );
  };

  const handleGetSuggestions = async () => {
    try {
      setIsLoading(true);
      const result = await generateAIContent(form?.content || '', 'evaluate');

      if (result) {
        setAiSuggestions(result);
        setShowAiSuggestions(true);
        setSnackbar({
          open: true,
          message: 'Gợi ý AI đã được tạo thành công',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);

      // Sử dụng ApiService.handleError để xử lý lỗi
      const errorResult = ApiService.handleError(error);

      setSnackbar({
        open: true,
        message: errorResult.message,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    try {
      setIsLoading(true);
      const result = await generateAIContent(form?.title || '', 'blog');

      if (result?.data) {
        setAiSuggestions(result.data);
        setShowAiSuggestions(true);
        onChange({ name: 'content', value: result.data });
        setSnackbar({
          open: true,
          message: 'Tạo nội dung bằng AI thành công',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error getting AI content:', error);

      // Sử dụng ApiService.handleError để xử lý lỗi
      const errorResult = ApiService.handleError(error);

      setSnackbar({
        open: true,
        message: errorResult.message,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaSelect = (item: ProductMedia) => {
    handleInputChange('avatarUrl', item.url);
    setIsMediaPopupOpen(false);
  };


  const showError = (msg: string) => {
    setSnackbar({
      open: true,
      message: msg,
      severity: 'error'
    });
  };

  const showSuccess = (msg: string) => {
    setSnackbar({
      open: true,
      message: msg,
      severity: 'success'
    });
  };

  const handleConfirmSubmit = async () => {

    try {
      if (action === 'edit') {
        // Xử lý cập nhật bài viết
        await updateBlogPost(formData);
        showSuccess("Cập nhật bài viết thành công");
        router.push("/bai-viet");
      } else {
        // Xử lý thêm mới bài viết
        await createBlogPost(formData);
        showSuccess("Thêm bài viết thành công");
        router.push("/bai-viet");
      }

      // Đóng popup xác nhận nếu thành công
      setConfirmPopupOpen(false);
    } catch (error) {

      // Re-throw lỗi để xử lý ở phần gọi
      throw error;
    }
  };
  const handleErrorDisplay = (error: any) => {

    if (error?.message) {
      showError(error.message);
    }
    const errorMessage = error?.response?.data?.message ||
      error?.response?.data?.message ||
      error?.message ||
      'Đã xảy ra lỗi không xác định';
    // Kiểm tra và hiển thị lỗi validation chi tiết nếu có
    if (error?.data && Array.isArray(error?.data)) {
      setSnackbar({
        open: true,
        message: (
          <Box>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              {error?.message || 'Đã xảy ra các lỗi sau:'}
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {error?.data.map((msg: string, index: number) => (
                <li key={index}>
                  <Typography variant="body2">{msg}</Typography>
                </li>
              ))}
              <li key={`0`}>
                <Typography variant="body2">{errorMessage}</Typography>
              </li>
            </ul>
          </Box>
        ),
        severity: 'error'
      });
    } else {
      showError(errorMessage);
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {formTitle}
          </Typography>

          {/* Basic Information */}
          <Typography variant="h6" gutterBottom style={{ marginTop: "16px" }}>
            Thông tin bài viết
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              placeholder="Tiêu đề"
              value={form?.title || ""}
              disabled={isView}
              onChange={(e) => handleInputChange('title', e.target.value)}
              style={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGenerateContent}
              disabled={isView || !form?.title || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              Viết bài (AI)
            </Button>
          </Box>

          <TextField
            placeholder="Slug"
            value={form?.slug || ""}
            disabled={isView}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            style={{ marginBottom: "16px", width: "100%" }}
            helperText="Tự động tạo từ tiêu đề bài viết. Thay đổi tiêu đề vẫn sẽ cập nhật slug."
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Ảnh đại diện"
              value={form?.avatarUrl || ""}
              disabled={isView || isLoading}
              onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
              style={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              onClick={() => setIsMediaPopupOpen(true)}
              disabled={isView || isLoading}
            >
              Chọn ảnh
            </Button>
          </Box>
          {form?.avatarUrl && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${form?.avatarUrl}`}
                alt="Avatar Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                  border: '1px solid #eee',
                  borderRadius: 4,
                  padding: 4
                }}
              />
            </Box>
          )}
          <TextField
            placeholder="Tác giả"
            value={form?.author || ""}
            disabled={isView}
            onChange={(e) => handleInputChange('author', e.target.value)}
            style={{ marginBottom: "16px", width: "100%" }}
          />

          <div style={{ marginBottom: "16px" }}>
            <Typography variant="body2" gutterBottom>Danh mục bài viết</Typography>
            <Select
              value={form?.blogCategoryId || ""}
              label="Danh mục bài viết"
              disabled={isView}
              onChange={(event) => handleInputChange('blogCategoryId', event.target.value)}
              style={{ width: "100%" }}
            >
              {blogCategories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Typography variant="body2" gutterBottom>Nội dung</Typography>
            <Editor
              disabled={false}
              value={editorContent}
              onChange={handleEditorChange}
              placeholder="Nội dung"
            />
          </div>

          {/* SEO Information */}
          <Typography variant="h6" gutterBottom>Thông tin SEO</Typography>
          <TextField
            placeholder="Meta Title"
            value={form?.metaTitle || ""}
            disabled={isView}
            onChange={(e) => handleInputChange('metaTitle', e.target.value)}
            style={{ marginBottom: "16px", width: "100%" }}
          />

          <TextField
            placeholder="Meta Description"
            value={form?.metaDescription || ""}
            disabled={isView}
            onChange={(e) => handleInputChange('metaDescription', e.target.value)}
            style={{ marginBottom: "16px", width: "100%" }}
          />

          <TextField
            placeholder="Meta Keywords"
            value={form?.metaKeywords || ""}
            disabled={isView}
            onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
            style={{ marginBottom: "16px", width: "100%" }}
          />

          {/* Dates */}
          <Typography variant="h6" gutterBottom>Ngày tạo</Typography>

          <div style={{ marginBottom: "16px" }}>
            <Typography variant="body2" gutterBottom>Ngày xuất bản</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={form?.publishedAt ? new Date(form?.publishedAt) : null}
                onChange={(date) => {
                  onChange({
                    name: 'publishedAt',
                    value: date ? date.toISOString() : null,
                  });
                }}
                format="yyyy-MM-dd"
                sx={{ width: "100%" }}
              />
            </LocalizationProvider>

          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: "50%" }}>
              <Typography variant="body2" gutterBottom>Ngày tạo</Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={form?.createdAt ? new Date(form?.createdAt) : null}
                  onChange={(date) => {
                    onChange({
                      name: 'createdAt',
                      value: date ? date.toISOString() : null,
                    });
                  }}
                  format="yyyy-MM-dd"
                  disabled={true}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </div>

            <div style={{ width: "50%" }}>
              <Typography variant="body2" gutterBottom>Ngày cập nhật</Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={form?.updatedAt ? new Date(form?.updatedAt) : null}
                  onChange={(date) => {
                    onChange({
                      name: 'updatedAt',
                      value: date ? date.toISOString() : null,
                    });
                  }}
                  format="yyyy-MM-dd"
                  disabled={true}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </div>
          </div>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            {onCancel && (
              <Button onClick={onCancel} sx={{ mr: 1 }}>
                Cancel
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => setConfirmPopupOpen(true)} // Thay vì gọi hàm submit trực tiếp
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : action === 'edit' ? 'Cập nhật' : 'Đăng bài'}
            </Button>
            <Tooltip title={!isFormValid() && !isLoading ? "Vui lòng điền đầy đủ các trường thông tin trước khi sử dụng gợi ý AI" : ""}>
              <span>
                <Button
                  disabled={isView || !isFormValid() || isLoading}
                  onClick={handleGetSuggestions}
                  variant="outlined"
                  color="primary"
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {"Gợi ý (AI)"}
                </Button>
              </span>
            </Tooltip>
          </Box>

          {/* {errorMessage && (
            <Typography
              color="error"
              variant="body2"
              sx={{
                mt: 2,
                textAlign: 'center',
                backgroundColor: '#ffebee',
                padding: '8px',
                borderRadius: '4px'
              }}
            >
              {errorMessage}
            </Typography>
          )} */}

          {showAiSuggestions && aiSuggestions && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Gợi ý AI
              </Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {aiSuggestions.result}
                </Typography>
              </Paper>
            </>
          )}

          <MediaPopup
            open={isMediaPopupOpen}
            onClose={() => setIsMediaPopupOpen(false)}
            onSelect={handleMediaSelect}
            onSubmit={() => { }}
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
        content={`Bạn có chắc chắn muốn ${action === 'edit' ? 'cập nhật' : 'đăng'} bài viết này?`}
        onConfirm={async () => {
          try {
            await handleConfirmSubmit();
            // Thành công đã được xử lý trong handleConfirmSubmit
          } catch (error) {
            // Xử lý lỗi
            handleErrorDisplay(error);
            setConfirmPopupOpen(false); // Đóng popup khi có lỗi
          }
        }}
        title={action === 'edit' ? "Cập nhật bài viết" : "Đăng bài viết mới"}
      />
    </>
  );
};

export default BlogPostForm;