import React, { useState } from 'react';
import { Input, DatePicker, Button as AntButton, Space, Divider } from 'antd';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton } from '@mui/material';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ProductAttributes, ProductItemAttributes, ProductMedia } from '@/data/ProductAttributes';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Editor from "../editor/Editor";
import { ProductCategory } from '@/data/ProductCategory';

interface AddFormPopupProps {
  open: boolean;
  isView: boolean;
  onClose: () => void;
  onChange: (data: { name: string; value: any }) => void;
  onSubmit: () => void;
  formData: ProductCategory;
}

const AddProductCategoryFormPopup: React.FC<AddFormPopupProps> = ({
  open,
  isView,
  onClose,
  onChange,
  onSubmit,
  formData,
}) => {
  const title = formData && formData.id ? "Edit Product Category" : "Add Product Category";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {/* Basic Information */}
        <h4>Basic Information</h4>
        <Input
          placeholder="Name"
          value={formData.name || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'name', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Slug"
          value={formData.slug || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'slug', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />


        <Input
          placeholder="Description"
          value={formData.description || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'description', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />


        <Input
          placeholder="Parent Category ID (Để trống nếu là danh mục gốc)"
          type="number"
          value={formData.parentId || ""}
          disabled={isView}
          onChange={(e) => {
            const value = e.target.value.trim() === "" ? null : Number(e.target.value);
            onChange({ name: 'parentId', value: value });
          }}
          style={{ marginBottom: "16px" }}
        />

        {/* Dates */}
        <h4>Dates</h4>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <DatePicker
            value={formData.createdAt ? dayjs(formData.createdAt) : null}
            onChange={(date) => {
              onChange({
                name: 'createdAt',
                value: date ? date.toISOString() : null,
              });
            }}
            format="YYYY-MM-DD"
            disabled={true}
            style={{ width: "100%" }}
            getPopupContainer={(trigger) => trigger.parentElement!}
            placeholder="Created Date"
          />

          <DatePicker
            value={formData.updatedAt ? dayjs(formData.updatedAt) : null}
            onChange={(date) => {
              onChange({
                name: 'updatedAt',
                value: date ? date.toISOString() : null,
              });
            }}
            format="YYYY-MM-DD"
            disabled={true}
            style={{ width: "100%" }}
            getPopupContainer={(trigger) => trigger.parentElement!}
            placeholder="Updated Date"
          />
        </div>
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

export default AddProductCategoryFormPopup;
