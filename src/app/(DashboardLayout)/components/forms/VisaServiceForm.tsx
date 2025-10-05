import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { VisaService } from '@/data/VisaService';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import VisaTypesForm from './form-partials/VisaTypesForm';
import PricingForm from './form-partials/PricingForm';
import TestimonialsForm from './form-partials/TestimonialsForm';
import RelatedArticlesForm from './form-partials/RelatedArticlesForm';
import VisaImagesForm from './form-partials/VisaImagesForm';
import MediaPopup from '../popup/MediaPopup';
import { ProductMedia } from '@/data/ProductAttributes';

const initialServiceState: Omit<VisaService, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  continentSlug: '',
  countryName: '',
  heroImage: '',
  successRate: '',
  processingTime: '',
  description: '',
  services: [],
  visaTypes: [],
  pricing: [],
  testimonials: [],
  relatedArticles: [],
  media: [],
  status: 'draft',
};

const VisaServiceForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createVisaService, updateVisaService, fetchVisaServiceBySlug, selectedVisaService } = useAppContext();
  const [serviceData, setServiceData] = useState(initialServiceState);
  const [isEditMode, setIsEditMode] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [mediaPopupOpen, setMediaPopupOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ProductMedia[]>([]); // Sử dụng kiểu dữ liệu media cho Visa Service
  // Bạn có thể cần thêm state cho popup item nếu bạn quản lý media cho các phần cụ thể trong Visa Service

  // Khởi tạo selectedMedia khi dữ liệu Visa Service được load
  useEffect(() => {
    if (selectedVisaService && selectedVisaService.media) { // Giả định dữ liệu visa service có thuộc tính media
      setSelectedMedia(selectedVisaService.media);
    } else {
      setSelectedMedia([]);
    }
  }, [selectedVisaService]);
  useEffect(() => {
    const slugParam = searchParams?.get('slug');
    if (slugParam) {
      setIsEditMode(true);
      setSlug(slugParam);
      fetchVisaServiceBySlug(slugParam);
    }
  }, [searchParams, fetchVisaServiceBySlug]);

  useEffect(() => {
    if (isEditMode && selectedVisaService) {
      setServiceData(selectedVisaService as any);
    }
  }, [isEditMode, selectedVisaService]);

  // Trong form Visa Service component của bạn

  const handleMediaSelect = (media: ProductMedia) => { // MediaPopup có thể trả về ProductMedia, bạn cần xử lý để chuyển đổi sang VisaMedia nếu cần
    // Tùy thuộc vào cách bạn muốn quản lý media (chọn 1 hay nhiều)
    // Nếu chọn nhiều:
    if (!selectedMedia.some(item => item.id === media.id)) {
      setSelectedMedia([...selectedMedia, media as ProductMedia]); // Cần ép kiểu hoặc chuyển đổi
    } else {
      // Nếu đã có, có thể bỏ chọn
      setSelectedMedia(selectedMedia.filter(item => item.id !== media.id));
    }

    // Nếu chỉ chọn 1 (ví dụ: ảnh bìa):
    // setSelectedMedia([media as VisaMedia]);
  };

  // Nếu bạn có popup item, bạn cần hàm handleItemMediaSelect tương tự
  // const handleItemMediaSelect = (media: ProductMedia) => { ... }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServiceData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e: any) => {
    setServiceData(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' }));
  }

  const handleNestedChange = useCallback((field: keyof VisaService, data: any) => {
    setServiceData(prev => ({ ...prev, [field]: data }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && slug) {
      await updateVisaService(slug, serviceData);
    } else {
      await createVisaService(serviceData);
    }
    router.push('/dich-vu-visa');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Thông tin chung</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField name="title" label="Tên Dịch Vụ" value={serviceData.title} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="countryName" label="Tên Quốc Gia" value={serviceData.countryName} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="continentSlug" label="Slug Châu Lục" value={serviceData.continentSlug} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select name="status" value={serviceData.status} label="Trạng thái" onChange={handleStatusChange}>
                <MenuItem value="draft">Bản nháp</MenuItem>
                <MenuItem value="published">Xuất bản</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="heroImage" label="URL Ảnh Hero" value={serviceData.heroImage} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField name="successRate" label="Tỷ lệ thành công" value={serviceData.successRate} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField name="processingTime" label="Thời gian xử lý" value={serviceData.processingTime} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} mb={3}>
            <TextField name="description" label="Mô tả" value={serviceData.description} onChange={handleChange} multiline rows={4} fullWidth />
          </Grid>
          </Grid>
          <Grid item xs={12} mb={3}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={serviceData.services}
              onChange={(event, newValue) => {
                handleNestedChange('services', newValue);
              }}
              renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Các Dịch Vụ Bao Gồm"
                  placeholder="Thêm dịch vụ và nhấn Enter"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} mb={3}>
            <Button variant="outlined" onClick={() => setMediaPopupOpen(true)}>
              Chọn Media
            </Button>
        </Grid>
      </Paper>

      <VisaTypesForm initialData={serviceData.visaTypes} onChange={(data) => handleNestedChange('visaTypes', data)} />
      <PricingForm initialData={serviceData.pricing} onChange={(data) => handleNestedChange('pricing', data)} />
      {/* <TestimonialsForm initialData={serviceData.testimonials} onChange={(data) => handleNestedChange('testimonials', data)} /> */}
      {/* <RelatedArticlesForm initialData={serviceData.relatedArticles} onChange={(data) => handleNestedChange('relatedArticles', data)} /> */}

      <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
        {isEditMode ? 'Cập nhật Dịch vụ' : 'Tạo Dịch vụ'}
      </Button>

      <MediaPopup
        listMedia={selectedMedia} // Truyền danh sách media đã chọn
        open={mediaPopupOpen}
        onClose={() => setMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
        onSubmit={() => { /* Logic khi submit form thêm mới media trong popup nếu có */ }}
      />
    </form>
  );
};

export default VisaServiceForm;
