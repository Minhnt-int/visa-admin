import React, { useState, useEffect } from 'react';
import { Input, DatePicker } from 'antd';
import { Button, Card, CardContent, Typography, Box, Divider, Paper, CircularProgress, Tooltip } from '@mui/material';
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
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [editorContent, setEditorContent] = useState('');
  const formTitle = formData && formData?.id ? "Edit Blog Post" : "Add Blog Post";

  useEffect(() => {
    if (formData) {
      setEditorContent(formData.content || '');
    }
  }, [formData]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    onChange({ name: 'content', value: content });
  };

  // Check if required fields are filled
  const isFormValid = () => {
    return Boolean(
      formData?.title &&
      formData?.content &&
      formData?.slug &&
      formData?.author &&
      formData?.blogCategoryId &&
      formData?.metaTitle &&
      formData?.metaDescription &&
      formData?.metaKeywords
    );
  };

  const handleGetSuggestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData?.title || '',
          content: formData?.content || '',
          type: 'blog'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }
      
      const suggestions = await response.json();
      setAiSuggestions(suggestions);
      setShowAiSuggestions(true);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: "Hãy viết một bài tin tức chuẩn SEO theo tiêu chí Google về: " + formData?.title
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI content');
      }
      
      const result = await response.json();
      if (result.data) {
        setAiSuggestions(result.data);
        setShowAiSuggestions(true);
        onChange({ name: 'content', value: result.data });
      }
    } catch (error) {
      console.error('Error getting AI content:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Input
            placeholder="Title"
            value={formData?.title || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'title', value: e.target.value })}
            style={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={handleGenerateContent}
            disabled={isView || !formData?.title || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            Viết bài (AI)
          </Button>
        </Box>

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
            value={editorContent}
            onChange={handleEditorChange}
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
            sx={{ mr: 1 }}
          >
            Submit
          </Button>
          <Tooltip title={!isFormValid() && !isLoading ? "Vui lòng điền đầy đủ các trường thông tin trước khi sử dụng gợi ý AI" : ""}>
            <span>
              <Button
                disabled={isView || !isFormValid() || isLoading}
                onClick={handleGetSuggestions}
                variant="outlined"
                color="primary"
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {"Gợi ý (AI)"}
              </Button>
            </span>
          </Tooltip>
        </Box>

        {showAiSuggestions && aiSuggestions && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Gợi ý AI
            </Typography>
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {aiSuggestions.result}
              </Typography>
            </Paper>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BlogPostForm;