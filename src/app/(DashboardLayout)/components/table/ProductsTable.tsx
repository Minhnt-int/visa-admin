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
  Stack
} from '@/config/mui';
import { 
  IconEye,
  IconEdit,
  IconTrash,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheck,
  IconArrowBackUp,
  IconPlus
} from '@tabler/icons-react';
import ConfirmPopup from '../popup/ConfirmPopup';
import { ProductAttributes } from '@/data/ProductAttributes';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import AddProductFormPopup from '../popup/AddProductFormPopup';
import { createProduct } from '@/services/productService';
import { updateProduct } from '@/services/productService';

const initialFormData: ProductAttributes = {
  id: 0,
  name: "",
  description: "",
  categoryId: 0,
  slug: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  media: [
    {
      id: 0,
      productId: 0,
      url: "https://example.com/image-main.jpg",
      type: "image",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mediaId: 0,
      altText: "",
      name: ''
    }
  ],
  items: [
    {
      id: 0,
      name: "",
      color: "",
      price: 0,
      originalPrice: 0,
      status: "available"
    },
    {
      id: 1,
      name: "",
      color: "",
      price: 0,
      originalPrice: 0,
      status: "available"
    }
  ],
};

const columns = [
  { id: 'id', label: 'ID', minWidth: 80 },
  { id: 'name', label: 'Name', minWidth: 150 },
  { id: 'shortDescription', label: 'Short Description', minWidth: 200 },
  { id: 'categoryId', label: 'Category ID', minWidth: 120 },
  { id: 'slug', label: 'Slug', minWidth: 150 },
  { id: 'items', label: 'Items', minWidth: 300 },
  { id: 'itemsPrice', label: 'Items Price', minWidth: 150 },
  { id: 'actions', label: 'Actions', minWidth: 150 }
];

const ProductsTable: React.FC = () => {
  const { 
    deleteProduct: deleteProductContext, 
    productStatus, 
    toggleProductStatus,
    fetchProducts,
    products: productsContext,
    productsPagination,
    permanentlyDeleteProduct,
    activateProduct,
    restoreProduct,
    selectedProduct,
    setSelectedProduct,
    fetchProductBySlug,
    changeProductStatus
  } = useAppContext();
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isView, setIsView] = useState(false);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState<'create' | 'update' | 'delete' | 'restore' | 'activate'>('create');
  const [formData, setFormData] = useState<ProductAttributes | null>(null);
  const [currentSlug, setCurrentSlug] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleLogSelected = () => {
    console.log(`Selected Products: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = (row: ProductAttributes) => {
    console.log(row);
    setCurrentSlug(row.slug);
    setFormData(row);
    setIsView(true);
    setIsModalOpen(true);
  };

  const handleEdit = (slug: string) => {
    fetchProductBySlug(slug);
    router.push(`/san-pham/action?action=edit&slug=${slug}`);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    router.push('/san-pham/action?action=add');
  };

  const handleDelete = (id: number) => {
    setFormData({ ...initialFormData, id });
    setConfirmingPopup(true);
    setAction('delete');
  };
  
  const executeDelete = async (id: number) => {
    try {
      if (productStatus === 'active' || productStatus === 'draft') {
        const result = await deleteProductContext(id);
        fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
      } else {
        const result = await permanentlyDeleteProduct(id);
        fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleRestore = (id: number) => {
    setFormData({ ...initialFormData, id });
    setConfirmingPopup(true);
    setAction('restore');
  };
  
  const executeRestore = async (id: number) => {
    try {
      const result = await restoreProduct(id);
      if (result) {
        fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
      }
    } catch (error) {
      console.error('Error restoring product:', error);
    }
  };

  const handleActive = (id: number) => {
    setFormData({ ...initialFormData, id });
    setConfirmingPopup(true);
    setAction('activate');
  };
  
  const executeActive = async (id: number) => {
    try {
      const result = await activateProduct(id);
      if (result) {
        fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
      }
    } catch (error) {
      console.error('Error activating product:', error);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchData = async (page: number, limit: number, search: string, sortField: string, sortOrder: string) => {
    try {
      setLoading(true);
      await fetchProducts({
        page,
        limit,
        search,
        sortBy: sortField,
        sortOrder: sortOrder as 'ASC' | 'DESC',
        status: productStatus
      });
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize: limit,
        total: productsPagination.total
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchData(1, pagination.pageSize, searchText, sortField, sortOrder);
  };

  const handleSortChange = (field: string, order: string) => {
    setSortField(field);
    setSortOrder(order);
    fetchData(1, pagination.pageSize, searchText, field, order);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setConfirmingPopup(false);
    setFormData(null);
    setCurrentSlug('');
    setIsView(false);
  };

  const handleChange = (data: { name: string; value: any }) => {
    setFormData(prev => {
      if (!prev) return initialFormData;
      return {
        ...prev,
        [data.name]: data.value
      } as ProductAttributes;
    });
  };

  const handleSubmit = async (data: ProductAttributes) => {
    try {
      if (currentSlug) {
        await updateProduct(data);
        setSnackbar({
          open: true,
          message: 'Cập nhật sản phẩm thành công',
          severity: 'success'
        });
      } else {
        await createProduct(data);
        setSnackbar({
          open: true,
          message: 'Thêm sản phẩm thành công',
          severity: 'success'
        });
      }
      handleModalClose();
      fetchData(1, pagination.pageSize, searchText, sortField, sortOrder);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra',
        severity: 'error'
      });
    }
  };

  const handleModalSubmit = (actionType: string) => {
    setConfirmingPopup(true);
    setAction(actionType as 'create' | 'update' | 'delete' | 'restore' | 'activate');
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize, searchText, sortField, sortOrder);
  }, [productStatus]);

  useEffect(() => {
    if (productsContext) {
      setPagination(prev => ({
        ...prev,
        total: productsPagination.total
      }));
    }
    
  }, [productsContext, productsPagination]);

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<IconPlus />}
              onClick={handleAdd}
            >
              Thêm sản phẩm mới
            </Button>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={productStatus}
                onChange={(e) => toggleProductStatus(e.target.value as 'draft' | 'active' | 'deleted')}
                label="Trạng thái"
              >
                <MenuItem value="draft">Sản phẩm bản nháp</MenuItem>
                <MenuItem value="active">Sản phẩm hoạt động</MenuItem>
                <MenuItem value="deleted">Sản phẩm đã xóa</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Tìm kiếm sản phẩm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              size="small"
              sx={{ width: 200 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Sắp xếp theo</InputLabel>
              <Select
                value={sortField}
                onChange={(e) => handleSortChange(e.target.value, sortOrder)}
                label="Sắp xếp theo"
                size="small"
              >
                <MenuItem value="name">Tên sản phẩm</MenuItem>
                <MenuItem value="price">Giá sản phẩm</MenuItem>
                <MenuItem value="createdAt">Ngày tạo</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Thứ tự</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => handleSortChange(sortField, e.target.value)}
                label="Thứ tự"
                size="small"
              >
                <MenuItem value="ASC">Tăng dần</MenuItem>
                <MenuItem value="DESC">Giảm dần</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {productsContext.map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {columns.map((column) => {
                    if (column.id === 'actions') {
                      return (
                        <TableCell key={column.id}>
                          <Stack direction="row" spacing={1}>
                            <IconButton onClick={() => handleView(row)}>
                              <IconEye size={16} />
                            </IconButton>
                            {productStatus === 'active' && (
                              <>
                                <IconButton onClick={() => handleEdit(row.slug)}>
                                  <IconEdit size={16} />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(row.id)} color="error">
                                  <IconTrash size={16} />
                                </IconButton>
                              </>
                            )}
                            {productStatus === 'draft' && (
                              <>
                                <IconButton onClick={() => handleEdit(row.slug)}>
                                  <IconEdit size={16} />
                                </IconButton>
                                <IconButton onClick={() => handleActive(row.id)} color="success">
                                  <IconCircleCheck size={16} />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(row.id)} color="error">
                                  <IconTrash size={16} />
                                </IconButton>
                              </>
                            )}
                            {productStatus === 'deleted' && (
                              <>
                                <IconButton onClick={() => handleRestore(row.id)} color="info">
                                  <IconArrowBackUp size={16} />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(row.id)} color="error">
                                  <IconTrash size={16} />
                                </IconButton>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      );
                    }
                    const value = row[column.id as keyof ProductAttributes];
                    return (
                      <TableCell key={column.id}>
                        {column.id === 'items' 
                          ? (value as any[])?.map((item: any) => item.name).join(', ')
                          : column.id === 'itemsPrice'
                          ? (value as any[])?.map((item: any) => item.price).join(', ')
                          : String(value)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={productsPagination.total}
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
        />
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
      <AddProductFormPopup
        open={isModalOpen}
        onClose={handleModalClose}
        isView={isView}
        formData={formData || initialFormData}
        onSubmit={handleSubmit}
        onChange={handleChange}
        categories={[]}
      />

      <ConfirmPopup
        open={ConfirmingPopup}
        onClose={() => setConfirmingPopup(false)}
        onConfirm={() => {
          if (action === 'delete' && formData?.id) {
            executeDelete(formData.id);
          } else if (action === 'restore' && formData?.id) {
            executeRestore(formData.id);
          } else if (action === 'activate' && formData?.id) {
            executeActive(formData.id);
          }
          setConfirmingPopup(false);
        }}
        title={
          action === 'delete' ? 'Xác nhận xóa' :
          action === 'restore' ? 'Xác nhận khôi phục' :
          'Xác nhận kích hoạt'
        }
        content={
          action === 'delete' ? 'Bạn có chắc chắn muốn xóa sản phẩm này?' :
          action === 'restore' ? 'Bạn có chắc chắn muốn khôi phục sản phẩm này?' :
          'Bạn có chắc chắn muốn kích hoạt sản phẩm này?'
        }
      />
    </Card>
  );
};
export default ProductsTable;
