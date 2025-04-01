import React, { useState } from 'react';
import { Input, DatePicker, Button as AntButton, Space, Divider } from 'antd';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton } from '@mui/material';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ProductAttributes, ProductItemAttributes, ProductMedia } from '@/data/ProductAttributes';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Editor from "../editor/Editor"
interface AddFormPopupProps {
  open: boolean;
  isView: boolean;
  onClose: () => void;
  onChange: (data: { name: string; value: any }) => void;
  onSubmit: () => void;
  formData: ProductAttributes;
}

const AddProductFormPopup: React.FC<AddFormPopupProps> = ({
  open,
  isView,
  onClose,
  onChange,
  onSubmit,
  formData,
}) => {
  // Hàm để xử lý thay đổi trong mảng items
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...(formData.items || [])];

    if (!updatedItems[index]) {
      updatedItems[index] = {} as ProductItemAttributes;
    }

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    onChange({
      name: 'items',
      value: updatedItems
    });
  };

  // Hàm để thêm một item mới vào mảng items
  const handleAddItem = () => {
    const newItem: ProductItemAttributes = {
      name: '',
      color: '',
      price: 0,
      originalPrice: 0,
      status: 'available'
    };

    onChange({
      name: 'items',
      value: [...(formData.items || []), newItem]
    });
  };

  // Hàm để xóa một item khỏi mảng items
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems.splice(index, 1);

    onChange({
      name: 'items',
      value: updatedItems
    });
  };

  // Hàm để xử lý thay đổi trong mảng media
  const handleMediaChange = (index: number, field: string, value: any) => {
    const updatedMedia = [...(formData.media || [])];

    if (!updatedMedia[index]) {
      updatedMedia[index] = {} as ProductMedia;
    }

    updatedMedia[index] = {
      ...updatedMedia[index],
      [field]: value
    };

    onChange({
      name: 'media',
      value: updatedMedia
    });
  };

  // Hàm để thêm một media mới vào mảng media
  const handleAddMedia = () => {
    const newMedia: ProductMedia = {
      type: 'image',
      url: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onChange({
      name: 'media',
      value: [...(formData.media || []), newMedia]
    });
  };

  // Hàm để xóa một media khỏi mảng media
  const handleRemoveMedia = (index: number) => {
    const updatedMedia = [...(formData.media || [])];
    updatedMedia.splice(index, 1);

    onChange({
      name: 'media',
      value: updatedMedia
    });
  };

  // Trong component cha
  const handleEditorChange = (content: string) => {
    console.log('Editor content:', content);
    
    onChange({ name: 'description', value: content });
  };
  
  const title = formData && formData.id ? "Edit Product" : "Add Product";

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
        />
{/* 
        <Input
          placeholder="Description"
          value={formData.description || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'description', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        /> */}

<Editor 
  disabled={isView} 
  value={formData.description || ""}
  onChange={(content) => onChange({ name: 'description', value: content })}
  placeholder="Description"
/>


        <Input
          placeholder="shortDescription"
          value={formData.shortDescription || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'shortDescription', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />
        <Input
          placeholder="Category ID"
          type="number"
          value={formData.categoryId || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'categoryId', value: Number(e.target.value) || 0 })}
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Slug"
          value={formData.slug || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'slug', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />

        {/* Meta Information */}
        <h4>Meta Information</h4>
        <Input
          placeholder="Meta Title"
          value={formData.metaTitle || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'metaTitle', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Meta Description"
          value={formData.metaDescription || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'metaDescription', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Meta Keywords"
          value={formData.metaKeywords || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'metaKeywords', value: e.target.value })}
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
          />
        </div>

        {/* Media Section */}
        <div style={{ marginBottom: "16px", border: "1px solid #eee", padding: "10px" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4>Media</h4>
            {!isView && (
              <IconButton
                color="primary"
                onClick={handleAddMedia}
              >
                <AddIcon />
              </IconButton>
            )}
          </div>

          {formData.media && formData.media.map((media, index) => (
            <div key={index} style={{ border: '1px dashed #ccc', padding: '10px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <h5>Media {index + 1}</h5>
                {!isView && (
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleRemoveMedia(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </div>

              <Input
                placeholder="Type"
                value={media.type || ""}
                disabled={isView}
                onChange={(e) => handleMediaChange(index, 'type', e.target.value)}
                style={{ marginBottom: "8px" }}
              />

              <Input
                placeholder="URL"
                value={media.url || ""}
                disabled={isView}
                onChange={(e) => handleMediaChange(index, 'url', e.target.value)}
                style={{ marginBottom: "8px" }}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <DatePicker
                  value={media.createdAt ? dayjs(media.createdAt) : null}
                  onChange={(date) => {
                    handleMediaChange(index, 'createdAt', date ? date.toISOString() : null);
                  }}
                  format="YYYY-MM-DD"
                  disabled={true}
                  style={{ width: "100%", marginBottom: "8px" }}
                  getPopupContainer={(trigger) => trigger.parentElement!}
                />

                <DatePicker
                  value={media.updatedAt ? dayjs(media.updatedAt) : null}
                  onChange={(date) => {
                    handleMediaChange(index, 'updatedAt', date ? date.toISOString() : null);
                  }}
                  format="YYYY-MM-DD"
                  disabled={true}
                  style={{ width: "100%", marginBottom: "8px" }}
                  getPopupContainer={(trigger) => trigger.parentElement!}
                />
              </div>
            </div>
          ))}

          {(!formData.media || formData.media.length === 0) && (
            <div style={{ textAlign: 'center', color: '#999', padding: '10px' }}>
              No media. Click + to add.
            </div>
          )}
        </div>

        {/* Items Section */}
        <div style={{ marginBottom: "16px", border: "1px solid #eee", padding: "10px" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4>Product Variants</h4>
            {!isView && (
              <IconButton
                color="primary"
                onClick={handleAddItem}
              >
                <AddIcon />
              </IconButton>
            )}
          </div>

          {formData.items && formData.items.map((item, index) => (
            <div key={index} style={{ border: '1px dashed #ccc', padding: '10px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <h5>Variant {index + 1}</h5>
                {!isView && (
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </div>

              <Input
                placeholder="Name"
                value={item.name || ""}
                disabled={isView}
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                style={{ marginBottom: "8px" }}
              />

              <Input
                placeholder="Color"
                value={item.color || ""}
                disabled={isView}
                onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                style={{ marginBottom: "8px" }}
              />

              <Input
                placeholder="Price"
                type="number"
                value={item.price || ""}
                disabled={isView}
                onChange={(e) => handleItemChange(index, 'price', Number(e.target.value) || 0)}
                style={{ marginBottom: "8px" }}
              />

              <Input
                placeholder="Original Price"
                type="number"
                value={item.originalPrice || ""}
                disabled={isView}
                onChange={(e) => handleItemChange(index, 'originalPrice', Number(e.target.value) || 0)}
                style={{ marginBottom: "8px" }}
              />

              <Input
                placeholder="Status"
                value={item.status || ""}
                disabled={isView}
                onChange={(e) => handleItemChange(index, 'status', e.target.value)}
                style={{ marginBottom: "8px" }}
              />
            </div>
          ))}

          {(!formData.items || formData.items.length === 0) && (
            <div style={{ textAlign: 'center', color: '#999', padding: '10px' }}>
              No variants. Click + to add.
            </div>
          )}
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

export default AddProductFormPopup;
