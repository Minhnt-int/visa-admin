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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from '@/config/mui';
import { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import dayjs from 'dayjs';
import { BlogCategory, initBlogCategory } from '@/data/blogCategory';
import { ActionType, useAppContext } from '@/contexts/AppContext';
import MediaPopup from '../popup/MediaPopup';
import { ProductMedia } from '@/data/ProductAttributes';
import { useRouter } from 'next/navigation';
import { convertToSlug } from "../function/TittleToSlug";
import ApiService from '@/services/ApiService';

interface BlogCategoryFormProps {
  isView?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: BlogCategory;
  afterDelete?: () => void;
}

const BlogCategoryForm: React.FC<BlogCategoryFormProps> = ({
  isView = false,
  onSuccess,
  onCancel,
  initialData,
  afterDelete,
}) => {
  const {
    currentAction,
    selectedBlogCategory,
    setSelectedBlogCategory,
    updateBlogCategory,
    createBlogCategory,
    setLoadingState,
    setCurrentAction,
    deleteBlogCategory,
    fetchBlogCategoryBySlug,
  } = useAppContext();
  // Cập nhật initialFormData
  const [formData, setFormData] = useState<BlogCategory>(() => {
    // Nếu đang edit, sử dụng initialData, nếu không tạo form trống
    if (currentAction.type === ActionType.EDIT && initialData) {
      return {
        ...initialData,
        // Đảm bảo các trường không bị undefined/null
        // Các trường khác...
      };
    }
    
    return initBlogCategory;
  });
  const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const router = useRouter();


  useEffect(() => {
    if (currentAction.type === ActionType.EDIT && selectedBlogCategory?.slug) {
      fetchBlogCategoryBySlug(selectedBlogCategory?.slug).then(() => {
        setFormData(selectedBlogCategory);
      });
    }
  }, [currentAction.type, selectedBlogCategory?.slug]);

  useEffect(() => {
    // Tự động cập nhật slug khi tên danh mục thay đổi
    if (formData?.name) {
      setFormData(prev => ({
        ...prev,
        slug: convertToSlug(formData.name)
      }));
    }
  }, [formData?.name]);

  const formTitle = currentAction.type === ActionType.EDIT ? "Edit Blog Category" : "Add Blog Category";

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (selectedBlogCategory && field in selectedBlogCategory) {
      setSelectedBlogCategory({
        ...selectedBlogCategory,
        [field]: value
      });
    }
  };

  const handleMediaSelect = (item: ProductMedia) => {
    handleInputChange('avatarUrl', item.url);
    setIsMediaPopupOpen(false);
  };

  const handleConfirmSubmit = async () => {
    try {
      if (currentAction.type === ActionType.EDIT) {
        await updateBlogCategory(formData);
        showSuccess("Cập nhật danh mục thành công");
        if (onSuccess) onSuccess();
      } else {
        await createBlogCategory(formData);
        showSuccess("Thêm danh mục thành công");
        if (onSuccess) onSuccess();
      }
      setConfirmingPopup(false);
      router.push('/danh-muc-bai-viet');
    } catch (error) {
      // Xử lý lỗi chi tiết
      handleErrorDisplay(error);
      // Không đóng popup khi có lỗi để người dùng có thể sửa và thử lại
      setConfirmingPopup(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      const result = await deleteBlogCategory(formData.id);

      if (result) {
        setSelectedBlogCategory(null);
        setIsDeleteConfirmOpen(false);

        if (afterDelete) {
          afterDelete();
        }
      }
    } catch (error) {

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

  const handleConfirm = async () => {
    try {
      if (currentAction.type === ActionType.EDIT) {
        await updateBlogCategory(formData);
        setSnackbar({ open: true, message: 'Đã cập nhật danh mục thành công!', severity: 'success' });
      } else {
        await createBlogCategory(formData);
        setSnackbar({ open: true, message: 'Đã tạo danh mục mới thành công!', severity: 'success' });
      }
      router.push('/danh-muc-bai-viet');
    } catch (error) {

      // Sử dụng ApiService.handleError để xử lý lỗi
      const errorResult = ApiService.handleError(error);
      setSnackbar({
        open: true,
        message: errorResult.message,
        severity: 'error'
      });
    }
    setConfirmingPopup(false);
  };
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: React.ReactNode;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // 2. Thêm các hàm trợ giúp để hiển thị thông báo
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

  // 3. Thêm hàm xử lý lỗi chi tiết
  const handleErrorDisplay = (error: any) => {
    // Trích xuất thông báo lỗi cơ bản
    const errorMessage = error?.response?.data?.message ||
      error?.response?.data?.message ||
      error?.message ||
      'Đã xảy ra lỗi không xác định';

    // Kiểm tra lỗi có cấu trúc mảng
    if (error?.data && Array.isArray(error.data) && error.data.length > 0) {
      const errorMessages = error.data.map((err: any) => {
        if (typeof err === 'string') return err;
        if (err.message) return err.message;
        return JSON.stringify(err);
      });

      // Hiển thị danh sách lỗi
      setSnackbar({
        open: true,
        message: (
          <Box>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Đã xảy ra các lỗi sau:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errorMessages.map((msg: string, index: number) => (
                <li key={index}>
                  <Typography variant="body2">{msg}</Typography>
                </li>
              ))}
              <li key={`general`}>
                <Typography variant="body2">{errorMessage}</Typography>
              </li>
            </ul>
          </Box>
        ),
        severity: 'error'
      });
      return;
    } else {
      // Hiển thị thông báo lỗi đơn giản
      showError(errorMessage);
    }
  };

  // Quan trọng: cập nhật formData khi initialData thay đổi (ví dụ: sau khi tải từ API)
  useEffect(() => {
    if (currentAction.type === ActionType.EDIT && initialData && initialData.id) {
      
      setFormData(prev => ({
        ...initialData,
      }));

    }
  }, [currentAction, initialData]);

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {formTitle}
          </Typography>

          {/* Basic Information */}
          <Typography variant="h6" gutterBottom style={{ marginTop: "16px" }}>
            Danh mục bài viết
          </Typography>

          <TextField
            placeholder="Tên danh mục"
            value={formData?.name || ""}
            disabled={isView || isLoading}
            onChange={(e) => handleInputChange('name', e.target.value)}
            style={{ marginBottom: "16px", width: "100%" }}
          />

          <TextField
            placeholder="Slug"
            value={formData?.slug || ""}
            disabled={isView || isLoading}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            style={{ marginBottom: "16px", width: "100%" }}
            helperText="Tự động tạo từ tên danh mục. Thay đổi tên vẫn sẽ cập nhật slug."
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Ảnh đại diện"
              value={formData?.avatarUrl || ""}
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

          {formData?.avatarUrl && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${formData.avatarUrl}`}
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

          {/* Dates */}
          <Typography variant="h6" gutterBottom>Dates</Typography>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: "50%" }}>
              <Typography variant="body2" gutterBottom>Created At</Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={formData?.createdAt ? new Date(formData.createdAt) : null}
                  onChange={(date) => {
                    handleInputChange('createdAt', date ? date.toISOString() : null);
                  }}
                  format="yyyy-MM-dd"
                  disabled={true}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </div>

            <div style={{ width: "50%" }}>
              <Typography variant="body2" gutterBottom>Updated At</Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={formData?.updatedAt ? new Date(formData.updatedAt) : null}
                  onChange={(date) => {
                    handleInputChange('updatedAt', date ? date.toISOString() : null);
                  }}
                  format="yyyy-MM-dd"
                  disabled={true}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </div>
          </div>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Box>
              {currentAction.type === ActionType.EDIT && !isView && (
                <Button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  variant="contained"
                  color="error"
                  disabled={isLoading}
                >
                  Delete
                </Button>
              )}
            </Box>
            <Box>
              {onCancel && (
                <Button
                  onClick={onCancel}
                  sx={{ mr: 1 }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              {!isView && (
                <Button
                  onClick={handleConfirmSubmit}
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isLoading ? 'Saving...' : 'Submit'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Media Popup */}
      <MediaPopup
        open={isMediaPopupOpen}
        onClose={() => setIsMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
        onSubmit={(data: { type: string; url: string }) => {
          handleInputChange('avatarUrl', data.url);
          setIsMediaPopupOpen(false);
        }}
        listMedia={[]}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        style={{ marginTop: '60px' }} // Để tránh bị che bởi navigation
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

export default BlogCategoryForm;