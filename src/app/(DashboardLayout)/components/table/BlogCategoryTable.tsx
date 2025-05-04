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
  Snackbar,
  Alert
} from '@/config/mui';
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { BlogCategory } from '@/data/blogCategory';
import ConfirmPopup from '../popup/ConfirmPopup';
import AddBlogCategoryFormPopup from '../popup/AddBlogCategoryFormPopup';
import { ActionType } from '@/contexts/AppContext';
import BlogCategoryService from '@/services/BlogCategoryService';

interface BlogCategoryTableProps {
  data: BlogCategory[];
  onEdit: (category: BlogCategory) => void;
  onDelete: (id: number) => void;
  onView: (category: BlogCategory) => void;
}

interface ExtendedBlogCategory extends BlogCategory {
  status: 'active' | 'inactive';
}

const BlogCategoryTable = () => {
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [formData, setFormData] = useState<BlogCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentId, setCurrentId] = useState<number | null>(null);
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
    // BlogCategory State
    blogCategories,
    
    setSelectedBlogCategory,

    
    // Shared State
    loading,
    error,
    
    // BlogCategory Actions
    fetchBlogCategories,
    deleteBlogCategory,
    
    // Shared Actions
    setLoadingState,
    setErrorState,
    setCurrentAction,
  } = useAppContext();
  useEffect(() => {
    fetchBlogCategories();
  }, []);
  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleView = async (record: BlogCategory) => {
    setIsModalOpen(true);
    setFormData(record);
    setCurrentId(record.id || null);
  };
  
  const handleEdit = async (record: BlogCategory) => {
    setSelectedBlogCategory(record);
    setCurrentAction(ActionType.EDIT, 'blogCategory', record.id);
    router.push(`/danh-muc-bai-viet/action?id=${record.id}&mode=edit`);
  };

  const handleAdd = () => {
    router.push(`/danh-muc-bai-viet/action?mode=create`);
  };

  const handleDelete = async (record: BlogCategory) => {
    try {
      setFormData(record);
      setConfirmingPopup(true);
    } catch (error) {
      console.error("Error deleting blog category:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete blog category",
        severity: 'error'
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData(null);
    setCurrentId(null);
  };

  const handleSubmit = async (data: BlogCategory) => {
    try {
      if (currentId) {
        await BlogCategoryService.updateCategory(data);
        setSnackbar({
          open: true,
          message: 'Cập nhật danh mục thành công',
          severity: 'success'
        });
      } else {
        await BlogCategoryService.createCategory(data);
        setSnackbar({
          open: true,
          message: 'Thêm danh mục thành công',
          severity: 'success'
        });
      }
      handleModalClose();
      fetchData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra',
        severity: 'error'
      });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = blogCategories?.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (category as ExtendedBlogCategory).status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDeleteCategory = async () => {
    if (formData && formData.id) {
      try {
        await deleteBlogCategory(formData.id);
        setSnackbar({
          open: true,
          message: `Deleted blog category: ${formData.name}`,
          severity: 'success'
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting blog category:', error);
        setSnackbar({
          open: true,
          message: `Failed to delete blog category: ${formData.name}`,
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
    parentId?: number | null;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    try {
      setLoadingState(true);
      await fetchBlogCategories(params);
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
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
  }, []);

  return (
    <Card>
      <CardContent>
        <Button onClick={() => console.log(paginatedData, filteredData)}>Click me</Button>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
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
                <TableCell>Tên danh mục</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <Typography>Đang tải...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginatedData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography>Không có dữ liệu</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: (category as ExtendedBlogCategory).status === 'active' ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {(category as ExtendedBlogCategory).status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleView(category)}
                          startIcon={<IconEye size={16} />}
                        >
                          Xem
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleEdit(category)}
                          startIcon={<IconEdit size={16} />}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(category)}
                          startIcon={<IconTrash size={16} />}
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
          count={filteredData?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
      <AddBlogCategoryFormPopup
        open={isModalOpen}
        onClose={handleModalClose}
        isView={true}
        formData={formData!}
        onSubmit={handleSubmit}
      />
    </Card>
  );
};

export default BlogCategoryTable;
