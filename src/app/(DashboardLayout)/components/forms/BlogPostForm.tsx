import React from 'react';
import { Input, DatePicker } from 'antd';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';
import dayjs from 'dayjs';
import Editor from "../editor/Editor";
import { BlogPostAttributes } from '@/data/BlogPost';

interface BlogPostFormProps {
  isView?: boolean;
  onChange: (data: { name: string; value: any }) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  formData: BlogPostAttributes;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  isView = false,
  onChange,
  onSubmit,
  onCancel,
  formData,
}) => {
  const formTitle = formData && formData?.id ? "Edit Blog Post" : "Add Blog Post";

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {formTitle}
        </Typography>
        
        {/* Basic Information */}
        <Typography variant="h6" gutterBottom style={{ marginTop: "16px" }}>
          Blog Post Information
        </Typography>
        
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
          <Typography variant="body2" gutterBottom>Content</Typography>
          <Editor 
            disabled={isView} 
            value={formData?.content || ""}
            onChange={(content) => onChange({ name: 'content', value: content })}
            placeholder="Content"
          />
        </div>

        {/* SEO Information */}
        <Typography variant="h6" gutterBottom>SEO Information</Typography>
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
        <Typography variant="h6" gutterBottom>Dates</Typography>
        
        <div style={{ marginBottom: "16px" }}>
          <Typography variant="body2" gutterBottom>Published Date</Typography>
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
            <Typography variant="body2" gutterBottom>Created At</Typography>
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
            <Typography variant="body2" gutterBottom>Updated At</Typography>
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
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          {onCancel && (
            <Button onClick={onCancel} sx={{ mr: 1 }}>
              Cancel
            </Button>
          )}
          <Button 
            disabled={isView} 
            onClick={onSubmit} 
            variant="contained" 
            color="primary"
          >
            Submit
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BlogPostForm;