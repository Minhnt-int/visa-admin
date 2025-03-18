import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface AddProductPopupProps {
  open: boolean;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  formData: {
    name: string;
    post: string;
    pname: string;
    priority: string;
    budget: string;
  };
}

const AddProductPopup: React.FC<AddProductPopupProps> = ({ open, onClose, onChange, onSubmit, formData }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Product</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Name"
          type="text"
          fullWidth
          variant="standard"
          value={formData.name}
          onChange={onChange}
        />
        <TextField
          margin="dense"
          name="post"
          label="Post"
          type="text"
          fullWidth
          variant="standard"
          value={formData.post}
          onChange={onChange}
        />
        <TextField
          margin="dense"
          name="pname"
          label="Product Name"
          type="text"
          fullWidth
          variant="standard"
          value={formData.pname}
          onChange={onChange}
        />
        <TextField
          margin="dense"
          name="priority"
          label="Priority"
          type="text"
          fullWidth
          variant="standard"
          value={formData.priority}
          onChange={onChange}
        />
        <TextField
          margin="dense"
          name="budget"
          label="Budget"
          type="number"
          fullWidth
          variant="standard"
          value={formData.budget}
          onChange={onChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductPopup;