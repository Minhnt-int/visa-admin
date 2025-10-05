import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Paper,
  Grid,
  Rating
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Testimonial } from '@/data/VisaService';

interface TestimonialsFormProps {
  initialData: Testimonial[];
  onChange: (data: Testimonial[]) => void;
}

const TestimonialsForm: React.FC<TestimonialsFormProps> = ({ initialData: testimonials, onChange }) => {

  const handleAddTestimonial = () => {
    const newTestimonials = [
      ...(testimonials || []),
      {
        id: `new-testimonial-${Date.now()}`,
        name: '',
        quote: '',
        rating: 5,
        image: '',
      },
    ];
    onChange(newTestimonials);
  };

  const handleDeleteTestimonial = (index: number) => {
    const newTestimonials = (testimonials || []).filter((_, i) => i !== index);
    onChange(newTestimonials);
  };

  const handleTestimonialChange = (index: number, field: keyof Testimonial, value: any) => {
    const newTestimonials = (testimonials || []).map((t, i) => i === index ? { ...t, [field]: value } : t);
    onChange(newTestimonials);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Đánh giá của khách hàng</Typography>
      <Grid container spacing={2}>
        {(testimonials || []).map((testimonial, index) => (
          <Grid item xs={12} key={testimonial.id || index}>
            <Paper sx={{ p: 2, border: '1px solid #ddd' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tên khách hàng"
                    value={testimonial.name}
                    onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="URL Ảnh đại diện"
                    value={testimonial.image}
                    onChange={(e) => handleTestimonialChange(index, 'image', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                   <TextField
                    label="Nội dung đánh giá"
                    value={testimonial.quote}
                    onChange={(e) => handleTestimonialChange(index, 'quote', e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={10}>
                    <Rating 
                        name={`rating-${index}`}
                        value={testimonial.rating} 
                        onChange={(event, newValue) => {
                            handleTestimonialChange(index, 'rating', newValue);
                        }}
                    />
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <IconButton onClick={() => handleDeleteTestimonial(index)}><DeleteIcon /></IconButton>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Button startIcon={<AddIcon />} onClick={handleAddTestimonial} sx={{ mt: 2 }}>Thêm đánh giá</Button>
    </Paper>
  );
};

export default TestimonialsForm;
