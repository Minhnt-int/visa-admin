"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Rating,
  Stack,
  Chip,
  Tooltip
} from '@mui/material'; // Thêm Rating và Stack
import { ProductCategory } from '@/data/ProductCategory';
import { useAppContext } from '@/contexts/AppContext';
import dayjs from 'dayjs';
import ConfirmPopup from '../popup/ConfirmPopup';
import MediaPopup from '../popup/MediaPopup';
import { ProductMedia } from '@/data/ProductAttributes';
import { SelectChangeEvent } from '@mui/material';
import { convertToSlug } from '../function/TittleToSlug';
import ApiService from '@/services/ApiService';
import Editor from '../editor/Editor';

interface ProductCategoryFormProps {
  formData: ProductCategory;
  isView?: boolean;
  isEdit?: boolean;
  onSubmit: (data: ProductCategory) => Promise<void>;
  onCancel: () => void;
}

const ProductCategoryForm: React.FC<ProductCategoryFormProps> = ({
  formData: initialFormData,
  isView = false,
  isEdit = false,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<ProductCategory>(initialFormData);
  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const [mediaPopupOpen, setMediaPopupOpen] = useState(false);

  // Thêm states cho chức năng AI
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [contentScore, setContentScore] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: React.ReactNode; // Thay đổi từ string sang ReactNode
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const { productCategories, selectedProductCategory, generateAIContent } = useAppContext();

  // Reset form data và trạng thái khi selectedProductCategory hoặc initialFormData thay đổi
  useEffect(() => {
    setFormData(selectedProductCategory || initialFormData);
  }, [selectedProductCategory, initialFormData]);

  // Theo dõi riêng khi tên thay đổi để cập nhật slug
  useEffect(() => {
    // Luôn cập nhật slug khi tên thay đổi, bất kể người dùng đã chỉnh sửa thủ công hay chưa
    if (formData.name) {
      setFormData(prev => ({
        ...prev,
        slug: convertToSlug(formData.name)
      }));
    }
  }, [formData.name]); // Chỉ phụ thuộc vào formData.name

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Cập nhật giá trị cho trường tương ứng
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<number | string>) => {
    const value = event.target.value;

    // Chuyển đổi chuỗi rỗng thành null nếu cần
    const parentId = value === '' ? null : Number(value);

    setFormData((prev: any) => ({
      ...prev,
      parentId: parentId,
    }));
  };

  const handleMediaSelect = (media: ProductMedia) => {
    setFormData(prev => ({
      ...prev,
      avatarUrl: media.url
    }));
  };

  const handleSubmitClick = () => {
    setConfirmingPopup(true);
  };

  const handleConfirm = async () => {
    try {
      await onSubmit(formData);
    } finally {
      setConfirmingPopup(false);
    }
  };

  // Hàm hiển thị thông báo lỗi
  const showError = (msg: string) => {
    setSnackbar({
      open: true,
      message: msg,
      severity: 'error'
    });
  };

  // Hàm hiển thị thông báo thành công
  const showSuccess = (msg: string) => {
    setSnackbar({
      open: true,
      message: msg,
      severity: 'success'
    });
  };

  // Thêm hàm xử lý tạo nội dung bằng AI
  const handleGenerateContent = async () => {
    try {
      setIsLoadingAi(true);
      const result = await generateAIContent(formData.name, 'category') as any;

      if (result.data && result.data.result) {
        setAiSuggestions(result.data);
        setShowAiSuggestions(true);

        // Cập nhật mô tả từ gợi ý AI
        // setFormData(prev => ({
        //   ...prev,
        //   description: result.data.result
        // }));

        showSuccess('Tạo nội dung bằng AI thành công');
      }
    } catch (error) {

      // Thay thế đoạn code xử lý lỗi hiện tại
      handleErrorDisplay(error);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Thêm hàm xử lý thay đổi nội dung Editor
  const handleEditorChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
  };

  // Thêm hàm xử lý hiển thị lỗi từ response API
  const handleErrorDisplay = (error: any) => {
    const errorMessage = error?.response?.data?.message ||
      error?.response?.data?.message ||
      error?.message ||
      'Đã xảy ra lỗi không xác định';
    // Kiểm tra nếu có response data và là mảng
    if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const errorMessages = error.response.data.errors.map((err: any) => {
        if (typeof err === 'string') return err;
        if (err.message) return err.message;
        return JSON.stringify(err);
      });

      // Hiển thị danh sách lỗi
      setSnackbar({
        open: true,
        message: (
          <Box>{/* Đây là JSX element, không phải string */}
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Đã xảy ra các lỗi sau:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errorMessages.map((msg: string, index: number) => (
                <li key={index}>
                  <Typography variant="body2">{msg}</Typography>
                </li>
              ))}
              <li key={`0`}>
                <Typography variant="body2">{errorMessage}</Typography>
              </li>
            </ul>
          </Box>
        ),
        severity: 'error'
      });
      return;
    } else {
      showError(errorMessage);  // Hiển thị thông báo lỗi đầu tiên
    }
  };

  // 1. Thêm hàm kiểm tra form hợp lệ để sử dụng với nút gợi ý AI
  const isFormValid = () => {
    return Boolean(
      formData?.name &&
      formData?.description &&
      formData?.slug
    );
  };

  // 2. Thêm hàm lấy gợi ý AI dựa trên nội dung hiện tại (khác với handleGenerateContent)
  const handleGetAISuggestions = async () => {
    try {
      setIsLoadingAi(true);

      // Gọi API đánh giá và gợi ý cải thiện nội dung
      const result = await generateAIContent(formData.description, 'evaluate');

      if (result?.data) {
        setAiSuggestions(result.data);
        setShowAiSuggestions(true);
        showSuccess('Đã tạo gợi ý AI thành công');
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      handleErrorDisplay(error);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isView ? "Chi tiết danh mục" : isEdit ? "Cập nhật danh mục" : "Tạo mới danh mục"}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Tên danh mục */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 1, width: '100%' }}>
              <TextField
                name="name"
                label="Tên danh mục"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                disabled={isView}
                placeholder="Nhập tên danh mục"
                required
              />
              <Button
                variant="outlined"
                color="primary"
                onClick={handleGenerateContent}
                disabled={isView || !formData.name || isLoadingAi}
                startIcon={isLoadingAi ? <CircularProgress size={20} /> : null}
              >
                Viết mô tả (AI)
              </Button>
            </Box>
          </Grid>

          {/* Slug - với giải thích về tự động tạo */}
          <Grid item xs={12}>
            <TextField
              name="slug"
              label="Slug"
              fullWidth
              value={formData.slug}
              onChange={handleChange}
              disabled={isView}
              placeholder="Nhập slug (vd: danh-muc-moi)"
              helperText="Tự động tạo từ tên danh mục. Nếu chỉnh sửa thủ công, thay đổi tên vẫn sẽ cập nhật slug."
            />
          </Grid>

          {/* Danh mục cha */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink style={{ backgroundColor: 'white' }} id="parent-category-label">Danh mục cha</InputLabel>
              <MuiSelect // Sử dụng tên mới
                labelId="parent-category-label"
                value={formData.parentId || ''} // Thêm || '' để tránh giá trị null
                onChange={handleSelectChange}
                disabled={isView}
              >
                <MenuItem value="">
                  <em>Không có</em>
                </MenuItem>
                {productCategories
                  .filter(cat => cat.id !== formData.id)
                  .map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
              </MuiSelect>
            </FormControl>
          </Grid>

          {/* Mô tả */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Mô tả
              </Typography>
              <Editor
                value={formData.description || ''}
                onChange={handleEditorChange}
                disabled={isView}
                placeholder="Nhập mô tả cho danh mục này"
              />
            </Box>
          </Grid>

          {/* SEO Section - Meta Tags */}
          {/* <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Thông tin SEO
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="metaTitle"
                  label="Meta Title"
                  fullWidth
                  value={formData.metaTitle || ''}
                  onChange={handleChange}
                  disabled={isView}
                  placeholder="Nhập tiêu đề meta (tối đa 60 ký tự)"
                  helperText={`${(formData.metaTitle || '').length}/60 ký tự`}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="metaDescription"
                  label="Meta Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.metaDescription || ''}
                  onChange={handleChange}
                  disabled={isView}
                  placeholder="Nhập mô tả meta (tối đa 160 ký tự)"
                  helperText={`${(formData.metaDescription || '').length}/160 ký tự`}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="metaKeywords"
                  label="Meta Keywords"
                  fullWidth
                  value={formData.metaKeywords || ''}
                  onChange={handleChange}
                  disabled={isView}
                  placeholder="Nhập từ khóa (phân cách bằng dấu phẩy)"
                />
              </Grid>
            </Grid>
          </Grid> */}

          {/* Hình ảnh */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Hình ảnh đại diện
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  name="avatarUrl"
                  fullWidth
                  value={formData.avatarUrl || ''}
                  onChange={(e) => handleChange({ target: { name: 'avatarUrl', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
                  disabled={isView}
                  placeholder="URL hình ảnh"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setMediaPopupOpen(true)}
                  disabled={isView}
                  fullWidth
                >
                  Chọn hình ảnh
                </Button>
              </Grid>
            </Grid>
            {formData.avatarUrl && (
              <Box mt={2} sx={{ textAlign: 'center' }}>
                <img
                  src={formData.avatarUrl.startsWith('http')
                    ? formData.avatarUrl
                    : `${process.env.NEXT_PUBLIC_API_URL}${formData.avatarUrl}`}
                  alt="Category thumbnail"
                  style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                />
              </Box>
            )}
          </Grid>

          {/* Thời gian tạo và cập nhật */}
          {(formData.createdAt || formData.updatedAt) && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Thông tin thời gian
              </Typography>
              <Grid container spacing={2}>
                {formData.createdAt && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ngày tạo"
                      value={dayjs(formData.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                )}
                {formData.updatedAt && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ngày cập nhật"
                      value={dayjs(formData.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
        </Grid>

        {/* Hiển thị phân tích AI */}
        {showAiSuggestions && aiSuggestions && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Gợi ý và Phân tích từ AI
            </Typography>

            {/* Phân tích SEO nếu có */}
            {aiSuggestions.seoAnalysis && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                  Phân tích SEO
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        height: '100%',
                        bgcolor: '#f8f9fa',
                        borderTop: '4px solid #4caf50'
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom color="success.main">
                        Điểm mạnh
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {Array.isArray(aiSuggestions.seoAnalysis.strengths) ? (
                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                          {aiSuggestions.seoAnalysis.strengths.map((item: string, index: number) => (
                            <li key={index}>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {item}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Typography variant="body2">
                          {aiSuggestions.seoAnalysis.strengths || 'Không có thông tin'}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        height: '100%',
                        bgcolor: '#f8f9fa',
                        borderTop: '4px solid #ff9800'
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom color="warning.main">
                        Cần cải thiện
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {Array.isArray(aiSuggestions.seoAnalysis.improvements) ? (
                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                          {aiSuggestions.seoAnalysis.improvements.map((item: string, index: number) => (
                            <li key={index}>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {item}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Typography variant="body2">
                          {aiSuggestions.seoAnalysis.improvements || 'Không có thông tin'}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        height: '100%',
                        bgcolor: '#f8f9fa',
                        borderTop: '4px solid #2196f3'
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom color="info.main">
                        Gợi ý từ khóa
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {Array.isArray(aiSuggestions.seoAnalysis.keywords) ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {aiSuggestions.seoAnalysis.keywords.map((keyword: string, index: number) => (
                            <Chip
                              key={index}
                              label={keyword}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ margin: '2px' }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2">
                          {aiSuggestions.seoAnalysis.keywords || 'Không có từ khóa được gợi ý'}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Hiển thị kết quả gợi ý nội dung */}
            {aiSuggestions.result && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                  Gợi ý nội dung
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px'
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {aiSuggestions.result}
                  </Typography>

                  {/* Thêm nút để áp dụng gợi ý */}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          description: aiSuggestions.result
                        }));
                        showSuccess('Đã áp dụng gợi ý vào mô tả');
                      }}
                    >
                      Áp dụng gợi ý này
                    </Button>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Phân tích chung */}
            {aiSuggestions.analysis && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                  Phân tích chung
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {aiSuggestions.analysis}
                  </Typography>
                </Paper>
              </Box>
            )}
          </>
        )}

        {/* Nút điều khiển */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Tooltip title={!isFormValid() && !isLoadingAi ? "Vui lòng điền đầy đủ các trường thông tin trước khi sử dụng gợi ý AI" : ""}>
            <span>
              <Button
                disabled={isView || !isFormValid() || isLoadingAi}
                onClick={handleGetAISuggestions}
                variant="outlined"
                color="secondary"
                startIcon={isLoadingAi ? <CircularProgress size={20} /> : null}
              >
                {isLoadingAi ? "Đang phân tích..." : "Gợi ý cải thiện nội dung"}
              </Button>
            </span>
          </Tooltip>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={onCancel}>
              {isView ? "Quay lại" : "Hủy"}
            </Button>
            {!isView && (
              <Button variant="contained" color="primary" onClick={handleSubmitClick}>
                {isEdit ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>

      <MediaPopup
        open={mediaPopupOpen}
        onClose={() => setMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
        onSubmit={() => { }}
        listMedia={[]}
      />

      <ConfirmPopup
        open={confirmingPopup}
        onClose={() => setConfirmingPopup(false)}
        onConfirm={handleConfirm}
        title={isEdit ? "Xác nhận cập nhật" : "Xác nhận tạo mới"}
        content={isEdit ? "Bạn có chắc chắn muốn cập nhật danh mục này?" : "Bạn có chắc chắn muốn tạo danh mục mới?"}
      />

      {/* Thêm Snackbar cho thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        style={{ marginTop: '60px' }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ProductCategoryForm;