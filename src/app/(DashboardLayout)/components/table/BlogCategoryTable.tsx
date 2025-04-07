import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Input, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import AddFormPopup from '../popup/AddFormPopup';
import axios from 'axios';
import axioss from '../../../../../axiosConfig';
import { Pagination } from "antd";
import { set } from 'lodash';
import { Modal } from 'antd';
import ConfirmPopup from '../popup/ConfirmPopup';
import { Card } from "antd";
import AddProductFormPopup from '../popup/AddProductFormPopup';
import { fetchProductList, createProduct, updateProduct, deleteProduct, fetchProductBySlug } from "@/services/productService";
import { BlogCategory, initBlogCategory } from '@/data/blogCategory';
import { fetchBlogCategories } from '@/services/blogService';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';


const BlogCategoryTable: React.FC = () => {

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isView, setIsView] = useState(true);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState("");
  const [formData, setFormData] = useState<BlogCategory | null>(null);


  const [data, setData] = useState<BlogCategory[]>([]);
  const [pagination, setPagination] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(1);
  const [Currentpagination, setCurrentpagination] = useState(1);

  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  const {
    // Blog State
    blogs,
    selectedBlog,
    
    // Product State
    products,
    selectedProduct,
    
    // Shared State
    loading,
    error,
    currentAction, // Thay đổi tên
    
    // Blog Actions
    setBlogsData,
    setSelectedBlogData,
    selectBlog,
    clearSelectedBlog,
    
    // Product Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    clearSelectedProduct,
    
    // Shared Actions
    setLoadingState,
    setErrorState,
    setCurrentAction, // Thay đổi tên
  } = useAppContext();

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleLogSelected = () => {
    message.info(`Selected Products: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = async (record: BlogCategory) => {
    setIsView(true);
    setFormData(record);
    setIsModalOpen(true);
  };
  const router = useRouter();
  const handleEdit = async (record: BlogCategory) => {
    router.push(`/danh-muc-bai-viet/action`);
  };

  const handleAdd = () => {
    setIsView(false);
    setFormData(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (record: BlogCategory) => {
    setFormData(record);
    setConfirmingPopup(true);
    setAction("delete");
  };

  const columns: ColumnsType<BlogCategory> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
    },
    {
      title: 'Avatar',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      width: 150,
      render: (url) => url ? <img src={url} alt="Avatar" style={{ width: 50, height: 50, objectFit: 'cover' }} /> : 'No Image',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (value) => (value ? new Date(value).toLocaleString() : ''),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (value) => (value ? new Date(value).toLocaleString() : ''),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleView(record)}>
            View
          </Button>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const fetchData = async (page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string) => {
    try {
      const response = await fetchBlogCategories(
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      ) as any;
      
      setLoadingState(false);
      setTotal(response.data.pagination.total);

      setData(response.data.categories); 
      setPagination(response.data.pagination.totalPages);
      setCurrentpagination(response.data.pagination.page);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearch = () => {
    fetchData(1, limit, searchText, sortField, sortOrder);
  };

  const handleSortChange = (field: string, order: string) => {
    setSortField(field);
    setSortOrder(order);
    fetchData(1, limit, searchText, field, order);
  };

  const deleteAPI = async (record: BlogCategory) => {
    try {
      await deleteProduct(record.id);
      fetchData(Currentpagination, limit, searchText, sortField, sortOrder);
      message.success(`Deleted Product: ${record.name}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error(`Failed to delete product: ${record.name}`);
    }
    handleModalClose();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setConfirmingPopup(false);
    setFormData(null);
  };

  useEffect(() => {
    fetchData(1, limit, searchText, sortField, sortOrder);
  }, [Currentpagination]);

  useEffect(() => {
    fetchData(1, limit, searchText, sortField, sortOrder);
  }, []);
  return (
    <>
      <Card title="Products Table" style={{ width: '100%', margin: '0 auto', maxWidth: '100%' }}>
        <Row style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Space>
              <Button type="primary" onClick={handleLogSelected} disabled={selectedRowKeys.length === 0}>
                Log Selected
              </Button>
              <Button type="primary" onClick={() => {
                setIsView(false);
                setFormData(null);
                setAction("create");
                handleAdd();
              }}>
                Add Blog Category
              </Button>
            </Space>
          </Col>
          <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Input.Search
                placeholder="Tìm kiếm sản phẩm..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
              <Select
                defaultValue="createdAt"
                style={{ width: 140 }}
                value={sortField}
                onChange={(value) => handleSortChange(value, sortOrder)}
                options={[
                  { value: 'name', label: 'Tên sản phẩm' },
                  { value: 'categoryId', label: 'Danh mục' },
                  { value: 'createdAt', label: 'Ngày tạo' },
                  { value: 'updatedAt', label: 'Ngày cập nhật' },
                ]}
              />
              <Select
                defaultValue="DESC"
                style={{ width: 120 }}
                value={sortOrder}
                onChange={(value) => handleSortChange(sortField, value)}
                options={[
                  { value: 'ASC', label: 'Tăng dần' },
                  { value: 'DESC', label: 'Giảm dần' },
                ]}
              />
            </Space>
          </Col>
        </Row>
        <Table<BlogCategory>
          style={{ width: '90%', margin: '0 auto', maxWidth: '90%' }}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: handleSelectChange,
          }}
          columns={columns}
          dataSource={data.map((product) => ({ ...product, key: product.id }))}
          pagination={false}
          scroll={{ x: 700 }}
        />
        {!loading && (
          <Pagination
            align="center"
            current={Currentpagination}
            total={total}
            onChange={(page) => {
              setCurrentpagination(page);
              fetchData(page, limit, searchText, sortField, sortOrder);
            }}
          />
        )}
        <ConfirmPopup
          open={ConfirmingPopup}
          onClose={setConfirmingPopup.bind(this, false)}
          onSubmit={() => deleteAPI(formData!)}
          Content={""}
        />
      </Card>
    </>

  );
};
export default BlogCategoryTable;
