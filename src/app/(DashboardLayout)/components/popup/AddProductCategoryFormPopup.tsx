import React from 'react';
import { Input, DatePicker } from 'antd';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import dayjs from 'dayjs';
import { ProductCategory } from '@/data/ProductCategory';

interface AddFormPopupProps {
  open: boolean;
  isView?: boolean;
  onClose: () => void;
  onChange: (data: { name: string; value: any }) => void;
  onSubmit: () => void;
  formData: ProductCategory;
}

const AddProductCategoryFormPopup: React.FC<AddFormPopupProps> = ({
  open,
  isView = false,
  onClose,
  onChange,
  onSubmit,
  formData,
}) => {
  const title = isView ? "Chi tiết danh mục" : (formData && formData.id ? "Sửa danh mục" : "Thêm danh mục");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {/* Basic Information */}
        <h4>Thông tin cơ bản</h4>
        <Input
          placeholder="Tên danh mục"
          value={formData?.name || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'name', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Slug"
          value={formData?.slug || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'slug', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />

        <Input.TextArea
          placeholder="Mô tả"
          value={formData?.description || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'description', value: e.target.value })}
          style={{ marginBottom: "16px" }}
          rows={4}
        />

        {/* Dates */}
        <h4>Ngày tháng</h4>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '50%' }}>
            <p style={{ margin: '0 0 8px 0' }}>Ngày tạo:</p>
            <DatePicker
              value={formData?.createdAt ? dayjs(formData?.createdAt) : null}
              onChange={(date) => {
                onChange({
                  name: 'createdAt',
                  value: date ? date.toDate() : null,
                });
              }}
              format="DD/MM/YYYY HH:mm:ss"
              disabled={true}
              style={{ width: "100%" }}
              showTime
            />
          </div>

          <div style={{ width: '50%' }}>
            <p style={{ margin: '0 0 8px 0' }}>Ngày cập nhật:</p>
            <DatePicker
              value={formData?.updatedAt ? dayjs(formData?.updatedAt) : null}
              onChange={(date) => {
                onChange({
                  name: 'updatedAt',
                  value: date ? date.toDate() : null,
                });
              }}
              format="DD/MM/YYYY HH:mm:ss"
              disabled={true}
              style={{ width: "100%" }}
              showTime
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        {!isView && (
          <Button onClick={onSubmit} variant="contained" color="primary">
            Lưu
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddProductCategoryFormPopup;
