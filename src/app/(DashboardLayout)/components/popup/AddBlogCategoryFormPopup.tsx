import React, { useState, useEffect } from 'react';
import { Input, DatePicker, Select } from 'antd';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';
import { BlogCategory } from '@/data/blogCategory';
import AIResultPopup from './AIResultPopup';
import { useAppContext } from '@/contexts/AppContext';

interface AddFormPopupProps {
  open: boolean;
  isView: boolean;
  onClose: () => void;
  onChange: (data: { name: string; value: any }) => void;
  onSubmit: () => void;
  formData: BlogCategory;
  categoryId?: number | null;
}

const AddBlogCategoryFormPopup: React.FC<AddFormPopupProps> = ({
  open,
  isView,
  onClose,
  onChange,
  onSubmit,
  formData,
  categoryId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAIResultOpen, setIsAIResultOpen] = useState(false);
  const [localFormData, setLocalFormData] = useState<BlogCategory | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const {
    blogCategories,
    fetchBlogCategories
  } = useAppContext();

  useEffect(() => {
    if (open && categoryId) {
      setDataLoading(true);
      // Kiểm tra xem đã có dữ liệu trong blogCategories chưa
      const existingCategory = blogCategories.find(cat => cat.id === categoryId);
      if (existingCategory) {
        setLocalFormData(existingCategory);
        setDataLoading(false);
      } else {
        // Nếu không, fetch lại danh sách để đảm bảo có dữ liệu mới nhất
        fetchBlogCategories()
          .then(() => {
            const category = blogCategories.find(cat => cat.id === categoryId);
            if (category) {
              setLocalFormData(category);
            }
          })
          .finally(() => {
            setDataLoading(false);
          });
      } 
    }
  }, [open, categoryId, fetchBlogCategories, blogCategories]);

  useEffect(() => {
    if (formData) {
      setLocalFormData(formData);
    }
  }, [formData]);

  const handleGenerateContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: "Hãy viết một bài tin tức chuẩn SEO theo tiêu chí Google về: " + (localFormData?.name || formData?.name)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI content');
      }
      
      const result = await response.json();
      if (result.data) {
        setIsAIResultOpen(true);
      }
    } catch (error) {
      console.error('Error getting AI content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categoryData = localFormData || formData;
  const title = isView ? 'View Category' : 'Add New Category';

  if (dataLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Loading...</DialogTitle>
        <DialogContent style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
            <Input
              placeholder="Name"
              value={categoryData?.name || ""}
              disabled={isView}
              onChange={(e) => onChange({ name: 'name', value: e.target.value })}
              style={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGenerateContent}
              disabled={isView || !categoryData?.name || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              Viết bài (AI)
            </Button>
          </div>

          <Input
            placeholder="Slug"
            value={categoryData?.slug || ""}
            disabled={isView}
            onChange={(e) => onChange({ name: 'slug', value: e.target.value })}
            style={{ marginBottom: "16px" }}
          />

          <div style={{ marginBottom: "16px" }}>
            <p style={{ marginBottom: "8px" }}>Parent Category</p>
            <Select
              style={{ width: '100%' }}
              placeholder="Select parent category"
              value={categoryData?.parentId || undefined}
              onChange={(value) => onChange({ name: 'parentId', value })}
              disabled={isView}
              options={blogCategories.map(category => ({
                value: category.id,
                label: category.name
              }))}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <p style={{ marginBottom: "8px" }}>Avatar URL</p>
            <Input
              placeholder="Avatar URL"
              value={categoryData?.avatarUrl || ""}
              disabled={isView}
              onChange={(e) => onChange({ name: 'avatarUrl', value: e.target.value })}
              style={{ marginBottom: "8px" }}
            />
            {categoryData?.avatarUrl && (
              <div style={{ marginTop: "8px", textAlign: "center" }}>
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}${categoryData.avatarUrl}`} 
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
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: "50%" }}>
              <p style={{ marginBottom: "8px" }}>Created At</p>
              <DatePicker
                value={categoryData?.createdAt ? dayjs(categoryData?.createdAt) : null}
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
                value={categoryData?.updatedAt ? dayjs(categoryData?.updatedAt) : null}
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
          {!isView && (
            <Button onClick={onSubmit} variant="contained" color="primary">
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <AIResultPopup
        open={isAIResultOpen}
        onClose={() => setIsAIResultOpen(false)}
        formData={categoryData}
        type="blog"
      />
    </>
  );
};

export default AddBlogCategoryFormPopup;
