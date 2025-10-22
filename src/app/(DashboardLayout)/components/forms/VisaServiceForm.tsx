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
  MenuItem,
  IconButton,
  Stack,
  Divider
} from '@mui/material';
import Image from 'next/image';
import { VisaService, VisaType, Pricing, PricingEntry } from '@/data/VisaService';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
// import VisaTypesForm from './form-partials/VisaTypesForm';
// import PricingForm from './form-partials/PricingForm';
import TestimonialsForm from './form-partials/TestimonialsForm';
import RelatedArticlesForm from './form-partials/RelatedArticlesForm';
import MediaPopup from '../popup/MediaPopup';
import { ProductMedia, ProductAttributes } from '@/data/ProductAttributes';
import MediaDisplay from '../display/MediaDisplay';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Static continent data
const CONTINENT_OPTIONS = [
  { slug: "visa-chau-a", name: "Châu Á" },
  { slug: "visa-chau-au", name: "Châu Âu" },
  { slug: "visa-chau-my", name: "Châu Mỹ" },
  { slug: "visa-chau-phi", name: "Châu Phi" },
  { slug: "visa-chau-uc", name: "Châu Úc" },
];

const initialServiceState: Omit<VisaService, 'id' | 'createdAt' | 'updatedAt'> = {
  slug: '',
  title: '',
  continentSlug: '',
  countryName: '',
  heroImage: '',
  successRate: '',
  processingTime: '',
  description: '',
  services: [],
  visaTypes: [],
  media: [],
  status: 'inactive',
};

// Fixed visa type options
const FIXED_VISA_TYPES: Array<{ id: 'tourist' | 'business' | 'family'; name: string }> = [
  { id: 'tourist', name: 'Du lịch' },
  { id: 'business', name: 'Công tác' },
  { id: 'family', name: 'Thăm thân' },
];

function buildVisaType(id: 'tourist' | 'business' | 'family', name: string): VisaType {
  return {
    id,
    name,
    requirements: {
      personal: [],
      work: [],
      financial: [],
      travel: [],
    },
    pricing: []
  } as VisaType;
}

interface VisaServiceFormProps {
  formData?: VisaService;
  isView?: boolean;
  isEdit?: boolean;
  onSubmit?: (data: VisaService) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}
 
const VisaServiceForm: React.FC<VisaServiceFormProps> = ({
  formData: initialFormData = initialServiceState as VisaService,
  isView = false,
  isEdit = false,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createVisaService, updateVisaService, fetchVisaServiceBySlug, selectedVisaService } = useAppContext();
  const [serviceData, setServiceData] = useState<VisaService>({
    ...initialFormData,
    createdAt: '',
    updatedAt: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [mediaPopupOpen, setMediaPopupOpen] = useState(false);
  const [heroMediaPopupOpen, setHeroMediaPopupOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ProductMedia[]>([]); // Media list for visa service
  const [formData, setFormData] = useState<VisaService>(initialFormData);
  const [newService, setNewService] = useState<string>('');
  // Update modal states for MediaDisplay
  const [updateMediaModalVisible, setUpdateMediaModalVisible] = useState(false);
  const [updatedMediaData, setUpdatedMediaData] = useState<ProductMedia>({
    id: 0,
    url: '',
    type: 'image',
    createdAt: '',
    updatedAt: '',
    productId: 0,
  });

  // Track selected visa type IDs for Select
  const selectedVisaTypeIds: Array<'tourist' | 'business' | 'family'> = (serviceData?.visaTypes || [])
    .map(v => (v.id as any))
    .filter((id: any) => id === 'tourist' || id === 'business' || id === 'family');

  // Initialize from selectedVisaService
  useEffect(() => {
    if (selectedVisaService && selectedVisaService.media) {
      setSelectedMedia(selectedVisaService.media as unknown as ProductMedia[]);
    } else {
      setSelectedMedia([]);
    }
  }, [selectedVisaService]);

  // Initialize selected media from initial form data on first mount
  useEffect(() => {
    if (Array.isArray(initialFormData?.media)) {
      setSelectedMedia(initialFormData.media as unknown as ProductMedia[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep form media in sync with selectedMedia
  useEffect(() => {
    setServiceData(prev => ({ ...prev, media: selectedMedia }));
  }, [selectedMedia]);

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
      // API service already maps the data, so we can use it directly
      console.log('Setting service data from API:', selectedVisaService);
      setServiceData(selectedVisaService);
    }
  }, [isEditMode, selectedVisaService]);

  // Select media handlers
  const handleMediaSelect = (media: ProductMedia) => {
    if (!selectedMedia.some(item => item.id === media.id)) {
      setSelectedMedia(prev => [...prev, media]);
    } else {
      setSelectedMedia(prev => prev.filter(item => item.id !== media.id));
    }
  };

  const handleHeroSelect = (media: ProductMedia) => {
    setServiceData(prev => ({ ...prev, heroImage: media.url }));
    setHeroMediaPopupOpen(false);
  };

  // Simple change handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServiceData(prev => ({ ...prev, [name]: value }));
    console.log(serviceData);
    
  };

  const handleStatusChange = (e: any) => {
    setServiceData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }));
  };

  // Handle fixed visa types selection
  const handleVisaTypesSelectChange = (e: any) => {
    const ids = e.target.value as Array<'tourist' | 'business' | 'family'>;
    const mapped: VisaType[] = ids.map(id => {
      const found = FIXED_VISA_TYPES.find(t => t.id === id)!;
      const existing = (serviceData.visaTypes || []).find(v => v.id === id);
      // keep existing data if already present
      return existing || buildVisaType(found.id, found.name);
    });
    setServiceData(prev => ({ ...prev, visaTypes: mapped }));
  };

  const handleNestedChange = useCallback((field: keyof VisaService, data: any) => {
    setServiceData(prev => ({ ...prev, [field]: data }));
  }, []);

  // Adapter: satisfy MediaDisplay's handleInputChange signature (ProductAttributes)
  const handleMediaDisplayInputChange = (field: keyof ProductAttributes, value: any) => {
    if (field === 'avatarUrl') {
      setServiceData(prev => ({ ...prev, heroImage: String(value) }));
    }
  };

  const handleOpenUpdateMediaPopup = (media: ProductMedia, _index: number) => {
    setUpdatedMediaData(media);
    setUpdateMediaModalVisible(true);
  };

  const handleCloseUpdateMediaPopup = () => setUpdateMediaModalVisible(false);

  const handleMediaUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('type', 'image');
    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/media`, {
      method: 'POST',
      body: form,
    });
    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      setUpdatedMediaData(prev => ({ ...prev, url: result?.data?.url || prev.url }));
    }
  };

  const handleUpdateMedia = () => {
    setSelectedMedia(prev => prev.map(m => (m.id === updatedMediaData.id ? { ...m, url: updatedMediaData.url, type: updatedMediaData.type } : m)));
    setUpdateMediaModalVisible(false);
  };

  const handleRemoveMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  // --- VisaType editors ---
  const updateVisaTypes = (updater: (prev: VisaType[]) => VisaType[]) => {
    setServiceData(prev => ({ ...prev, visaTypes: updater(prev.visaTypes || []) }));
  };

  const addRequirement = (typeId: string, category: keyof VisaType['requirements'], value: string) => {
    if (!value.trim()) return;
    updateVisaTypes(prev => prev.map(v => v.id === typeId ? {
      ...v,
      requirements: { ...v.requirements, [category]: [...(v.requirements[category] as string[]), value] }
    } : v));
  };

  const removeRequirement = (typeId: string, category: keyof VisaType['requirements'], index: number) => {
    updateVisaTypes(prev => prev.map(v => v.id === typeId ? {
      ...v,
      requirements: { ...v.requirements, [category]: (v.requirements[category] as string[]).filter((_, i) => i !== index) }
    } : v));
  };

  const addPricing = (typeId: string) => {
    const newPricing: Pricing = { type: 'Trọn gói', name: 'Gói cơ bản', prices: [ { adult: '', child_6_12: '', child_under_6: '', note: '' } as PricingEntry ] };
    updateVisaTypes(prev => prev.map(v => v.id === typeId ? { ...v, pricing: [ ...(v.pricing || []), newPricing ] } : v));
  };

  const removePricing = (typeId: string, pricingIndex: number) => {
    updateVisaTypes(prev => prev.map(v => v.id === typeId ? { ...v, pricing: v.pricing.filter((_, i) => i !== pricingIndex) } : v));
  };

  const updatePricingField = (typeId: string, pricingIndex: number, field: keyof Pricing, value: string) => {
    updateVisaTypes(prev => prev.map(v => {
      if (v.id !== typeId) return v;
      const cloned = [...v.pricing];
      cloned[pricingIndex] = { ...cloned[pricingIndex], [field]: value } as Pricing;
      return { ...v, pricing: cloned };
    }));
  };

  const addPriceEntry = (typeId: string, pricingIndex: number) => {
    updateVisaTypes(prev => prev.map(v => {
      if (v.id !== typeId) return v;
      const cloned = [...v.pricing];
      const prices = [ ...(cloned[pricingIndex].prices || []), {} as PricingEntry ];
      cloned[pricingIndex] = { ...cloned[pricingIndex], prices };
      return { ...v, pricing: cloned };
    }));
  };

  const updatePriceEntryKey = (typeId: string, pricingIndex: number, entryIndex: number, key: string, val: string) => {
    updateVisaTypes(prev => prev.map(v => {
      if (v.id !== typeId) return v;
      const cloned = [...v.pricing];
      const entries = [...(cloned[pricingIndex].prices || [])];
      const newEntry = { ...(entries[entryIndex] || {}) } as PricingEntry;
      newEntry[key] = val;
      entries[entryIndex] = newEntry;
      cloned[pricingIndex] = { ...cloned[pricingIndex], prices: entries };
      return { ...v, pricing: cloned };
    }));
  };

  const removePriceEntry = (typeId: string, pricingIndex: number, entryIndex: number) => {
    updateVisaTypes(prev => prev.map(v => {
      if (v.id !== typeId) return v;
      const cloned = [...v.pricing];
      const entries = [...(cloned[pricingIndex].prices || [])].filter((_, i) => i !== entryIndex);
      cloned[pricingIndex] = { ...cloned[pricingIndex], prices: entries };
      return { ...v, pricing: cloned };
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...serviceData, media: selectedMedia } as any;
    
    console.log('Form submission:', {
      isEditMode,
      slug,
      hasSlugParam: !!slug,
      action: (isEditMode && slug) ? 'UPDATE' : 'CREATE',
      payload
    });
    
    try {
      if (isEditMode && slug) {
        console.log('Calling updateVisaService with slug:', slug);
        await updateVisaService(slug, payload);
      } else {
        console.log('Calling createVisaService');
        await createVisaService(payload);
      }
      router.push('/dich-vu-visa');
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle error appropriately
    }
  };

  const handleContinentChange = (e: any) => {
    setServiceData(prev => ({ ...prev, continentSlug: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Thông tin chung</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField name="title" label="Tên Dịch Vụ" value={serviceData?.title ?? ''} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="countryName" label="Tên Quốc Gia" value={serviceData?.countryName ?? ''} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Châu lục</InputLabel>
              <Select
                name="continentSlug"
                value={serviceData?.continentSlug ?? ''}
                label="Châu lục"
                onChange={handleContinentChange}
              >
                {CONTINENT_OPTIONS.map((continent) => (
                  <MenuItem key={continent.slug} value={continent.slug}>
                    {continent.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select name="status" value={serviceData?.status ?? 'inactive'} label="Trạng thái" onChange={handleStatusChange}>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
                <MenuItem value="active">Hoạt động</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Hero image selector */}
          <Grid item xs={12} sm={9}>
            <TextField name="heroImage" label="URL Ảnh Hero" value={serviceData?.heroImage ?? '' } onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="outlined" fullWidth onClick={() => setHeroMediaPopupOpen(true)}>
              Chọn ảnh hero
            </Button>
          </Grid>

          {/* Current hero preview */}
          <Grid item xs={12} sm={12}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Hình ảnh hiện tại
              </Typography>
              {serviceData?.heroImage ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${serviceData.heroImage}`}
                  alt="Hero"
                  width={300}
                  height={200}
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">Chưa chọn ảnh hero</Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField name="successRate" label="Tỷ lệ thành công" value={serviceData?.successRate ?? ''} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="processingTime" label="Thời gian xử lý" value={serviceData?.processingTime ?? ''} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} mb={3}>
            <TextField name="description" label="Mô tả" value={serviceData?.description ?? ''} onChange={handleChange} multiline rows={4} fullWidth />
          </Grid>
                    {/* Services included */}
                    <Grid item xs={12} sm={12} mb={3}>
            <Typography variant="subtitle1" gutterBottom>Các Dịch Vụ Bao Gồm</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {(serviceData?.services ?? []).map((svc, idx) => (
                <Chip key={`${svc}-${idx}`} label={svc} onDelete={() => {
                  setServiceData(prev => ({
                    ...prev,
                    services: (prev.services ?? []).filter((_, i) => i !== idx)
                  }));
                }} />
              ))}
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
              <TextField
                size="small"
                fullWidth
                placeholder="Nhập dịch vụ (vd: Tư vấn hồ sơ)"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const v = newService.trim();
                    if (v) {
                      setServiceData(prev => ({ ...prev, services: [ ...(prev.services ?? []), v ] }));
                      setNewService('');
                    }
                  }
                }}
              />
              <Button
                variant="outlined"
                size="small"
                sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: 12 }}
                onClick={() => {
                  const v = newService.trim();
                  if (v) {
                    setServiceData(prev => ({ ...prev, services: [ ...(prev.services ?? []), v ] }));
                    setNewService('');
                  }
                }}
              >
                Thêm dịch vụ
              </Button>
            </Stack>
          </Grid>

          {/* Fixed visa types select */}
          <Grid item xs={12} sm={6} mb={3}>
            <FormControl fullWidth>
              <InputLabel>Loại visa</InputLabel>
              <Select
                multiple
                label="Loại visa"
                value={selectedVisaTypeIds ?? []}
                onChange={handleVisaTypesSelectChange}
                renderValue={(selected) => (selected as string[]).map(id => FIXED_VISA_TYPES.find(t => t.id === id as any)?.name).join(', ')}
              >
                {FIXED_VISA_TYPES.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>


        </Grid>

        {/* Editable Visa Types */}
        {(serviceData.visaTypes || []).map((vt) => (
          <Paper key={vt.id} sx={{ p: 2, mb: 2, bgcolor: '#fafafa' }}>
            <Typography variant="subtitle1" fontWeight="bold">{vt.name}</Typography>
            <Divider sx={{ my: 1 }} />
            {/* Requirements editor */}
            <Grid container spacing={2}>
              {(['personal','work','financial','travel'] as const).map((cat) => (
                <Grid item xs={12} md={6} key={cat}>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>Yêu cầu {cat}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(vt.requirements[cat] as string[])?.map((req, idx) => (
                      <Chip key={`${cat}-${idx}`} label={req} onDelete={() => removeRequirement(vt.id, cat, idx)} />
                    ))}
                    {/* Add control */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
                      <TextField size="small" placeholder={`Thêm ${cat}`} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value;
                          addRequirement(vt.id, cat, val);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }} />
                      <IconButton size="small" onClick={(e) => {
                        const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                        const val = input?.value || '';
                        addRequirement(vt.id, cat, val);
                        if (input) input.value = '';
                      }}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Pricing editor inside VisaType */}
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" fontWeight="bold">Bảng giá</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => addPricing(vt.id)}>Thêm bảng giá</Button>
              </Stack>

              {(vt.pricing || []).map((pr, pIdx) => (
                <Paper key={pIdx} sx={{ p: 2, mb: 1, border: '1px solid #eee' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                    <TextField label="Loại" value={pr.type} onChange={(e) => updatePricingField(vt.id, pIdx, 'type', e.target.value)} size="small" />
                    <TextField label="Tên" value={pr.name} onChange={(e) => updatePricingField(vt.id, pIdx, 'name', e.target.value)} size="small" />
                    <TextField label="Mô tả" value={pr.description || ''} onChange={(e) => updatePricingField(vt.id, pIdx, 'description', e.target.value)} size="small" fullWidth />
                    <IconButton color="error" onClick={() => removePricing(vt.id, pIdx)}><DeleteIcon /></IconButton>
                  </Stack>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Giá chi tiết (JSON động)</Typography>
                  {(pr.prices || []).map((entry, eIdx) => (
                    <Stack key={eIdx} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }} alignItems="center">
                      {/* Dynamic key/value editor: simple three common keys + custom */}
                      <TextField size="small" label="Khóa" placeholder="vd: adult" defaultValue={Object.keys(entry)[0] || ''} onChange={(e) => {
                        const keys = Object.keys(entry);
                        const firstKey = keys[0] || '';
                        const val = firstKey ? entry[firstKey] : '';
                        delete (entry as any)[firstKey];
                        updatePriceEntryKey(vt.id, pIdx, eIdx, e.target.value, val || '');
                      }} />
                      <TextField size="small" label="Giá trị" placeholder="vd: 900.000 VNĐ" defaultValue={Object.values(entry)[0] || ''} onChange={(e) => {
                        const key = Object.keys(entry)[0] || 'value';
                        updatePriceEntryKey(vt.id, pIdx, eIdx, key, e.target.value);
                      }} />
                      <IconButton color="error" onClick={() => removePriceEntry(vt.id, pIdx, eIdx)}><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  ))}

                  <Button size="small" startIcon={<AddIcon />} sx={{ mt: 1 }} onClick={() => addPriceEntry(vt.id, pIdx)}>Thêm dòng giá</Button>
                </Paper>
              ))}
            </Box>
          </Paper>
        ))}
      </Paper>

      {/* Media display using shared component */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Media của dịch vụ</Typography>
        <Box sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={() => setMediaPopupOpen(true)}>Chọn Media cho dịch vụ</Button>
        </Box>
        <MediaDisplay
          formData={{ avatarUrl: serviceData?.heroImage, media: selectedMedia }}
          isView={false}
          handleInputChange={handleMediaDisplayInputChange}
          handleOpenUpdateMediaPopup={handleOpenUpdateMediaPopup}
          handleRemoveMedia={handleRemoveMedia}
          updateMediaModalVisible={updateMediaModalVisible}
          handleCloseUpdateMediaPopup={handleCloseUpdateMediaPopup}
          updatedMediaData={updatedMediaData}
          handleMediaUploadChange={handleMediaUploadChange}
          handleUpdateMedia={handleUpdateMedia}
        />
      </Paper>

      {/* Removed external PricingForm/testimonials/relatedArticles per new structure */}

      <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }} disabled={isLoading}>
        {isEditMode ? 'Cập nhật Dịch vụ' : 'Tạo Dịch vụ'}
      </Button>
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }} disabled={isLoading} onClick={() => console.log(serviceData)}>
        Log
      </Button>

      {/* Popups */}
      <MediaPopup
        listMedia={selectedMedia}
        open={mediaPopupOpen}
        onClose={() => setMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
        onSubmit={() => { }}
      />

      <MediaPopup
        listMedia={selectedMedia}
        open={heroMediaPopupOpen}
        onClose={() => setHeroMediaPopupOpen(false)}
        onSelect={handleHeroSelect}
        onSubmit={() => { }}
      />
    </form>
  );
};

export default VisaServiceForm;
