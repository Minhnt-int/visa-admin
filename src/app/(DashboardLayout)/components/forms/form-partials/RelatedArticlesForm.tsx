import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Paper,
  Grid
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { RelatedArticle } from '@/data/VisaService';

interface RelatedArticlesFormProps {
  initialData: RelatedArticle[];
  onChange: (data: RelatedArticle[]) => void;
}

const RelatedArticlesForm: React.FC<RelatedArticlesFormProps> = ({ initialData: articles, onChange }) => {

  const handleAddArticle = () => {
    const newArticles = [
      ...(articles || []),
      {
        id: `new-article-${Date.now()}`,
        title: '',
        url: '',
        image: '',
      },
    ];
    onChange(newArticles);
  };

  const handleDeleteArticle = (index: number) => {
    const newArticles = (articles || []).filter((_, i) => i !== index);
    onChange(newArticles);
  };

  const handleArticleChange = (index: number, field: keyof RelatedArticle, value: string) => {
    const newArticles = (articles || []).map((article, i) => i === index ? { ...article, [field]: value } : article);
    onChange(newArticles);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Bài viết liên quan</Typography>
      <Grid container spacing={2}>
        {(articles || []).map((article, index) => (
          <Grid item xs={12} key={article.id || index}>
            <Paper sx={{ p: 2, border: '1px solid #ddd' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Tiêu đề bài viết"
                    value={article.title}
                    onChange={(e) => handleArticleChange(index, 'title', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="URL bài viết"
                    value={article.url}
                    onChange={(e) => handleArticleChange(index, 'url', e.target.value)}
                    fullWidth
                  />
                </Grid>
                 <Grid item xs={12} sm={3}>
                  <TextField
                    label="URL Hình ảnh"
                    value={article.image}
                    onChange={(e) => handleArticleChange(index, 'image', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={1} sx={{ textAlign: 'right' }}>
                  <IconButton onClick={() => handleDeleteArticle(index)}><DeleteIcon /></IconButton>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Button startIcon={<AddIcon />} onClick={handleAddArticle} sx={{ mt: 2 }}>Thêm bài viết</Button>
    </Paper>
  );
};

export default RelatedArticlesForm;
