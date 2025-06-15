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

const MediaPopup: React.FC<MediaPopupProps> = ({ open, onClose, onSelect, listMedia, onSubmit, formData, isView = false }) => {
  const [media, setMedia] = useState<ProductMedia[]>(listMedia);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [altText, setAltText] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formState, setFormState] = useState<{ type: string; url: string }>(formData || {
    type: '',
    url: ''
  });

  // Thêm state để quản lý việc chỉnh sửa altText
  const [editingAltTextId, setEditingAltTextId] = useState<number | null>(null);
  const [editingAltTextValue, setEditingAltTextValue] = useState('');

  // Thêm states mới
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [batchUploading, setBatchUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      console.error('Error fetching media:', error);
      setSnackbar({ open: true, message: 'Error fetching media', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật hàm handleUpload để đảm bảo luôn có altText
  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      // Sử dụng altText hiện tại nếu có, nếu không thì tạo từ tên file
      let finalAltText = altText;
      if (!finalAltText || finalAltText.trim() === '') {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        finalAltText = fileName.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      }
      
      formData.append('altText', finalAltText);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({ open: true, message: 'Tải lên thành công', severity: 'success' });
        fetchMedia();
      } else {
        setSnackbar({ open: true, message: 'Tải lên thất bại', severity: 'error' });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbar({ open: true, message: 'Lỗi khi tải file lên', severity: 'error' });
    } finally {
      setUploading(false);
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
      console.error('Error deleting media:', error);
      setSnackbar({ open: true, message: 'Error deleting media', severity: 'error' });
    } finally {
      setDeletingId(null);
      setDeleteConfirmOpen(false);
    }
  };

  // Thêm function để cập nhật altText
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
        // Cập nhật state local
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
      console.error('Error updating altText:', error);
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật mô tả', severity: 'error' });
    } finally {
      setEditingAltTextId(null);
      setEditingAltTextValue('');
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const isMediaAlreadySelected = (id: number) => {
    return listMedia.some(item => item.id === id);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Tự động tạo alt text từ tên file
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Bỏ phần mở rộng
      const formattedName = fileName
        .replace(/[-_]/g, " ") // Thay thế dấu - và _ bằng khoảng trắng
        .replace(/\b\w/g, (c) => c.toUpperCase()); // Viết hoa chữ cái đầu tiên của mỗi từ
    
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

  // Thêm function xử lý upload nhiều file
  const handleMultipleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      // Chuyển FileList thành mảng
      const filesArray = Array.from(event.target.files);
      
      // Lọc ra các file hợp lệ (chỉ chấp nhận ảnh)
      const validFiles = filesArray.filter(file => 
        file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // Tối đa 5MB
      );
      
      // Nếu có file không hợp lệ
      if (validFiles.length < filesArray.length) {
        setSnackbar({
          open: true,
          message: `${filesArray.length - validFiles.length} file không hợp lệ đã bị loại bỏ. Chỉ chấp nhận ảnh dưới 5MB.`,
          severity: 'error'
        });
      }
      
      // Cập nhật state
      setSelectedFiles(validFiles);
      
      // Log kích thước để debug
      validFiles.forEach(file => {
        console.log(`File: ${file.name}, Size: ${file.size} bytes`);
      });
    }
  };

  const handleBatchUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setBatchUploading(true);
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Cập nhật tiến trình
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));
      
      try {
        // Giả lập tiến trình upload
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[file.name] || 0;
            if (currentProgress < 90) {
              return { ...prev, [file.name]: currentProgress + 10 };
            }
            return prev;
          });
        }, 200);

        // Xử lý upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Tạo alt text từ tên file
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const formattedName = fileName
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        
        formData.append('altText', formattedName);

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
        console.error('Error uploading file:', error);
        failCount++;
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
      }
    }
    
    // Hiển thị kết quả
    setSnackbar({ 
      open: true, 
      message: `Đã tải lên ${successCount} trong ${selectedFiles.length} ảnh${failCount > 0 ? `, ${failCount} thất bại` : ''}`, 
      severity: failCount > 0 ? 'error' : 'success'
    });
    
    // Cập nhật danh sách media
    fetchMedia();
    
    // Reset state
    setBatchUploading(false);
    setSelectedFiles([]);
    setUploadProgress({});
    
    // Reset input để có thể chọn lại file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Thêm hàm này vào component của bạn
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

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

            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Box sx={{ flex: '8 1 0' }}>
                <TextField
                  placeholder="Alt Text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  fullWidth   
                  size="small"
                />
              </Box>
              <Box sx={{ flex: '4 1 0' }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="upload-button"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="upload-button">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<IconUpload />}
                    disabled={uploading}
                    fullWidth
                  >
                    {uploading ? <CircularProgress size={20} /> : 'Upload Media'}
                  </Button>
                </label>
              </Box>
            </Box>

            {/* Phần upload nhiều file */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Upload nhiều file
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
                    {batchUploading ? <CircularProgress size={20} /> : 'Chọn file'}
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

              {/* Hiển thị tiến trình tải lên từng file */}
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
                      {uploadProgress[file.name] === 100 ? 'Hoàn thành' : uploadProgress[file.name] === -1 ? 'Thất bại' : `${uploadProgress[file.name] || 0}%`}
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
                              <Typography variant="body2" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '4px 8px', borderRadius: '4px' }}>
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
                          <CardContent>
                            <Typography variant="body2" color="text.secondary">
                              {item.name}
                            </Typography>
                            {/* Thêm phần chỉnh sửa altText */}
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
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this media item? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteConfirmOpen(false)}
            >
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