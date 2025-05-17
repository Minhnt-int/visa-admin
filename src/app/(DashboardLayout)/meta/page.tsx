'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import MetaTable from '../components/table/MetaTable';

const MetaPage = () => {
  return (
    <PageContainer title="Meta SEO" description="Quản lý Meta SEO">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MetaTable />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default MetaPage;