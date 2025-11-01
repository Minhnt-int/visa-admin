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
import { NewsSummary } from '@/data/News';
import NewsService from '@/services/NewsService';
import { useRouter } from 'next/navigation';

const columns = [
  { id: 'id', label: 'ID', minWidth: 80 },
  { id: 'title', label: 'Tiêu đề', minWidth: 200 },
  { id: 'author', label: 'Tác giả', minWidth: 120 },
  { id: 'publishedAt', label: 'Ngày xuất bản', minWidth: 120 },
  { id: 'readTime', label: 'Thời gian đọc', minWidth: 100 },
  { id: 'metaKeywords', label: 'Keywords', minWidth: 150 },
  { id: 'status', label: 'Trạng thái', minWidth: 120 },
  { id: 'actions', label: 'Hành động', minWidth: 150 }
];

const NewsTable: React.FC = () => {
  const router = useRouter();
  const [news, setNews] = useState<NewsSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' |'inactive' | 'all'>('active');
  const [sortField, setSortField] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState<'softDelete' | 'hardDelete' | 'restore' | 'activate'>('softDelete');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
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

      const result = await NewsService.getAll(params);
      setNews(result.data.data);
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize: limit,
        total: result.data.total
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      showSnackbar('Lỗi khi tải dữ liệu tin tức', 'error');
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
    router.push('/tin-tuc/action?action=add');
  };

  const handleView = (slug: string) => {
    router.push(`/tin-tuc/action?action=view&slug=${slug}`);
  };

  const handleEdit = (slug: string) => {
    router.push(`/tin-tuc/action?action=edit&slug=${slug}`);
  };

  const handleSoftDelete = (id: number) => {
    setSelectedId(id);
    setSelectedSlug(null);
    setConfirmingPopup(true);
    setAction('softDelete');
  };

  const handleHardDelete = (id: number) => {
    setSelectedId(id);
    setSelectedSlug(null);
    setConfirmingPopup(true);
    setAction('hardDelete');
  };

  const handleRestore = (id: number) => {
    setSelectedId(id);
    setSelectedSlug(null); // Không cần slug cho restore
    setConfirmingPopup(true);
    setAction('restore');
  };

  const handleActivate = (id: number) => {
    setSelectedId(id);
    setSelectedSlug(null); // Không cần slug cho activate
    setConfirmingPopup(true);
    setAction('activate');
  };

  const executeAction = async () => {
    if (!selectedId) return;

    try {
      if (action === 'softDelete') {
        await NewsService.softDelete([selectedId]);
        showSnackbar('Đã chuyển tin tức sang trạng thái inactive', 'success');
      } else if (action === 'hardDelete') {
        await NewsService.delete([selectedId]);
        showSnackbar('Đã xóa tin tức vĩnh viễn', 'success');
      } else if (action === 'restore') {
        await NewsService.changeStatus(selectedId, 'active');
        showSnackbar('Khôi phục tin tức thành công', 'success');
      } else if (action === 'activate') {
        await NewsService.changeStatus(selectedId, 'active');
        showSnackbar('Kích hoạt tin tức thành công', 'success');
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
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đã xuất bản';
      case 'inactive':
        return 'Không hoạt động';
      default:
        return status;
    }
  };

  return (
    <Card sx={{ boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Quản lý tin tức
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
                Thêm tin tức mới
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
                  <MenuItem value="active">Đã xuất bản</MenuItem>
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
                placeholder="Tìm kiếm tin tức..."
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
                  <MenuItem value="title">Tiêu đề</MenuItem>
                  <MenuItem value="publishedAt">Ngày xuất bản</MenuItem>
                  <MenuItem value="author">Tác giả</MenuItem>
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
              ) : news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                    <Typography>Không có tin tức nào</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                news.map((row) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.id}
                    sx={{ '&:hover': { backgroundColor: '#F9FAFC' } }}
                  >
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Tooltip title={row.title}>
                        <Typography noWrap variant="body2" sx={{ maxWidth: 200 }}>
                          {row.title}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{row.author}</TableCell>
                    <TableCell>{row.date || row.publishedAt}</TableCell>
                    <TableCell>{row.readTime} phút</TableCell>
                    <TableCell>
                      <Tooltip title={row.metaKeywords}>
                        <Typography noWrap variant="body2" sx={{ maxWidth: 150 }}>
                          {row.metaKeywords}
                        </Typography>
                      </Tooltip>
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

                        {/* Edit button - luôn hiển thị */}
                        <IconButton
                          onClick={() => handleEdit(row.slug)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': { backgroundColor: 'primary.light', color: 'primary.dark' }
                          }}
                        >
                          <IconEdit size={18} />
                        </IconButton>

                        {/* Buttons dựa trên status của từng item */}
                        {(row.status as string === 'active') ? (
                          // News đang active/published: chỉ có soft delete
                          <IconButton
                            onClick={() => handleSoftDelete(row.id)}
                            sx={{
                              color: 'error.main',
                              '&:hover': { backgroundColor: 'error.light', color: 'error.dark' }
                            }}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        ) : (
                          // News đang inactive: có restore và hard delete
                          <>
                            <IconButton
                              onClick={() => handleActivate(row.id)}
                              sx={{
                                color: 'success.main',
                                '&:hover': { backgroundColor: 'success.light', color: 'success.dark' }
                              }}
                            >
                              <IconArrowBackUp size={18} />
                            </IconButton>
                            <IconButton
                              onClick={() => handleHardDelete(row.id)}
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
          action === 'softDelete' ? 'Xác nhận chuyển sang inactive' :
            action === 'hardDelete' ? 'Xác nhận xóa vĩnh viễn' :
              action === 'restore' ? 'Xác nhận khôi phục' :
                'Xác nhận kích hoạt'
        }
        content={
          action === 'softDelete' ? 'Bạn có chắc chắn muốn chuyển tin tức này sang trạng thái inactive?' :
            action === 'hardDelete' ? 'Bạn có chắc chắn muốn xóa vĩnh viễn tin tức này? Hành động này không thể hoàn tác!' :
              action === 'restore' ? 'Bạn có chắc chắn muốn khôi phục tin tức này?' :
                'Bạn có chắc chắn muốn kích hoạt tin tức này?'
        }
      />
    </Card>
  );
};

export default NewsTable;

