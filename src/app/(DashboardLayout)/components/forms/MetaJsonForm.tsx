import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Stack
} from '@/config/mui';
import { convertToSlug } from '../function/TittleToSlug';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AddIcon from '@mui/icons-material/Add';
import MediaPopup from '../popup/MediaPopup';
import { ProductMedia } from '@/data/ProductAttributes';

// Interface cho Slide
interface Slide {
  imgSrc?: string; // Đường dẫn đến hình ảnh
  alt: string; // Mô tả thay thế cho hình ảnh
  subheading: string; // Tiêu đề phụ
  heading?: string; // Tiêu đề chính
  btnText?: string; // Nội dung hiển thị trên nút
  link?: string; // Đường dẫn khi nhấp vào nút
}

// Interface cho ContactInfo
interface ContactInfo {
  address: string; // Địa chỉ
  email: string; // Email liên hệ
  phone: string; // Số điện thoại
}

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

// Mẫu cho slide - trực tiếp là mảng các slide
const slideTemplate = [
  {
    imgSrc: '',
    alt: '',
    subheading: '',
    heading: '',
    btnText: '',
    link: '',
  },
];

// Mẫu cho thông tin liên hệ - trực tiếp là đối tượng ContactInfo
const contactTemplate = {
  address: '',
  email: '',
  phone: ''
};

const MetaJsonForm: React.FC<MetaJsonFormProps> = ({
  formData,
  isView = false,
  isEdit = false,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<MetaJsonAttributes>(formData);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [mediaPopupOpen, setMediaPopupOpen] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (isView) {
      setActiveTab(newValue);
      return;
    }

    // Tạo dữ liệu mới hoàn toàn dựa trên tab được chọn
    let newData: any;

    if (newValue === 0) {
      newData = [...slideTemplate]; // Mảng slides
    } else if (newValue === 1) {
      newData = { ...contactTemplate }; // Object contact
    } else if (newValue === 2) {
      // Giữ nguyên dữ liệu hiện tại cho tab JSON Editor
      newData = form.metaData;
    }

    setForm((prev) => ({
      ...prev,
      metaData: newData,
    }));
    setJsonContent(JSON.stringify(newData, null, 2));
    setActiveTab(newValue);
  };

  useEffect(() => {
    setForm(formData);
    setJsonContent(formData.metaData ? JSON.stringify(formData.metaData, null, 2) : '{}');
  }, [formData]);

  useEffect(() => {
    if (!isView && !isEdit && form.metaData?.title) {
      setForm((prev) => ({
        ...prev,
        pageKey: convertToSlug(form.metaData.title),
      }));
    }
  }, [form.metaData?.title, isView, isEdit]);

  const handleChange = (field: keyof MetaJsonAttributes, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleMetaDataChange = (field: string, value: any) => {
    const updatedMetaData = { ...form.metaData, [field]: value };
    setForm((prev) => ({
      ...prev,
      metaData: updatedMetaData,
    }));
    setJsonContent(JSON.stringify(updatedMetaData, null, 2));
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonContent(value);
    setJsonError('');

    try {
      const parsedJson = JSON.parse(value);
      setForm((prev) => ({
        ...prev,
        metaData: parsedJson,
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

  const formatJson = () => {
    try {
      const parsedJson = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsedJson, null, 2));
    } catch (error) {
      setJsonError('JSON không hợp lệ');
    }
  };

  const handleMediaSelect = (media: ProductMedia) => {
    const slides = [...(form.metaData?.slides || [])];
    if (!slides[currentBannerIndex]) {
      slides[currentBannerIndex] = { alt: '', subheading: '' };
    }
    slides[currentBannerIndex].imgSrc = media.url;
    handleMetaDataChange('slides', slides);
    setMediaPopupOpen(false);
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
                <TextField
                  label="Page Key *"
                  fullWidth
                  value={form.pageKey}
                  onChange={(e) => handleChange('pageKey', e.target.value)}
                  disabled={isView || isEdit}
                  error={!!errors.pageKey}
                  helperText={errors.pageKey || 'Ví dụ: trang-chu, gioi-thieu, lien-he'}
                  sx={{ mb: 3 }}
                  placeholder="trang-chu"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                  Dữ liệu trang
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Banner" />
                    <Tab label="Contact Info" />
                    <Tab label="JSON Editor" />
                  </Tabs>
                </Box>

                {activeTab === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Cấu hình Banner Slider
                      </Typography>
                      
                      {/* Hiển thị form cho mỗi banner trong mảng metaData */}
                      {(Array.isArray(form.metaData) ? form.metaData : []).map((slide, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            p: 2, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 1, 
                            mb: 2,
                            position: 'relative'
                          }}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            Banner #{index + 1}
                          </Typography>
                          
                          {/* Nút xóa banner (chỉ hiển thị khi có nhiều hơn 1 banner) */}
                          {Array.isArray(form.metaData) && form.metaData.length > 1 && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              sx={{ position: 'absolute', top: 8, right: 8 }}
                              onClick={() => {
                                const newSlides = Array.isArray(form.metaData) ? [...form.metaData] : [];
                                newSlides.splice(index, 1); // Xóa banner tại vị trí index
                                setForm(prev => ({
                                  ...prev,
                                  metaData: newSlides
                                }));
                                setJsonContent(JSON.stringify(newSlides, null, 2));
                              }}
                              disabled={isView}
                            >
                              Xóa
                            </Button>
                          )}

                          {/* Các trường nhập liệu cũng cần cập nhật tương tự */}
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={8}>
                              <TextField
                                label="URL Hình ảnh"
                                fullWidth
                                value={slide.imgSrc || ''}
                                onChange={(e) => {
                                  const newSlides = Array.isArray(form.metaData) ? [...form.metaData] : [];
                                  newSlides[index].imgSrc = e.target.value;
                                  setForm(prev => ({
                                    ...prev,
                                    metaData: newSlides
                                  }));
                                  setJsonContent(JSON.stringify(newSlides, null, 2));
                                }}
                                disabled={isView}
                                placeholder="/images/banner.jpg"
                                sx={{ mb: 2 }}
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                  setCurrentBannerIndex(index);
                                  setMediaPopupOpen(true);
                                }}
                                disabled={isView}
                                fullWidth
                              >
                                Chọn hình ảnh
                              </Button>
                            </Grid>
                          </Grid>

                          {/* Hiển thị xem trước hình ảnh */}
                          {slide.imgSrc && (
                            <Box sx={{ mt: 1, mb: 3, textAlign: 'center', border: '1px dashed #ccc', p: 2, borderRadius: '4px' }}>
                              <Typography variant="caption" display="block" gutterBottom>
                                Xem trước hình ảnh:
                              </Typography>
                              <img
                                src={slide.imgSrc.startsWith('http') 
                                  ? slide.imgSrc 
                                  : `${process.env.NEXT_PUBLIC_API_URL || ''}${slide.imgSrc}`}
                                alt="Banner preview"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: 200,
                                  objectFit: 'contain'
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/image-placeholder.png';
                                  (e.target as HTMLImageElement).style.opacity = '0.5';
                                }}
                              />
                            </Box>
                          )}

                          <TextField
                            label="Alt Text *"
                            fullWidth
                            value={slide.alt || ''}
                            onChange={(e) => {
                              const newSlides = Array.isArray(form.metaData) ? [...form.metaData] : [];
                              newSlides[index].alt = e.target.value;
                              setForm(prev => ({
                                ...prev,
                                metaData: newSlides
                              }));
                              setJsonContent(JSON.stringify(newSlides, null, 2));
                            }}
                            disabled={isView}
                            required
                            placeholder="Mô tả hình ảnh"
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            label="Tiêu đề phụ *"
                            fullWidth
                            value={slide.subheading || ''}
                            onChange={(e) => {
                              const newSlides = Array.isArray(form.metaData) ? [...form.metaData] : [];
                              newSlides[index].subheading = e.target.value;
                              setForm(prev => ({
                                ...prev,
                                metaData: newSlides
                              }));
                              setJsonContent(JSON.stringify(newSlides, null, 2));
                            }}
                            disabled={isView}
                            required
                            placeholder="Chào mừng đến với"
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            label="Tiêu đề chính"
                            fullWidth
                            value={slide.heading || ''}
                            onChange={(e) => {
                              const newSlides = Array.isArray(form.metaData) ? [...form.metaData] : [];
                              newSlides[index].heading = e.target.value;
                              setForm(prev => ({
                                ...prev,
                                metaData: newSlides
                              }));
                              setJsonContent(JSON.stringify(newSlides, null, 2));
                            }}
                            disabled={isView}
                            placeholder="Website của chúng tôi"
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            label="Nút nhấn"
                            fullWidth
                            value={slide.btnText || ''}
                            onChange={(e) => {
                              const newSlides = Array.isArray(form.metaData) ? [...form.metaData] : [];
                              newSlides[index].btnText = e.target.value;
                              setForm(prev => ({
                                ...prev,
                                metaData: newSlides
                              }));
                              setJsonContent(JSON.stringify(newSlides, null, 2));
                            }}
                            disabled={isView}
                            placeholder="Khám phá ngay"
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            label="Đường dẫn"
                            fullWidth
                            value={slide.link || ''}
                            onChange={(e) => {
                              const newSlides = Array.isArray(form.metaData) ? [...form.metaData] : [];
                              newSlides[index].link = e.target.value;
                              setForm(prev => ({
                                ...prev,
                                metaData: newSlides
                              }));
                              setJsonContent(JSON.stringify(newSlides, null, 2));
                            }}
                            disabled={isView}
                            placeholder="/collections"
                            sx={{ mb: 2 }}
                          />
                        </Box>
                      ))}

                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          // Kiểm tra nếu metaData không phải mảng, khởi tạo nó
                          const currentSlides = Array.isArray(form.metaData) ? form.metaData : [];
                          const newSlides = [
                            ...currentSlides,
                            {
                              imgSrc: '',
                              alt: '',
                              subheading: '',
                              heading: '',
                              btnText: '',
                              link: ''
                            }
                          ];
                          
                          setForm(prev => ({
                            ...prev,
                            metaData: newSlides
                          }));
                          setJsonContent(JSON.stringify(newSlides, null, 2));
                          setCurrentBannerIndex(newSlides.length - 1);
                        }}
                        disabled={isView}
                        sx={{ mt: 1 }}
                      >
                        Thêm Banner
                      </Button>
                    </Grid>
                  </Grid>
                )}

                {activeTab === 1 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Thông tin liên hệ
                      </Typography>
                      <TextField
                        label="Địa chỉ *"
                        fullWidth
                        value={form.metaData?.address || ''}
                        onChange={(e) => {
                          // Cập nhật trực tiếp vào metaData
                          handleMetaDataChange('address', e.target.value);
                        }}
                        disabled={isView}
                        required
                        placeholder="123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        label="Email *"
                        fullWidth
                        value={form.metaData?.email || ''}
                        onChange={(e) => {
                          // Cập nhật trực tiếp vào metaData
                          handleMetaDataChange('email', e.target.value);
                        }}
                        disabled={isView}
                        required
                        placeholder="info@example.com"
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        label="Số điện thoại *"
                        fullWidth
                        value={form.metaData?.phone || ''}
                        onChange={(e) => {
                          // Cập nhật trực tiếp vào metaData
                          handleMetaDataChange('phone', e.target.value);
                        }}
                        disabled={isView}
                        required
                        placeholder="0123 456 789"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                  </Grid>
                )}

                {activeTab === 2 && (
                  <Box>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                      <Button size="small" variant="outlined" onClick={formatJson} disabled={isView}>
                        Format JSON
                      </Button>
                    </Stack>
                    <TextField
                      label="JSON Data"
                      fullWidth
                      multiline
                      rows={12}
                      value={jsonContent}
                      onChange={handleJsonChange}
                      disabled={isView}
                      error={!!jsonError}
                      helperText={jsonError || 'Nhập JSON data hợp lệ'}
                      sx={{ 
                        mb: 2,
                        fontFamily: 'monospace',
                        '& .MuiInputBase-input': {
                          fontFamily: 'monospace'
                        }
                      }}
                    />
                  </Box>
                )}

                {activeTab !== 3 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Xem trước JSON:
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        whiteSpace: 'pre-wrap',
                        overflowX: 'auto',
                      }}
                    >
                      {JSON.stringify(form.metaData, null, 2)}
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                  <Button variant="outlined" color="secondary" onClick={onCancel}>
                    {isView ? 'Quay lại' : 'Hủy'}
                  </Button>

                  {!isView && (
                    <Button type="submit" variant="contained" color="primary" disabled={!!jsonError}>
                      {isEdit ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <MediaPopup
        open={mediaPopupOpen}
        onClose={() => setMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
        onSubmit={() => {}}
        listMedia={[]}
      />
    </form>
  );
};

export default MetaJsonForm;