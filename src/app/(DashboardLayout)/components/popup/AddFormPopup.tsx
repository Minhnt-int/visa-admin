import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';


interface AddFormPopup extends Record<string, any> {
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
interface AddFormPopupProps {
  open: boolean;
  isView: boolean;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  formData: ProductCategory | ProductAttributes; // Union Type
}

const AddFormPopup: React.FC<AddFormPopupProps> = ({
  open,
  isView,
  onClose,
  onChange,
  onSubmit,
  formData,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{formData ? 'Edit Item' : 'Add Item'}</DialogTitle>
      <DialogContent>
        {formData &&
          Object.keys(formData).map((key) => (
            <TextField
              disabled={isView}
              key={key}
              margin="dense"
              name={key}
              label={key}
              type="text"
              fullWidth
              variant="standard"
              value={(formData as any)[key] || ''} // Ép kiểu để TypeScript không báo lỗi
              onChange={onChange}
            />
          ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={isView} onClick={onSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFormPopup;