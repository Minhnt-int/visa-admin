import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Stack,
} from '@/config/mui';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

interface MetaJsonAttributes {
  id?: number;
  pageKey: string;
  metaData: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

interface MetaJsonFormProps {
  formData: MetaJsonAttributes;
  isView?: boolean;
  isEdit?: boolean;
  onSubmit: (data: MetaJsonAttributes) => void;
  onCancel: () => void;
}

// Mẫu mặc định cho metaData
const defaultMetaData = {
  title: "",
  description: "",
  keywords: ""
};

const MetaJsonForm: React.FC<MetaJsonFormProps> = ({
  formData,
  isView = false,
  isEdit = false,
  onSubmit,
  onCancel
}) => {
  const [form, setForm] = useState<MetaJsonAttributes>(formData);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Khởi tạo form với dữ liệu mặc định nếu metaData trống
    if (!formData.metaData || Object.keys(formData.metaData).length === 0) {
      formData.metaData = { ...defaultMetaData };
    }
    
    setForm(formData);
    // Convert metaData object to formatted JSON string for editor
    setJsonContent(formData.metaData ? JSON.stringify(formData.metaData, null, 2) : JSON.stringify(defaultMetaData, null, 2));
  }, [formData]);

  const handleChange = (field: keyof MetaJsonAttributes, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleMetaDataChange = (field: string, value: string) => {
    const updatedMetaData = { ...form.metaData, [field]: value };
    setForm(prev => ({
      ...prev,
      metaData: updatedMetaData
    }));
    
    // Update JSON content to stay in sync
    setJsonContent(JSON.stringify(updatedMetaData, null, 2));
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonContent(value);
    setJsonError('');
    
    try {
      const parsedJson = JSON.parse(value);
      setForm(prev => ({
        ...prev,
        metaData: parsedJson
      }));
    } catch (error) {
      setJsonError('JSON không hợp lệ');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.pageKey.trim()) {
      newErrors.pageKey = 'Page Key không được để trống';
    }
    
    if (jsonError) {
      newErrors.json = jsonError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(form);
    }
  };

  // Hàm format JSON để làm đẹp mã
  const formatJson = () => {
    try {
      const parsedJson = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsedJson, null, 2));
    } catch (error) {
      setJsonError('JSON không hợp lệ');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: '12px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            {isView ? 'Chi tiết Meta JSON' : isEdit ? 'Cập nhật Meta JSON' : 'Thêm Meta JSON mới'}
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>Thông tin cơ bản</Typography>
                <Divider sx={{ mb: 3 }} />
                
                <TextField
                  label="Page Key *"
                  fullWidth
                  value={form.pageKey}
                  onChange={(e) => handleChange('pageKey', e.target.value)}
                  disabled={isView || isEdit}
                  error={!!errors.pageKey}
                  helperText={errors.pageKey || "Ví dụ: trang-chu, gioi-thieu, lien-he"}
                  sx={{ mb: 3 }}
                  placeholder="trang-chu"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>Thông tin Meta</Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="Form đơn giản" />
                    <Tab label="JSON Editor" />
                  </Tabs>
                </Box>
                
                {activeTab === 0 ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Title"
                        fullWidth
                        value={form.metaData?.title || ''}
                        onChange={(e) => handleMetaDataChange('title', e.target.value)}
                        disabled={isView}
                        placeholder="Trang chủ"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={form.metaData?.description || ''}
                        onChange={(e) => handleMetaDataChange('description', e.target.value)}
                        disabled={isView}
                        placeholder="Mô tả trang chủ"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Keywords"
                        fullWidth
                        value={form.metaData?.keywords || ''}
                        onChange={(e) => handleMetaDataChange('keywords', e.target.value)}
                        disabled={isView}
                        placeholder="từ khóa, trang chủ"
                        helperText="Các từ khóa cách nhau bởi dấu phẩy"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    {/* Phần xem trước JSON */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                        Xem trước JSON:
                      </Typography>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: '#f5f5f5', 
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        whiteSpace: 'pre-wrap',
                        overflowX: 'auto'
                      }}>
                        {JSON.stringify(form.metaData, null, 2)}
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Box>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={formatJson}
                        disabled={isView}
                      >
                        Format JSON
                      </Button>
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      rows={16}
                      value={jsonContent}
                      onChange={handleJsonChange}
                      disabled={isView}
                      error={!!errors.json}
                      helperText={errors.json}
                      InputProps={{
                        sx: {
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'monospace',
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                      Nhập dữ liệu Meta dưới dạng JSON hoặc sử dụng form đơn giản ở tab trước
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              {/* Action Buttons */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onCancel}
                  >
                    {isView ? 'Quay lại' : 'Hủy'}
                  </Button>
                  
                  {!isView && (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={!!jsonError}
                    >
                      {isEdit ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </form>
  );
};

export default MetaJsonForm;