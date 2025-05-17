import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Grid, 
  Card, 
  CardContent,
  TablePagination,
  Box,
  Typography,
  Chip,
  Snackbar,
  Alert
} from '@/config/mui';
import { IconEdit, IconTrash, IconEye, IconPlus, IconCircleCheck, IconArrowBackUp } from '@tabler/icons-react';
import { useAppContext } from '@/contexts/AppContext';
import { ProductCategory } from '@/data/ProductCategory';
import { ActionType } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import AddProductCategoryFormPopup from '../popup/AddProductCategoryFormPopup';
import ConfirmPopup from '../popup/ConfirmPopup';
import { changeProductStatus } from '@/services/ProductCategoryService';

const initialFormData: ProductCategory = {
  id: 0,
  name: "",
  parentId: null,
  slug: "",
  description: "",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  avatarUrl: ""
}

const ProductCategoryTable: React.FC = () => {
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const [formData, setFormData] = useState<ProductCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const {
    // ProductCategory State
    productCategories,
    
    // Shared State
    loading,
    
    // ProductCategory Actions
    fetchProductCategories,
    deleteProductCategory,
    
    // Shared Actions
    setLoadingState,
    setErrorState,
    setCurrentAction,
    selectedProductCategory,
    setSelectedProductCategory,
  } = useAppContext();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = productCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleView = (record: ProductCategory) => {
    setFormData(record);
    setIsModalOpen(true);
  };

  const handleEdit = (record: ProductCategory) => {
    setCurrentAction(ActionType.EDIT, 'productCategory', record.id);
    setSelectedProductCategory(record);
    router.push(`/danh-muc-san-pham/action?id=${record.id}&mode=edit`);
  };

  const handleAdd = () => {
    setCurrentAction(ActionType.CREATE, 'productCategory');
    setSelectedProductCategory(null);
    router.push(`/danh-muc-san-pham/action?mode=create`);
  };

  const handleDelete = (record: ProductCategory) => {
    setFormData(record);
    setConfirmingPopup(true);
  };

  const handleChange = (data: { name: string; value: any }) => {
    if (formData) {
      setFormData({
        ...formData,
        [data.name]: data.value
      });
    }
  };
  
  const handleSubmit = () => {
  };

  // Xử lý trạng thái chuyển đổi
  const handleActivate = async (categoryId: number) => {
    try {
      await changeProductStatus(categoryId, 'active');
      setSnackbar({
        open: true,
        message: 'Kích hoạt danh mục thành công',
        severity: 'success'
      });
      fetchData();
    } catch (error) {
      console.error('Error activating category:', error);
      setSnackbar({
        open: true,
        message: 'Kích hoạt danh mục thất bại',
        severity: 'error'
      });
    }
  };

  const handleChangeStatus = async (categoryId: number, newStatus: string) => {
    try {
      await changeProductStatus(categoryId, newStatus);
      setSnackbar({
        open: true,
        message: `Cập nhật trạng thái thành ${newStatus === 'active' ? 'hoạt động' : 'đã xóa'} thành công`,
        severity: 'success'
      });
      fetchData();
    } catch (error) {
      console.error('Error updating category status:', error);
      setSnackbar({
        open: true,
        message: 'Cập nhật trạng thái thất bại',
        severity: 'error'
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (formData && formData.id) {
      try {
        // Nếu trạng thái là deleted, xóa hoàn toàn
        if (formData.status === 'deleted') {
          await deleteProductCategory(formData.id);
          setSnackbar({
            open: true,
            message: `Đã xóa hoàn toàn danh mục "${formData.name}"`,
            severity: 'success'
          });
        } else {
          // Nếu không, chỉ chuyển trạng thái sang deleted
          await changeProductStatus(formData.id, 'deleted');
          setSnackbar({
            open: true,
            message: `Đã chuyển danh mục "${formData.name}" sang trạng thái đã xóa`,
            severity: 'success'
          });
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting/changing status of category:', error);
        setSnackbar({
          open: true,
          message: 'Đã xảy ra lỗi khi xử lý yêu cầu',
          severity: 'error'
        });
      }
      setConfirmingPopup(false);
      setFormData(null);
    }
  };

  const fetchData = async (params?: {
    page?: number;
    limit?: number;
    name?: string;
    status?: string;
    parentId?: number | null;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    try {
      setLoadingState(true);
      // Nếu statusFilter là 'all', không gửi tham số status
      const statusParam = params?.status === 'all' ? undefined : params?.status;
      await fetchProductCategories({
        ...params,
        parentId: params?.parentId ?? undefined, // Ensure parentId is number or undefined
        status: statusParam
      });
      setLoadingState(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorState(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchData({
      page: 1,
      limit: 10,
      status: 'all',  
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
  }, []);

  useEffect(() => {
    fetchData({
      page: page + 1, // Chuyển từ zero-based sang one-based cho API
      limit: rowsPerPage,
      status: statusFilter,
      name: searchTerm || undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
  }, [statusFilter, page, rowsPerPage, searchTerm]);

  // Cập nhật hàm getStatusColor - loại bỏ draft
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  // Cập nhật hàm getStatusLabel - loại bỏ draft
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'deleted':
        return 'Đã xóa';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4} >
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconPlus />}
              onClick={handleAdd}
            >
              Thêm mới
              </Button>
          </Grid> 
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Trạng thái"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="deleted">Đã xóa</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Danh mục cha</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Hình ảnh</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>Đang tải...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>Không có dữ liệu</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>
                      {record.parentId 
                        ? productCategories.find(c => c.id === record.parentId)?.name || `ID: ${record.parentId}` 
                        : 'Không có'}
                    </TableCell>
                    <TableCell>{record.slug}</TableCell>
                    <TableCell>
                      {record.avatarUrl ? (
                        <Box
                          component="img"
                          src={record.avatarUrl}
                          alt={record.name}
                          sx={{ 
                            width: 50, 
                            height: 50, 
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                      ) : (
                        <Box>-</Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            color: record.status === 'active' ? 'success.main' : 'error.main',
                            fontWeight: 'bold',
                            minWidth: 90
                          }}
                        >
                          {getStatusLabel(record.status)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleView(record)}
                          startIcon={<IconEye />}
                        >
                          Xem
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleEdit(record)}
                          startIcon={<IconEdit />}
                        >
                          Sửa
                        </Button>
                        
                        {/* Nút kích hoạt cho danh mục đã xóa */}
                        {record.status === 'deleted' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleChangeStatus(record.id, 'active')}
                            startIcon={<IconCircleCheck />}
                          >
                            Kích hoạt
                          </Button>
                        )}
                        
                        {/* Nút Xóa/Xóa vĩnh viễn */}
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(record)}
                          startIcon={<IconTrash />}
                        >
                          {record.status === 'deleted' ? 'Xóa vĩnh viễn' : 'Xóa'}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count}`
          }
        />

        {formData && (
          <AddProductCategoryFormPopup
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            formData={formData}
            isView={true}
          />
        )}
        <ConfirmPopup
          open={confirmingPopup}
          onClose={() => setConfirmingPopup(false)}
          onConfirm={handleDeleteCategory}
          title={formData?.status === 'deleted' ? "Xác nhận xóa vĩnh viễn" : "Xác nhận chuyển sang trạng thái đã xóa"}
          content={formData?.status === 'deleted' 
            ? `Bạn có chắc chắn muốn xóa vĩnh viễn danh mục "${formData?.name}"? Hành động này không thể hoàn tác.`
            : `Bạn có chắc chắn muốn chuyển danh mục "${formData?.name}" sang trạng thái đã xóa?`}
        />
        
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
      </CardContent>
    </Card>
  );
};

export default ProductCategoryTable;
