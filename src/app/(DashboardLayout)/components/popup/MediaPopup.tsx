import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  IconButton, 
  DialogContentText, 
  TextField,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@/config/mui';
import { SelectChangeEvent, LinearProgress } from '@mui/material';
import { ProductMedia } from '@/data/ProductAttributes';
import { IconTrash, IconUpload, IconX, IconEdit } from '@tabler/icons-react';

interface MediaResponse {
  success: boolean;
  data: {
    media: ProductMedia[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      itemsPerPage: number;
    };
  };
}

interface MediaPopupProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: ProductMedia) => void;
  listMedia: ProductMedia[];
  onSubmit: (data: { type: string; url: string }) => void;
  formData?: { type: string; url: string };
  isView?: boolean;
}

const MediaPopup: React.FC<MediaPopupProps> = ({ 
  open, 
  onClose, 
  onSelect, 
  listMedia, 
  onSubmit, 
  formData, 
  isView = false 
}) => {
  const [media, setMedia] = useState<ProductMedia[]>(listMedia);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [altText, setAltText] = useState('');
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error' 
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formState, setFormState] = useState<{ type: string; url: string }>(formData || {
    type: '',
    url: ''
  });
  const [editingAltTextId, setEditingAltTextId] = useState<number | null>(null);
  const [editingAltTextValue, setEditingAltTextValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [batchUploading, setBatchUploading] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video'>('image'); // Mặc định là image

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Utility functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const generateAltTextFromFilename = (filename: string): string => {
    const fileName = filename.replace(/\.[^/.]+$/, "");
    return fileName.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const resetUploadState = () => {
    setAltText('');
    setUploading(false);
  };

  // API functions
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media?page=${currentPage}`);
      const data: MediaResponse = await response.json();
      
      if (data.success) {
        setMedia(data.data.media);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setSnackbar({ open: true, message: 'Failed to fetch media', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching media', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const finalAltText = altText.trim() || generateAltTextFromFilename(file.name);
      formData.append('altText', finalAltText);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({ open: true, message: 'Tải lên thành công', severity: 'success' });
        fetchMedia();
        resetUploadState();
      } else {
        setSnackbar({ open: true, message: 'Tải lên thất bại', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi tải file lên', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setSnackbar({ 
        open: true, 
        message: 'Chỉ chấp nhận file video', 
        severity: 'error' 
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setSnackbar({ 
        open: true, 
        message: 'File video quá lớn (max 25MB)', 
        severity: 'error' 
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const finalAltText = altText.trim() || generateAltTextFromFilename(file.name);
      formData.append('altText', finalAltText);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({ 
          open: true, 
          message: 'Tải video thành công', 
          severity: 'success' 
        });
        fetchMedia();
        resetUploadState();
      } else {
        setSnackbar({ 
          open: true, 
          message: data.message || 'Tải video thất bại', 
          severity: 'error' 
        });
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Lỗi khi tải video', 
        severity: 'error' 
      });
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/delete?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({ open: true, message: 'Media deleted successfully', severity: 'success' });
        fetchMedia();
      } else {
        setSnackbar({ open: true, message: 'Failed to delete media', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting media', severity: 'error' });
    } finally {
      setDeletingId(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleUpdateAltText = async (id: number, newAltText: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          altText: newAltText
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMedia(prevMedia => 
          prevMedia.map(item => 
            item.id === id ? { ...item, altText: newAltText } : item
          )
        );
        setSnackbar({ open: true, message: 'Cập nhật mô tả thành công', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Cập nhật mô tả thất bại', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật mô tả', severity: 'error' });
    } finally {
      setEditingAltTextId(null);
      setEditingAltTextValue('');
    }
  };

  // Event handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formattedName = generateAltTextFromFilename(file.name);
      setAltText(formattedName);
      handleUpload(file);
    }
  };

  const handleChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formState);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormState(prev => ({
          ...prev,
          url: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      const validFiles = filesArray.filter(file => 
        file.type.startsWith('image/') && file.size <= 25 * 1024 * 1024
      );
      
      if (validFiles.length < filesArray.length) {
        setSnackbar({
          open: true,
          message: `${filesArray.length - validFiles.length} file không hợp lệ đã bị loại bỏ. Chỉ chấp nhận ảnh dưới 25MB.`,
          severity: 'error'
        });
      }
      
      setSelectedFiles(validFiles);
    }
  };

  const handleBatchUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setBatchUploading(true);
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));
      
      try {
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[file.name] || 0;
            if (currentProgress < 90) {
              return { ...prev, [file.name]: currentProgress + 10 };
            }
            return prev;
          });
        }, 200);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('altText', generateAltTextFromFilename(file.name));

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        clearInterval(progressInterval);
        
        if (data.success) {
          successCount++;
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } else {
          failCount++;
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
        }
      } catch (error) {
        failCount++;
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
      }
    }
    
    setSnackbar({ 
      open: true, 
      message: `Đã tải lên ${successCount} trong ${selectedFiles.length} ảnh${failCount > 0 ? `, ${failCount} thất bại` : ''}`, 
      severity: failCount > 0 ? 'error' : 'success'
    });
    
    fetchMedia();
    setBatchUploading(false);
    setSelectedFiles([]);
    setUploadProgress({});
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const isMediaAlreadySelected = (id: number) => {
    return listMedia.some(item => item.id === id);
  };

  const handleMediaTypeChange = (type: 'image' | 'video') => {
    setSelectedMediaType(type);
    setAltText(''); // Reset alt text khi chuyển type
  };

  // Effects
  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open, currentPage]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isView ? 'Xem chi tiết media' : formData ? 'Sửa media' : 'Thêm media mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Loại</InputLabel>
                  <Select
                    name="type"
                    value={formState.type}
                    onChange={handleChange}
                    disabled={isView}
                    label="Loại"
                  >
                    <MenuItem value="image">Hình ảnh</MenuItem>
                    <MenuItem value="video">Video</MenuItem>
                    <MenuItem value="document">Tài liệu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formState.url && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    {formState.type === 'image' && (
                      <img
                        src={formState.url}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: 200,
                          objectFit: 'contain'
                        }}
                      />
                    )}
                    {formState.type === 'video' && (
                      <video
                        controls
                        style={{
                          maxWidth: '100%',
                          maxHeight: 200
                        }}
                      >
                        <source src={formState.url} type="video/mp4" />
                      </video>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Media Type Selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Chọn loại media để upload
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant={selectedMediaType === 'image' ? 'contained' : 'outlined'}
                  onClick={() => handleMediaTypeChange('image')}
                  color="primary"
                >
                  Hình ảnh
                </Button>
                <Button
                  variant={selectedMediaType === 'video' ? 'contained' : 'outlined'}
                  onClick={() => handleMediaTypeChange('video')}
                  color="secondary"
                >
                  Video
                </Button>
              </Box>
            </Box>

            {/* Upload Section - Hiển thị theo loại được chọn */}
            {selectedMediaType === 'image' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Upload Hình ảnh
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    placeholder="Alt Text cho hình ảnh"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    fullWidth   
                    size="small"
                  />
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="upload-image-button"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="upload-image-button">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<IconUpload />}
                      disabled={uploading}
                      color="primary"
                    >
                      {uploading ? <CircularProgress size={20} /> : 'Upload Image'}
                    </Button>
                  </label>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Chấp nhận: JPG, PNG, GIF. Tối đa 5MB
                </Typography>
              </Box>
            )}

            {selectedMediaType === 'video' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Upload Video
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    placeholder="Alt Text cho video"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <input
                    accept="video/*"
                    style={{ display: 'none' }}
                    id="upload-video-button"
                    type="file"
                    onChange={handleVideoUpload}
                  />
                  <label htmlFor="upload-video-button">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<IconUpload />}
                      disabled={uploading}
                      color="secondary"
                    >
                      {uploading ? <CircularProgress size={20} /> : 'Upload Video'}
                    </Button>
                  </label>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Chấp nhận: MP4, AVI, MOV. Tối đa 5MB
                </Typography>
              </Box>
            )}

            {/* Batch Upload Section - Chỉ hiển thị khi chọn image */}
            {selectedMediaType === 'image' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Upload nhiều hình ảnh
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="batch-upload-button"
                    type="file"
                    multiple
                    onChange={handleMultipleFileSelect}
                    ref={fileInputRef}
                  />
                  <label htmlFor="batch-upload-button">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<IconUpload />}
                      disabled={batchUploading}
                      fullWidth
                    >
                      {batchUploading ? <CircularProgress size={20} /> : 'Chọn nhiều ảnh'}
                    </Button>
                  </label>
                  <Button
                    variant="contained"
                    onClick={handleBatchUpload}
                    disabled={batchUploading || selectedFiles.length === 0}
                    fullWidth
                  >
                    {batchUploading ? <CircularProgress size={20} /> : 'Tải lên tất cả'}
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Chọn nhiều file ảnh cùng lúc để tải lên
                </Typography>

                {/* Upload Progress */}
                <Box sx={{ mt: 2 }}>
                  {selectedFiles.map((file) => (
                    <Box key={file.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name} ({formatFileSize(file.size)})
                      </Typography>
                      <Box sx={{ width: '100px', mr: 1 }}>
                        <LinearProgress variant="determinate" value={uploadProgress[file.name] || 0} />
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: '40px', textAlign: 'right' }}>
                        {uploadProgress[file.name] === 100 ? 'Hoàn thành' : 
                         uploadProgress[file.name] === -1 ? 'Thất bại' : 
                         `${uploadProgress[file.name] || 0}%`}
                      </Typography>
                      {!batchUploading && (
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedFiles(prev => prev.filter(f => f !== file));
                          }}
                        >
                          <IconX size={16} />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Media Gallery */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={2}>
                  {media.map((item) => {
                    const isAlreadySelected = isMediaAlreadySelected(item.id);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card 
                          sx={{ 
                            cursor: isAlreadySelected ? 'not-allowed' : 'pointer',
                            position: 'relative',
                            '&:hover': {
                              boxShadow: isAlreadySelected ? 1 : 6,
                            },
                            opacity: isAlreadySelected ? 0.6 : 1,
                          }}
                        >
                          {isAlreadySelected && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                zIndex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="body2" sx={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                                padding: '4px 8px', 
                                borderRadius: '4px' 
                              }}>
                                Already Selected
                              </Typography>
                            </Box>
                          )}
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: 'rgba(255, 0, 0, 0.7)',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 0, 0, 0.9)',
                              },
                              zIndex: 2,
                              width: '36px',
                              height: '36px',
                              boxShadow: '0px 2px 4px rgba(0,0,0,0.3)',
                              border: '2px solid white',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(item.id);
                              setDeleteConfirmOpen(true);
                            }}
                            disabled={deletingId !== null}
                          >
                            {deletingId === item.id ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <IconTrash />
                            )}
                          </IconButton>

                          {/* Hiển thị Media dựa trên type */}
                          {item.type === 'video' ? (
                            <Box
                              sx={{
                                height: 140,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#000',
                                position: 'relative',
                                cursor: isAlreadySelected ? 'not-allowed' : 'pointer'
                              }}
                              onClick={() => {
                                if (!isAlreadySelected) {
                                  onSelect(item);
                                  onClose();
                                }
                              }}
                            >
                              <video
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                                preload="metadata"
                                muted
                              >
                                <source src={`${process.env.NEXT_PUBLIC_API_URL}${item.url}`} />
                              </video>
                              {/* Video play icon overlay */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  width: '40px',
                                  height: '40px',
                                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '20px',
                                  pointerEvents: 'none',
                                }}
                              >
                                ▶
                              </Box>
                            </Box>
                          ) : (
                            <CardMedia
                              component="img"
                              height="140"
                              image={`${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
                              alt={item.altText}
                              onClick={() => {
                                if (!isAlreadySelected) {
                                  onSelect(item);
                                  onClose();
                                }
                              }}
                            />
                          )}

                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                                {item.name}
                              </Typography>
                              {/* Type badge */}
                              <Box
                                sx={{
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: '4px',
                                  backgroundColor: item.type === 'video' ? '#f44336' : '#4caf50',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {item.type}
                              </Box>
                            </Box>
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              {editingAltTextId === item.id ? (
                                <>
                                  <TextField
                                    size="small"
                                    value={editingAltTextValue}
                                    onChange={(e) => setEditingAltTextValue(e.target.value)}
                                    placeholder="Nhập alt text mới"
                                    fullWidth
                                  />
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleUpdateAltText(item.id, editingAltTextValue)}
                                  >
                                    Lưu
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setEditingAltTextId(null)}
                                  >
                                    Hủy
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                                    {item.altText}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setEditingAltTextId(item.id);
                                      setEditingAltTextValue(item.altText ?? '');
                                    }}
                                  >
                                    <IconEdit size={16} />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                    <Button 
                      disabled={currentPage === 1 || loading}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Typography variant="body1" sx={{ mx: 2, display: 'flex', alignItems: 'center' }}>
                      Page {currentPage} of {totalPages}
                    </Typography>
                    <Button 
                      disabled={currentPage === totalPages || loading}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this media item? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => deletingId && handleDelete(deletingId)}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MediaPopup;