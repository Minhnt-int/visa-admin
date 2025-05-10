import React, { useState, useEffect } from 'react';
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
import { SelectChangeEvent } from '@mui/material';
import { ProductMedia } from '@/data/ProductAttributes';
import { IconTrash, IconUpload, IconX } from '@tabler/icons-react';

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

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', altText);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({ open: true, message: 'Upload successful', severity: 'success' });
        fetchMedia();
      } else {
        setSnackbar({ open: true, message: 'Upload failed', severity: 'error' });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbar({ open: true, message: 'Error uploading file', severity: 'error' });
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
              {/* <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<IconUpload />}
                    disabled={isView}
                  >
                    Tải lên
                    <input
                      type="file"
                      hidden
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                  </Button>
                  {formState.url && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formState.url.substring(0, 30)}...
                      </Typography>
                      {!isView && (
                        <IconButton
                          size="small"
                          onClick={() => setFormState(prev => ({ ...prev, url: '' }))}
                        >
                          <IconX size={16} />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid> */}
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
                    disabled={uploading || altText === ''}
                    fullWidth
                  >
                    {uploading ? <CircularProgress size={20} /> : 'Upload Media'}
                  </Button>
                </label>
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