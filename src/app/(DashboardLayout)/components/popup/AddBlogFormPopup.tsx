import React, { useState } from 'react';
import { Input, DatePicker } from 'antd';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import dayjs from 'dayjs';
import Editor from "../editor/Editor";
import { BlogPostAttributes } from '@/data/BlogPost';
import AIResultPopup from './AIResultPopup';

interface AddFormPopupProps {
  open: boolean;
  isView: boolean;
  onClose: () => void;
  onChange: (data: { name: string; value: any }) => void;
  onSubmit: () => void;
  formData: BlogPostAttributes;
}

const AddBlogFormPopup: React.FC<AddFormPopupProps> = ({
  open,
  isView,
  onClose,
  onChange,
  onSubmit,
  formData,
}) => {
  const [isAIResultOpen, setIsAIResultOpen] = useState(false);

  const handleAISuggestion = () => {
    setIsAIResultOpen(true);
  };

  const title = isView ? "View Blog Post" : "Edit Blog Post";

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {/* Basic Information */}
          <h4 style={{ marginTop: "16px" }}>Blog Post Information</h4>
          
          <Input
            placeholder="Title"
            value={formData?.title || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'title', value: e.target.value })}
            style={{ marginBottom: "16px" }}
          />

          <Input
            placeholder="Slug"
            value={formData?.slug || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'slug', value: e.target.value })}
            style={{ marginBottom: "16px" }}
          />

          <Input
            placeholder="Author"
            value={formData?.author || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'author', value: e.target.value })}
            style={{ marginBottom: "16px" }}
          />

          <Input
            placeholder="Blog Category ID"
            type="number"
            value={formData?.blogCategoryId || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'blogCategoryId', value: Number(e.target.value) || 0 })}
            style={{ marginBottom: "16px" }}
          />

          <div style={{ marginBottom: "16px" }}>
            <p style={{ marginBottom: "8px" }}>Content</p>
            <Editor 
              disabled={isView} 
              value={formData?.content || ""}
              onChange={(content) => onChange({ name: 'content', value: content })}
              placeholder="Content"
            />
          </div>

          {/* SEO Information */}
          <h4>SEO Information</h4>
          <Input
            placeholder="Meta Title"
            value={formData?.metaTitle || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'metaTitle', value: e.target.value })}
            style={{ marginBottom: "16px" }}
          />

          <Input
            placeholder="Meta Description"
            value={formData?.metaDescription || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'metaDescription', value: e.target.value })}
            style={{ marginBottom: "16px" }}
          />

          <Input
            placeholder="Meta Keywords"
            value={formData?.metaKeywords || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'metaKeywords', value: e.target.value })}
            style={{ marginBottom: "16px" }}
          />

          {/* Dates */}
          <h4>Dates</h4>
          
          <div style={{ marginBottom: "16px" }}>
            <p style={{ marginBottom: "8px" }}>Published Date</p>
            <DatePicker
              value={formData?.publishedAt ? dayjs(formData?.publishedAt) : null}
              onChange={(date) => {
                onChange({
                  name: 'publishedAt',
                  value: date ? date.toISOString() : null,
                });
              }}
              format="YYYY-MM-DD HH:mm:ss"
              showTime
              disabled={isView}
              style={{ width: "100%" }}
              getPopupContainer={(trigger) => trigger.parentElement!}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: "50%" }}>
              <p style={{ marginBottom: "8px" }}>Created At</p>
              <DatePicker
                value={formData?.createdAt ? dayjs(formData?.createdAt) : null}
                onChange={(date) => {
                  onChange({
                    name: 'createdAt',
                    value: date ? date.toISOString() : null,
                  });
                }}
                format="YYYY-MM-DD HH:mm:ss"
                showTime
                disabled={true}
                style={{ width: "100%" }}
                getPopupContainer={(trigger) => trigger.parentElement!}
              />
            </div>
            
            <div style={{ width: "50%" }}>
              <p style={{ marginBottom: "8px" }}>Updated At</p>
              <DatePicker
                value={formData?.updatedAt ? dayjs(formData?.updatedAt) : null}
                onChange={(date) => {
                  onChange({
                    name: 'updatedAt',
                    value: date ? date.toISOString() : null,
                  });
                }}
                format="YYYY-MM-DD HH:mm:ss"
                showTime
                disabled={true}
                style={{ width: "100%" }}
                getPopupContainer={(trigger) => trigger.parentElement!}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          {/* <Button onClick={handleAISuggestion} variant="outlined">
            Gợi Ý (AI)
          </Button>
          <Button onClick={onSubmit} variant="contained" color="primary">
            Submit
          </Button> */}
        </DialogActions>
      </Dialog>

      {/* <AIResultPopup
        open={isAIResultOpen}
        onClose={() => setIsAIResultOpen(false)}
        formData={formData}
        type="blog"
      /> */}
    </>
  );
};

export default AddBlogFormPopup;
