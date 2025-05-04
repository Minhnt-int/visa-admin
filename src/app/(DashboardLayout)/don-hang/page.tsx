'use client'
import { Suspense } from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import OrderTable from '@/app/(DashboardLayout)/components/table/OrderTable';

const OrderContent = () => {
  return (
    <PageContainer title="Đơn hàng" description="Quản lý đơn hàng">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Bọc OrderTable trong Suspense */}
            <Suspense fallback={<div>Đang tải dữ liệu đơn hàng...</div>}>
              <OrderTable />
            </Suspense>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

const OrderPage = () => {
  return (
    <OrderContent />
  );
};

export default OrderPage;
