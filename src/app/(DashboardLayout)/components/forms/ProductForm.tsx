"use client";

import React, { useState, useEffect } from 'react';
import { Input, DatePicker, Select, Button, Space, Upload, message, Modal } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button as MuiButton, Card, CardContent, Typography, Box, Divider, Paper, CircularProgress, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import Editor from "../editor/Editor";
import { ProductAttributes, ProductMedia } from '@/data/ProductAttributes';
import { useAppContext } from '@/contexts/AppContext';
import MediaPopup from '../popup/MediaPopup';
import { useRouter, useSearchParams } from 'next/navigation';
import { convertToFormData } from '@/utils/productUtils';
import ConfirmPopup from '../popup/ConfirmPopup';
import { productMediaDelete } from '@/services/productService';

interface ProductFormProps {
  action?: string;
  onCancel: () => void;
  isView?: boolean;
  isLoading?: boolean;
}

interface AiSuggestionResponse {
  success: boolean;
  data: {
    title: string;
    description: string;
    keywords: string;
  };
  message?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  action,
  onCancel,
  isView = false,
  isLoading = false,
}) => {
  const { 
    productCategories, 
    fetchProductCategories, 
    fetchProductBySlug, 
    createProduct, 
    updateProduct, 
    selectedProduct,
    setSelectedProduct 
  } = useAppContext();
  
  const [mediaPopupOpen, setMediaPopupOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ProductMedia[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [aiSuggestions, setAiSuggestions] = useState<{
    title: string;
    description: string;
    keywords: string;
  }>({
    title: '',
    description: '',
    keywords: '',
  });
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);
  const [primaryMediaIndex, setPrimaryMediaIndex] = useState<number>(-1);
  
  const [formData, setFormData] = useState<ProductAttributes>({
    id: 0,
    name: '',
    description: '',
    shortDescription: '',
    categoryId: 0,
    avatarUrl: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    status: 'active',
    media: [],
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const searchParams = useSearchParams();
  const slug = searchParams?.get('slug') || '';
  const router = useRouter();
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        await fetchProductCategories();
      } catch (error) {
        console.error('Error loading product categories:', error);
        message.error('Failed to load product categories');
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    
    loadCategories();
  }, [fetchProductCategories]);

  useEffect(() => {
    if (action === 'edit' && slug) {
      fetchProductBySlug(slug).then(() => {
        console.log("selectedProduct after fetch", selectedProduct);
      });
    }
  }, [action, slug]);

  useEffect(() => {
    if (selectedProduct) {
      console.log("Cập nhật formData từ selectedProduct:", selectedProduct);
      setFormData(selectedProduct);
      setEditorContent(selectedProduct.description || '');
      setSelectedMedia(selectedProduct.media as any || []);
    } else {
      setFormData({
        id: 0,
        name: '',
        description: '',
        shortDescription: '',
        categoryId: 0,
        avatarUrl: '',
        slug: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        status: 'active',
        media: [],
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setEditorContent('');
      setSelectedMedia([]);
    }
  }, [selectedProduct]);

  useEffect(() => {
    console.log("formData.media đã thay đổi:", formData.media);
    setSelectedMedia(formData.media as any || []);
  }, [formData.media]);

  const handleInputChange = (field: keyof ProductAttributes, value: any) => {
    console.log(`Cập nhật trường ${field} với giá trị:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    handleInputChange('description', content);
  };

  const handleMediaSelect = (media: ProductMedia) => {
    console.log("handleMediaSelect được gọi với:", media);
    
    const newProductMedia: any = {
      url: media.url,
      type: mediaType,
      altText: media.altText,
    };
    
    const newMedia = [...formData.media, newProductMedia];
    
    setFormData(prev => ({
      ...prev,
      media: newMedia as any
    }));
    
    console.log("Đã cập nhật media trong formData:", newMedia);
  };

  const handleRemoveMedia = async (index: number) => {
    await productMediaDelete(formData.media[index].id).then(() => {
      console.log("Media đã được xóa thành công");
    }).catch((error) => {
      console.error("Lỗi khi xóa media:", error);
    });
    const newMedia = [...formData.media];
    newMedia.splice(index, 1);
    
    console.log("newMedia sau khi xóa:", newMedia);
    
    setFormData(prev => ({
      ...prev,
      media: newMedia as any
    }));
    
    console.log("Đã cập nhật media trong formData sau khi xóa");
  };

  const handleAddItem = () => {
    const newItems = [...formData.items];
    newItems.push({
      id: 0,
      name: "",
      color: "",
      price: 0,
      originalPrice: 0,
      status: "available"
    });
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleSubmit = () => {
    console.log("submit", formData);
    setConfirmPopupOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (action === 'add') {
      createProduct(formData).then(() => {
        message.success('Thêm sản phẩm thành công');
        router.push('/san-pham');
      }).catch(error => {
        message.error('Thêm sản phẩm thất bại');
        console.error('Error creating product:', error);
      });
    } else if (action === 'edit') {
      const productData: ProductAttributes = {
        ...formData,
        updatedAt: new Date().toISOString()
      };
      updateProduct(formData.id, productData).then(() => {
        message.success('Cập nhật sản phẩm thành công');
        router.push('/san-pham');
      }).catch(error => {
        message.error('Cập nhật sản phẩm thất bại');
        console.error('Error updating product:', error);
      });
    }
    setConfirmPopupOpen(false);
  };

  const handleGetSuggestions = async () => {
    try {
      setIsLoadingAi(true);
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.name,
          description: formData.description,
        }),
      });
      const data: AiSuggestionResponse = await response.json();
      if (data.success) {
        setAiSuggestions({
          title: data.data.title || '',
          description: data.data.description || '',
          keywords: data.data.keywords || '',
        });
        setShowAiSuggestions(true);
      } else {
        throw new Error(data.message || 'Failed to get AI suggestions');
      }
    } catch (error) {
      message.error('Failed to get AI suggestions');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handlePrimaryMediaChange = (index: number) => {
    setPrimaryMediaIndex(index);
    
    const newMedia = [...formData.media];
    
    const selectedMedia = newMedia[index];
    
    newMedia.splice(index, 1);
    
    newMedia.unshift(selectedMedia);
    
    setFormData(prev => ({
      ...prev,
      media: newMedia as any
    }));
    
    console.log("Đã đặt media index", index, "lên đầu array");
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {action === 'add' ? "Add Product" : action === 'edit' ? "Edit Product" : "View Product"}
        </Typography>

        {/* Basic Information */}
        <Typography variant="h6" gutterBottom style={{ marginTop: "16px" }}>
          Product Information
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Input
            placeholder="Product Name"
            value={formData.name}
            disabled={isView}
            onChange={(e) => handleInputChange('name', e.target.value)}
            style={{ flex: 1 }}
          />
          <MuiButton
            variant="outlined"
            color="primary"
            onClick={handleGetSuggestions}
            disabled={isView || !formData.name || isLoadingAi}
            startIcon={isLoadingAi ? <CircularProgress size={20} /> : null}
          >
            Gợi Ý (AI)
          </MuiButton>
        </Box>

        <Input
          placeholder="Short Description"
          value={formData.shortDescription}
          disabled={isView}
          onChange={(e) => handleInputChange('shortDescription', e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Slug"
          value={formData.slug}
          disabled={isView}
          onChange={(e) => handleInputChange('slug', e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        <Select
          placeholder="Category"
          value={formData.categoryId}
          disabled={isView || isCategoriesLoading}
          onChange={(value) => handleInputChange('categoryId', value)}
          style={{ width: '100%', marginBottom: "16px" }}
          loading={isCategoriesLoading}
        >
          {productCategories && productCategories.length > 0 ? productCategories.map(category => (
            <Select.Option key={category.id} value={category.id}>
              {category.name}
            </Select.Option>
          )) : null}
        </Select>

        <div style={{ marginBottom: "16px" }}>
          <Typography variant="body2" gutterBottom>Description</Typography>
          <Editor
            disabled={isView}
            value={editorContent}
            onChange={(content) => {
              handleInputChange('description', content);
              setEditorContent(content);
            }}
            placeholder="Product Description"
          />
        </div>

        {/* Media Section */}
        <Typography variant="h6" gutterBottom>Media</Typography>
        <Box sx={{ mb: 2 }}>
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setMediaType('image');
                setMediaPopupOpen(true);
              }}
              disabled={isView}
            >
              Add Image
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setMediaType('video');
                setMediaPopupOpen(true);
              }}
              disabled={isView}
            >
              Add Video
            </Button>
          </Space>
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {formData?.media?.map((media, index) => (
              <Box key={index} sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {media.type === 'image' ? (
                  <img
                    src={process.env.NEXT_PUBLIC_API_URL + media.url}
                    alt={media.altText}
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                  />
                ) : (
                  <video
                    src={process.env.NEXT_PUBLIC_API_URL + media.url}
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                  />
                )}
                {!isView && (
                  <>
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveMedia(index)}
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0, 
                        backgroundColor: 'white',
                        borderColor: 'red',
                        borderWidth: '1.5px',
                        color: 'red',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        width: '30px',
                        height: '30px',
                        padding: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'red';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = 'red';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                      }}
                    />
                    <div style={{ marginTop: '5px' }}>
                      <input
                        type="radio"
                        checked={index === 0}
                        onChange={() => handlePrimaryMediaChange(index)}
                        disabled={isView || index === 0}
                        id={`primary-${index}`}
                      />
                      <label htmlFor={`primary-${index}`} style={{ marginLeft: '5px', fontSize: '12px' }}>
                        {index === 0 ? 'Avatar' : 'Make Avatar'}
                      </label>
                    </div>
                  </>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Product Items */}
        <Typography variant="h6" gutterBottom>Product Items</Typography>
        {formData?.items?.map((item, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="Item Name"
                value={item.name}
                disabled={isView}
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
              />
              <Input
                placeholder="Color"
                value={item.color}
                disabled={isView}
                onChange={(e) => handleItemChange(index, 'color', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Price"
                value={item.price}
                disabled={isView}
                onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Original Price"
                value={item.originalPrice}
                disabled={isView}
                onChange={(e) => handleItemChange(index, 'originalPrice', Number(e.target.value))}
              />
              <Select
                value={item.status}
                disabled={isView}
                onChange={(value) => handleItemChange(index, 'status', value)}
                style={{ width: '100%' }}
              >
                <Select.Option value="available">Available</Select.Option>
                <Select.Option value="out_of_stock">Out of Stock</Select.Option>
                <Select.Option value="discontinued">Discontinued</Select.Option>
              </Select>
              {!isView && (
                <Button
                  type="link"
                  danger
                  onClick={() => handleRemoveItem(index)}
                >
                  Remove Item
                </Button>
              )}
            </Space>
          </Box>
        ))}
        {!isView && (
          <Button type="dashed" onClick={handleAddItem} style={{ width: '100%' }}>
            Add Item
          </Button>
        )}

        {/* SEO Information */}
        <Typography variant="h6" gutterBottom>SEO Information</Typography>
        <Input
          placeholder="Meta Title"
          value={formData?.metaTitle || ""}
          disabled={isView}
          onChange={(e) => handleInputChange('metaTitle', e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Meta Description"
          value={formData?.metaDescription || ""}
          disabled={isView}
          onChange={(e) => handleInputChange('metaDescription', e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Meta Keywords"
          value={formData?.metaKeywords || ""}
          disabled={isView}
          onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        {/* Dates */}
        <Typography variant="h6" gutterBottom>Dates</Typography>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: "50%" }}>
            <Typography variant="body2" gutterBottom>Created At</Typography>
            <DatePicker
              value={formData?.createdAt ? dayjs(formData?.createdAt) : null}
              onChange={(date) => {
                handleInputChange('createdAt', date ? date.toISOString() : null);
              }}
              format="YYYY-MM-DD HH:mm:ss"
              showTime
              disabled={true}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ width: "50%" }}>
            <Typography variant="body2" gutterBottom>Updated At</Typography>
            <DatePicker
              value={formData?.updatedAt ? dayjs(formData?.updatedAt) : null}
              onChange={(date) => {
                handleInputChange('updatedAt', date ? date.toISOString() : null);
              }}
              format="YYYY-MM-DD HH:mm:ss"
              showTime
              disabled={true}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          {onCancel && (
            <MuiButton onClick={onCancel} sx={{ mr: 1 }}>
              Cancel
            </MuiButton>
          )}
          {!isView && (
            <MuiButton
              onClick={handleSubmit}
              variant="contained"
              color="primary"
            >
              Submit
            </MuiButton>
          )}
        </Box>

        <ConfirmPopup
          open={confirmPopupOpen}
          onClose={() => setConfirmPopupOpen(false)}
          onSubmit={handleConfirmSubmit}
          Content={action === 'add' 
            ? 'Bạn có chắc chắn muốn thêm sản phẩm mới?' 
            : 'Bạn có chắc chắn muốn cập nhật sản phẩm?'}
        />

        {showAiSuggestions && (
          <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              AI Suggestions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Input
                placeholder="Meta Title"
                value={aiSuggestions.title}
                onChange={(e) => setAiSuggestions(prev => ({ ...prev, title: e.target.value }))}
              />
              <Input.TextArea
                placeholder="Meta Description"
                value={aiSuggestions.description}
                onChange={(e) => setAiSuggestions(prev => ({ ...prev, description: e.target.value }))}
              />
              <Input
                placeholder="Meta Keywords"
                value={aiSuggestions.keywords}
                onChange={(e) => setAiSuggestions(prev => ({ ...prev, keywords: e.target.value }))}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <MuiButton
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleInputChange('metaTitle', aiSuggestions.title);
                    handleInputChange('metaDescription', aiSuggestions.description);
                    handleInputChange('metaKeywords', aiSuggestions.keywords);
                    setShowAiSuggestions(false);
                  }}
                >
                  Apply Suggestions
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  onClick={() => setShowAiSuggestions(false)}
                >
                  Cancel
                </MuiButton>
              </Box>
            </Box>
          </Paper>
        )}
      </CardContent>
      <MediaPopup
        listMedia={formData.media}
        open={mediaPopupOpen}
        onClose={() => setMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
      />
    </Card>
  );
};

export default ProductForm; 