import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
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
  Snackbar,
  Alert
} from '@/config/mui';
import { IconEdit, IconTrash, IconEye, IconPlus, IconCircleCheck } from '@tabler/icons-react';
import { useAppContext } from '@/contexts/AppContext';
import { ProductCategory } from '@/data/ProductCategory';
import { ActionType } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import AddProductCategoryFormPopup from '../popup/AddProductCategoryFormPopup';
import ConfirmPopup from '../popup/ConfirmPopup';
import ApiService from '@/services/ApiService';

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
  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const [formData, setFormData] = useState<ProductCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalCount, setTotalCount] = useState(0);
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
    // Sửa productsTotal thành productsPagination
    productsPagination,
    
    // Shared State
    loading,
    
    // ProductCategory Actions
    fetchProductCategories,
    deleteProductCategory,
    changeProductCategoryStatus, // Thêm dòng này
    
    // Shared Actions
    setLoadingState,
    setErrorState,
    setCurrentAction,
    selectedProductCategory,
    setSelectedProductCategory,
  } = useAppContext();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    // Gọi API khi chuyển trang
    fetchData({
      page: newPage + 1,
      limit: rowsPerPage,
      status: statusFilter === 'all' ? undefined : statusFilter,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // Gọi API khi thay đổi số lượng hàng mỗi trang
    fetchData({
      page: 1,
      limit: newRowsPerPage,
      status: statusFilter === 'all' ? undefined : statusFilter,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(0);
    // Gọi API khi thay đổi bộ lọc trạng thái
    fetchData({
      page: 1,
      limit: rowsPerPage,
      status: newStatus === 'all' ? undefined : newStatus,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
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

  const handleChangeStatus = async (categoryId: number, newStatus: string) => {
    try {
      const success = await changeProductCategoryStatus(categoryId, newStatus);
      if (!success) {
        return;
      }
      
      // Chỉ cần gọi lại API để cập nhật dữ liệu
      fetchData({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
    } catch (error) {
      // Sử dụng ApiService.handleError để xử lý lỗi
      const errorResult = ApiService.handleError(error);
      setSnackbar({
        open: true,
        message: errorResult.message,
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
          await changeProductCategoryStatus(formData.id, 'deleted');
          setSnackbar({
            open: true,
            message: `Đã chuyển danh mục "${formData.name}" sang trạng thái đã xóa`,
            severity: 'success'
          });
        }
        // Gọi lại API để cập nhật dữ liệu
        fetchData({
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter === 'all' ? undefined : statusFilter,
          sortBy: 'createdAt',
          sortOrder: 'DESC'
        });
      } catch (error) {
        // Sử dụng ApiService.handleError để xử lý lỗi
        const errorResult = ApiService.handleError(error);
        setSnackbar({
          open: true,
          message: errorResult.message,
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
      
      // Gọi fetchProductCategories mà không kiểm tra kết quả trả về
      await fetchProductCategories({
        ...params,
        parentId: params?.parentId ?? undefined,
      });
      
      // Sử dụng productsPagination.total thay vì result.totalCount
      if (productsPagination && typeof productsPagination.total === 'number') {
        setTotalCount(productsPagination.total);
      }
    } catch (error) {
      const errorResult = ApiService.handleError(error);
      setSnackbar({
        open: true,
        message: errorResult.message,
        severity: 'error'
      });
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    // Tải dữ liệu ban đầu
    fetchData({
      page: 1,
      limit: rowsPerPage,
      status: statusFilter === 'all' ? undefined : statusFilter,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
    
    // Nếu cần theo dõi thay đổi productsPagination
  }, [productsPagination?.total]);

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

  // Function để tìm tên danh mục cha
  const getParentCategoryName = (parentId: number | null) => {
    if (!parentId) return 'Không có';
    const parent = productCategories.find(cat => cat.id === parentId);
    return parent ? parent.name : `ID: ${parentId}`;
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6} >
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconPlus />}
              onClick={handleAdd}
            >
              Thêm mới
            </Button>
          </Grid> 
          <Grid item xs={12} sm={6} md={6}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
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
              ) : productCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>Không có dữ liệu</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                productCategories.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{getParentCategoryName(record.parentId)}</TableCell>
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
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : 'nhiều hơn ' + to}`
          }
        />

        {formData && (
          <AddProductCategoryFormPopup
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={() => {}}
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
