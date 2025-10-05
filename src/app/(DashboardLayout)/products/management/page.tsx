'use client'
import { Grid, Box } from '@mui/material';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
// components

import DataTable from '@/app/(DashboardLayout)/components/shared/DataTable';

const Dashboard = () => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={12}>
            <DataTable rows={[]} columns={[]} />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default Dashboard;
