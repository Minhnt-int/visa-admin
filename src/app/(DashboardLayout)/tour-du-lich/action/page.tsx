"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Grid, Snackbar, Alert } from '@/config/mui';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import TourForm from '../../components/forms/TourForm';
import ConfirmPopup from '@/app/(DashboardLayout)/components/popup/ConfirmPopup';
import { useAppContext, ActionType } from '@/contexts/AppContext';
import { TourFormData } from '@/data/Tour';
import { initTourData } from '@/data/initData';

const TourActionPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    selectedTour, 
    loading, 
    error,
    currentAction,
    setCurrentAction
  } = useAppContext();

  const [formData, setFormData] = useState<TourFormData>(initTourData);
  const [confirmingPopup, setConfirmingPopup] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Helper function để load tour data từ URL params
  const loadTourFromParams = () => {
    const id = searchParams?.get('id');
    const slug = searchParams?.get('slug');
    
    if (id || slug) {
      // Tạo formData với slug từ URL để TourForm có thể gọi API
      const formDataWithSlug: TourFormData = {
        ...initTourData,
        slug: slug || `tour-${id}`,
        // Để trống các field khác để TourForm load từ API
        name: '',
        country: '',
        duration: '',
        price: 0,
        originalPrice: 0,
        rating: 0,
        reviewCount: 0,
        isHot: false,
        departure: [],
        metaTitle: '',
        metaDescription: '',
        metaKeywords: ''
      };
      setFormData(formDataWithSlug);
      return true;
    }
    return false;
  };

  useEffect(() => {
    
    // Set action từ URL params nếu chưa có
    const actionFromUrl = searchParams?.get('action');
    if (actionFromUrl && currentAction.type === ActionType.NONE) {
      setCurrentAction(
        actionFromUrl === 'edit' ? ActionType.EDIT : 
        actionFromUrl === 'create' || actionFromUrl === 'add' ? ActionType.CREATE : 
        ActionType.NONE,
        null, // entityType không cần thiết cho tour
        actionFromUrl === 'edit' ? parseInt(searchParams?.get('id') || '0') : undefined,
        searchParams?.get('slug') || undefined
      );
      return; // Return để tránh xử lý logic khác
    }
    
    // Nếu đã set action rồi thì không cần xử lý thêm
    if (currentAction.type === ActionType.NONE) {
      return;
    }
    
    if (selectedTour) {
      setFormData(selectedTour);
    } else if (currentAction.type === ActionType.CREATE) {
      setFormData(initTourData);
    } else if (currentAction.type === ActionType.EDIT) {
      // Thử load từ URL params trước
      if (!loadTourFromParams()) {
        // Nếu không có URL params, dùng mock data
        const mockTourData: TourFormData = {
          ...initTourData,
          id: 1, // Thêm ID cho mock data
          slug: 'tour-test',
          name: 'Tour Test',
          country: 'Việt Nam',
          duration: '3 ngày 2 đêm',
          price: 2000000,
          originalPrice: 2500000,
          rating: 4.5,
          reviewCount: 25,
          isHot: true,
          departure: ['Hà Nội', 'TP.HCM'],
          metaTitle: 'Tour Test - Du lịch Việt Nam',
          metaDescription: 'Tour du lịch 3 ngày 2 đêm tại Việt Nam',
          metaKeywords: 'tour, du lịch, việt nam'
        };
        setFormData(mockTourData);
      }
    }
  }, [selectedTour, currentAction, searchParams]);

  // Chỉ reset formData khi thực sự cần thiết
  useEffect(() => {
    // Chỉ reset khi chuyển từ edit sang create
    if (currentAction.type === ActionType.CREATE && formData && formData.slug) {
      setFormData(initTourData);
    }
  }, [currentAction.type]);

  // Helper function để reset form data
  const resetFormData = () => {
    setFormData(initTourData);
  };

  const updateTour = async (data: TourFormData) => {
    // Implementation for updating tour
  };

  const createTour = async (data: TourFormData) => {
    // Implementation for creating tour
  };

  const handleFormChange = useCallback(({ name, value }: { name: string; value: any }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  return (
    <PageContainer title="Tour du lịch" description="Quản lý tour du lịch">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TourForm 
              onChange={handleFormChange} 
              action={currentAction.type === ActionType.EDIT ? 'edit' : currentAction.type === ActionType.CREATE ? 'create' : undefined}
              formData={formData} 
            />
            <ConfirmPopup
              open={confirmingPopup}
              onClose={() => setConfirmingPopup(false)}
              onConfirm={async () => {
                if (currentAction.type === ActionType.EDIT) {
                  await updateTour(formData);
                } else if (currentAction.type === ActionType.CREATE) {
                  await createTour(formData);
                } else {
                  setSnackbar({
                    open: true,
                    message: "Có lỗi xảy ra",
                    severity: 'error'
                  });
                }
                setConfirmingPopup(false)
                router.push('/tour-du-lich')
              }}
              title="Xác nhận"
              content={currentAction.type === ActionType.EDIT ? "Bạn có chắc chắn muốn lưu tour này?" : "Bạn có chắc chắn muốn tạo tour mới?"}
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

export default TourActionPage;
