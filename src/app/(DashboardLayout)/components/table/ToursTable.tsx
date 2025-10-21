import React, { useEffect, useState } from 'react';
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
  Chip
} from '@/config/mui';
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconSearch,
  IconCircleCheck,
  IconArrowBackUp,
  IconPlus
} from '@tabler/icons-react';
import ConfirmPopup from '../popup/ConfirmPopup';
import { TourSummary } from '@/data/Tour';
import TourService from '@/services/TourService';
import { useRouter } from 'next/navigation';

const columns = [
  { id: 'id', label: 'ID', minWidth: 80 },
  { id: 'name', label: 'Tên tour', minWidth: 200 },
  { id: 'country', label: 'Quốc gia', minWidth: 120 },
  { id: 'duration', label: 'Thời gian', minWidth: 120 },
  { id: 'price', label: 'Giá', minWidth: 120 },
  { id: 'rating', label: 'Đánh giá', minWidth: 100 },
  { id: 'isHot', label: 'Hot', minWidth: 80 },
  { id: 'status', label: 'Trạng thái', minWidth: 120 },
  { id: 'actions', label: 'Hành động', minWidth: 150 }
];

const ToursTable: React.FC = () => {
  const router = useRouter();
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState<'delete' | 'restore' | 'activate'>('delete');
  const [selectedId, setSelectedId] = useState<number | null>(null);
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

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const result = await TourService.getAll(params);
      setTours(result.data);
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize: limit,
        total: result.pagination.total
      }));
    } catch (error) {
      console.error('Error fetching tours:', error);
      showSnackbar('Lỗi khi tải dữ liệu tour', 'error');
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

  const handleAdd = () => {
    router.push('/tour-du-lich/action?action=add');
  };

  const handleView = (slug: string) => {
    router.push(`/tour-du-lich/action?action=view&slug=${slug}`);
  };

  const handleEdit = (slug: string) => {
    router.push(`/tour-du-lich/action?action=edit&slug=${slug}`);
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setConfirmingPopup(true);
    setAction('delete');
  };

  const handleRestore = (id: number) => {
    setSelectedId(id);
    setConfirmingPopup(true);
    setAction('restore');
  };

  const handleActivate = (id: number) => {
    setSelectedId(id);
    setConfirmingPopup(true);
    setAction('activate');
  };

  const executeAction = async () => {
    if (!selectedId) return;

    try {
      if (action === 'delete') {
        if (statusFilter === 'inactive') {
          // Nếu đang ở trạng thái inactive → xóa vĩnh viễn
          await TourService.permanentlyDelete([selectedId]);
          showSnackbar('Xóa vĩnh viễn tour thành công', 'success');
        } else {
          // Nếu đang ở trạng thái active → chuyển sang inactive (soft delete)
          await TourService.changeStatus(selectedId, 'inactive');
          showSnackbar('Đã chuyển tour sang trạng thái inactive', 'success');
        }
      } else if (action === 'restore') {
        await TourService.changeStatus(selectedId, 'active');
        showSnackbar('Khôi phục tour thành công', 'success');
      } else if (action === 'activate') {
        await TourService.changeStatus(selectedId, 'active');
        showSnackbar('Kích hoạt tour thành công', 'success');
      }
      fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
    } catch (error) {
      console.error('Error executing action:', error);
      showSnackbar('Có lỗi xảy ra', 'error');
    } finally {
      setConfirmingPopup(false);
      setSelectedId(null);
    }
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize, searchText, sortField, sortOrder);
  }, [statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'draft':
        return 'Bản nháp';
      case 'deleted':
        return 'Đã xóa';
      default:
        return status;
    }
  };

  return (
    <Card sx={{ boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Quản lý tour du lịch
        </Typography>

        {/* Filter and Search Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                Thêm tour mới
              </Button>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  label="Trạng thái"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Không hoạt động</MenuItem>
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
                placeholder="Tìm kiếm tour..."
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
              <FormControl sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                <InputLabel>Sắp xếp theo</InputLabel>
                <Select
                  value={sortField}
                  onChange={(e) => handleSortChange(e.target.value, sortOrder)}
                  label="Sắp xếp theo"
                  size="small"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="name">Tên tour</MenuItem>
                  <MenuItem value="price">Giá</MenuItem>
                  <MenuItem value="rating">Đánh giá</MenuItem>
                  <MenuItem value="createdAt">Ngày tạo</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: { xs: '100%', sm: 120 } }}>
                <InputLabel>Thứ tự</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => handleSortChange(sortField, e.target.value as 'ASC' | 'DESC')}
                  label="Thứ tự"
                  size="small"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="ASC">Tăng dần</MenuItem>
                  <MenuItem value="DESC">Giảm dần</MenuItem>
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
              ) : tours.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                    <Typography>Không có tour nào</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tours.map((row) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.id}
                    sx={{ '&:hover': { backgroundColor: '#F9FAFC' } }}
                  >
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Tooltip title={row.name}>
                        <Typography noWrap variant="body2" sx={{ maxWidth: 200 }}>
                          {row.name}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{row.country}</TableCell>
                    <TableCell>{row.duration}</TableCell>
                    <TableCell>{Number(row.price).toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>
                      {row.rating} ⭐ ({row.reviewCount})
                    </TableCell>
                    <TableCell>
                      {row.isHot && <Chip label="HOT" color="error" size="small" />}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(row.status)}
                        color={getStatusColor(row.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => handleView(row.slug)}
                          sx={{
                            color: 'info.main',
                            '&:hover': { backgroundColor: 'info.light', color: 'info.dark' }
                          }}
                        >
                          <IconEye size={18} />
                        </IconButton>

                        {statusFilter === 'active' && (
                          <>
                            <IconButton
                              onClick={() => handleEdit(row.slug)}
                              sx={{
                                color: 'primary.main',
                                '&:hover': { backgroundColor: 'primary.light', color: 'primary.dark' }
                              }}
                            >
                              <IconEdit size={18} />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(row.id)}
                              sx={{
                                color: 'error.main',
                                '&:hover': { backgroundColor: 'error.light', color: 'error.dark' }
                              }}
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          </>
                        )}

                        {statusFilter === 'inactive' && (
                          <>
                            <IconButton
                              onClick={() => handleRestore(row.id)}
                              sx={{
                                color: 'info.main',
                                '&:hover': { backgroundColor: 'info.light', color: 'info.dark' }
                              }}
                            >
                              <IconArrowBackUp size={18} />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(row.id)}
                              sx={{
                                color: 'error.main',
                                '&:hover': { backgroundColor: 'error.light', color: 'error.dark' }
                              }}
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          </>
                        )}
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

      {/* Confirm Popup */}
      <ConfirmPopup
        open={confirmingPopup}
        onClose={() => setConfirmingPopup(false)}
        onConfirm={executeAction}
        title={
          action === 'delete' ? 'Xác nhận xóa' :
            action === 'restore' ? 'Xác nhận khôi phục' :
              'Xác nhận kích hoạt'
        }
        content={
          action === 'delete' ? 'Bạn có chắc chắn muốn xóa tour này?' :
            action === 'restore' ? 'Bạn có chắc chắn muốn khôi phục tour này?' :
              'Bạn có chắc chắn muốn kích hoạt tour này?'
        }
      />
    </Card>
  );
};

export default ToursTable;

