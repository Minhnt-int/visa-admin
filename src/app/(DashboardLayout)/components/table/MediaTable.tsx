import React, { useEffect, useState, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Box,
  IconButton,
  Snackbar,
  Alert,
  Typography,
  TablePagination,
  Stack,
  Grid,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@/config/mui';
import {
  IconTrash,
  IconSearch,
  IconPlus,
  IconUpload,
  IconPhoto,
  IconVideo,
  IconEye
} from '@tabler/icons-react';
import ConfirmPopup from '../popup/ConfirmPopup';
import { MediaSummary } from '@/data/Media';
import MediaService from '@/services/MediaService';

const columns = [
  { id: 'id', label: 'ID', minWidth: 80 },
  { id: 'preview', label: 'Preview', minWidth: 100 },
  { id: 'name', label: 'Tên file', minWidth: 200 },
  { id: 'type', label: 'Loại', minWidth: 100 },
  { id: 'altText', label: 'Alt Text', minWidth: 200 },
  { id: 'url', label: 'URL', minWidth: 250 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 120 },
  { id: 'actions', label: 'Hành động', minWidth: 100 }
];

const MediaTable: React.FC = () => {
  const [media, setMedia] = useState<MediaSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<'image' | 'video' | 'all'>('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    media: MediaSummary | null;
  }>({
    open: false,
    media: null
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchData = async (page: number, limit: number, search: string, sortBy: string, order: 'ASC' | 'DESC') => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
        search,
        sortBy,
        sortOrder: order,
      };

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      const result = await MediaService.getAll(params);
      if(!result.data || !Array.isArray(result.data)) {
        setMedia([]);
        return;
      }
      setMedia(result.data);
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize: limit,
        total: result.pagination.total
      }));
    } catch (error) {
      console.error('Error fetching media:', error);
      showSnackbar('Lỗi khi tải dữ liệu media', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchData(1, pagination.pageSize, searchText, sortField, sortOrder);
  };

  const handleSortChange = (field: string, order: 'ASC' | 'DESC') => {
    setSortField(field);
    setSortOrder(order);
    fetchData(1, pagination.pageSize, searchText, field, order);
  };

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showSnackbar('Vui lòng chọn file', 'warning');
      return;
    }

    try {
      setUploading(true);
      const result = await MediaService.upload(selectedFile, altText);
      if (result.success) {
        showSnackbar('Upload thành công', 'success');
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setAltText('');
        fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
      } else {
        showSnackbar(result.error || 'Upload thất bại', 'error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showSnackbar('Có lỗi xảy ra khi upload', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setConfirmingPopup(true);
  };

  const executeDelete = async () => {
    if (!selectedId) return;

    try {
      await MediaService.delete(selectedId);
      showSnackbar('Xóa media thành công', 'success');
      fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
    } catch (error) {
      console.error('Error deleting media:', error);
      showSnackbar('Có lỗi xảy ra', 'error');
    } finally {
      setConfirmingPopup(false);
      setSelectedId(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showSnackbar('Đã copy URL', 'success');
  };

  const handlePreview = (media: MediaSummary) => {
    setPreviewDialog({
      open: true,
      media: media
    });
  };

  const handleClosePreview = () => {
    setPreviewDialog({
      open: false,
      media: null
    });
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize, searchText, sortField, sortOrder);
  }, [typeFilter]);

  return (
    <Card sx={{ boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Quản lý Media
        </Typography>

        {/* Filter and Search Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                startIcon={<IconUpload />}
                onClick={handleUploadClick}
                sx={{
                  background: (theme) => theme.palette.primary.main,
                  '&:hover': {
                    background: (theme) => theme.palette.primary.dark,
                    boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.1)'
                  },
                  borderRadius: '8px',
                  px: 2
                }}
              >
                Upload Media
              </Button>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Loại file</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  label="Loại file"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="image">Hình ảnh</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
            >
              <TextField
                placeholder="Tìm kiếm media..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                size="small"
                sx={{
                  width: { xs: '100%', sm: 200 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={handleSearch}>
                      <IconSearch size={18} />
                    </IconButton>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: { xs: '100%', sm: 120 } }}>
                <InputLabel>Thứ tự</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => handleSortChange(sortField, e.target.value as 'ASC' | 'DESC')}
                  label="Thứ tự"
                  size="small"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="ASC">Cũ nhất</MenuItem>
                  <MenuItem value="DESC">Mới nhất</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 'none',
            border: '1px solid #E0E0E0',
            borderRadius: '10px',
            overflowX: 'auto'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                    sx={{
                      fontWeight: 600,
                      py: 2,
                      color: '#333333'
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                    <Typography>Đang tải dữ liệu...</Typography>
                  </TableCell>
                </TableRow>
              ) : media.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                    <Typography>Không có media nào</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                media.map((row) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.id}
                    sx={{ '&:hover': { backgroundColor: '#F9FAFC' } }}
                  >
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      {row.type === 'image' ? (
                        <Box
                          component="img"
                          src={process.env.NEXT_PUBLIC_API_URL + row.url}
                          alt={row.altText}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                      ) : (
                        <IconVideo size={40} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={row.name}>
                        <Typography noWrap variant="body2" sx={{ maxWidth: 200 }}>
                          {row.name}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={row.type === 'image' ? <IconPhoto size={16} /> : <IconVideo size={16} />}
                        label={row.type === 'image' ? 'Hình ảnh' : 'Video'}
                        color={row.type === 'image' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={row.altText}>
                        <Typography noWrap variant="body2" sx={{ maxWidth: 200 }}>
                          {row.altText || '-'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Click để copy">
                        <Typography
                          noWrap
                          variant="body2"
                          sx={{
                            maxWidth: 250,
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
                          }}
                          onClick={() => handleCopyUrl(row.url)}
                        >
                          {row.url}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{new Date(row.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Xem trước">
                          <IconButton
                            onClick={() => handlePreview(row)}
                            sx={{
                              color: 'primary.main',
                              '&:hover': { backgroundColor: 'primary.light', color: 'primary.dark' }
                            }}
                          >
                            <IconEye size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            onClick={() => handleDelete(row.id)}
                            sx={{
                              color: 'error.main',
                              '&:hover': { backgroundColor: 'error.light', color: 'error.dark' }
                            }}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={pagination.total}
            rowsPerPage={pagination.pageSize}
            page={pagination.current - 1}
            onPageChange={(event, newPage) => {
              setPagination({ ...pagination, current: newPage + 1 });
              fetchData(newPage + 1, pagination.pageSize, searchText, sortField, sortOrder);
            }}
            onRowsPerPageChange={(event) => {
              const newPageSize = parseInt(event.target.value, 10);
              setPagination({ ...pagination, pageSize: newPageSize, current: 1 });
              fetchData(1, newPageSize, searchText, sortField, sortOrder);
            }}
            labelRowsPerPage="Số hàng:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            sx={{
              '.MuiTablePagination-selectLabel, .MuiTablePagination-select, .MuiTablePagination-selectIcon, .MuiTablePagination-displayedRows': {
                fontWeight: 500,
              }
            }}
          />
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Media</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<IconPlus />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
            >
              {selectedFile ? selectedFile.name : 'Chọn file'}
            </Button>
            <TextField
              label="Alt Text (tùy chọn)"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Đang upload...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            {previewDialog.media?.type === 'image' ? <IconPhoto size={24} /> : <IconVideo size={24} />}
            <Typography variant="h6">
              {previewDialog.media?.name}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {previewDialog.media && (
            <Stack spacing={3}>
              {/* Media Preview */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 400,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                {previewDialog.media.type === 'image' ? (
                  <Box
                    component="img"
                    src={process.env.NEXT_PUBLIC_API_URL + previewDialog.media.url}
                    alt={previewDialog.media.altText}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 400,
                      objectFit: 'contain',
                      borderRadius: 1
                    }}
                  />
                ) : (
                  <Box
                    component="video"
                    src={process.env.NEXT_PUBLIC_APP_URL + previewDialog.media.url}
                    controls
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 400,
                      borderRadius: 1
                    }}
                  />
                )}
              </Box>

              {/* Media Info */}
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tên file
                    </Typography>
                    <Typography variant="body1">
                      {previewDialog.media.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Loại
                    </Typography>
                    <Chip
                      icon={previewDialog.media.type === 'image' ? <IconPhoto size={16} /> : <IconVideo size={16} />}
                      label={previewDialog.media.type === 'image' ? 'Hình ảnh' : 'Video'}
                      color={previewDialog.media.type === 'image' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Alt Text
                    </Typography>
                    <Typography variant="body1">
                      {previewDialog.media.altText || 'Không có'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      URL
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        backgroundColor: '#f5f5f5',
                        p: 1,
                        borderRadius: 1
                      }}
                    >
                      {previewDialog.media.url}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClosePreview}>
            Đóng
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (previewDialog.media) {
                handleCopyUrl(previewDialog.media.url);
              }
            }}
          >
            Copy URL
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Popup */}
      <ConfirmPopup
        open={confirmingPopup}
        onClose={() => setConfirmingPopup(false)}
        onConfirm={executeDelete}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa media này? Hành động này không thể hoàn tác."
      />
    </Card>
  );
};

export default MediaTable;

