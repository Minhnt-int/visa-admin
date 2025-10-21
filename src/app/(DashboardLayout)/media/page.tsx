'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import MediaTable from '../components/table/MediaTable';

const MediaPage = () => {
  return (
    <PageContainer title="Quản lý Media" description="Quản lý hình ảnh và video">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MediaTable />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default MediaPage;

