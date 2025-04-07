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
import { BlogPostAttributes } from '@/data/BlogPost';


const ProductsTable: React.FC = () => {

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isView, setIsView] = useState(true);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState("");
  const [formData, setFormData] = useState<BlogPostAttributes | null>(null);


  const [data, setData] = useState<BlogPostAttributes[]>([]);
  const [pagination, setPagination] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(1);
  const [Currentpagination, setCurrentpagination] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleLogSelected = () => {
    message.info(`Selected Products: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = async (record: BlogPostAttributes) => {
    setIsView(true);
    setFormData(record);
    setIsModalOpen(true);
  };

  const handleEdit = async (record: BlogPostAttributes) => {
    setIsView(false);
    setFormData(record);
    setAction("edit");
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setIsView(false);
    setFormData(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (record: BlogPostAttributes) => {
    setFormData(record);
    setConfirmingPopup(true);
    setAction("delete");
  };

  const columns: ColumnsType<BlogPostAttributes> = [
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
          <Button type="link" danger onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const fetchData = async (page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string) => {
    try {
      const response = await fetchProductList({
        page: page,
        limit: limit,
        categoryId: '',
        search: search || '',
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'DESC',
      }) as any;
      console.log("Response:", response);
      
      setLoading(false);
      setTotal(response.pagination.total);
      setData(response.data);
      setPagination(response.pagination.totalPages);
      setCurrentpagination(response.pagination.currentPage);
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

  const deleteAPI = async (record: BlogPostAttributes) => {
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
  
  const createAPI = async () => {
    
    if (formData) {
      try {
        const response = await createProduct(formData);
        fetchData(Currentpagination, limit, searchText, sortField, sortOrder);
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
        fetchData(Currentpagination, limit, searchText, sortField, sortOrder);
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
    setAction(action === 'create' ? "create" : "update");
  };

  useEffect(() => {
    fetchData(1, limit, searchText, sortField, sortOrder);
  }, []);

  useEffect(() => {
  }, [pagination]);

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
                setFormData(initialFormData);
                setAction("create");
                handleAdd();
              }}>
                Add Product
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
        <Table
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
          onSubmit={action === "delete" ? () => deleteAPI(formData!) : (action === "update" ? updateAPI : createAPI)}
          Content={""}
        />
      </Card>
    </>

  );
};
export default ProductsTable;
