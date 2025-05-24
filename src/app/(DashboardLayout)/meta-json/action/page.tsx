"use client";

import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MetaJsonForm from '../../components/forms/MetaJsonForm';
import { Snackbar, Alert } from '@/config/mui';
import { getMetaJsonData, createMetaJsonData, updateMetaJsonData } from '@/services/SEOService';
import ApiService from '@/services/ApiService';

interface MetaJsonAttributes {
  id?: number;
  pageKey: string;
  metaData: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

const initialFormData: MetaJsonAttributes = {
  pageKey: "",
  metaData: {}
};

export default function MetaJsonAction() { 
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams?.get('action') || 'add';
  const pageKey = searchParams?.get('pageKey') || '';
  
  const isView = action === 'view';
  const isEdit = action === 'edit';
  
  const [formData, setFormData] = useState<MetaJsonAttributes>(initialFormData);
  const [loading, setLoading] = useState(false);
  
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error' 
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchMetaJsonData = async () => {
      if ((isView || isEdit) && pageKey) {
        try {
          setLoading(true);
          const data = await getMetaJsonData(pageKey);
          
          if (data) {
            setFormData(data);
          } else {
            setSnackbar({
              open: true,
              message: 'Không tìm thấy dữ liệu meta JSON',
              severity: 'error'
            });
            router.push('/meta-json');
          }
        } catch (error) {
          console.error('Error fetching meta JSON data:', error);
          setSnackbar({
            open: true,
            message: 'Không thể tải dữ liệu meta JSON',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMetaJsonData();
  }, [pageKey, isView, isEdit, router]);

  const handleSubmit = async (data: MetaJsonAttributes) => {
    try {
      setLoading(true);
      
      if (isEdit) {
        const result = await updateMetaJsonData(data);
        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Đã cập nhật meta JSON thành công!',
            severity: 'success'
          });
          setTimeout(() => router.push('/meta-json'), 1500);
        } else {
          // Sử dụng thông báo lỗi trả về từ API
          throw new Error(result.message || 'Không thể cập nhật meta JSON');
        }
      } else {
        const result = await createMetaJsonData(data);
        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Đã tạo meta JSON mới thành công!',
            severity: 'success'
          });
          setTimeout(() => router.push('/meta-json'), 1500);
        } else {
          // Sử dụng thông báo lỗi trả về từ API
          throw new Error(result.message || 'Không thể tạo meta JSON mới');
        }
      }
    } catch (error) {
      console.error('Error saving meta JSON:', error);
      
      // Sử dụng ApiService.handleError để lấy thông báo lỗi
      const errorResult = ApiService.handleError(error);
      
      setSnackbar({
        open: true,
        message: errorResult.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/meta-json');
  };

  return (
    <PageContainer 
      title={isView ? 'Chi tiết Meta JSON' : isEdit ? 'Cập nhật Meta JSON' : 'Thêm Meta JSON mới'} 
      description="Quản lý Meta JSON"
    >
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                Đang tải dữ liệu...
              </div>
            ) : (
              <MetaJsonForm
                formData={formData}
                isView={isView}
                isEdit={isEdit}
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