
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import BlogsTable from '../components/table/BlogsTable';
import Editor from '../components/editor/Editor';



const Dashboard = () => {

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <BlogsTable></BlogsTable>
          
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default Dashboard;
