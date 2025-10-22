'use client';

import React from 'react';
import VisaServiceForm from '../../components/forms/VisaServiceForm';
import { Typography, Box } from '@mui/material';
import PageContainer from '../../components/container/PageContainer';

const ActionVisaServicePage = () => {
  return (
    <PageContainer title="Thêm/Sửa Dịch vụ Visa" description="Form để quản lý dịch vụ visa">
        <Typography variant="h4" gutterBottom>Thêm/Sửa Dịch vụ Visa</Typography>
        <Box mt={2}>
            <VisaServiceForm 
              formData={undefined}
              isView={false}
              isEdit={false}
              onSubmit={undefined}
              onCancel={undefined}
              isLoading={false}
            />
        </Box>
    </PageContainer>
  );
};

export default ActionVisaServicePage;
