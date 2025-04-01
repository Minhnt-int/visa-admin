import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Button,
  Paper
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import axios from 'axios';

// API endpoint - thay đổi URL này theo endpoint thực tế của bạn
const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/ai/chat'; 
const sendContent = {
  "messages": [
    {
      "role": "user",
      "content": "<h1><mark class=pen-red>Búp bê Barbie Cao Cấp – Biểu tượng sắc đẹp và phong cách</mark></h1><h6><br>Búp bê Barbie từ lâu đã trở thành một biểu tượng của sự sáng tạo, phong cách và sự đa dạng. Được thiết kế với chất lượng cao cấp, Barbie không chỉ là món đồ chơi trẻ em, mà còn là một người bạn đồng hành, giúp kích thích trí tưởng tượng và niềm đam mê sáng tạo.</h6><figure class='image image_resized'style=width:45.85%><img height=2048 src=http://localhost:3000/uploads/0109fb62-a4c5-4c0c-8eae-d65df6714141.jpg style=aspect-ratio:1536/2048 width=1536></figure><h2><br>Đặc điểm nổi bật của Búp bê Barbie Cao Cấp</h2><p>Vì sao Búp bê Barbie Cao Cấp là sự lựa chọn hoàn hảo?<br>Không chỉ là một món đồ chơi thông thường, Barbie giúp trẻ rèn luyện sự tự tin và thể hiện bản thân. Với hàng loạt phụ kiện và mẫu mã đa dạng, Barbie mở ra một thế giới đầy màu sắc, nơi bé có thể khám phá phong cách riêng của mình.<br>Hãy để Barbie trở thành người bạn đồng hành đáng yêu của bé! 💖"
    }
  ],
  "systemPrompt": "Bạn là trợ lý ảo của GiftWeb, Hãy đánh giá SEO trang này theo tiêu chuẩn Google (thang điểm 100), gửi lại cho tôi bản chỉnh sửa để tăng điểm SEO. Trả lời bằng tiếng Việt."
};

// Cập nhật hàm stripHtml để bảo toàn xuống dòng
const stripHtml = (html: string) => {
  // Sử dụng textContent thay vì innerText
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || '';
};

const Scoring = () => {
  // States để quản lý dữ liệu và trạng thái
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm gọi API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(API_URL, sendContent);
      console.log('Response:', response.data.data.response.content);
      
      // Kiểm tra và lấy nội dung từ response
      if (response.data.data && response.data.data.response && response.data.data.response.content) {
        setContent(response.data.data.response.content);
      } else {
        setError('Dữ liệu không đúng định dạng');
      }
    } catch (err) {
      setError('Không thể kết nối với server. Vui lòng thử lại sau.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardCard title="Scoring Report">
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
            onClick={fetchData}
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
          <Typography 
            sx={{ 
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap' // Quan trọng: giữ nguyên ký tự xuống dòng khi hiển thị
            }}
          >
            {stripHtml(content)}
          </Typography>
        </Paper>
      )}
    </DashboardCard>
  );
};

export default Scoring;
