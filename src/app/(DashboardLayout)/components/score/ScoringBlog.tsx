import React, { useEffect, useState } from 'react';
import PickNews from './PickNews';
import { NewsAttributes } from '@/data/News';
import Scoring from './Scoring';
import { Box, CircularProgress } from '@mui/material';
import { useAppContext } from '@/contexts/AppContext';

interface ScoringNewsProps {
}

const ScoringNews: React.FC<any> = ({ }) => {
    const { generateAIContent } = useAppContext();

    const [selected, setSelectedNews] = useState<NewsAttributes | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<string>('');
    
    // Reset state when component mounts
    useEffect(() => {
        setSelectedNews(null);
        setAnalysis('');
    }, []);
    
    const onNewsSelect = async (news: NewsAttributes) => {
        setLoading(true);
        try {
            setSelectedNews(news);
            
            if (news?.content) {
                const result = await generateAIContent(news.content, 'evaluate');
                let data = result as any;
                if (data.result) {
                    setAnalysis(data.result);
                }
            }
        } catch (error) {
            console.error('Error in news selection process:', error);
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
            <PickNews 
                onNewsSelect={onNewsSelect} 
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
                newsContent={selected?.content || ''}
                analysis={analysis}
                onLoadingChange={handleLoadingChange}
            />
        </>
    );
};

export default ScoringNews;