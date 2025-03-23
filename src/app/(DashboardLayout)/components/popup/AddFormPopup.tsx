import React from 'react';
import { Input, DatePicker } from 'antd';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import dayjs from 'dayjs';
import _ from 'lodash';

interface AddFormPopupProps {
  open: boolean;
  isView: boolean;
  onClose: () => void;
  onChange: (data: { name: string; value: any }) => void;
  onSubmit: () => void;
  formData: ProductCategory | ProductAttributes | BlogPostAttributes;
  formObject: { name: string; type: any }[]; // Thay đổi từ hàm thành mảng
}

const AddFormPopup: React.FC<AddFormPopupProps> = ({
  open,
  isView,
  onClose,
  onChange,
  onSubmit,
  formData,
  formObject,
}) => {
  const title = formData && formData.id ? "Edit Item" : "Add Item";

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {formObject.map((field : any) => {
          const value = (formData as any)[field.name]; // Lấy giá trị từ formData

          // Xử lý các trường kiểu number
          if (field.type === "number") {
            return (
              <Input
                key={field.name}
                name={field.name}
                placeholder={field.name}
                type="number"
                value={value || ""}
                disabled={isView}
                onChange={(e) =>
                  onChange({ name: field.name, value: Number(e.target.value) || 0 })
                }
                style={{ marginBottom: "16px" }}
              />
            );
          }

          // Xử lý các trường kiểu date
          if (field.type === "date") {
            return (
              <DatePicker
                key={field.name}
                value={value ? dayjs(value) : null}
                onChange={(date) => {
                  onChange({
                    name: field.name,
                    value: date ? date.toISOString() : null,
                  });
                }}
                format="YYYY-MM-DD"
                disabled={isView}
                style={{ width: "100%", marginBottom: "16px" }}
                getPopupContainer={(trigger) => trigger.parentElement!} // Đặt vùng chứa là phần tử cha
              />
            );
          }

          // Xử lý các trường kiểu text
          return (
            <Input
              key={field.name}
              name={field.name}
              placeholder={field.name}
              type="text"
              value={value || ""}
              disabled={isView}
              onChange={(e) => onChange({ name: field.name, value: e.target.value })}
              style={{ marginBottom: "16px" }}
            />
          );
        })}
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