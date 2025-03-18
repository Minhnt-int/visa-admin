import React, { useState } from 'react';
import {
  Typography, Box,
  Button, IconButton
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';
import productsData from '@/data/products.json';
import AddProductPopup from './AddProductPopup';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface ProductAttributes {
  id: number;
  name: string;
  price: number;
  description: string;
  categoryId: number;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const products: ProductAttributes[] = productsData;

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'NAME', width: 150 },
  { field: 'price', headerName: 'price', width: 60, type: 'number' },
  { field: 'description', headerName: 'description', width: 110 },
  { field: 'categoryId', headerName: 'categoryId', width: 60, type: 'number' },
  { field: 'slug', headerName: 'slug', width: 90 },
  { field: 'metaTitle', headerName: 'metaTitle', width: 150 },
  { 
    field: 'metaDescription', 
    headerName: 'metaDescription', 
    width: 150,
    renderCell: (params) => (
      <span title={params.value}>
        {params.value.length > 20 ? `${params.value.substring(0, 20)}...` : params.value}
      </span>
    )
  },
  { field: 'metaKeywords', headerName: 'metaKeywords', width: 110 },
  { field: 'createdAt', headerName: 'createdAt', width: 110, type: 'number' },
  { field: 'updatedAt', headerName: 'updatedAt', width: 90 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    renderCell: (params) => (
      <div>
        <IconButton color="primary" onClick={() => handleView(params.row.id)}>
          <VisibilityIcon />
        </IconButton>
        <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
          <EditIcon />
        </IconButton>
        <IconButton color="secondary" onClick={() => handleDelete(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      </div>
    )
  }
];

const ProductsTable = () => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    post: '',
    pname: '',
    priority: '',
    budget: ''
  });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const handleSelectionChange = (newSelection: number[]) => {
    setSelectedProducts(newSelection);
  };

  const handleLogSelectedProducts = () => {
    console.log(selectedProducts);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log(formData);
    handleClose();
  };

  const handleView = (id: number) => {
    console.log(`View product with id: ${id}`);
    // Add your view logic here
  };

  const handleEdit = (id: number) => {
    console.log(`Edit product with id: ${id}`);
    // Add your edit logic here
  };

  const handleDelete = (id: number) => {
    console.log(`Delete product with id: ${id}`);
    // Add your delete logic here
  };

  return (
      <DashboardCard title="Product Performance">
        <Box sx={{ width: '100%' }}>
          <div className="row justify-content-center">
            <div className="col-3">    
              <Button variant="contained" color="primary" size="small" onClick={handleLogSelectedProducts}>
                  Nothing
              </Button>   
            </div> 
            <div className="col-9 d-flex justify-content-end">
              <Button variant="contained" color="primary" size="small" onClick={handleClickOpen}>
                Add product modal
              </Button>
              <Button variant="contained" color="primary" size="small" onClick={handleLogSelectedProducts} sx={{ ml: 1 }}>
                Log Selected Products 
              </Button>
              <Button variant="contained" color="primary" size="small" onClick={handleLogSelectedProducts} sx={{ ml: 1 }}>
                API Delete ProductList
              </Button>
            </div>
          </div>
          <DataGrid
            rows={products}
            columns={columns}
            pagination
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 20]}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => handleSelectionChange(newSelection as number[])}
            autoHeight
          />
        </Box>

        <AddProductPopup
          open={open}
          onClose={handleClose}
          onChange={handleChange}
          onSubmit={handleSubmit}
          formData={formData}
        />
      </DashboardCard>
  );
};

export default ProductsTable;
