"use client";
import React, { useEffect, useState, useCallback, Suspense } from 'react';
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
  Paper,
  Stack,
  IconButton
} from '@/config/mui';
import { 
  IconEdit, 
  IconTrash, 
  IconEye, 
  IconPlus, 
  IconCircleCheck, 
  IconArrowBackUp 
} from '@tabler/icons-react';
import { BlogPostAttributes } from '@/data/BlogPost';
import { deleteBlog, fetchBlogList } from "@/services/blogService";
import { ActionType, useAppContext } from '@/contexts/AppContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DeleteOutlined } from '@mui/icons-material';
import { EditOutlined } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';
import AddBlogFormPopup from '../popup/AddBlogFormPopup';
import ConfirmPopup from '../popup/ConfirmPopup';

const BlogsTable = ({
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isView, setIsView] = useState(true);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState("");
  const [formData, setFormData] = useState<BlogPostAttributes | null>(null);
  const [currentSlug, setCurrentSlug] = useState<string>('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [Currentpage, setCurrentpage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(1);
  const [data, setData] = useState<BlogPostAttributes[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const {
    selectBlog,
    setCurrentAction,
    changeBlogStatus,
    setSelectedBlogData,
  } = useAppContext();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialFormData: BlogPostAttributes = {
    id: 0,
    title: "",
    content: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    author: "",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    blogCategoryId: 0,
    avatarUrl: "",
    status: "draft"
  }

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleLogSelected = () => {
    console.log(`Selected blogCategory: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = (record: BlogPostAttributes) => {
    setIsView(true);
    setFormData(record);
    setCurrentSlug(record.slug);
    setIsModalOpen(true);
  };

  const handleEdit = (record: BlogPostAttributes) => {
    selectBlog(record, ActionType.EDIT);
    router.push(`/bai-viet/action`);
  }

  const handleAdd = () => {
    setSelectedBlogData(null);
    setCurrentAction(ActionType.CREATE);
    router.push(`/bai-viet/action`);
  };

  const handleDelete = async (record: BlogPostAttributes) => {
    setFormData(record);
    setConfirmingPopup(true);
    setAction("delete");
  };

  const handleSearch = () => {
    fetchData(0, rowsPerPage, searchText, sortField, sortOrder);
  };

  const handleSortChange = (field: string, order: string) => {
    setSortField(field);
    setSortOrder(order as 'ASC' | 'DESC');
    fetchData(1, limit, searchText, field, order);
  };

  const handleLevelUp = async (postId: number, currentStatus: string) => {
    try {
      let nextStatus;
      switch(currentStatus) {
        case 'deleted':
          nextStatus = 'draft';
          break;
        case 'draft':
          nextStatus = 'active';
          break;
        default:
          return;
      }
      await changeBlogStatus(postId, nextStatus);
      await fetchData(Currentpage, limit, searchText, sortField, sortOrder);
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  const handleLevelDown = async (postId: number, currentStatus: string) => {
    try {
      let nextStatus;
      switch(currentStatus) {
        case 'active':
          nextStatus = 'draft';
          break;
        case 'draft':
          nextStatus = 'deleted';
          break;
        default:
          return;
      }
      await changeBlogStatus(postId, nextStatus);
      await fetchData(Currentpage, limit, searchText, sortField, sortOrder);
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'Đã xuất bản';
      case 'draft': return 'Bản nháp';
      case 'deleted': return 'Đã xóa';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'deleted': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 80 },
    { id: 'title', label: 'Tiêu đề', minWidth: 200 },
    { id: 'author', label: 'Tác giả', minWidth: 150 },
    { id: 'blogCategoryId', label: 'Danh mục', minWidth: 120 },
    { id: 'status', label: 'Trạng thái', minWidth: 120 },
    { id: 'publishedAt', label: 'Ngày xuất bản', minWidth: 150 },
    { id: 'createdAt', label: 'Ngày tạo', minWidth: 150 },
    { id: 'updatedAt', label: 'Ngày cập nhật', minWidth: 150 },
    { id: 'actions', label: 'Thao tác', minWidth: 200 }
  ];

  const fetchData = useCallback(async (
    page: number, 
    limit: number, 
    search: string,
    sortBy: string,
    sortOrder: string,
    status?: string
  ) => {
    try {
      const statusParam = status === 'all' ? undefined : status;
      
      const response = await fetchBlogList({
        page: page,
        limit: limit,
        categoryId: '',
        search: search,
        sortBy: sortBy,
        sortOrder: sortOrder,
        status: statusParam
      }) as any;

      setData(response.data);
      setPagination(response.pagination.totalPages);
      setCurrentpage(response.pagination.page);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  const deleteAPI = useCallback(async (record: BlogPostAttributes) => {
    try {
      const response = await deleteBlog(record.id);
      await fetchData(Currentpage, limit, searchText, sortField, sortOrder);
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
    handleModalClose();
  }, [Currentpage, limit, searchText, sortField, sortOrder]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setConfirmingPopup(false);
    setFormData(null);
    setCurrentSlug('');
  };

  useEffect(() => {
    fetchData(Currentpage, limit, searchText, sortField, sortOrder);
  }, [pathname, searchParams, fetchData, Currentpage, limit, sortField, sortOrder]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setCurrentpage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setCurrentpage(1);
  };

  const handleSortFieldChange = (event: SelectChangeEvent) => {
    setSortField(event.target.value);
  };

  const handleSortOrderChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value as 'ASC' | 'DESC');
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    fetchData(1, limit, searchText, sortField, sortOrder, event.target.value);
  };

  const filteredData = data.filter(blog =>
    blog.title.toLowerCase().includes(searchText.toLowerCase())
  ).sort((a, b) => {
    const order = sortOrder === 'ASC' ? 1 : -1;
    if (sortField === 'id') {
      return (a.id - b.id) * order;
    } else if (sortField === 'title') {
      return a.title.localeCompare(b.title) * order;
    } else {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
    }
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Card>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<IconPlus size={16} />}
                  onClick={handleAdd}
                >
                  Thêm bài viết
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Tìm kiếm"
                variant="outlined"
                value={searchText}
                onChange={handleSearchChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sắp xếp theo</InputLabel>
                <Select
                  value={sortField}
                  label="Sắp xếp theo"
                  onChange={handleSortFieldChange}
                >
                  <MenuItem value="id">ID</MenuItem>
                  <MenuItem value="title">Tiêu đề</MenuItem>
                  <MenuItem value="createdAt">Ngày tạo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>  
              <FormControl fullWidth size="small">
                <InputLabel>Thứ tự</InputLabel>
                <Select
                  value={sortOrder}
                  label="Thứ tự"
                  onChange={handleSortOrderChange}
                >
                  <MenuItem value="ASC">Tăng dần</MenuItem>
                  <MenuItem value="DESC">Giảm dần</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Lọc trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Lọc trạng thái"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Đã xuất bản</MenuItem>
                  <MenuItem value="draft">Bản nháp</MenuItem>
                  <MenuItem value="deleted">Đã xóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>


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
                {data.map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      if (column.id === 'actions') {
                        return (
                          <TableCell key={column.id}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={() => handleView(row)}
                                startIcon={<IconEye size={16} />}
                              >
                                Xem
                              </Button>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={() => handleEdit(row)}
                                startIcon={<IconEdit size={16} />}
                              >
                                Sửa
                              </Button>
                              
                              {/* Nút Level Up - Tăng cấp trạng thái */}
                              {row.status !== 'active' && (
                                <Button
                                  variant="outlined"
                                  color="success"
                                  size="small"
                                  onClick={() => handleLevelUp(row.id, row.status)}
                                  startIcon={<IconCircleCheck size={16} />}
                                >
                                  {row.status === 'deleted' ? 'Nháp' : 'Kích hoạt'}
                                </Button>
                              )}
                              
                              {/* Nút Level Down - Giảm cấp trạng thái */}
                              {row.status !== 'deleted' && (
                                <Button
                                  variant="outlined"
                                  color="warning"
                                  size="small"
                                  onClick={() => handleLevelDown(row.id, row.status)}
                                  startIcon={<IconArrowBackUp size={16} />}
                                >
                                  {row.status === 'active' ? 'Nháp' : 'Xóa'}
                                </Button>
                              )}

                              {/* Nút xóa vĩnh viễn khi ở trạng thái deleted */}
                              {row.status === 'deleted' && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleDelete(row)}
                                  startIcon={<IconTrash size={16} />}
                                >
                                  Xóa vĩnh viễn
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        );
                      }
                      const value = row[column.id as keyof BlogPostAttributes];
                      return (
                        <TableCell key={column.id}>
                          {column.id === 'publishedAt' || column.id === 'createdAt' || column.id === 'updatedAt'
                            ? value ? new Date(value).toLocaleString() : ''
                            : column.id === 'status'
                            ? <Chip label={getStatusText(value as string)} color={getStatusColor(value as string)} />
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
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={limit}
            page={Currentpage - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          <AddBlogFormPopup
            open={isModalOpen}
            onClose={handleModalClose}
            onSubmit={() => { }}
            formData={formData || initialFormData}
            isView={isView}
            onChange={() => { }}
            slug={currentSlug}
            categories={[]}
          />
          <ConfirmPopup
            open={ConfirmingPopup}
            onClose={() => setConfirmingPopup(false)}
            onConfirm={() => {
              if (action === "delete" && formData) {
                deleteAPI(formData);
              }
            }}
            title="Xác nhận xóa"
            content="Bạn có chắc chắn muốn thực hiện hành động này?"
          />
        </CardContent>
      </Card>
    </Suspense>
  );
};

export default BlogsTable;
