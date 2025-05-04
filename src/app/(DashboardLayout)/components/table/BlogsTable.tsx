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
import { IconEdit, IconTrash, IconEye, IconPlus } from '@tabler/icons-react';
import { BlogPostAttributes } from '@/data/BlogPost';
import { deleteBlog, fetchBlogList } from "@/services/blogService";
import { ActionType, useAppContext } from '@/contexts/AppContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DeleteOutlined } from '@mui/icons-material';
import { EditOutlined } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';
import AddBlogFormPopup from '../popup/AddBlogFormPopup';
import ConfirmPopup from '../popup/ConfirmPopup';

const BlogsTable= ({ 
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
  const { 
    selectBlog,
    setCurrentAction
  } = useAppContext();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialFormData : BlogPostAttributes = {
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

  const columns = [
    { id: 'id', label: 'ID', minWidth: 80 },
    { id: 'title', label: 'Title', minWidth: 200 },
    { id: 'author', label: 'Author', minWidth: 150 },
    { id: 'blogCategoryId', label: 'Category ID', minWidth: 120 },
    { id: 'publishedAt', label: 'Published At', minWidth: 150 },
    { id: 'createdAt', label: 'Created At', minWidth: 150 },
    { id: 'updatedAt', label: 'Updated At', minWidth: 150 },
    { id: 'actions', label: 'Actions', minWidth: 150 }
  ];

  const fetchData = useCallback(async (page: number, limit: number, search: string,
    sortBy: string,
    sortOrder: string) => {
    try {
      const response = await fetchBlogList({
        page: page,
        limit: limit,
        categoryId: '',
        search: search,
        sortBy: sortBy,
        sortOrder: sortOrder,
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
      console.log(`Deleted blog: ${record.id}`);
    } catch (error) {
      console.error('Error deleting blog:', error);
      console.error(`Failed to delete blog: ${record.id}`);
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
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              variant="outlined"
              value={searchText}
              onChange={handleSearchChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
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
          <Grid item xs={12} sm={4}>
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
        </Grid>

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
                          <Stack direction="row" spacing={1}>
                            <IconButton onClick={() => handleView(row)}>
                              <IconEye size={16} />
                            </IconButton>
                            <IconButton onClick={() => handleEdit(row)} color="error">
                              <IconEdit size={16} />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(row)} color="error">
                              <IconTrash size={16} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      );
                    }
                    const value = row[column.id as keyof BlogPostAttributes];
                    return (
                      <TableCell key={column.id}>
                        {column.id === 'publishedAt' || column.id === 'createdAt' || column.id === 'updatedAt'
                          ? value ? new Date(value).toLocaleString() : ''
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
          onSubmit={() => {}}
          formData={formData || initialFormData}
          isView={isView}
          onChange={() => {}}
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
