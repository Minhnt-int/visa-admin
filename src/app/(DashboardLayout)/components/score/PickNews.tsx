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
import { NewsAttributes } from '@/data/News';
import NewsService from '@/services/NewsService';

interface PickNewsProps {
  onNewsSelect: (news: NewsAttributes) => void;
  disabled?: boolean;
}

const PickNews: React.FC<PickNewsProps> = ({ onNewsSelect, disabled = false }) => {
  const [news, setNews] = useState<NewsAttributes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedNews, setSelectedNews] = useState<NewsAttributes | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewNews, setViewNews] = useState<NewsAttributes | null>(null);

  const newsService = NewsService;

  const fetchNews = async (pageNumber: number, pageSize: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await newsService.getList({
        page: pageNumber + 1,
        limit: pageSize,
        search: '',
        status: 'active',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      // Check if response has the correct structure
      if (response && response.status === 'success' && response.data) {
        setNews(response.data.data || response.data);
        setTotal(response.data.total || 0);
      } else if (response && response.status === 'fail') {
        setError(response.message || 'Không thể tải danh sách tin tức');
      } else {
        console.log('Unexpected response format:', response);
        setError('Dữ liệu không đúng định dạng'); 
      }
    } catch (err) {
      setError('Không thể tải danh sách tin tức. Vui lòng thử lại sau.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleSelectNews = (newsItem: NewsAttributes) => {
    setSelectedNews(newsItem);
    onNewsSelect(newsItem);
  };

  const handleViewNews = (newsItem: NewsAttributes) => {
    setViewNews(newsItem);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setViewNews(null);
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

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const createExcerpt = (content: string, maxLength: number = 100) => {
    if(!content) return '';
    const plainText = content.replace(/<[^>]*>/g, '') || '';
    if (plainText.length <= maxLength) return plainText;
    return plainText.substr(0, plainText.lastIndexOf(' ', maxLength)) + '...';
  };

  return (
    <DashboardCard title="Chọn Tin Tức để đánh giá">
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
              onClick={() => fetchNews(page, rowsPerPage)}
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
                    <TableCell>Tác giả</TableCell>
                    <TableCell>Ngày đăng</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {news.map((newsItem) => (
                    <TableRow 
                      key={newsItem.id}
                      selected={selectedNews?.id === newsItem.id}
                      hover
                    >
                      <TableCell padding="checkbox">
                        <Radio
                          checked={selectedNews?.id === newsItem.id}
                          onChange={() => handleSelectNews(newsItem)}
                          disabled={disabled}
                        />
                      </TableCell>
                      <TableCell>{newsItem.id}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 'bold' }}>
                          {newsItem.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{createExcerpt(newsItem.content, 150)}</TableCell>
                      <TableCell>{newsItem.author}</TableCell>
                      <TableCell>
                        {newsItem.publishedAt ? formatDate(newsItem.publishedAt) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            onClick={() => handleViewNews(newsItem)}
                            disabled={disabled}
                          >
                            Xem
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleSelectNews(newsItem)}
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

            {/* News View Modal - You can create a separate component for this */}
            {isModalOpen && viewNews && (
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1300,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onClick={handleModalClose}
              >
                <Paper
                  sx={{
                    maxWidth: '80%',
                    maxHeight: '80%',
                    overflow: 'auto',
                    p: 3
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Typography variant="h5" gutterBottom>
                    {viewNews.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tác giả: {viewNews.author} | Ngày đăng: {formatDate(viewNews.publishedAt)}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {viewNews.content.replace(/<[^>]*>/g, '')}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleModalClose}
                    sx={{ mt: 2 }}
                  >
                    Đóng
                  </Button>
                </Paper>
              </Box>
            )}
          </>
        )}
      </>
    </DashboardCard>
  );
};

export default PickNews;
