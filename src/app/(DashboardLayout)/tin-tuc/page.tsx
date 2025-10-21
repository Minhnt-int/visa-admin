'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import NewsTable from '../components/table/NewsTable';

const TinTucPage = () => {
  return (
    <PageContainer title="Quản lý Tin tức" description="Quản lý tin tức và bài viết">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <NewsTable />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default TinTucPage;

