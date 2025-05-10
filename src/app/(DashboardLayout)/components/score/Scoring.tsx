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
import { useAppContext } from '@/contexts/AppContext';

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
  analysis: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

const Scoring: React.FC<ScoringProps> = ({ blogContent, analysis, onLoadingChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { generateAIContent } = useAppContext();

  const analyzeContent = async () => {
    if (!blogContent || blogContent.trim() === '') {
      setLoading(false);
      if (onLoadingChange) {
        onLoadingChange(false);
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    if (onLoadingChange) {
      onLoadingChange(true);
    }
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 - prev) * 0.1;
        return Math.min(newProgress, 95);
      });
    }, 500);
    
    try {
      const result = await generateAIContent(blogContent, 'evaluate');
      
      if (result.data) {
        // No need to set analysis here as it's passed as a prop
      } else {
        setError('Dữ liệu không đúng định dạng');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Không thể kết nối với server. Vui lòng thử lại sau.');
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setLoading(false);
        if (onLoadingChange) {
          onLoadingChange(false);
        }
      }, 500);
    }
  };

  useEffect(() => {
    if (blogContent && blogContent.trim() !== '') {
      analyzeContent();
    } else {
      setLoading(false);
      if (onLoadingChange) {
        onLoadingChange(false);
      }
    }
  }, [blogContent]);

  return (
    <DashboardCard 
      title="Phân tích SEO"
      subtitle={loading ? `Đang phân tích... ${Math.round(progress)}%` : ''}
    >
      {loading ? (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button 
            size="small" 
            variant="outlined" 
            sx={{ ml: 2 }} 
            onClick={analyzeContent}
          >
            Thử lại
          </Button>
        </Alert>
      ) : (
        <Paper elevation={0} sx={{ p: 3, backgroundColor: '#fafafa', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Kết quả phân tích</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
            {analysis || 'Chọn một blog để xem phân tích SEO'}
          </Typography>
        </Paper>
      )}
    </DashboardCard>
  );
};

export default Scoring;