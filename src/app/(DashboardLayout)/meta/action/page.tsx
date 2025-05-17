"use client";

import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MetaForm from '../../components/forms/MetaForm';
import { Snackbar, Alert } from '@/config/mui';
import { getMetaData, createMetaData, updateMetaData } from '@/services/SEOService';

interface MetaSEOAttributes {
  id?: number;
  pageKey: string;
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  customHead?: string;
  createdAt?: string;
  updatedAt?: string;
}

const initialFormData: MetaSEOAttributes = {
  id: 0,
  pageKey: "",
  title: "",
  description: "",
  keywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  customHead: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default function MetaAction() { 
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams?.get('action') || 'add';
  const pageKey = searchParams?.get('pageKey') || '';
  
  const isView = action === 'view';
  const isEdit = action === 'edit';
  
  const [formData, setFormData] = useState<MetaSEOAttributes>(initialFormData);
  const [loading, setLoading] = useState(false);
  
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (pageKey && (isEdit || isView)) {
      setLoading(true);
      getMetaData(pageKey)
        .then(data => {
          if (data) {
            setFormData(data as MetaSEOAttributes);
          }
        })
        .catch(err => {
          console.error("Error fetching meta data:", err);
          setSnackbar({
            open: true,
            message: 'Không thể tải dữ liệu Meta. Vui lòng thử lại sau.',
            severity: 'error'
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [pageKey, isEdit, isView]);

  const handleSubmit = async (data: MetaSEOAttributes) => {
    try {
      if (isEdit) {
        await updateMetaData(data);
        setSnackbar({
          open: true,
          message: 'Đã cập nhật Meta SEO thành công!',
          severity: 'success'
        });
      } else {
        await createMetaData(data);
        setSnackbar({
          open: true,
          message: 'Đã tạo Meta SEO mới thành công!',
          severity: 'success'
        });
      }
      router.push('/meta');
    } catch (error) {
      console.error('Error saving meta data:', error);
      setSnackbar({
        open: true,
        message: 'Không thể lưu Meta SEO. Vui lòng thử lại sau.',
        severity: 'error'
      });
    }
  };

  const handleCancel = () => {
    router.push('/meta');
  };

  return (
    <PageContainer 
      title={isView ? 'Chi tiết Meta SEO' : isEdit ? 'Cập nhật Meta SEO' : 'Thêm Meta SEO mới'} 
      description="Quản lý Meta SEO"
    >
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                Đang tải dữ liệu...
              </div>
            ) : (
              <MetaForm
                formData={formData}
                isView={isView}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            )}
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
  );
}