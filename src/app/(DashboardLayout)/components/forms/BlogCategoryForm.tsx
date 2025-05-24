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
  const [formData, setFormData] = useState<BlogCategory>(initialData || initBlogCategory);
  const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const router = useRouter();
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
      
      // Nếu đang edit, cập nhật cả selectedBlogCategory
      if (selectedBlogCategory) {
        setSelectedBlogCategory({
          ...selectedBlogCategory,
          slug: convertToSlug(formData.name)
        });
      }
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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (formData.id) {
        // Cần kiểm tra kết quả trả về
        const result = await updateBlogCategory(formData);

        // Kiểm tra kết quả trước khi tiếp tục
        if (
          !result ||
          (typeof result === 'object' &&
            result !== null &&
            'success' in result &&
            (result as { success?: boolean }).success === false)
        ) {
          throw new Error((result as any)?.message || 'Không thể cập nhật danh mục');
        }

        setSnackbar({ 
          open: true, 
          message: 'Blog category updated successfully', 
          severity: 'success' 
        });

        // Di chuyển router.push xuống dưới để chỉ thực hiện khi thành công
        setTimeout(() => {
          router.push('/danh-muc-bai-viet');
          setFormData(initBlogCategory);
        }, 1000);

        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Tương tự với createBlogCategory
        const result = await createBlogCategory(formData);

        if (
          !result ||
          (typeof result === 'object' &&
            result !== null &&
            'success' in result &&
            (result as { success?: boolean }).success === false)
        ) {
          throw new Error((result as any)?.message || 'Không thể tạo danh mục mới');
        }

        setSnackbar({ 
          open: true, 
          message: 'Blog category created successfully', 
          severity: 'success' 
        });

        // Di chuyển router.push xuống dưới với setTimeout
        setTimeout(() => {
          router.push('/danh-muc-bai-viet');
          setFormData(initBlogCategory);
        }, 1000);

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error saving blog category:', error);
      
      // Kiểm tra chi tiết lỗi và ghi log
      console.log('Error details:', {
        type: typeof error,
        hasResponse: typeof error === 'object' && error !== null && 'response' in error,
        responseStatus: typeof error === 'object' && error !== null && 'response' in error
          ? (error as any).response?.status
          : undefined,
        responseData: typeof error === 'object' && error !== null && 'response' in error
          ? (error as any).response?.data
          : undefined
      });
      
      // Sử dụng ApiService.handleError để xử lý lỗi
      const errorResult = ApiService.handleError(error);
      console.log('Error result from ApiService:', errorResult);
      
      setSnackbar({ 
        open: true, 
        message: errorResult.message || 'Có lỗi khi lưu danh mục. Vui lòng thử lại sau.', 
        severity: 'error' 
      });
      
      // Ngăn chuyển router nếu có lỗi
      return;
    } finally {
      setIsLoading(false);
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
      console.error('Error deleting blog category:', error);
      
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
      console.error('Error saving category:', error);
      
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

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

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
                  onClick={handleSubmit}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category {formData?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteConfirmOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default BlogCategoryForm;