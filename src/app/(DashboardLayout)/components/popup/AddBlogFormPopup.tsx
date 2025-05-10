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
  Typography
} from '@/config/mui';
import dayjs from 'dayjs';
import Editor from "../editor/Editor";
import { BlogPostAttributes } from '@/data/BlogPost';
import { useAppContext } from '@/contexts/AppContext';
import { fetchBlogList } from '@/services/blogService';
import { BlogCategory } from '@/data/blogCategory';
import { SelectChangeEvent } from '@mui/material';

interface AddBlogFormPopupProps {
  open: boolean;
  isView: boolean;
  onClose: () => void;
  onChange: (data: { name: string; value: any }) => void;
  onSubmit: (data: BlogPostAttributes) => void;
  formData: BlogPostAttributes;
  slug?: string;
  categories: BlogCategory[];
}

const AddBlogFormPopup: React.FC<AddBlogFormPopupProps> = ({
  open,
  isView,
  onClose,
  onChange,
  onSubmit,
  formData,
  slug,
  categories
}) => {
  const [isAIResultOpen, setIsAIResultOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localFormData, setLocalFormData] = useState<BlogPostAttributes | null>(null);
  const [formState, setFormState] = useState<BlogPostAttributes>({
    id: 0,
    title: '',
    slug: '',
    content: '',
    blogCategoryId: 0,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    avatarUrl: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    author: '',
    publishedAt: new Date()
  });
  
  const { blogs } = useAppContext();

  useEffect(() => {
    if (open && slug) {
      setLoading(true);
      fetchBlogList({
        search: slug,
        limit: 1,
        categoryId: '',
        sortBy: '',
        sortOrder: '',
        page: 1
      })
        .then((response: any) => {
          if (response && response.data && response.data.length > 0) {
            setLocalFormData(response.data[0]);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, slug]);

  useEffect(() => {
    if (formData) {
      setFormState(formData);
    }
  }, [formData]);

  const handleAISuggestion = () => {
    setIsAIResultOpen(true);
  };

  const title = isView ? "View Blog Post" : "Edit Blog Post";
  
  const blogToDisplay = localFormData || formData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<number | string>) => {
    const { name, value } = e.target;
    setFormState( (prev: any) => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formState);
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Loading...</DialogTitle>
        <DialogContent style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div>Loading blog data...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isView ? 'Xem chi tiết bài viết' : formData ? 'Sửa bài viết' : 'Thêm bài viết mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề"
                  name="title"
                  value={formState.title}
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
                <Typography variant="body2" gutterBottom>Nội dung</Typography>
                <Editor
                  disabled={isView}
                  value={formState.content}
                  onChange={(content) => handleInputChange({ target: { name: 'content', value: content } })}
                  placeholder="Nội dung"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    name="blogCategoryId"
                    value={formState.blogCategoryId || ''}
                    onChange={handleSelectChange}
                    disabled={isView}
                    label="Danh mục"
                  >
                    <MenuItem value="">Chọn danh mục</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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

export default AddBlogFormPopup;
