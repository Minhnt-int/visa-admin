"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import ProductForm from '../../components/forms/ProductForm';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { Box } from '@mui/material';

const ProductActionPage = () => {
  const searchParams = useSearchParams();
  const { 
    selectedProduct, 
    fetchProductBySlug,
    setSelectedProduct
  } = useAppContext();

  const action = searchParams?.get('action') || '';
  const slug = searchParams?.get('slug') || '';

  // Fetch product data when component mounts or params change
  useEffect(() => {
    const fetchData = async () => {
      if (action === 'edit' && slug) {
        await fetchProductBySlug(slug);
      } else {
        setSelectedProduct(null);
      }
    };
    fetchData();
  }, [action, slug, fetchProductBySlug, setSelectedProduct]);

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <PageContainer title={action === 'add' ? 'Add Product' : action === 'edit' ? 'Edit Product' : 'View Product'} description="Product form">
      <Box>
        <ProductForm
          action={action}
          onCancel={handleCancel}
          isView={action === 'view'}
        />
      </Box>
    </PageContainer>
  );
};

export default ProductActionPage; 