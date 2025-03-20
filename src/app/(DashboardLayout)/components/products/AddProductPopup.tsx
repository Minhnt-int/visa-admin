import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';


interface ProductFormData {
  id: number;
  name: string;
  price: number;
  description: string;
  categoryId: number;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AddProductPopupProps {
  open: boolean;
  isView: boolean;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  formData: ProductFormData;
}

const AddProductPopup: React.FC<AddProductPopupProps> = ({ open, isView, onClose, onChange, onSubmit, formData }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{formData ? 'Edit Product' : 'Add Product'}</DialogTitle>
      <DialogContent>
        <TextField
          disabled={isView}
          autoFocus
          margin="dense"
          name="name"
          label="Name"
          type="text"
          fullWidth
          variant="standard"
          value={formData?.name || ''} // Kiểm tra formData trước khi truy cập name
          onChange={onChange}
        />
        <TextField
          disabled={isView}
          margin="dense"
          name="price"
          label="Price"
          type="number"
          fullWidth
          variant="standard"
          value={formData?.price || ''} // Kiểm tra formData trước khi truy cập price
          onChange={onChange}
        />
        <TextField
          disabled={isView}
          margin="dense"
          name="description"
          label="Description"
          type="text"
          fullWidth
          variant="standard"
          value={formData?.description || ''} // Kiểm tra formData trước khi truy cập description
          onChange={onChange}
        />
        <TextField
          disabled={isView}
          margin="dense"
          name="categoryId"
          label="Category ID"
          type="number"
          fullWidth
          variant="standard"
          value={formData?.categoryId || ''} // Kiểm tra formData trước khi truy cập categoryId
          onChange={onChange}
        />
        <TextField
          disabled={isView}
          margin="dense"
          name="slug"
          label="Slug"
          type="text"
          fullWidth
          variant="standard"
          value={formData?.slug || ''} // Kiểm tra formData trước khi truy cập slug
          onChange={onChange}
        />
        <TextField
          disabled={isView}
          margin="dense"
          name="metaTitle"
          label="Meta Title"
          type="text"
          fullWidth
          variant="standard"
          value={formData?.metaTitle || ''} // Kiểm tra formData trước khi truy cập metaTitle
          onChange={onChange}
        />
        <TextField
          disabled={isView}
          margin="dense"
          name="metaDescription"
          label="Meta Description"
          type="text"
          fullWidth
          variant="standard"
          value={formData?.metaDescription || ''} // Kiểm tra formData trước khi truy cập metaDescription
          onChange={onChange}
        />
        <TextField
        disabled={isView}
          margin="dense"
          name="metaKeywords"
          label="Meta Keywords"
          type="text"
          fullWidth
          variant="standard"
          value={formData?.metaKeywords || ''} // Kiểm tra formData trước khi truy cập metaKeywords
          onChange={onChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={isView} onClick={onSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductPopup;