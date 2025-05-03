import React, { useState, useEffect } from 'react';
import { Input, DatePicker, message, Modal } from 'antd';
import { Button, Card, CardContent, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';
import { BlogCategory, initBlogCategory } from '@/data/blogCategory';
import { ActionType, useAppContext } from '@/contexts/AppContext';
import MediaPopup from '../popup/MediaPopup';
import ConfirmPopup from '../popup/ConfirmPopup';
import { useRouter } from 'next/navigation';
import { ProductMedia } from '@/data/ProductAttributes';

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

  // Update form data when initialData or selectedBlogCategory changes

  useEffect(() => {
    if (currentAction.type === ActionType.EDIT && selectedBlogCategory?.slug) {
      fetchBlogCategoryBySlug(selectedBlogCategory?.slug).then(() => {
        console.log("selectedBlogCategory after fetch", selectedBlogCategory);
        setFormData(selectedBlogCategory);
      });
    }
  }, [currentAction.type, selectedBlogCategory?.slug]);

  const formTitle = currentAction.type === ActionType.EDIT ? "Edit Blog Category" : "Add Blog Category";
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update context if editing existing category
    if (selectedBlogCategory && field in selectedBlogCategory) {
      setSelectedBlogCategory({
        ...selectedBlogCategory,
        [field]: value
      });
    }
  };
  
  const handleMediaSelect = (item : ProductMedia) => {
    handleInputChange('avatarUrl', item.url);
    setIsMediaPopupOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      if (formData.id) {
        const result = await updateBlogCategory(formData);
        
        if (result) {
          message.success(`Blog category updated successfully`);
          router.push('/danh-muc-bai-viet');
          // Reset form after successful update
          setFormData(initBlogCategory);
          
          // Notify parent component of success
          if (onSuccess) {
            onSuccess();
          }
        }
      } else {
        const result = await createBlogCategory(formData);
        if (result) {
          message.success(`Blog category created successfully`);
          router.push('/danh-muc-bai-viet');
          // Reset form after successful creation
          setFormData(initBlogCategory);
          
          // Notify parent component of success
          if (onSuccess) {
            onSuccess();
          }
        }
      }
    } catch (error) {
      console.error('Error saving blog category:', error);
      message.error('Failed to save blog category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      const result = await deleteBlogCategory(formData.id);
      
      if (result) {
        // Reset selected category
        setSelectedBlogCategory(null);
        
        // Close confirm dialog
        setIsDeleteConfirmOpen(false);
        
        // Notify parent component of deletion
        if (afterDelete) {
          afterDelete();
        }
      }
    } catch (error) {
      console.error('Error deleting blog category:', error);
      message.error('Failed to delete blog category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      if (currentAction.type === ActionType.EDIT) {
        await updateBlogCategory(formData);
        message.success('Đã cập nhật danh mục thành công!');
      } else {
        await createBlogCategory(formData);
        message.success('Đã tạo danh mục mới thành công!');
      }
      router.push('/danh-muc-bai-viet');
    } catch (error) {
      console.error('Error saving category:', error);
      message.error('Không thể lưu danh mục. Vui lòng thử lại sau.');
    }
    setConfirmingPopup(false);
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
            Blog Category Information
          </Typography>
          
          <Input
            placeholder="Name"
            value={formData?.name || ""}
            disabled={isView || isLoading}
            onChange={(e) => handleInputChange('name', e.target.value)}
            style={{ marginBottom: "16px" }}
          />

          <Input
            placeholder="Slug"
            value={formData?.slug || ""}
            disabled={isView || isLoading}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            style={{ marginBottom: "16px" }}
          />

          {/* <Input
            placeholder="Description"
            value={formData?.description || ""}
            disabled={isView || isLoading}
            onChange={(e) => handleInputChange('description', e.target.value)}
            style={{ marginBottom: "16px" }}
          /> */}

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Input
              placeholder="Avatar URL"
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
              Select Image
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

          <Input
            placeholder="Parent Category ID"
            type="number"
            value={formData?.parentId || ""}
            disabled={isView || isLoading}
            onChange={(e) => handleInputChange('parentId', Number(e.target.value) || null)}
            style={{ marginBottom: "16px" }}
          />

          {/* Dates */}
          <Typography variant="h6" gutterBottom>Dates</Typography>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: "50%" }}>
              <Typography variant="body2" gutterBottom>Created At</Typography>
              <DatePicker
                value={formData?.createdAt ? dayjs(formData?.createdAt) : null}
                onChange={(date) => {
                  handleInputChange('createdAt', date ? date.toISOString() : null);
                }}
                format="YYYY-MM-DD HH:mm:ss"
                showTime
                disabled={true}
                style={{ width: "100%" }}
                getPopupContainer={(trigger) => trigger.parentElement!}
              />
            </div>
            
            <div style={{ width: "50%" }}>
              <Typography variant="body2" gutterBottom>Updated At</Typography>
              <DatePicker
                value={formData?.updatedAt ? dayjs(formData?.updatedAt) : null}
                onChange={(date) => {
                  handleInputChange('updatedAt', date ? date.toISOString() : null);
                }}
                format="YYYY-MM-DD HH:mm:ss"
                showTime
                disabled={true}
                style={{ width: "100%" }}
                getPopupContainer={(trigger) => trigger.parentElement!}
              />
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

      <ConfirmPopup
        open={confirmingPopup}
        onClose={() => setConfirmingPopup(false)}
        onSubmit={handleConfirm}
        Content={currentAction.type === ActionType.EDIT 
          ? "Xác nhận cập nhật danh mục này?"
          : "Xác nhận tạo danh mục mới?"
        }
      />
    </>
  );
};

export default BlogCategoryForm;