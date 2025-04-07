import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Button,
  Paper,
  LinearProgress
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import axios from 'axios';

// API endpoint - thay đổi URL này theo endpoint thực tế của bạn
const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/ai'; 

// Cập nhật hàm stripHtml để bảo toàn xuống dòng
const stripHtml = (html: string) => {
  // Sử dụng textContent thay vì innerText
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || '';
};

interface ScoringProps {
  blogContent: string;
  onLoadingChange?: (isLoading: boolean) => void; // Callback để cập nhật loading
}

const Scoring: React.FC<ScoringProps> = ({ blogContent, onLoadingChange }) => {
  // States để quản lý dữ liệu và trạng thái
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // Thêm state để hiển thị tiến trình

  // Hàm gọi API
  const fetchData = async () => {
    if (!blogContent) {
      setContent(''); // Xóa nội dung cũ nếu không có blog content
      return;
    }
    
    setLoading(true);
    setError(null);
    setProgress(0); // Reset progress
    
    // Thông báo cho component cha về trạng thái loading
    if (onLoadingChange) {
      onLoadingChange(true);
    }
    
    const sendContent = {
      content: blogContent + 
      "\nHãy giúp tôi đánh giá SEO của bài viết này với các tiêu chí của Google theo thang điểm 100, gợi ý và gửi lại một bản hoàn thiện để tăng điểm SEO.\n"
    };
    
    // Giả lập tiến trình loading
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 - prev) * 0.1;
        return Math.min(newProgress, 95); // Không đạt 100% cho đến khi thực sự hoàn thành
      });
    }, 500);
    
    try {
      const response = await axios.post(API_URL, sendContent);
      // Kiểm tra và lấy nội dung từ response
      if (response.data && response.data.data && response.data.data.result) {
        setContent(response.data.data.result);
      } else {
        setError('Dữ liệu không đúng định dạng');
      }
    } catch (err) {
      setError('Không thể kết nối với server. Vui lòng thử lại sau.');
      console.error('Error fetching data:', err);
    } finally {
      clearInterval(progressInterval);
      setProgress(100); // Đạt 100% khi hoàn thành
      
      // Đợi một chút để hiển thị 100% trước khi ẩn progress bar
      setTimeout(() => {
        setLoading(false);
        // Thông báo cho component cha về trạng thái loading
        if (onLoadingChange) {
          onLoadingChange(false);
        }
      }, 500);
    }
  };

  // Gọi API khi blogContent thay đổi
  useEffect(() => {
    if (blogContent) {
      fetchData();
    } else {
      // Nếu không có blog content, reset loading state
      setLoading(false);
      if (onLoadingChange) {
        onLoadingChange(false);
      }
    }
  }, [blogContent]); // Thêm blogContent vào dependency array

  return (
    <DashboardCard 
      title="Chấm điểm SEO cho bài viết"
      subtitle={loading ? `Đang phân tích SEO... ${Math.round(progress)}%` : ''}
    >
      <>
      {loading ? (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      ) : null}
      
      {loading && progress < 30 ? (
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
            onClick={() => fetchData()}
          >
            Thử lại
          </Button>
        </Alert>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            backgroundColor: '#fafafa',
            borderRadius: 2,
            minHeight: '200px'
          }}
        >
          {content ? (
            <Typography 
              sx={{ 
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap' // Quan trọng: giữ nguyên ký tự xuống dòng khi hiển thị
              }}
            >
              {stripHtml(content)}
            </Typography>
          ) : (
            <Typography color="text.secondary">
              Chọn một blog để xem đánh giá SEO
            </Typography>
          )}
        </Paper>
      )}
      </>
    </DashboardCard>
  );
};

export default Scoring;