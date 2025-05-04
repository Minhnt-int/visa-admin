import React, { useState } from 'react';
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
  Box
} from '@/config/mui';
import { ProductCategory } from '@/data/ProductCategory';
import { SelectChangeEvent } from '@mui/material/Select';

interface AddProductCategoryFormPopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCategory) => void;
  formData?: ProductCategory;
  isView?: boolean;
}

const AddProductCategoryFormPopup: React.FC<AddProductCategoryFormPopupProps> = ({
  open,
  onClose,
  onSubmit,
  formData,
  isView = false
}) => {
  const [formState, setFormState] = useState<ProductCategory>(formData || {
    id: 0,
    name: '',
    slug: '',
    description: '',
    parentId: null,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    avatarUrl: ''
  });

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isView ? 'Xem chi tiết danh mục' : formData ? 'Sửa danh mục' : 'Thêm danh mục mới'}
      </DialogTitle>
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
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                disabled={isView}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Danh mục cha</InputLabel>
                <Select
                  name="parentId"
                  value={formState.parentId || ''}
                  onChange={handleSelectChange}
                  disabled={isView}
                  label="Danh mục cha"
                >
                  <MenuItem value="">Không có</MenuItem>
                  {/* Add parent category options here */}
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
  );
};

export default AddProductCategoryFormPopup;
