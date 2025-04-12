"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, Card, Row, Col, Image } from 'antd';
import { ProductCategory } from '@/data/ProductCategory';
import { useAppContext } from '@/contexts/AppContext';
import dayjs from 'dayjs';
import ConfirmPopup from '../popup/ConfirmPopup';
import MediaPopup from '../popup/MediaPopup';
import { ProductMedia } from '@/data/ProductAttributes';

interface ProductCategoryFormProps {
  formData: ProductCategory;
  isView?: boolean;
  isEdit?: boolean;
  onSubmit: (data: ProductCategory) => Promise<void>;
  onCancel: () => void;
}

const ProductCategoryForm: React.FC<ProductCategoryFormProps> = ({
  formData: initialFormData,
  isView = false,
  isEdit = false,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<ProductCategory>(initialFormData);
  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const [mediaPopupOpen, setMediaPopupOpen] = useState(false);
  
  const { productCategories, selectedProductCategory } = useAppContext();

  useEffect(() => {
    setFormData(selectedProductCategory || initialFormData);
  }, [selectedProductCategory, initialFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSelectChange = (value: number | null) => {
    setFormData(prev => ({
      ...prev,
      parentId: value,
    }));
  };

  const handleMediaSelect = (media: ProductMedia) => {
    setFormData(prev => ({
      ...prev,
      avatarUrl: media.url
    }));
  };

  const handleSubmitClick = () => {
    setConfirmingPopup(true);
  };

  const handleConfirm = async () => {
    try {
      await onSubmit(formData);
    } finally {
      setConfirmingPopup(false);
    }
  };

  return (
    <Card>
      <Form layout="vertical" style={{ maxWidth: 800, margin: '0 auto' }}>
        <Form.Item 
          label="Tên danh mục" 
          required 
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isView}
            placeholder="Nhập tên danh mục"
          />
        </Form.Item>
        
        <Form.Item 
          label="Slug" 
          required
          rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
        >
          <Input
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            disabled={isView}
            placeholder="Nhập slug"
          />
        </Form.Item>
        
        <Form.Item label="Danh mục cha">
          <Select
            allowClear
            placeholder="Chọn danh mục cha (nếu có)"
            value={formData.parentId}
            onChange={handleSelectChange}
            disabled={isView}
            options={productCategories
              .filter(cat => cat.id !== formData.id) // Loại bỏ danh mục hiện tại
              .map(category => ({
                value: category.id,
                label: category.name
              }))}
          />
        </Form.Item>
        
        <Form.Item label="Hình ảnh">
          <Row gutter={16}>
            <Col span={16}>
              <Input 
                value={formData.avatarUrl || ''} 
                onChange={(e) => handleChange({ target: { name: 'avatarUrl', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
                disabled={isView}
                placeholder="URL hình ảnh"
              />
            </Col>
            <Col span={8}>
              <Button 
                type="primary" 
                onClick={() => setMediaPopupOpen(true)} 
                disabled={isView}
              >
                Chọn hình ảnh
              </Button>
            </Col>
          </Row>
          {formData.avatarUrl && (
            <div style={{ marginTop: 16 }}>
              <Image 
                src={`${process.env.NEXT_PUBLIC_API_URL}${formData.avatarUrl}`} 
                alt="Category thumbnail" 
                style={{ maxWidth: '100%', maxHeight: 200 }}
              />
            </div>
          )}
        </Form.Item>
        
        <Form.Item label="Mô tả">
          {isView ? (
            <div dangerouslySetInnerHTML={{ __html: formData.description || '' }} />
          ) : (
            <Input.TextArea
              rows={6}
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập mô tả"
            />
          )}
        </Form.Item>
        
        <Form.Item>
          <Space>
            {isView ? (
              <Button type="primary" onClick={onCancel}>
                Quay lại
              </Button>
            ) : (
              <>
                <Button onClick={onCancel}>
                  Hủy
                </Button>
                <Button type="primary" onClick={handleSubmitClick}>
                  {isEdit ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </>
            )}
          </Space>
        </Form.Item>
      </Form>
      
      <ConfirmPopup
        open={confirmingPopup}
        onClose={() => setConfirmingPopup(false)}
        onSubmit={handleConfirm}
        Content={isEdit 
          ? "Xác nhận cập nhật danh mục này?"
          : "Xác nhận tạo danh mục mới?"
        }
      />
      
      <MediaPopup
        open={mediaPopupOpen}
        onClose={() => setMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
        listMedia={[]}
      />
    </Card>
  );
};

export default ProductCategoryForm; 