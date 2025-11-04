"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Box,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Paper
} from '@/config/mui';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Divider } from '@mui/material';
import { IconUpload, IconTrash, IconEdit, IconPlus, IconX } from '@tabler/icons-react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from "dayjs";
import Editor from "../editor/Editor";
import { TourFormData, GroupSize, Highlight, ItineraryDay, TourServices, TourTerms, WhyChooseUs } from "@/data/Tour";
import { useAppContext, ActionType } from "@/contexts/AppContext";
import MediaPopup from "../popup/MediaPopup";
import { useRouter } from "next/navigation";
import ConfirmPopup from "../popup/ConfirmPopup";
import { convertToSlug } from "../function/TittleToSlug";
import ApiService from "@/services/ApiService";
import TourService from "@/services/TourService";

interface TourFormProps {
  isView?: boolean;
  onChange?: ({ name, value }: { name: string; value: any }) => void;
  onCancel?: () => void;
  formData: TourFormData;
  action?: string | ActionType;
}

const TourForm: React.FC<TourFormProps> = ({
  isView = false,
  onChange,
  onCancel,
  formData,
  action
}) => {
  const {
    selectedTour,
    setSelectedTour,
    updateTour,
    createTour,
    generateAIContent,
    currentAction
  } = useAppContext();
  
  const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false);
  const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [editorContent, setEditorContent] = useState('');
  const formTitle = currentAction.type === ActionType.EDIT ? "Edit Tour" : "Add Tour";
  const [form, setForm] = useState<TourFormData>(formData);
  const router = useRouter();
  
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: React.ReactNode;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departureCities, setDepartureCities] = useState<string[]>(formData.departure || []);
  const [newDepartureCity, setNewDepartureCity] = useState('');

  // Sync formData prop to internal form state - chỉ khi thực sự cần thiết
  useEffect(() => {
    // Chỉ sync khi formData có slug và form chưa có slug (initial load)
    // Hoặc khi formData có id (đã được load từ API)
    if (formData && formData.slug) {
      // Nếu formData có id và name, đó là data đầy đủ từ API hoặc parent
      // Nếu form chưa có data tương ứng, sync
      if (formData.id && formData.name && (!form.id || form.id !== formData.id)) {
        setForm({ ...formData });
        setDepartureCities([...(formData.departure || [])]);
      } else if (!form.slug && formData.slug) {
        // Nếu chỉ có slug, vẫn sync để form có slug
        setForm({ ...form, slug: formData.slug });
      }
    }
  }, [formData?.slug, formData?.id, formData?.name]); // Trigger khi có slug, id, hoặc name mới

  // Thêm useEffect để load data từ API khi có slug
  useEffect(() => {
    let isMounted = true; // Flag để check component còn mounted không
    
    const loadTourData = async () => {
      // Không load nếu đang submit hoặc đã submit xong
      if (isSubmitting || !isMounted) {
        return;
      }
      
      // Load khi edit và có slug
      // Kiểm tra cả 'edit' string và ActionType.EDIT enum
      const isEditMode = action === 'edit' || 
                         action === ActionType.EDIT || 
                         String(action) === String(ActionType.EDIT) ||
                         currentAction?.type === ActionType.EDIT;
      
      if (isEditMode && formData?.slug) {
        // Kiểm tra xem đã có đầy đủ data chưa (có id và name đầy đủ)
        // Nếu chưa có id hoặc name rỗng thì mới load
        const hasFullData = formData.id && formData.name && formData.name.trim() !== '';
        
        if (!hasFullData && isMounted) {
          setIsLoadingData(true);
        
          try {
            const tourData = await TourService.getBySlug(formData.slug);
            
            // Kiểm tra component còn mounted không trước khi set state
            if (!isMounted) {
              return;
            }
            
            // Kiểm tra tourData có tồn tại không
            if (!tourData || !tourData.id) {
              throw new Error('Không tìm thấy dữ liệu tour từ API');
            }

          
          // Helper function to convert price string to number
          const parsePrice = (price: any): number => {
            if (typeof price === 'number') return price;
            if (typeof price === 'string') {
              const parsed = parseFloat(price.replace(/[^\d.-]/g, ''));
              return isNaN(parsed) ? 0 : parsed;
            }
            return 0;
          };

          // Convert Tour to TourFormData
          const formDataFromApi: TourFormData = {
            id: tourData.id,
            slug: tourData.slug || '',
            name: tourData.name || '',
            // categoryId removed - no longer supported
            country: tourData.country || '',
            duration: tourData.duration || '',
            price: parsePrice(tourData.price),
            originalPrice: parsePrice(tourData.originalPrice),
            departure: Array.isArray(tourData.departure) ? tourData.departure : [],
            image: tourData.image || '',
            gallery: Array.isArray(tourData.gallery) ? tourData.gallery : [],
            rating: typeof tourData.rating === 'number' ? tourData.rating : parseFloat(tourData.rating) || 0,
            reviewCount: typeof tourData.reviewCount === 'number' ? tourData.reviewCount : parseInt(tourData.reviewCount) || 0,
            isHot: Boolean(tourData.isHot),
            groupSize: tourData.groupSize && typeof tourData.groupSize === 'object' 
              ? { 
                  min: typeof tourData.groupSize.min === 'number' ? tourData.groupSize.min : parseInt(tourData.groupSize.min) || 1,
                  max: typeof tourData.groupSize.max === 'number' ? tourData.groupSize.max : parseInt(tourData.groupSize.max) || 20
                }
              : { min: 1, max: 20 },
            highlights: Array.isArray(tourData.highlights) 
              ? tourData.highlights.map((h: any) => ({
                  id: h.id || `hl-${Date.now()}`,
                  title: h.title || '',
                  description: h.description || '',
                  icon: h.icon || 'star'
                }))
              : [],
            itinerary: Array.isArray(tourData.itinerary)
              ? tourData.itinerary.map((i: any) => ({
                  day: typeof i.day === 'number' ? i.day : parseInt(String(i.day)) || 1,
                  title: i.title || '',
                  description: i.description || '',
                  activities: Array.isArray(i.activities)
                    ? i.activities
                        .filter((a: any) => a !== null && a !== undefined)
                        .map((a: any) => typeof a === 'string' ? a : (a.activity || a))
                    : [],
                  meals: Array.isArray(i.meals) ? i.meals : []
                }))
              : [],
            services: {
              included: Array.isArray(tourData.services?.included)
                ? tourData.services.included
                    .filter((s: any) => s !== null && s !== undefined)
                    .map((s: any) => typeof s === 'string' ? s : (s.name || s))
                : [],
              excluded: Array.isArray(tourData.services?.excluded)
                ? tourData.services.excluded
                    .filter((s: any) => s !== null && s !== undefined)
                    .map((s: any) => typeof s === 'string' ? s : (s.name || s))
                : []
            },
            terms: {
              registration: Array.isArray(tourData.terms?.registration) ? tourData.terms.registration : [],
              cancellation: Array.isArray(tourData.terms?.cancellation) ? tourData.terms.cancellation : [],
              payment: Array.isArray(tourData.terms?.payment) ? tourData.terms.payment : []
            },
            whyChooseUs: Array.isArray(tourData.whyChooseUs)
              ? tourData.whyChooseUs.map((w: any) => ({
                  id: w.id || `wcu-${Date.now()}`,
                  title: w.title || '',
                  description: w.description || '',
                  icon: w.icon || 'star'
                }))
              : [],
            // Auto-generate meta SEO nếu null
            metaTitle: tourData.metaTitle || `${tourData.name} - Tour du lịch ${tourData.country}`,
            metaDescription: tourData.metaDescription || `Tour ${tourData.name} ${tourData.duration} tại ${tourData.country}. Giá từ ${parsePrice(tourData.price).toLocaleString('vi-VN')} VNĐ. Đặt tour ngay!`,
            metaKeywords: tourData.metaKeywords || `tour, du lịch, ${tourData.country}, ${tourData.name}, ${tourData.duration}`,
            status: tourData.status || 'active'
          };
          

          
            // Update form state
            setForm(formDataFromApi);
            setDepartureCities([...(tourData.departure || [])]);
            
            // Call onChange to update parent
            if (onChange) {
              Object.keys(formDataFromApi).forEach(key => {
                onChange({ name: key, value: formDataFromApi[key as keyof TourFormData] });
              });
            }
            
          } catch (error) {
            if (!isMounted) return;
            console.error('TourForm - Error loading tour data:', error);
            setSnackbar({
              open: true,
              message: 'Lỗi khi tải dữ liệu tour',
              severity: 'error'
            });
          } finally {
            if (isMounted) {
              setIsLoadingData(false);
            }
          }
        }
      }
    };
    
    loadTourData();
    
    // Cleanup: đánh dấu component đã unmount
    return () => {
      isMounted = false;
    };
  }, [action, formData?.slug, currentAction?.type, onChange, isSubmitting]);

  useEffect(() => {
    if (action === 'create') {
      setSelectedTour(null);
    }
  }, [action, setSelectedTour]);

  // Loại bỏ useEffect gây infinite loop
  // useEffect(() => {
  //   if (onChange) {
  //     onChange({ name: 'name', value: editorContent });
  //   }
  // }, [editorContent, onChange]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setForm(prevForm => {
      const updatedForm = { ...prevForm, [field]: value };
      
      // Chỉ gọi onChange khi cần thiết, không gây infinite loop
      if (onChange && field !== 'name') {
        onChange({ name: field, value });
      }
      
      return updatedForm;
    });
  }, [onChange]);

  const handleTitleChange = useCallback((value: string) => {
    setForm(prevForm => {
      const updatedForm = { ...prevForm, name: value };
      
      // Luôn tự động tạo slug từ tên tour
      const slug = convertToSlug(value);
      const formWithSlug = { ...updatedForm, slug };
      
      return formWithSlug;
    });
    
    // Gọi onChange sau khi state đã được update
    if (onChange) {
      onChange({ name: 'name', value });
      onChange({ name: 'slug', value: convertToSlug(value) });
    }
  }, [onChange]);

  const handleMediaSelect = useCallback((item: any) => {
    setForm(prevForm => {
      const updatedForm = { ...prevForm, image: item.url };
      if (onChange) {
        onChange({ name: 'image', value: item.url });
      }
      return updatedForm;
    });
    setIsMediaPopupOpen(false);
  }, [onChange]);

  const handleAddDepartureCity = useCallback(() => {
    if (newDepartureCity.trim() && !departureCities.includes(newDepartureCity.trim())) {
      const updatedCities = [...departureCities, newDepartureCity.trim()];
      setDepartureCities(updatedCities);
      setForm(prevForm => {
        const updatedForm = { ...prevForm, departure: updatedCities };
        if (onChange) {
          onChange({ name: 'departure', value: updatedCities });
        }
        return updatedForm;
      });
      setNewDepartureCity('');
    }
  }, [newDepartureCity, departureCities, onChange]);

  const handleRemoveDepartureCity = useCallback((cityToRemove: string) => {
    const updatedCities = departureCities.filter(city => city !== cityToRemove);
    setDepartureCities(updatedCities);
    setForm(prevForm => {
      const updatedForm = { ...prevForm, departure: updatedCities };
      if (onChange) {
        onChange({ name: 'departure', value: updatedCities });
      }
      return updatedForm;
    });
  }, [departureCities, onChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true); // Đánh dấu đang submit để prevent loadTourData
      
      if (action === 'edit') {
        await updateTour(formData);
        router.push("/tour-du-lich");
      } else {
        await createTour(formData);
        router.push("/tour-du-lich");
      }
      setConfirmPopupOpen(false);
    } catch (error) {
      setIsSubmitting(false); // Reset nếu có lỗi
      throw error;
    }
  };

  const handleErrorDisplay = (error: any) => {
    const errorResult = ApiService.handleError(error);
    setSnackbar({
      open: true,
      message: errorResult.message,
      severity: 'error'
    });
  };

  const handleSubmit = () => {
    setConfirmPopupOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {formTitle}
          </Typography>
          
          {isLoadingData && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography variant="h6">Đang tải dữ liệu tour...</Typography>
            </Box>
          )}
          
          {!isLoadingData && (
            <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                key="tour-name-field"
                fullWidth
                label="Tên tour"
                value={form.name || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                disabled={isView}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Slug"
                value={form.slug || ''}
                disabled={true}
                helperText="Tự động tạo từ tên tour"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quốc gia"
                value={form.country || ''}
                onChange={(e) => handleInputChange('country', e.target.value)}
                disabled={isView}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Thời gian"
                value={form.duration || ''}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                disabled={isView}
                placeholder="VD: 3 ngày 2 đêm"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={form.status || 'active'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={isView}
                >
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Không hoạt động</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Pricing */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Giá cả
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giá hiện tại"
                type="number"
                value={form.price || 0}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                disabled={isView}
                InputProps={{
                  endAdornment: <Typography variant="body2">VNĐ</Typography>
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giá gốc"
                type="number"
                value={form.originalPrice || 0}
                onChange={(e) => handleInputChange('originalPrice', parseInt(e.target.value) || 0)}
                disabled={isView}
                InputProps={{
                  endAdornment: <Typography variant="body2">VNĐ</Typography>
                }}
              />
            </Grid>

            {/* Group Size */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Số lượng khách
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Tối thiểu"
                    type="number"
                    value={form.groupSize?.min || 1}
                    onChange={(e) => handleInputChange('groupSize', {
                      ...form.groupSize,
                      min: parseInt(e.target.value) || 1
                    })}
                    disabled={isView}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Tối đa"
                    type="number"
                    value={form.groupSize?.max || 20}
                    onChange={(e) => handleInputChange('groupSize', {
                      ...form.groupSize,
                      max: parseInt(e.target.value) || 20
                    })}
                    disabled={isView}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Rating */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Đánh giá
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Điểm đánh giá"
                    type="number"
                    value={form.rating || 0}
                    onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                    disabled={isView}
                    inputProps={{
                      step: 0.1,
                      min: 0,
                      max: 5
                    }}
                    helperText="Từ 0.0 đến 5.0"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Số lượt đánh giá"
                    type="number"
                    value={form.reviewCount || 0}
                    onChange={(e) => handleInputChange('reviewCount', parseInt(e.target.value) || 0)}
                    disabled={isView}
                    inputProps={{
                      min: 0
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Departure Cities */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Điểm khởi hành
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField
                  label="Thêm điểm khởi hành"
                  value={newDepartureCity}
                  onChange={(e) => setNewDepartureCity(e.target.value)}
                  disabled={isView}
                  size="small"
                />
                <Button
                  variant="outlined"
                  onClick={handleAddDepartureCity}
                  disabled={isView || !newDepartureCity.trim()}
                  startIcon={<IconPlus />}
                >
                  Thêm
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {departureCities.map((city, index) => (
                  <Chip
                    key={index}
                    label={city}
                    onDelete={isView ? undefined : () => handleRemoveDepartureCity(city)}
                    deleteIcon={<IconX />}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Grid>

            {/* Featured Image */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Hình ảnh đại diện
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  fullWidth
                  label="URL hình ảnh"
                  value={form.image || ''}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  disabled={isView}
                />
                <Button
                  variant="outlined"
                  startIcon={<IconUpload />}
                  onClick={() => setIsMediaPopupOpen(true)}
                  disabled={isView}
                >
                  Chọn từ thư viện
                </Button>
              </Box>
              {form.image && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={form.image}
                    alt="Tour image"
                    style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                  />
                </Box>
              )}
            </Grid>

            {/* Hot Tour */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isHot || false}
                    onChange={(e) => handleInputChange('isHot', e.target.checked)}
                    disabled={isView}
                  />
                }
                label="Tour nổi bật"
              />
            </Grid>

            {/* SEO */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                SEO
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Title"
                value={form.metaTitle || ''}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                disabled={isView}
                helperText="Tiêu đề SEO (tối đa 60 ký tự)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Description"
                multiline
                rows={3}
                value={form.metaDescription || ''}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                disabled={isView}
                helperText="Mô tả SEO (tối đa 160 ký tự)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Keywords"
                value={form.metaKeywords || ''}
                onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                disabled={isView}
                helperText="Từ khóa SEO, phân cách bằng dấu phẩy"
              />
            </Grid>
            </Grid>
          )}

          {/* Action Buttons */}
          {!isView && !isLoadingData && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {action === 'edit' ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button
                variant="outlined"
                onClick={onCancel || (() => router.push('/tour-du-lich'))}
              >
                Hủy
              </Button>
            </Box>
          )}

          <MediaPopup
            open={isMediaPopupOpen}
            onClose={() => setIsMediaPopupOpen(false)}
            onSelect={handleMediaSelect}
            onSubmit={() => {}}
            listMedia={[]}
          />
        </CardContent>
      </Card>
      
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
      
      <ConfirmPopup
        open={confirmPopupOpen}
        onClose={() => setConfirmPopupOpen(false)}
        content={`Bạn có chắc chắn muốn ${action === 'edit' ? 'cập nhật' : 'tạo'} tour này?`}
        onConfirm={async () => {
          try {
            await handleConfirmSubmit();
          } catch (error) {
            handleErrorDisplay(error);
            setConfirmPopupOpen(false);
          }
        }}
        title={action === 'edit' ? "Cập nhật tour" : "Tạo tour mới"}
      />
    </>
  );
};

export default TourForm;
