import React, { useState, useEffect } from 'react';
import { Input, DatePicker, Select, message } from 'antd';
import { Button, Card, CardContent, Typography, Box, Divider, Paper, CircularProgress, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import Editor from "../editor/Editor";
import { BlogPostAttributes, initBlog } from '@/data/BlogPost';
import { useAppContext } from '@/contexts/AppContext';
import MediaPopup from '../popup/MediaPopup';
import { ProductMedia } from '@/data/ProductAttributes';
import { initBlogCategory } from '@/data/blogCategory';
import { useRouter } from 'next/navigation';

interface BlogPostFormProps {
  isView?: boolean;
  onChange: (data: { name: string; value: any }) => void;
  onCancel?: () => void;
  formData: BlogPostAttributes;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  isView = false,
  onChange,
  onCancel,
  formData,
}) => {
  const {
    selectedBlogPost,
    setSelectedBlogPost,
    updateBlogPost,
    createBlogPost
  } = useAppContext();
  const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false);

  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [editorContent, setEditorContent] = useState('');
  const formTitle = formData && formData?.id ? "Edit Blog Post" : "Add Blog Post";
  const [form, setForm] = useState<BlogPostAttributes>(formData);
  const { blogCategories, fetchBlogCategories } = useAppContext();
  const router = useRouter();
  useEffect(() => {
    fetchBlogCategories();
  }, [fetchBlogCategories]);

  useEffect(() => {
    if (form) {
      setEditorContent(form.content || '');
    }
  }, [form]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    onChange({ name: 'content', value: content });
  };

  // Check if required fields are filled
  const isFormValid = () => {
    return Boolean(
      form?.title &&
      form?.content &&
      form?.slug &&
      form?.author &&
      form?.blogCategoryId &&
      form?.metaTitle &&
      form?.metaDescription &&
      form?.metaKeywords
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
          title: form?.title || '',
          content: form?.content || '',
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
          content: "Hãy viết một bài tin tức chuẩn SEO theo tiêu chí Google về: " + form?.title
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
  const handleInputChange = (field: string, value: any) => {
    console.log(field, value);
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Update context if editing existing category
    if (selectedBlogPost && field in selectedBlogPost) {
      setSelectedBlogPost({
        ...selectedBlogPost,
        [field]: value
      });
    }
  };

  const handleMediaSelect = (item: ProductMedia) => {
    handleInputChange('avatarUrl', item.url);
    setIsMediaPopupOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      if (form.id) {
        const result = await updateBlogPost(form);
        
        if (result) {
          message.success(`Blog post updated successfully`);
          router.push('/bai-viet');
          setForm(initBlog);
        } else {
          console.log('Update failed - result is false');
        }
      } else {
        const result = await createBlogPost(form);
        
        if (result) {
          message.success(`Blog post created successfully`);
          router.push('/bai-viet');
          setForm(initBlog);
        } else {
          console.log('Create failed - result is false');
        }
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      message.error('Failed to save blog post');
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
            value={form?.title || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'title', value: e.target.value })}
            style={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={handleGenerateContent}
            disabled={isView || !form?.title || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            Viết bài (AI)
          </Button>
        </Box>

        <Input
          placeholder="Slug"
          value={form?.slug || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'slug', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Input
            placeholder="Avatar URL"
            value={form?.avatarUrl || ""}
            disabled={isView || isLoading}
            onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
            style={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            onClick={() => setIsMediaPopupOpen(true)}
            disabled={isView || isLoading}
          >
            Select Image
          </Button>
        </Box>
        {form?.avatarUrl && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${form?.avatarUrl}`}
              alt="Avatar Preview"
              style={{
                maxWidth: '100%',
                maxHeight: 200,
                objectFit: 'contain',
                border: '1px solid #eee',
                borderRadius: 4,
                padding: 4
              }}
            />
          </Box>
        )}
        <Input
          placeholder="Author"
          value={form?.author || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'author', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />

        <div style={{ marginBottom: "16px" }}>
          <Typography variant="body2" gutterBottom>Blog Category</Typography>
          <Select
            placeholder="Select category"
            value={form?.blogCategoryId}
            disabled={isView}
            onChange={(value) => onChange({ name: 'blogCategoryId', value })}
            style={{ width: "100%" }}
            options={blogCategories.map(category => ({
              value: category.id,
              label: category.name
            }))}
          />
        </div>

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
          value={form?.metaTitle || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'metaTitle', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Meta Description"
          value={form?.metaDescription || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'metaDescription', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Meta Keywords"
          value={form?.metaKeywords || ""}
          disabled={isView}
          onChange={(e) => onChange({ name: 'metaKeywords', value: e.target.value })}
          style={{ marginBottom: "16px" }}
        />

        {/* Dates */}
        <Typography variant="h6" gutterBottom>Dates</Typography>

        <div style={{ marginBottom: "16px" }}>
          <Typography variant="body2" gutterBottom>Published Date</Typography>
          <DatePicker
            value={form?.publishedAt ? dayjs(form?.publishedAt) : null}
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
              value={form?.createdAt ? dayjs(form?.createdAt) : null}
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
              value={form?.updatedAt ? dayjs(form?.updatedAt) : null}
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
            onClick={handleSubmit}
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

        <MediaPopup
          open={isMediaPopupOpen}
          onClose={() => setIsMediaPopupOpen(false)}
          onSelect={handleMediaSelect}
          listMedia={[]}
        />
      </CardContent>
    </Card>
  );
};

export default BlogPostForm;