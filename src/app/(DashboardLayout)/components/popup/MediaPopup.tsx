import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Card, CardMedia, CardContent, Typography, Box, CircularProgress, IconButton, DialogContentText } from '@mui/material';
import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { message } from 'antd';
import DeleteIcon from '@mui/icons-material/Delete';

interface MediaItem {
  id: number;
  name: string;
  path: string;
  type: string;
  altText: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaResponse {
  success: boolean;
  data: {
    media: MediaItem[];
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
  onSelect: (path: string) => void;
}

const MediaPopup: React.FC<MediaPopupProps> = ({ open, onClose, onSelect }) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media?page=${currentPage}`);
      const data: MediaResponse = await response.json();
      
      if (data.success) {
        setMedia(data.data.media);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        message.error('Failed to fetch media');
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      message.error('Error fetching media');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', file.name);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        message.success('Upload successful');
        fetchMedia();
      } else {
        message.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        message.success('Media deleted successfully');
        fetchMedia();
      } else {
        message.error('Failed to delete media');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      message.error('Error deleting media');
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Media Library</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Upload
            beforeUpload={(file) => {
              handleUpload(file);
              return false;
            }}
            showUploadList={false}
          >
            <Button
              variant="outlined"
              startIcon={<UploadOutlined />}
              disabled={uploading}
            >
              {uploading ? <CircularProgress size={20} /> : 'Upload Media'}
            </Button>
          </Upload>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {media.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: 6,
                      }
                    }}
                  >
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(item.id);
                        setDeleteConfirmOpen(true);
                      }}
                      disabled={deletingId !== null}
                    >
                      {deletingId === item.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DeleteIcon color="error" />
                      )}
                    </IconButton>
                    <CardMedia
                      component="img"
                      height="140"
                      image={`${process.env.NEXT_PUBLIC_API_URL}${item.path}`}
                      alt={item.altText}
                      onClick={() => {
                        onSelect(item.path);
                        onClose();
                      }}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {item.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
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
  );
};

export default MediaPopup; 