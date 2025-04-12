import React, { useState, useEffect } from 'react';
import { Input, DatePicker, Button as AntButton, Space, Divider } from 'antd';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton } from '@mui/material';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ProductAttributes, ProductItemAttributes, ProductMedia } from '@/data/ProductAttributes';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Editor from "../editor/Editor"
import AIResultPopup from './AIResultPopup';
import { useAppContext } from '@/contexts/AppContext';

interface AddFormPopupProps {
  open: boolean;
  isView: boolean;
  onClose: () => void;
  onChange: (data: { name: string; value: any }) => void;
  onSubmit: () => void;
  formData: ProductAttributes;
  slug?: string;
}

const AddProductFormPopup: React.FC<AddFormPopupProps> = ({
  open,
  isView,
  onClose,
  onChange,
  onSubmit,
  formData,
  slug
}) => {
  const [isAIResultOpen, setIsAIResultOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localFormData, setLocalFormData] = useState<ProductAttributes | null>(null);

  const {
    selectedProduct,
    fetchProductBySlug
  } = useAppContext();

  useEffect(() => {
    if (open && slug) {
      setLoading(true);
      fetchProductBySlug(slug)
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, slug, fetchProductBySlug]);

  useEffect(() => {
    if (selectedProduct) {
      setLocalFormData(selectedProduct);
    } else if (formData) {
      setLocalFormData(formData);
    }
  }, [selectedProduct, formData]);

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
      status: 'available',
      id: 0
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: 0,
      productId: 0,
      mediaId: 0,
      altText: '',
      name: ''
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
    onChange({ name: 'description', value: content });
  };

  const title = isView ? "View Product" : selectedProduct?.id ? "Edit Product" : "Add Product";

  const handleAISuggestion = () => {
    setIsAIResultOpen(true);
  };

  const productToDisplay = localFormData || formData;

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Loading...</DialogTitle>
        <DialogContent style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div>Loading product data...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {/* Basic Information */}
          <Input
            placeholder="Name"
            value={productToDisplay?.name || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'name', value: e.target.value })}
          />

          <Editor
            disabled={isView}
            value={productToDisplay?.description || ""}
            onChange={(content) => onChange({ name: 'description', value: content })}
            placeholder="Description"
          />

          <Input
            placeholder="shortDescription"
            value={productToDisplay?.shortDescription || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'shortDescription', value: e.target.value })}
            style={{ marginBottom: "16px" }}
          />
          <Input
            placeholder="Category ID"
            type="number"
            value={productToDisplay?.categoryId || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'categoryId', value: Number(e.target.value) || 0 })}
            style={{ marginBottom: "16px" }}
          />

          <Input
            placeholder="Slug"
            value={productToDisplay?.slug || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'slug', value: e.target.value })}
            style={{ marginBottom: "16px" }}
          />

          {/* Meta Information */}
          <h4>Meta Information</h4>
          <Input
            placeholder="Meta Title"
            value={productToDisplay?.metaTitle || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'metaTitle', value: e.target.value })}
            style={{ marginBottom: "16px" }}
          />

          <Input
            placeholder="Meta Description"
            value={productToDisplay?.metaDescription || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'metaDescription', value: e.target.value })}
            style={{ marginBottom: "16px" }}
          />

          <Input
            placeholder="Meta Keywords"
            value={productToDisplay?.metaKeywords || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'metaKeywords', value: e.target.value })}
            style={{ marginBottom: "16px" }}
          />

          {/* Dates */}
          <h4>Dates</h4>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <DatePicker
              value={productToDisplay?.createdAt ? dayjs(productToDisplay.createdAt) : null}
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
              value={productToDisplay?.updatedAt ? dayjs(productToDisplay.updatedAt) : null}
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

            {productToDisplay?.media && productToDisplay.media.map((media, index) => (
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
                {media.url && (
                  <div style={{ margin: "8px 0", textAlign: "center" }}>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${media.url}`}
                      alt="Avatar Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                        border: "1px solid #eee",
                        borderRadius: "4px",
                        padding: "4px"
                      }}
                    />
                  </div>
                )}

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

            {(!productToDisplay?.media || productToDisplay.media.length === 0) && (
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

            {productToDisplay?.items && productToDisplay.items.map((item, index) => (
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

            {(!productToDisplay?.items || productToDisplay.items.length === 0) && (
              <div style={{ textAlign: 'center', color: '#999', padding: '10px' }}>
                No variants. Click + to add.
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          {!isView && (
            <>
              <Button onClick={handleAISuggestion} variant="outlined">
                Gợi Ý (AI)
              </Button>
              <Button onClick={onSubmit} variant="contained" color="primary">
                Submit
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <AIResultPopup
        open={isAIResultOpen}
        onClose={() => setIsAIResultOpen(false)}
        formData={productToDisplay}
        type="product"
      />
    </>
  );
};

export default AddProductFormPopup;
