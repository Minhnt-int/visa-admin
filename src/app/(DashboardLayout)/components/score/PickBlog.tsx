import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Stack,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { BlogPostAttributes } from '@/data/BlogPost';

// Interface cho danh mục blog (cần thêm hoặc sửa theo cấu trúc thực tế)
interface BlogCategory {
  id: number;
  name: string;
}

interface PickBlogProps {
  onBlogSelect: (blog: BlogPostAttributes) => void;
}

const PickBlog: React.FC<PickBlogProps> = ({ onBlogSelect }) => {
  // States
  const [blogs, setBlogs] = useState<BlogPostAttributes[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlog, setSelectedBlog] = useState<BlogPostAttributes | null>(null);

  // Số lượng blog mỗi trang
  const blogsPerPage = 8;

  // // Fetch danh mục blog
  // const fetchCategories = async () => {
  //   try {
  //     const response = await axios.get('/api/blog-categories');
  //     if (response.data && response.data.categories) {
  //       setCategories(response.data.categories);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching categories:', err);
  //   }
  // };

  // Hàm fetch danh sách blog
  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/blog/get-list?page=${page}&limit=${blogsPerPage}&search=${searchTerm}`);
      
      if (response.data && response.data.blogs) {
        setBlogs(response.data.blogs);
        setTotalPages(Math.ceil(response.data.total / blogsPerPage));
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

  // Fetch blogs và categories khi component mount
  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [page, searchTerm]);

  // Xử lý thay đổi trang
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  // Xử lý tìm kiếm
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset về trang 1 khi tìm kiếm
  };

  // Xử lý chọn blog
  const handleSelectBlog = (blog: BlogPostAttributes) => {
    setSelectedBlog(blog);
    onBlogSelect(blog);
  };

  // Tìm tên danh mục từ id
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Không có danh mục';
  };

  // Format ngày tháng
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Tạo excerpt từ content
  const createExcerpt = (content: string, maxLength: number = 100) => {
    // Loại bỏ HTML tags
    const plainText = content.replace(/<[^>]*>/g, '');
    
    if (plainText.length <= maxLength) return plainText;
    
    // Cắt đến khoảng trắng gần nhất để không cắt giữa từ
    return plainText.substr(0, plainText.lastIndexOf(' ', maxLength)) + '...';
  };

  return (
    <DashboardCard title="Chọn Blog để đánh giá">
      <>
      {/* Phần tìm kiếm */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm blog..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

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
            onClick={fetchBlogs}
          >
            Thử lại
          </Button>
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {blogs.map((blog) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={blog.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                    border: selectedBlog?.id === blog.id ? '2px solid #3f51b5' : 'none',
                  }}
                  onClick={() => handleSelectBlog(blog)}
                >
                  {/* Thay thế bằng một Card Media mặc định hoặc gradient nếu không có ảnh */}
                  <Box
                    sx={{
                      height: 140,
                      background: 'linear-gradient(135deg, #4527a0 0%, #8e24aa 100%)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white'
                    }}
                  >
                    <Typography variant="h6">{blog.title.charAt(0).toUpperCase()}</Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {blog.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 1
                      }}
                    >
                      {createExcerpt(blog.content)}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      <Chip 
                        label={getCategoryName(blog.blogCategoryId)} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Phân trang */}
          {totalPages > 1 && (
            <Stack spacing={2} alignItems="center" mt={3}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Stack>
          )}
        </>
      )}
      </>
    </DashboardCard>
  );
};

export default PickBlog;