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

interface ConfirmPopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  Content: string;
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({ open,onClose, onSubmit, Content }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{Content}</DialogTitle>
      <DialogContent>
            
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmPopup;