import React, { useEffect, useState } from 'react';
import PickBlog from './PickBlog';
import { BlogPostAttributes } from '@/data/BlogPost';
import Scoring from './Scoring';
import { Box, CircularProgress } from '@mui/material';
import { useAppContext } from '@/contexts/AppContext';

interface ScoringBlogProps {
}

const ScoringBlog: React.FC<any> = ({ }) => {
    const { generateAIContent, fetchBlogBySlug, selectedBlog, clearSelectedBlog } = useAppContext();

    const [selected, setSelectedBlog] = useState<BlogPostAttributes | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<string>('');
    
    // Reset state when component mounts
    useEffect(() => {
        setSelectedBlog(null);
        setAnalysis('');
        clearSelectedBlog();
    }, [clearSelectedBlog]);
    
    const onBlogSelect = async (blog: BlogPostAttributes) => {
        setLoading(true);
        try {
            await fetchBlogBySlug(blog.slug);
            setSelectedBlog(selectedBlog);
            
            if (selectedBlog?.content) {
                const result = await generateAIContent(selectedBlog.content, 'evaluate');
                if (result.data?.result) {
                    setAnalysis(result.data.result);
                }
            }
        } catch (error) {
            console.error('Error in blog selection process:', error);
        } finally {
            setLoading(false);
            setRefreshKey(prevKey => prevKey + 1);
        }
    };

    const handleLoadingChange = (isLoading: boolean) => {
        setLoading(isLoading);
    };

    return (
        <>
            <PickBlog 
                onBlogSelect={onBlogSelect} 
                disabled={loading}
            />
            
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
            
            <Scoring 
                key={refreshKey} 
                blogContent={selected?.content || ''}
                analysis={analysis}
                onLoadingChange={handleLoadingChange}
            />
        </>
    );
};

export default ScoringBlog;