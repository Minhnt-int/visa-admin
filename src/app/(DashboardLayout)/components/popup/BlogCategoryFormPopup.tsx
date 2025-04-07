import React from 'react';
import { Modal, Form, Input, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { BlogCategory } from '@/data/blogCategory';

interface BlogCategoryFormPopupProps {
  open: boolean;
  isView?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: BlogCategory;
  onChange: (data: { name: string; value: any }) => void;
}

const BlogCategoryFormPopup: React.FC<BlogCategoryFormPopupProps> = ({
  open,
  isView = false,
  onClose,
  onSubmit,
  formData,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ name, value });
  };

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <Modal
      title={isView ? 'Chi tiết danh mục' : formData.id ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
      open={open}
      onCancel={onClose}
      footer={
        isView
          ? [
              <Button key="close" onClick={onClose}>
                Đóng
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onClose}>
                Hủy
              </Button>,
              <Button key="submit" type="primary" onClick={handleSubmit}>
                {formData.id ? 'Cập nhật' : 'Thêm mới'}
              </Button>,
            ]
      }
    >
      <Form layout="vertical">
        <Form.Item label="Tên danh mục" required>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isView}
            placeholder="Nhập tên danh mục"
          />
        </Form.Item>
        <Form.Item label="Slug" required>
          <Input
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            disabled={isView}
            placeholder="Nhập slug"
          />
        </Form.Item>
        <Form.Item label="Hình ảnh">
          {formData.avatarUrl && (
            <div style={{ marginBottom: 16 }}>
              <img
                src={formData.avatarUrl}
                alt="Category Avatar"
                style={{ maxWidth: '100%', maxHeight: 200 }}
              />
            </div>
          )}
          {!isView && (
            <Upload
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                  onChange({
                    name: 'avatarUrl',
                    value: reader.result as string,
                  });
                };
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BlogCategoryFormPopup; 