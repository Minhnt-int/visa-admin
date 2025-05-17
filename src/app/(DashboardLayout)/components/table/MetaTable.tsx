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
  Tooltip
} from '@/config/mui';
import { 
  IconEye,
  IconEdit,
  IconTrash,
  IconSearch,
  IconPlus
} from '@tabler/icons-react';
import ConfirmPopup from '../popup/ConfirmPopup';
import { useRouter } from 'next/navigation';
import { getAllMetaData, deleteMetaData } from '@/services/SEOService';

interface MetaSEOAttributes {
  id?: number;
  pageKey: string;
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  customHead?: string;
  createdAt?: string;
  updatedAt?: string;
}

const columns = [
  { id: 'id', label: 'ID', minWidth: 80 },
  { id: 'pageKey', label: 'Page Key', minWidth: 150 },
  { id: 'pageUrl', label: 'Page Url', minWidth: 150 },
  { id: 'title', label: 'Title', minWidth: 200 },
  { id: 'description', label: 'Description', minWidth: 250 },
  { id: 'createdAt', label: 'Created At', minWidth: 150 },
  { id: 'actions', label: 'Actions', minWidth: 150 }
];

const MetaTable: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<MetaSEOAttributes[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MetaSEOAttributes | null>(null);
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
      const response = await getAllMetaData(); // Passing '*' to get all meta data
      if (response && Array.isArray(response)) {
        const filteredData = searchText ? 
          response.filter(item => 
            item.pageKey.toLowerCase().includes(searchText.toLowerCase()) ||
            item.title.toLowerCase().includes(searchText.toLowerCase())
          ) : response;
        
        setData(filteredData);
        setPagination(prev => ({
          ...prev,
          total: filteredData.length
        }));
      }
    } catch (error) {
      console.error('Error fetching meta data:', error);
      showSnackbar('Failed to fetch meta data', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  const handleDelete = (item: MetaSEOAttributes) => {
    setSelectedItem(item);
    setConfirmPopup(true);
  };

  const executeDelete = async () => {
    if (!selectedItem) return;
    
    try {
      const success = await deleteMetaData(selectedItem.pageKey);
      if (success) {
        showSnackbar('Meta data deleted successfully', 'success');
        fetchData();
      } else {
        showSnackbar('Failed to delete meta data', 'error');
      }
    } catch (error) {
      console.error('Error deleting meta data:', error);
      showSnackbar('Failed to delete meta data', 'error');
    }
  };

  const handleView = (item: MetaSEOAttributes) => {
    router.push(`/meta/action?action=view&pageKey=${item.pageKey}`);
  };

  const handleEdit = (item: MetaSEOAttributes) => {
    router.push(`/meta/action?action=edit&pageKey=${item.pageKey}`);
  };

  const handleAdd = () => {
    router.push('/meta/action?action=add');
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayedData = data.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  return (
    <Card sx={{ boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Quản lý Meta SEO
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
              Thêm Meta mới
            </Button>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
            >
              <TextField
                placeholder="Tìm kiếm theo Page Key..."
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
                    <Typography>Không có dữ liệu Meta</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayedData.map((row, index) => (
                  <TableRow 
                    hover 
                    role="checkbox" 
                    tabIndex={-1} 
                    key={row.id || index}
                    sx={{ '&:hover': { backgroundColor: '#F9FAFC' } }}
                  >
                    {columns.map((column) => {
                      if (column.id === 'actions') {
                        return (
                          <TableCell key={column.id}>
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
                        );
                      }
                      
                      const value = row[column.id as keyof MetaSEOAttributes];
                      return (
                        <TableCell 
                          key={column.id}
                          sx={{ 
                            py: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '300px'
                          }}
                        >
                          {column.id === 'description' || column.id === 'title' ? (
                            <Tooltip title={String(value || '')}>
                              <Typography noWrap variant="body2">
                                {String(value || '')}
                              </Typography>
                            </Tooltip>
                          ) : column.id === 'createdAt' || column.id === 'updatedAt' ? (
                            value ? new Date(value.toString()).toLocaleString() : ''
                          ) : (
                            String(value || '')
                          )}
                        </TableCell>
                      );
                    })}
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
        content="Bạn có chắc chắn muốn xóa Meta SEO này?"
      />
    </Card>
  );
};

export default MetaTable;