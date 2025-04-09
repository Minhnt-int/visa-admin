import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Input, Select, Card } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import AddFormPopup from '../popup/AddFormPopup';
import axios from 'axios';
import axioss from '../../../../../axiosConfig';
import { Pagination } from "antd";
import { set } from 'lodash';
import { Modal } from 'antd';
import ConfirmPopup from '../popup/ConfirmPopup';
import { ProductAttributes } from '@/data/ProductAttributes';
import AddProductFormPopup from '../popup/AddProductFormPopup';
import { fetchProductList, createProduct, updateProduct, deleteProduct, fetchProductBySlug } from "@/services/productService";
import { useAppContext } from '@/contexts/AppContext';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box } from '@mui/material';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const initialFormData: ProductAttributes = {
  id: 0,
  name: "",
  description: "",
  categoryId: 0,
  slug: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  media: [
    {
        type: "image",
        url: "https://example.com/image-main.jpg",
        createdAt:  new Date(),
        updatedAt:  new Date()
    }
],
  items: [
    {
      name: "",
      color: "",
      price: 0,
      originalPrice: 0,
      status: "available"
  },
  {
      name: "",
      color: "",
      price: 0,
      originalPrice: 0,
      status: "available"
  }
  ],
};


const ProductsTable: React.FC = () => {
  const { deleteProduct: deleteProductContext, productStatus, toggleProductStatus } = useAppContext();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isView, setIsView] = useState(true);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState<'create' | 'update' | 'delete'>('create');
  const [formData, setFormData] = useState<ProductAttributes | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [products, setProducts] = useState<ProductAttributes[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleLogSelected = () => {
    message.info(`Selected Products: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = async (record: ProductAttributes) => {
    setIsView(true);
    setFormData(record);
    setIsModalOpen(true);
  };

  const handleEdit = async (record: ProductAttributes) => {
    setIsView(false);
    setFormData(record);
    setAction('update');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setIsView(false);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteProductContext(id);
      if (result) {
        fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const columns: ColumnsType<ProductAttributes> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80, // Chiều rộng hợp lý cho cột ID
      fixed: 'left',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150, // Chiều rộng hợp lý cho cột Name
    },
    {
      title: 'Short Description',
      dataIndex: 'shortDescription',
      key: 'shortDescription',
      width: 200, // Chiều rộng hợp lý cho cột Meta Description
    },
    {
      title: 'Category ID',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 120, // Chiều rộng hợp lý cho cột Category ID
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 150, // Chiều rộng hợp lý cho cột Slug
    },
    {
      title: 'Meta Title',
      dataIndex: 'metaTitle',
      key: 'metaTitle',
      width: 150, // Chiều rộng hợp lý cho cột Meta Title
    },
    {
      title: 'Meta Description',
      dataIndex: 'metaDescription',
      key: 'metaDescription',
      width: 200, // Chiều rộng hợp lý cho cột Meta Description
    },
    {
      title: 'Meta Keywords',
      dataIndex: 'metaKeywords',
      key: 'metaKeywords',
      width: 200, // Chiều rộng hợp lý cho cột Meta Keywords
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150, // Chiều rộng hợp lý cho cột Created At
      render: (value) => (value ? new Date(value).toLocaleString() : ''),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150, // Chiều rộng hợp lý cho cột Updated At
      render: (value) => (value ? new Date(value).toLocaleString() : ''),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250, // Chiều rộng hợp lý cho cột Actions
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleView(record)}>
            View
          </Button>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const fetchData = async (page: number, limit: number, search: string, sortField: string, sortOrder: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?page=${page}&limit=${limit}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}&status=${productStatus}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data.products);
        setPagination({
          current: result.data.pagination.currentPage,
          pageSize: result.data.pagination.limit,
          total: result.data.pagination.total,
        });
      } else {
        message.error(result.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchData(1, pagination.pageSize, searchText, sortField, sortOrder);
  };

  const handleSortChange = (field: string, order: string) => {
    setSortField(field);
    setSortOrder(order);
    fetchData(1, pagination.pageSize, searchText, field, order);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setConfirmingPopup(false);
    setFormData(null);
  };
  
  const createAPI = async () => {
    
    if (formData) {
      try {
        const response = await createProduct(formData);
        fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
        message.success('Product created successfully!');
      } catch (error) {
        console.error('Error submitting product:', error);
        message.error('Failed to submit product.');
      }
      handleModalClose();
    }
  };
  const updateAPI = async () => {
    
    if (formData) {
      try {
        const response = await updateProduct(formData);
        fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
        message.success('Product updated successfully!');
      } catch (error) {
        console.error('Error updating product:', error);
        message.error('Failed to update product.');
      }
      handleModalClose();
    }
  };

  const handleModalSubmit = (action: string) => {
    setConfirmingPopup(true);
    setAction(action as 'create' | 'update' | 'delete');
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize, searchText, sortField, sortOrder);
  }, []);

  useEffect(() => {
  }, [pagination]);

  return (
    <Card title="Products Management">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setFormData(initialFormData);
              setAction("create");
              setIsModalOpen(true);
            }}
          >
            Add New Product
          </Button>
          <Button
            type={productStatus === 'active' ? 'default' : 'primary'}
            icon={productStatus === 'active' ? <EyeOutlined /> : <DeleteOutlined />}
            onClick={toggleProductStatus}
          >
            {productStatus === 'active' ? 'View Deleted Products' : 'View Active Products'}
          </Button>
        </Space>
        <Space>
          <Input
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            value={sortField}
            onChange={(value) => setSortField(value)}
            style={{ width: 120 }}
          >
            <Select.Option value="name">Name</Select.Option>
            <Select.Option value="price">Price</Select.Option>
            <Select.Option value="createdAt">Created At</Select.Option>
          </Select>
          <Select
            value={sortOrder}
            onChange={(value) => setSortOrder(value)}
            style={{ width: 120 }}
          >
            <Select.Option value="ASC">Ascending</Select.Option>
            <Select.Option value="DESC">Descending</Select.Option>
          </Select>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={(pagination) => {
          fetchData(
            pagination.current || 1,
            pagination.pageSize || 10,
            searchText,
            sortField,
            sortOrder
          );
        }}
      />
      <AddProductFormPopup
        open={isModalOpen}
        isView={isView}
        onClose={handleModalClose}
        onSubmit={() => handleModalSubmit(action)}
        formData={formData || initialFormData}
        onChange={({ name, value }) =>
          setFormData((prev) => ({
            ...prev!,
            [name]: value,
          }))
        }
      />
      <ConfirmPopup
        open={ConfirmingPopup}
        onClose={setConfirmingPopup.bind(this, false)}
        onSubmit={action === "delete" ? () => handleDelete(formData!.id) : (action === "update" ? updateAPI : createAPI)}
        Content={""}
      />
    </Card>
  );
};
export default ProductsTable;
