'use client';

import React from 'react';
import VisaServicesTable from '../components/table/VisaServicesTable';
import { Typography, Box } from '@mui/material';
import PageContainer from '../components/container/PageContainer';

const VisaServicesPage = () => {
  return (
    <PageContainer title="Quản lý Dịch vụ Visa" description="Danh sách các dịch vụ visa">
        <Typography variant="h4" gutterBottom>Quản lý Dịch vụ Visa</Typography>
        <Box mt={2}>
            <VisaServicesTable />
        </Box>
    </PageContainer>
  );
};

export default VisaServicesPage;
