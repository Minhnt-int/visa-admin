import React, { useEffect, useState } from 'react';
import PickBlog from './PickBlog';
import { BlogPostAttributes } from '@/data/BlogPost';
import Scoring from './Scoring';
import { Box, CircularProgress } from '@mui/material';

interface ScoringBlogProps {
}

const ScoringBlog: React.FC<any> = ({ }) => {
    const [selectedBlog, setSelectedBlog] = useState<BlogPostAttributes | null>(null);
    const [refreshKey, setRefreshKey] = useState(0); // State để force re-render Scoring
    const [loading, setLoading] = useState(false); // State để quản lý loading
    
    const onBlogSelect = (blog: BlogPostAttributes) => {
        setLoading(true); // Bắt đầu loading khi chọn blog
        setSelectedBlog(blog);
        setRefreshKey(prevKey => prevKey + 1); // Tăng refreshKey để force re-render Scoring
    };

    // Hàm để cập nhật trạng thái loading từ component con
    const handleLoadingChange = (isLoading: boolean) => {
        setLoading(isLoading);
    };

    return (
        <>
            <PickBlog 
                onBlogSelect={onBlogSelect} 
                disabled={loading} // Disable chọn blog khi đang loading
            />
            
            {/* Hiển thị loading overlay nếu cần */}
            {loading && (
                <Box 
                    sx={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                        zIndex: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <CircularProgress size={60} />
                </Box>
            )}
            
            {/* Sử dụng key để force re-render Scoring khi blog thay đổi */}
            <Scoring 
                key={refreshKey} 
                blogContent={selectedBlog?.content || ''}
                onLoadingChange={handleLoadingChange} // Truyền callback để cập nhật loading
            />
        </>
    );
};

export default ScoringBlog;