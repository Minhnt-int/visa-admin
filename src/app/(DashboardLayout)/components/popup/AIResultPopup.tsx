import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Button,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import axios from 'axios';

// API endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/ai';

// Convert HTML to plain text while preserving line breaks
const stripHtml = (html: string) => {
  if (typeof window === 'undefined') {
    return html.replace(/<[^>]*>?/gm, '');
  }
  
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || '';
};

interface AIResultPopupProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  type: 'product' | 'blog' | 'category';
}

const AIResultPopup: React.FC<AIResultPopupProps> = ({ open, onClose, formData, type }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const fetchData = async () => {
    if (!formData) {
      setContent('');
      return;
    }
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    // Create prompt based on type
    let prompt = '';
    if (type === 'product') {
      prompt = `Hãy giúp tôi tối ưu SEO cho sản phẩm "${formData.name}" với mô tả "${formData.description || ''}". Gợi ý meta title, meta description, meta keywords phù hợp.`;
    } else if (type === 'blog') {
      prompt = `Hãy giúp tôi tối ưu SEO cho bài viết "${formData.title}" với nội dung "${formData.content || ''}". Gợi ý meta title, meta description, meta keywords phù hợp.`;
    } else {
      prompt = `Hãy giúp tôi tối ưu SEO cho danh mục "${formData.name}". Gợi ý meta title, meta description, meta keywords phù hợp.`;
    }

    const sendContent = {
      content: prompt
    };
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 - prev) * 0.1;
        return Math.min(newProgress, 95);
      });
    }, 500);
    
    try {
      const response = await axios.post(API_URL, sendContent);
      
      // Process response
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
      setProgress(100);
      
      // Wait a bit to show 100% before hiding progress bar
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  // Call API when popup opens
  useEffect(() => {
    if (open && formData) {
      fetchData();
    }
  }, [open, formData]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Gợi Ý SEO từ AI</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            {progress < 30 && (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            )}
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
            <Typography 
              sx={{ 
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap'
              }}
            >
              {stripHtml(content) || 'Đang tải gợi ý...'}
            </Typography>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIResultPopup; 