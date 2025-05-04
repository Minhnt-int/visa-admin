import React, { useEffect, useState, Suspense } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Typography,
  Box,
  TablePagination,
  Stack,
  CircularProgress,
  Chip,
  Button,
  Select,
  MenuItem
} from '@/config/mui';
import { 
  IconEye,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';
import { OrderAttributes } from '@/data/Order';
import { useAppContext } from '@/contexts/AppContext';
import { fetchOrderList, updateOrder } from '@/services/orderService';

const OrderTableContent = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderAttributes[]>([]);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const { selectedOrder, clearSelectedOrder, updateOrder, createOrder, deleteOrder, fetchOrders } = useAppContext();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchOrderList({ page, limit: pageSize });
      const result = response as unknown as {
        data: OrderAttributes[],
        pagination: { total: number }
      };
      if (result && result.data) {
        setOrders(result.data);
        setTotal(result.pagination.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await updateOrder(orderId, { ...order, status });
        setSnackbar({
          open: true,
          message: 'Cập nhật trạng thái thành công',
          severity: 'success'
        });
        fetchData();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Cập nhật trạng thái thất bại',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Button variant="contained" color="primary" onClick={() => console.log(orders)}>Fetch Orders</Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Recipient</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : orders?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1">No orders found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              Array.isArray(orders) ? orders.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.recipientName}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {row.recipientPhone}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.totalAmount?.toLocaleString('vi-VN')} đ</TableCell>
                  <TableCell>
                    <Select
                      value={row.status || ''}
                      onChange={(e) => row.id && handleStatusChange(row.id, e.target.value as string)}
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="pending">Đang chờ</MenuItem>
                      <MenuItem value="processing">Đang xử lý</MenuItem>
                      <MenuItem value="delivered">Hoàn thành</MenuItem>
                      <MenuItem value="cancelled">Đã hủy</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => console.log('View:', row)} size="small" color="primary">
                        <IconEye size={18} />
                      </IconButton>
                      <IconButton onClick={() => console.log('Edit:', row)} size="small" color="primary">
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton onClick={() => console.log('Delete:', row)} size="small" color="error">
                        <IconTrash size={18} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              )) : null
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
        />
      </TableContainer>

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

const OrderTable = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderTableContent />
    </Suspense>
  );
};

export default OrderTable;
