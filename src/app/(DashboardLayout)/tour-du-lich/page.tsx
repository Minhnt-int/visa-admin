'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import ToursTable from '../components/table/ToursTable';

const TourDuLichPage = () => {
  return (
    <PageContainer title="Quản lý Tour du lịch" description="Quản lý tour du lịch">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ToursTable />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default TourDuLichPage;

