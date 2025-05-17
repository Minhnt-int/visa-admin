import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Stack
} from '@/config/mui';

interface MetaSEOAttributes {
  id?: number;
  pageKey: string;
  pageUrl?: string;
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  customHead?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MetaFormProps {
  formData: MetaSEOAttributes;
  isView?: boolean;
  onSubmit: (data: MetaSEOAttributes) => void;
  onCancel: () => void;
}

const MetaForm: React.FC<MetaFormProps> = ({
  formData,
  isView = false,
  onSubmit,
  onCancel
}) => {
  const [form, setForm] = useState<MetaSEOAttributes>(formData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(formData);
  }, [formData]);

  const handleChange = (field: keyof MetaSEOAttributes, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when it's changed
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.pageKey) {
      newErrors.pageKey = 'Page Key không được để trống';
    }
    
    if (!form.title) {
      newErrors.title = 'Title không được để trống';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    onSubmit(form);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={3}>
          {isView ? 'Thông tin Meta SEO' : 'Thông tin Meta SEO'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Page Key"
                value={form.pageKey}
                onChange={(e) => handleChange('pageKey', e.target.value)}
                disabled={isView || (form.id !== 0 && form.id !== undefined)}
                error={!!errors.pageKey}
                helperText={errors.pageKey}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Page URL"
                value={form.pageUrl || ''}
                onChange={(e) => handleChange('pageUrl', e.target.value)}
                disabled={isView}
                placeholder="https://example.com/page"
                helperText="URL của trang sẽ hiển thị meta này"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                disabled={isView}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={isView}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Keywords"
                value={form.keywords}
                onChange={(e) => handleChange('keywords', e.target.value)}
                disabled={isView}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="OG Title"
                value={form.ogTitle}
                onChange={(e) => handleChange('ogTitle', e.target.value)}
                disabled={isView}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="OG Image URL"
                value={form.ogImage}
                onChange={(e) => handleChange('ogImage', e.target.value)}
                disabled={isView}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="OG Description"
                value={form.ogDescription}
                onChange={(e) => handleChange('ogDescription', e.target.value)}
                disabled={isView}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Custom Head Content"
                value={form.customHead}
                onChange={(e) => handleChange('customHead', e.target.value)}
                disabled={isView}
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={onCancel}
                >
                  {isView ? 'Quay lại' : 'Hủy'}
                </Button>
                
                {!isView && (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                  >
                    {form.id ? 'Cập nhật' : 'Tạo mới'}
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default MetaForm;