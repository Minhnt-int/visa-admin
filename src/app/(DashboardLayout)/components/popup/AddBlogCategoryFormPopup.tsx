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
  CircularProgress
} from '@/config/mui';
import dayjs from 'dayjs';
import { BlogCategory } from '@/data/blogCategory';
import { useAppContext } from '@/contexts/AppContext';
import { SelectChangeEvent } from '@mui/material';

interface AddBlogCategoryFormPopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BlogCategory) => void;
  formData?: BlogCategory;
  isView?: boolean;
}

const AddBlogCategoryFormPopup: React.FC<AddBlogCategoryFormPopupProps> = ({
  open,
  onClose,
  onSubmit,
  formData,
  isView = false
}) => {
  const [formState, setFormState] = useState<BlogCategory>({
    id: 0,
    name: '',
    slug: '',
    status: 'active',
    avatarUrl: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAIResultOpen, setIsAIResultOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const {
    blogCategories,
    fetchBlogCategories
  } = useAppContext();

  useEffect(() => {
    if (open && formData?.id) {
      setDataLoading(true);
      // Kiểm tra xem đã có dữ liệu trong blogCategories chưa
      const existingCategory = blogCategories.find(cat => cat.id === formData.id);
      if (existingCategory) {
        setFormState(existingCategory);
        setDataLoading(false);
      } else {
        // Nếu không, fetch lại danh sách để đảm bảo có dữ liệu mới nhất
        fetchBlogCategories()
          .then(() => {
            const category = blogCategories.find(cat => cat.id === formData.id);
            if (category) {
              setFormState(category);
            }
          })
          .finally(() => {
            setDataLoading(false);
          });
      } 
    }
  }, [open, formData?.id, fetchBlogCategories, blogCategories]);

  useEffect(() => {
    if (formData) {
      const newFormState = { ...formData };
      if (typeof formData.createdAt === 'string') {
        newFormState.createdAt = dayjs(formData.createdAt).toDate();
      }
      if (typeof formData.updatedAt === 'string') {
        newFormState.updatedAt = dayjs(formData.updatedAt).toDate();
      }
      setFormState(newFormState);
    }
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<number | string>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formState);
    onClose();
  };

  const handleGenerateContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: "Hãy viết một bài tin tức chuẩn SEO theo tiêu chí Google về: " + formState.name
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI content');
      }
      
      const result = await response.json();
      if (result.data) {
        setIsAIResultOpen(true);
      }
    } catch (error) {
      console.error('Error getting AI content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const title = isView ? 'Xem chi tiết danh mục' : formData ? 'Sửa danh mục' : 'Thêm danh mục mới';

  if (dataLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Loading...</DialogTitle>
        <DialogContent style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên danh mục"
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
              {formData ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddBlogCategoryFormPopup;
