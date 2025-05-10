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
  Alert,
  Stack,
  IconButton
} from '@/config/mui';
import { IconEdit, IconTrash, IconEye, IconCircleCheck, IconArrowBackUp } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { BlogCategory, BlogStatus } from '@/data/blogCategory';
import ConfirmPopup from '../popup/ConfirmPopup';
import AddBlogCategoryFormPopup from '../popup/AddBlogCategoryFormPopup';
import { ActionType } from '@/contexts/AppContext';
import BlogCategoryService from '@/services/BlogCategoryService';
import { IconPlus } from '@tabler/icons-react';

interface BlogCategoryTableProps {
  data: BlogCategory[];
  onEdit: (category: BlogCategory) => void;
  onDelete: (id: number) => void;
  onView: (category: BlogCategory) => void;
}

interface ExtendedBlogCategory extends BlogCategory {
  status: typeof BlogStatus[keyof typeof BlogStatus];
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

    // Thêm function này
    changeBlogCategoryStatus
  } = useAppContext();
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

  const handleActivate = async (categoryId: number) => {
    try {
      await changeBlogCategoryStatus(categoryId, 'active');
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

  const handleDeactivate = async (categoryId: number) => {
    try {
      await changeBlogCategoryStatus(categoryId, 'draft');
      setSnackbar({
        open: true,
        message: 'Chuyển danh mục sang bản nháp thành công',
        severity: 'success'
      });
      fetchData();
    } catch (error) {
      console.error('Error deactivating category:', error);
      setSnackbar({
        open: true,
        message: 'Chuyển danh mục sang bản nháp thất bại',
        severity: 'error'
      });
    }
  };

  const handleRestore = async (categoryId: number) => {
    try {
      await changeBlogCategoryStatus(categoryId, 'active');
      setSnackbar({
        open: true,
        message: 'Khôi phục danh mục thành công',
        severity: 'success'
      });
      fetchData();
    } catch (error) {
      console.error('Error restoring category:', error);
      setSnackbar({
        open: true,
        message: 'Khôi phục danh mục thất bại',
        severity: 'error'
      });
    }
  };

  const handleLevelUp = async (categoryId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'deleted' ? 'draft' : 'active';
      await changeBlogCategoryStatus(categoryId, newStatus);
      setSnackbar({
        open: true,
        message: 'Cập nhật trạng thái thành công',
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

  const handleLevelDown = async (categoryId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'draft' : 'deleted';
      await changeBlogCategoryStatus(categoryId, newStatus);
      setSnackbar({
        open: true,
        message: 'Cập nhật trạng thái thành công',
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
    status?: string;
    parentId?: number | null;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    try {
      setLoadingState(true);
      // Nếu statusFilter là 'all', không gửi tham số status
      const statusParam = params?.status === 'all' ? undefined : params?.status;
      await fetchBlogCategories({
        ...params,
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

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<IconPlus />}
                      onClick={handleAdd} 
                    >
                      Thêm danh mục bài viết
              </Button>
                  </Stack>
                </Box>
        </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              variant="outlined"
              value={searchTerm}    
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {Object.entries(BlogStatus).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value}
                  </MenuItem>
                ))}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            color: (category as ExtendedBlogCategory).status === 'active' ? 'success.main' : 
                                   (category as ExtendedBlogCategory).status === 'draft' ? 'warning.main' : 'error.main',
                            fontWeight: 'bold',
                            minWidth: 90
                          }}
                        >
                          {(category as ExtendedBlogCategory).status === 'active' ? 'Hoạt động' : 
                           (category as ExtendedBlogCategory).status === 'draft' ? 'Bản nháp' : 
                           (category as ExtendedBlogCategory).status === 'deleted' ? 'Đã xóa' : 'Không xác định'}
                        </Typography>
                      </Box>
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
                        
                        {/* Nút Level Up - Tăng cấp trạng thái */}
                        {(category as ExtendedBlogCategory).status !== 'active' && (
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => handleLevelUp(category.id, (category as ExtendedBlogCategory).status)}
                            startIcon={<IconCircleCheck size={16} />}
                          >
                            {(category as ExtendedBlogCategory).status === 'deleted' ? 'Nháp' : 'Kích hoạt'}
                          </Button>
                        )}
                        
                        {/* Nút Level Down - Giảm cấp trạng thái */}
                        {(category as ExtendedBlogCategory).status !== 'deleted' && (
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            onClick={() => handleLevelDown(category.id, (category as ExtendedBlogCategory).status)}
                            startIcon={<IconArrowBackUp size={16} />}
                          >
                            {(category as ExtendedBlogCategory).status === 'active' ? 'Nháp' : 'Xóa'}
                          </Button>
                        )}
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
