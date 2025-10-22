import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Chip,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { VisaServiceSummary } from '@/data/VisaService';
import VisaServiceAPI from '@/services/VisaService';
import { useRouter } from 'next/navigation';

const statusColors: { [key: string]: 'success' | 'warning' | 'error' | 'default' } = {
  active: 'success',
  inactive: 'error',
};

const statusLabels: { [key: string]: string } = {
    active: 'Hoạt động',
    inactive: 'Không hoạt động',
  };

const VisaServicesTable: React.FC = () => {
  const router = useRouter();
  const [services, setServices] = useState<VisaServiceSummary[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedService, setSelectedService] = useState<VisaServiceSummary | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permanentlyDeleteDialogOpen, setPermanentlyDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params: any = {
          page: page + 1,
          limit: rowsPerPage,
          search: searchText,
      };
      if (statusFilter !== 'all') {
          params.status = statusFilter;
      } else {
          // Khi chọn "Tất cả", gửi status=all để lấy cả active và inactive
          params.status = 'all';
      }
      const result = await VisaServiceAPI.getAll(params); 
      setServices(result.data);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error("Error fetching visa services:", error);
    }
  }, [page, rowsPerPage, searchText, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchData();
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, service: VisaServiceSummary) => {
    setAnchorEl(event.currentTarget);
    setSelectedService(service);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedService(null);
  };

  const handleEdit = () => {
    if (selectedService) {
        router.push(`/dich-vu-visa/action?slug=${selectedService.slug}`);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedService) {
        // Soft delete: chuyển status sang inactive
        await VisaServiceAPI.changeStatus(selectedService.id, 'inactive');
        fetchData();
    }
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  const handlePermanentlyDelete = async () => {
    if (selectedService) {
        await VisaServiceAPI.permanentlyDelete(selectedService.id);
        fetchData();
    }
    setPermanentlyDeleteDialogOpen(false);
    handleMenuClose();
  };

  const handleRestore = async () => {
    if (selectedService) {
        // Restore: chuyển status về active
        await VisaServiceAPI.changeStatus(selectedService.id, 'active');
        fetchData();
    }
    setRestoreDialogOpen(false);
    handleMenuClose();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };
  
  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value as 'all' | 'active' | 'inactive');
    setPage(0);
  };

  return (
    <Paper>
         <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
                variant="outlined"
                size="small"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchText}
                onChange={handleSearchChange}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
                sx={{ width: '300px' }}
            />
             <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                    value={statusFilter}
                    label="Trạng thái"
                    onChange={handleStatusFilterChange}
                >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="active">Hoạt động</MenuItem>
                    <MenuItem value="inactive">Không hoạt động</MenuItem>
                </Select>
            </FormControl>
            <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => router.push('/dich-vu-visa/action')}
            >
                Thêm mới
            </Button>
        </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên Dịch Vụ</TableCell>
              <TableCell>Quốc Gia</TableCell>
              <TableCell>Tỷ lệ thành công</TableCell>
              <TableCell>Thời gian xử lý</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                    <Typography variant="body2" fontWeight="bold">{service.title}</Typography>
                </TableCell>
                <TableCell>{service.countryName}</TableCell>
                <TableCell>
                    <Chip label={service.successRate || 'N/A'} color="info" size="small" />
                </TableCell>
                <TableCell>{service.processingTime || 'N/A'}</TableCell>
                <TableCell>
                    <Chip 
                        label={statusLabels[service.status] || 'Không xác định'}
                        color={statusColors[service.status] || 'default'}
                        size="small"
                    />
                </TableCell>
                 <TableCell>{new Date(service.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={(event) => handleMenuClick(event, service)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
        >
            {selectedService?.status === 'active' ? (
                [
                    <MenuItem key="edit" onClick={handleEdit}><EditIcon sx={{ mr: 1 }} />Chỉnh sửa</MenuItem>,
                    <MenuItem key="delete" onClick={() => setDeleteDialogOpen(true)}><DeleteIcon sx={{ mr: 1 }} />Chuyển sang Inactive</MenuItem>
                ]
            ) : (
                [
                    <MenuItem key="restore" onClick={() => setRestoreDialogOpen(true)}><RestoreIcon sx={{ mr: 1 }} />Khôi phục</MenuItem>,
                    <MenuItem key="perm-delete" onClick={() => setPermanentlyDeleteDialogOpen(true)}><DeleteIcon sx={{ mr: 1 }} />Xóa vĩnh viễn</MenuItem>
                ]
            )}
        </Menu>

        {/* Action Dialogs */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Xác nhận chuyển sang Inactive</DialogTitle>
            <DialogContent><DialogContentText>Bạn có chắc muốn chuyển dịch vụ này sang trạng thái Inactive không?</DialogContentText></DialogContent>
            <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleDelete} color="warning">Chuyển Inactive</Button>
            </DialogActions>
        </Dialog>

        <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
            <DialogTitle>Xác nhận khôi phục</DialogTitle>
            <DialogContent><DialogContentText>Bạn có chắc muốn khôi phục dịch vụ này không?</DialogContentText></DialogContent>
            <DialogActions>
                <Button onClick={() => setRestoreDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleRestore} color="success">Khôi phục</Button>
            </DialogActions>
        </Dialog>

        <Dialog open={permanentlyDeleteDialogOpen} onClose={() => setPermanentlyDeleteDialogOpen(false)}>
            <DialogTitle>Xác nhận xóa vĩnh viễn</DialogTitle>
            <DialogContent><DialogContentText>Hành động này không thể hoàn tác. Bạn có chắc muốn xóa vĩnh viễn dịch vụ này không?</DialogContentText></DialogContent>
            <DialogActions>
                <Button onClick={() => setPermanentlyDeleteDialogOpen(false)}>Hủy</Button>
                <Button onClick={handlePermanentlyDelete} color="error">Xóa vĩnh viễn</Button>
            </DialogActions>
        </Dialog>
    </Paper>
  );
};

export default VisaServicesTable;
