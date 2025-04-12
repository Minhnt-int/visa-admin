'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import ProductsTable from '../components/table/ProductsTable';
import { useAppContext } from "@/contexts/AppContext";
import { useEffect } from "react";

const Dashboard = () => {
  const { fetchProductCategories } = useAppContext();

  useEffect(() => {
    fetchProductCategories();
  }, [fetchProductCategories]);

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ProductsTable></ProductsTable>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default Dashboard;
