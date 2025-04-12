import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Input, Select, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ConfirmPopup from '../popup/ConfirmPopup';
import { ProductAttributes } from '@/data/ProductAttributes';
import { useAppContext } from '@/contexts/AppContext';
import { 
  DeleteOutlined, 
  EyeOutlined, 
  EditOutlined, 
  CheckCircleOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AddProductFormPopup from '../popup/AddProductFormPopup';

const initialFormData: ProductAttributes = {
  id: 0,
  name: "",
  description: "",
  categoryId: 0,
  slug: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  media: [
    {
      id: 0,
      productId: 0,
      url: "https://example.com/image-main.jpg",
      type: "image",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mediaId: 0,
      altText: "",
      name: ''
    }
  ],
  items: [
    {
      id: 0,
      name: "",
      color: "",
      price: 0,
      originalPrice: 0,
      status: "available"
    },
    {
      id: 1,
      name: "",
      color: "",
      price: 0,
      originalPrice: 0,
      status: "available"
    }
  ],
};

const ProductsTable: React.FC = () => {
  const { 
    deleteProduct: deleteProductContext, 
    productStatus, 
    toggleProductStatus,
    fetchProducts,
    products: productsContext,
    productsPagination,
    permanentlyDeleteProduct,
    activateProduct,
    restoreProduct,
    selectedProduct,
    setSelectedProduct,
    fetchProductBySlug
  } = useAppContext();
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isView, setIsView] = useState(false);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState<'create' | 'update' | 'delete' | 'restore' | 'activate'>('create');
  const [formData, setFormData] = useState<ProductAttributes | null>(null);
  const [currentSlug, setCurrentSlug] = useState<string>('');

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleLogSelected = () => {
    message.info(`Selected Products: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = (slug: string) => {
    setCurrentSlug(slug);
    setIsView(true);
    setIsModalOpen(true);
  };

  const handleEdit = (slug: string) => {
    fetchProductBySlug(slug);
    router.push(`/san-pham/action?action=edit&slug=${slug}`);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    router.push('/san-pham/action?action=add');
  };

  const handleDelete = (id: number) => {
    setFormData({ ...initialFormData, id });
    setConfirmingPopup(true);
    setAction('delete');
  };
  
  const executeDelete = async (id: number) => {
    try {
      if (productStatus === 'active') {
        const result = await deleteProductContext(id);
        fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
      } else {
        const result = await permanentlyDeleteProduct(id);
        fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleRestore = (id: number) => {
    setFormData({ ...initialFormData, id });
    setConfirmingPopup(true);
    setAction('restore');
  };
  
  const executeRestore = async (id: number) => {
    try {
      const result = await restoreProduct(id);
      if (result) {
        fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
      }
    } catch (error) {
      console.error('Error restoring product:', error);
    }
  };

  const handleActive = (id: number) => {
    setFormData({ ...initialFormData, id });
    setConfirmingPopup(true);
    setAction('activate');
  };
  
  const executeActive = async (id: number) => {
    try {
      const result = await activateProduct(id);
      if (result) {
        fetchData(pagination.current, pagination.pageSize, searchText, sortField, sortOrder);
      }
    } catch (error) {
      console.error('Error activating product:', error);
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
      title: 'items',
      dataIndex: 'items',
      key: 'items',
      width: 300, // Chiều rộng hợp lý cho cột Created At
      render: (value) => (value ? value.map((item: any) => item.name).join('\n') : ''),
    },
    {
      title: 'itemsPrice',
      dataIndex: 'items',
      key: 'itemsPrice',
      width: 150, // Chiều rộng hợp lý cho cột Created At
      render: (value) => (value ? value.map((item: any) => item.price).join('\n') : ''),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleView(record.slug)}>
            <EyeOutlined />
          </Button>
          {productStatus === 'active' && (
            <>
              <Button type="link" onClick={() => handleEdit(record.slug)}>
                <EditOutlined />
              </Button>
              <Button type="link" danger onClick={() => handleDelete(record.id)}>
                <DeleteOutlined />
              </Button>
            </>
          )}
          {productStatus === 'draft' && (
            <>
              <Button type="link" onClick={() => handleEdit(record.slug)}>
                <EditOutlined />
              </Button>
              <Button type="link" onClick={() => handleActive(record.id)}>
                <CheckCircleOutlined />
              </Button>
              <Button type="link" danger onClick={() => handleDelete(record.id)}>
                <DeleteOutlined />
              </Button>
            </>
          )}
          {productStatus === 'deleted' && (
            <>
              <Button type="link" onClick={() => handleRestore(record.id)}>
                <RollbackOutlined />
              </Button>
              <Button type="link" danger onClick={() => handleDelete(record.id)}>
                <DeleteOutlined style={{ fontWeight: 'bold' }} />
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const fetchData = async (page: number, limit: number, search: string, sortField: string, sortOrder: string) => {
    try {
      setLoading(true);
      await fetchProducts({
        page,
        limit,
        search,
        sortBy: sortField,
        sortOrder: sortOrder as 'ASC' | 'DESC',
        status: productStatus
      });
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize: limit,
        total: productsPagination.total
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
    console.log("productsContext", productsContext);
    
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
    setCurrentSlug('');
  };
  
  const createAPI = async () => {
    if (formData) {
      try {
        await fetchProducts();
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
        await fetchProducts();
        message.success('Product updated successfully!');
      } catch (error) {
        console.error('Error updating product:', error);
        message.error('Failed to update product.');
      }
      handleModalClose();
    }
  };

  const handleModalSubmit = (actionType: string) => {
    setConfirmingPopup(true);
    setAction(actionType as 'create' | 'update' | 'delete' | 'restore' | 'activate');
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize, searchText, sortField, sortOrder);
  }, [productStatus]);

  useEffect(() => {
    if (productsContext) {
      setPagination(prev => ({
        ...prev,
        total: productsPagination.total
      }));
    }
    
  }, [productsContext, productsPagination]);

  return (
    <Card title="Products Management">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button
            type="primary"
            onClick={handleAdd}
          >
            Add New Product
          </Button>
          <Select
            value={productStatus}
            onChange={(value) => toggleProductStatus(value as 'draft' | 'active' | 'deleted')}
            style={{ width: 160 }}
          >
            <Select.Option value="draft">Draft Products</Select.Option>
            <Select.Option value="active">Active Products</Select.Option>
            <Select.Option value="deleted">Deleted Products</Select.Option>
          </Select>
        </Space>
        <Space>
          <Input
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Select
            value={sortField}
            onChange={(value) => handleSortChange(value, sortOrder)}
            style={{ width: 120 }}
          >
            <Select.Option value="name">Name</Select.Option>
            <Select.Option value="price">Price</Select.Option>
            <Select.Option value="createdAt">Created At</Select.Option>
          </Select>
          <Select
            value={sortOrder}
            onChange={(value) => handleSortChange(sortField, value)}
            style={{ width: 120 }}
          >
            <Select.Option value="ASC">Ascending</Select.Option>
            <Select.Option value="DESC">Descending</Select.Option>
          </Select>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={productsContext || []}
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
        onClose={() => {
          setIsModalOpen(false);
          setIsView(false);
          setCurrentSlug('');
        }}
        onSubmit={() => {}}
        formData={selectedProduct || initialFormData}
        onChange={() => {}}
        slug={currentSlug}
      />
      <ConfirmPopup
        open={ConfirmingPopup}
        onClose={() => setConfirmingPopup(false)}
        onSubmit={() => {
          if (action === "delete") {
            executeDelete(formData!.id);
          } else if (action === "restore") {
            executeRestore(formData!.id);
          } else if (action === "activate") {
            executeActive(formData!.id);
          } else if (action === "update") {
            updateAPI();
          } else {
            createAPI();
          }
          setConfirmingPopup(false);
        }}
        Content={
          action === "delete" 
            ? productStatus === 'deleted' 
              ? "Are you sure you want to permanently delete this product? This action cannot be undone."
              : "Are you sure you want to delete this product?" 
            : action === "restore" 
              ? "Are you sure you want to restore this product?"
              : action === "activate"
                ? "Are you sure you want to activate this product?"
                : "Are you sure you want to proceed with this action?"
        }
      />
    </Card>
  );
};
export default ProductsTable;
