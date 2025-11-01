"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Grid, Snackbar, Alert } from '@/config/mui';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import NewsForm from '@/app/(DashboardLayout)/components/forms/NewsForm';
import ConfirmPopup from '@/app/(DashboardLayout)/components/popup/ConfirmPopup';
import { useAppContext, ActionType } from '@/contexts/AppContext';
import { NewsAttributes } from '@/data/News';
import { initNewsData } from '@/data/initData';

const NewsActionPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    selectedNews, 
    setSelectedNews,
    loading, 
    error,
    currentAction,
    setCurrentAction
  } = useAppContext();

  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    // Reset selectedNews khi navigate để force reload
    setSelectedNews(null);
    
    // Set action từ URL params nếu chưa có
    const actionFromUrl = searchParams?.get('action');
    const slugFromUrl = searchParams?.get('slug');
    
    if (actionFromUrl) {
      // Chỉ update khi action hoặc slug khác với currentAction
      const shouldUpdate = 
        currentAction.type !== (actionFromUrl === 'edit' ? ActionType.EDIT : 
                               actionFromUrl === 'create' || actionFromUrl === 'add' ? ActionType.CREATE : 
                               ActionType.NONE) ||
        currentAction.slug !== slugFromUrl;
      
      if (shouldUpdate) {
        setCurrentAction(
          actionFromUrl === 'edit' ? ActionType.EDIT : 
          actionFromUrl === 'create' || actionFromUrl === 'add' ? ActionType.CREATE : 
          ActionType.NONE,
          null, // entityType không cần thiết cho news
          actionFromUrl === 'edit' ? undefined : undefined,
          slugFromUrl || undefined
        );
      }
    }
  }, [searchParams, setCurrentAction]);

  const updateNews = async (data: NewsAttributes) => {
    // Implementation for updating news
  };

  const createNews = async (data: NewsAttributes) => {
    // Implementation for creating news
  };

  return (
    <PageContainer title="Tin tức" description="Quản lý tin tức">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <NewsForm 
              action={currentAction.type}
              slug={currentAction.slug} 
            />
            <ConfirmPopup
              open={confirmingPopup}
              onClose={() => setConfirmingPopup(false)}
              onConfirm={async () => {
                if (currentAction.type === ActionType.EDIT) {
                  await updateNews(selectedNews || initNewsData);
                } else if (currentAction.type === ActionType.CREATE) {
                  await createNews(selectedNews || initNewsData);
                } else {
                  setSnackbar({
                    open: true,
                    message: "Có lỗi xảy ra",
                    severity: 'error'
                  });
                }
                setConfirmingPopup(false)
                router.push('/tin-tuc')
              }}
              title="Xác nhận"
              content={currentAction.type === ActionType.EDIT ? "Bạn có chắc chắn muốn lưu tin tức này?" : "Bạn có chắc chắn muốn tạo tin tức mới?"}
            />
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  )
}

export default NewsActionPage;
