'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import MetaJsonTable from '../components/table/MetaJsonTable';

const MetaJsonPage = () => {
  return (
    <PageContainer title="Meta JSON" description="Quản lý Meta JSON cho trang web">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MetaJsonTable />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default MetaJsonPage;