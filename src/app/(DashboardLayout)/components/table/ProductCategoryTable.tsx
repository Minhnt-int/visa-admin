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
  Chip
} from '@/config/mui';
import { IconEdit, IconTrash, IconEye, IconPlus } from '@tabler/icons-react';
import { useAppContext } from '@/contexts/AppContext';
import { ProductCategory } from '@/data/ProductCategory';
import { ActionType } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import AddProductCategoryFormPopup from '../popup/AddProductCategoryFormPopup';
import ConfirmPopup from '../popup/ConfirmPopup';

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
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [formData, setFormData] = useState<ProductCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const handleLogSelected = () => {
    console.log(`Đã chọn danh mục: ${selectedRowKeys.join(', ')}`);
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

  const handleDeleteCategory = async () => {
    if (formData && formData.id) {
      try {
        await deleteProductCategory(formData.id);
        fetchProductCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
      setConfirmingPopup(false);
      setFormData(null);
    }
  };

  useEffect(() => {
    fetchProductCategories();
  }, []);

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
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
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
                <MenuItem value="inactive">Không hoạt động</MenuItem>
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
                      <Chip
                        label={getStatusLabel(record.status)}
                        color={getStatusColor(record.status)}
                        size="small"
                      />
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
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(record)}
                          startIcon={<IconTrash />}
                        >
                          Xóa
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
          open={ConfirmingPopup}
          onClose={() => setConfirmingPopup(false)}
          onConfirm={handleDeleteCategory}
          title="Xác nhận xóa"
          content={`Bạn có chắc chắn muốn xóa danh mục "${formData?.name}"?`}
        />
      </CardContent>
      </Card>
  );
};

export default ProductCategoryTable;
