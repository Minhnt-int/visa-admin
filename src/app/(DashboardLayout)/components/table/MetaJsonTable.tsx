import React, { useEffect, useState, useCallback } from 'react';
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
} from '@/config/mui';
import { 
  IconEye,
  IconEdit,
  IconTrash,
  IconSearch,
  IconPlus,
  IconChevronDown,
  IconChevronUp,
  IconCode
} from '@tabler/icons-react';
import ConfirmPopup from '../popup/ConfirmPopup';
import { useRouter } from 'next/navigation';
import { getAllMetaJsonData, deleteMetaJsonData } from '@/services/SEOService';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
interface MetaJsonAttributes {
  id?: number;
  pageKey: string;
  metaData: {
    title?: string;
    description?: string;
    keywords?: string;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Định nghĩa mẫu meta JSON
const DEFAULT_META_JSON: MetaJsonAttributes = {
  pageKey: "trang-chu",
  metaData: {
    title: "Trang chủ",
    description: "Mô tả trang chủ",
    keywords: "từ khóa, trang chủ"
  }
};

const columns = [
  { id: 'id', label: 'ID', minWidth: 60 },
  { id: 'pageKey', label: 'Page Key', minWidth: 120 },
  { id: 'title', label: 'Title', minWidth: 180 },
  { id: 'metadata', label: 'Meta Data', minWidth: 200 },
  { id: 'createdAt', label: 'Ngày tạo', minWidth: 120 },
  { id: 'actions', label: 'Thao tác', minWidth: 120 }
];

const MetaJsonTable: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<MetaJsonAttributes[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MetaJsonAttributes | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllMetaJsonData();
      if (response && Array.isArray(response)) {
        const filteredData = searchText ? 
          response.filter(item => 
            item.pageKey.toLowerCase().includes(searchText.toLowerCase()) ||
            (item.metaData?.title && item.metaData.title.toLowerCase().includes(searchText.toLowerCase())) ||
            (item.metaData?.description && item.metaData.description.toLowerCase().includes(searchText.toLowerCase())) ||
            (item.metaData?.keywords && item.metaData.keywords.toLowerCase().includes(searchText.toLowerCase()))
          ) : response;
        
        setData(filteredData);
        setPagination(prev => ({
          ...prev,
          total: filteredData.length
        }));
      }
    } catch (error) {
      console.error('Error fetching meta JSON data:', error);
      showSnackbar('Không thể tải dữ liệu Meta JSON', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  const handleDelete = (item: MetaJsonAttributes) => {
    setSelectedItem(item);
    setConfirmPopup(true);
  };

  const executeDelete = async () => {
    if (!selectedItem) return;
    
    try {
      const success = await deleteMetaJsonData(selectedItem.pageKey);
      if (success) {
        showSnackbar('Đã xóa Meta JSON thành công', 'success');
        fetchData();
      } else {
        showSnackbar('Không thể xóa Meta JSON', 'error');
      }
    } catch (error) {
      console.error('Error deleting meta JSON data:', error);
      showSnackbar('Không thể xóa Meta JSON', 'error');
    }
  };

  const handleView = (item: MetaJsonAttributes) => {
    router.push(`/meta-json/action?action=view&pageKey=${item.pageKey}`);
  };

  const handleEdit = (item: MetaJsonAttributes) => {
    router.push(`/meta-json/action?action=edit&pageKey=${item.pageKey}`);
  };

  const handleAdd = () => {
    router.push('/meta-json/action?action=add&template=default');
  };

  const handleSearch = () => {
    fetchData();
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const toggleRowExpand = (rowId: string | number) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayedData = data.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  // Định dạng ngày
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Đếm số lượng trường trong metaData
  const countMetaDataFields = (metaData: Record<string, any>) => {
    return Object.keys(metaData || {}).length;
  };

  // Hiển thị JSON có cấu trúc
  const renderStructuredJson = (json: Record<string, any>) => {
    return (
      <Box sx={{ pl: 2 }}>
        {Object.entries(json).map(([key, value]) => (
          <Box key={key} sx={{ my: 0.5 }}>
            <Typography component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {key}:
            </Typography>{' '}
            <Typography 
              component="span" 
              sx={{ 
                color: typeof value === 'string' ? 'success.main' : 'text.primary',
                fontStyle: typeof value === 'string' ? 'italic' : 'normal'
              }}
            >
              {typeof value === 'object' && value !== null 
                ? 'Đối tượng lồng nhau'
                : String(value)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Card sx={{ boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Quản lý Meta JSON
        </Typography>
        
        {/* Filter and Search Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              startIcon={<IconPlus />}
              onClick={handleAdd}
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
              Thêm Meta JSON mới
            </Button>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
            >
              <TextField
                placeholder="Tìm kiếm theo Page Key, Title, Keywords..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                size="small"
                sx={{ 
                  width: { xs: '100%', sm: 300 },
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
              ) : displayedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                    <Box>
                      <Typography sx={{ mb: 2 }}>Không có dữ liệu Meta JSON</Typography>
                      {/* <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Meta JSON có cấu trúc như sau:
                      </Typography>
                      <Box 
                        sx={{ 
                          p: 2, 
                          bgcolor: '#f9f9f9', 
                          borderRadius: 1, 
                          maxWidth: 400, 
                          margin: '0 auto',
                          fontFamily: 'monospace',
                          textAlign: 'left',
                          fontSize: '0.85rem'
                        }}
                      >
                        {JSON.stringify(DEFAULT_META_JSON, null, 2)}
                      </Box> */}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                displayedData.map((row, index) => (
                  <React.Fragment key={row.id || row.pageKey || index}>
                    <TableRow 
                      hover 
                      role="checkbox" 
                      tabIndex={-1}
                      sx={{ '&:hover': { backgroundColor: '#F9FAFC' } }}
                    >
                      {/* ID */}
                      <TableCell>{row.id || '-'}</TableCell>
                      
                      {/* Page Key */}
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500, 
                            color: 'primary.main'
                          }}
                        >
                          {row.pageKey}
                        </Typography>
                      </TableCell>
                      
                      {/* Title from metaData */}
                      <TableCell>
                        <Tooltip title={row.metaData?.title || 'Không có tiêu đề'}>
                          <Typography noWrap variant="body2">
                            {row.metaData?.title || '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      
                      {/* Meta Data */}
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            size="small" 
                            label={`${countMetaDataFields(row.metaData)} trường`} 
                            color="primary" 
                            variant="outlined"
                          />
                          <IconButton 
                            size="small" 
                            onClick={() => toggleRowExpand(row.id || row.pageKey || index)}
                          >
                            {expandedRows[row.id || row.pageKey || index] ? 
                              <IconChevronUp size={18} /> : 
                              <IconChevronDown size={18} />
                            }
                          </IconButton>
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={() => handleView(row)}
                              sx={{ color: 'info.main' }}
                            >
                              <IconCode size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      
                      {/* Created At */}
                      <TableCell>
                        {formatDate(row.createdAt)}
                      </TableCell>
                      
                      {/* Actions */}
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton 
                            onClick={() => handleView(row)}
                            sx={{ 
                              color: 'info.main',
                              '&:hover': { backgroundColor: 'info.light', color: 'info.dark' }
                            }}
                          >
                            <IconEye size={18} />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleEdit(row)}
                            sx={{ 
                              color: 'primary.main',
                              '&:hover': { backgroundColor: 'primary.light', color: 'primary.dark' }
                            }}
                          >
                            <IconEdit size={18} />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(row)} 
                            sx={{ 
                              color: 'error.main',
                              '&:hover': { backgroundColor: 'error.light', color: 'error.dark' }
                            }}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row - JSON Content */}
                    <TableRow>
                      <TableCell 
                        style={{ paddingBottom: 0, paddingTop: 0 }} 
                        colSpan={columns.length}
                      >
                        <Collapse 
                          in={expandedRows[row.id || row.pageKey || index]} 
                          timeout="auto" 
                          unmountOnExit
                        >
                          <Box sx={{ py: 2, px: 3, backgroundColor: '#F9FAFC' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                              Chi tiết Meta Data:
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            {/* Hiển thị các trường chính trong metaData */}
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Title:</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {row.metaData?.title || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Keywords:</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {row.metaData?.keywords || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  Trường khác:
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {Object.keys(row.metaData || {})
                                    .filter(key => !['title', 'description', 'keywords'].includes(key))
                                    .join(', ') || 'Không có'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Description:</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {row.metaData?.description || '-'}
                                </Typography>
                              </Grid>
                            </Grid>
                            
                            {/* Hiển thị JSON đầy đủ */}
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                JSON đầy đủ:
                              </Typography>
                              <Box sx={{ 
                                p: 2, 
                                mt: 1,
                                bgcolor: '#f0f0f0', 
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                                whiteSpace: 'pre-wrap',
                                overflowX: 'auto'
                              }}>
                                {JSON.stringify(row.metaData, null, 2)}
                              </Box>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
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
            count={data.length}
            rowsPerPage={pagination.pageSize}
            page={pagination.current - 1}
            onPageChange={(event, newPage) => {
              setPagination({ ...pagination, current: newPage + 1 });
            }}
            onRowsPerPageChange={(event) => {
              const newPageSize = parseInt(event.target.value, 10);
              setPagination({ ...pagination, pageSize: newPageSize, current: 1 });
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
      
      {/* Confirm Popup */}
      <ConfirmPopup
        open={confirmPopup}
        onClose={() => setConfirmPopup(false)}
        onConfirm={() => {
          executeDelete();
          setConfirmPopup(false);
        }}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa Meta JSON này?"
      />
    </Card>
  );
};

export default MetaJsonTable;