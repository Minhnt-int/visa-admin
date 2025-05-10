import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  TablePagination,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { BlogPostAttributes } from '@/data/BlogPost';
import { fetchBlogList } from '@/services/blogService';
import AddBlogFormPopup from '../popup/AddBlogFormPopup';
import { BlogCategory } from '@/data/blogCategory';

interface PickBlogProps {
  onBlogSelect: (blog: BlogPostAttributes) => void;
  disabled?: boolean;
}

const PickBlog: React.FC<PickBlogProps> = ({ onBlogSelect, disabled = false }) => {
  const [blogs, setBlogs] = useState<BlogPostAttributes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedBlog, setSelectedBlog] = useState<BlogPostAttributes | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewBlog, setViewBlog] = useState<BlogPostAttributes | null>(null);

  const fetchBlogs = async (pageNumber: number, pageSize: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchBlogList({
        page: pageNumber + 1,
        limit: pageSize,
        categoryId: '',
        search: '',
        sortBy: '',
        sortOrder: '',
      }) as any;

      if (response.data) {
        setBlogs(response.data);
        setTotal(response.pagination.total);
      } else {
        setError('Dữ liệu không đúng định dạng');
      }
    } catch (err) {
      setError('Không thể tải danh sách blog. Vui lòng thử lại sau.');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleSelectBlog = (blog: BlogPostAttributes) => {
    // if (disabled) return;

    setSelectedBlog(blog);
    onBlogSelect(blog);
  };

  const handleViewBlog = (blog: BlogPostAttributes) => {
    setViewBlog(blog);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setViewBlog(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    if (disabled) return;
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const createExcerpt = (content: string, maxLength: number = 100) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substr(0, plainText.lastIndexOf(' ', maxLength)) + '...';
  };

  // Add empty categories array since we're only viewing
  const emptyCategories: BlogCategory[] = [];

  return (
    <DashboardCard title="Chọn Blog để đánh giá">
      <>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button
              size="small"
              variant="outlined"
              sx={{ ml: 2 }}
              onClick={() => fetchBlogs(page, rowsPerPage)}
              disabled={disabled}
            >
              Thử lại
            </Button>
          </Alert>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ width: '90%', margin: '0 auto', maxWidth: '90%' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell>ID</TableCell>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell>Nội dung</TableCell>
                    <TableCell>Danh mục</TableCell>
                    <TableCell>Ngày đăng</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blogs.map((blog) => (
                    <TableRow 
                      key={blog.id}
                      selected={selectedBlog?.id === blog.id}
                      hover
                    >
                      <TableCell padding="checkbox">
                        <Radio
                          checked={selectedBlog?.id === blog.id}
                          onChange={() => handleSelectBlog(blog)}
                          disabled={disabled}
                        />
                      </TableCell>
                      <TableCell>{blog.id}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 'bold' }}>
                          {blog.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{createExcerpt(blog.content, 150)}</TableCell>
                      <TableCell>{blog.blogCategoryId}</TableCell>
                      <TableCell>
                        {blog.publishedAt ? formatDate(blog.publishedAt) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            onClick={() => handleViewBlog(blog)}
                            disabled={disabled}
                          >
                            Xem
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleSelectBlog(blog)}
                            disabled={disabled}
                          >
                            Chọn
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Số hàng mỗi trang"
              />
            </TableContainer>

            <AddBlogFormPopup
              open={isModalOpen}
              isView={true}
              onClose={handleModalClose}
              onSubmit={() => {}}
              formData={viewBlog || {
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
              }}
              onChange={(data) => {}}
              categories={emptyCategories}
            />
          </>
        )}
      </>
    </DashboardCard>
  );
};

export default PickBlog;
