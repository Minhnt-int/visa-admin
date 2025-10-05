import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, IconButton, Paper } from '@mui/material';
import { IconTrash } from '@tabler/icons-react';
import { VisaImage } from '@/data/VisaService';

interface VisaImagesFormProps {
    initialData: VisaImage[];
    onChange: (data: VisaImage[]) => void;
}

const VisaImagesForm: React.FC<VisaImagesFormProps> = ({ initialData, onChange }) => {
    const [images, setImages] = useState<VisaImage[]>([]);

    useEffect(() => {
        if (initialData) {
            setImages(initialData);
        }
    }, [initialData]);

    const handleImageChange = (index: number, field: keyof VisaImage, value: string) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], [field]: value };
        setImages(newImages);
        onChange(newImages);
    };

    const addImage = () => {
        const newImages = [...images, { type: '', url: '', description: '' }];
        setImages(newImages);
        onChange(newImages);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onChange(newImages);
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Hình ảnh Visa</Typography>
            {images.map((image, index) => (
                <Paper key={index} elevation={2} sx={{ p: 2, mt: 2, mb: 2, position: 'relative' }}>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            value={image.type}
                            onChange={(e) => handleImageChange(index, 'type', e.target.value)}
                            label="Loại Ảnh"
                            fullWidth
                        />
                        <TextField
                            value={image.url}
                            onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                            label="URL Ảnh"
                            fullWidth
                        />
                        <TextField
                            value={image.description}
                            onChange={(e) => handleImageChange(index, 'description', e.target.value)}
                            label="Mô tả Ảnh"
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>
                    <IconButton
                        onClick={() => removeImage(index)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        color="error"
                    >
                        <IconTrash />
                    </IconButton>
                </Paper>
            ))}
            <Button
                variant="outlined"
                onClick={addImage}
                sx={{ mt: 2 }}
            >
                Thêm Ảnh
            </Button>
        </Paper>
    );
};

export default VisaImagesForm;
