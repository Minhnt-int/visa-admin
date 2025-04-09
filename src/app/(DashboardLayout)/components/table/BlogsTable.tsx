"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, message, Input, Select, Row, Col } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import axios from 'axios';
import axioss from '../../../../../axiosConfig';
import { Pagination } from "antd";
import ConfirmPopup from '../popup/ConfirmPopup';
import { Card } from "antd";
import AddBlogFormPopup from '../popup/AddBlogFormPopup';
import { BlogPostAttributes } from '@/data/BlogPost';
import { createBlog, deleteBlog, fetchBlogList, updateBlog } from "@/services/blogService";
import { ActionType, useAppContext } from '@/contexts/AppContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; // Add usePathname, useSearchParams

const ProductsTable: React.FC = () => {

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isView, setIsView] = useState(true);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState("");
  const [formData, setFormData] = useState<BlogPostAttributes | null>(null);

  const [data, setData] = useState<BlogPostAttributes[]>([]);
  const [pagination, setPagination] = useState(1);
  const [Currentpage, setCurrentpage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  const { 
    loading, 
    selectBlog,
    setCurrentAction
  } = useAppContext();

  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const searchParams = useSearchParams(); // Get search params

  const initialFormData : BlogPostAttributes = {
    id: 0,
    title: "",
    content: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    author: "",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    blogCategoryId: 0,
  }

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleLogSelected = () => {
    message.info(`Selected blogCategory: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = (record: BlogPostAttributes) => {
    setIsView(true);
    setFormData(record);
    setIsModalOpen(true);
  };

  // const handleEditPopup = (record: BlogPostAttributes) => {
  //   setIsView(false);
  //   setFormData(record);
  //   setAction("edit");
  //   setIsModalOpen(true);
  // };

  const handleEdit = (record: BlogPostAttributes) => {
    selectBlog(record, ActionType.EDIT);
    router.push(`/bai-viet/action`);
  }
  const handleAdd = () => {
    setCurrentAction(ActionType.CREATE);
    router.push(`/bai-viet/action`);
  };

  const handleDelete = async (record: BlogPostAttributes) => {
    setFormData(record);
    setConfirmingPopup(true);
    setAction("delete");
  };

  const handleSearch = () => {
    fetchData(1, limit, searchText, sortField, sortOrder);
  };

  const handleSortChange = (field: string, order: string) => {
    setSortField(field);
    setSortOrder(order);
    fetchData(1, limit, searchText, field, order);
  };

  const columns: ColumnsType<BlogPostAttributes> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      width: 150,
    },
    {
      title: 'Category ID',
      dataIndex: 'blogCategoryId',
      key: 'blogCategoryId',
      width: 120,
    },
    {
      title: 'Published At',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 150,
      render: (value) => (value ? new Date(value).toLocaleString() : ''),
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
            Xem
          </Button>
          <Button type="link" danger onClick={() => handleEdit(record)}>
            Sửa chi tiết
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const fetchData = useCallback(async (page: number, limit: number, search: string,
    sortBy: string,
    sortOrder: string) => {
    try {
      const response = await fetchBlogList({
        page: page,
        limit: limit,
        categoryId: '',
        search: search,
        sortBy: sortBy,
        sortOrder: sortOrder,
      }) as any;
      
      setData(response.data);
      setPagination(response.pagination.totalPages);
      setCurrentpage(response.pagination.page);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  const deleteAPI = useCallback(async (record: BlogPostAttributes) => {
    try {
      const response = await deleteBlog(record.id);
      await fetchData(Currentpage, limit, searchText, sortField, sortOrder);
      message.success(`Deleted blog: ${record.id}`);
    } catch (error) {
      console.error('Error deleting blog:', error);
      message.error(`Failed to delete blog: ${record.id}`);
    }
    handleModalClose();
  }, [Currentpage, limit, searchText, sortField, sortOrder]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setConfirmingPopup(false);
    setFormData(null);
  };

  useEffect(() => {
    fetchData(Currentpage, limit, searchText, sortField, sortOrder);
  }, [pathname, searchParams, fetchData, Currentpage, limit, sortField, sortOrder]);
  const tableProps: TableProps<BlogPostAttributes> = {
    columns,
    dataSource: data,
    rowKey: 'id',
    pagination: false,
    loading,
  };
  return (
    <>
      <Card title="Blogs Management" style={{ width: '100%', margin: '0 auto' }}>
        <Row style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Space>
              <Button type="primary" onClick={handleAdd}>
                Add New Blog
              </Button>
            </Space>
          </Col>
          <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Input
                placeholder="Search blogs..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              <Select
                defaultValue="createdAt"
                style={{ width: 120 }}
                onChange={(value) => setSortField(value)}
                options={[
                  { value: 'id', label: 'ID' },
                  { value: 'title', label: 'Title' },
                  { value: 'createdAt', label: 'Created Date' },
                ]}
              />
              <Select
                defaultValue="DESC"
                style={{ width: 120 }}
                onChange={(value) => setSortOrder(value)}
                options={[
                  { value: 'ASC', label: 'Ascending' },
                  { value: 'DESC', label: 'Descending' },
                ]}
              />
              <Button type="primary" onClick={handleSearch}>Search</Button>
            </Space>
          </Col>
        </Row>
        <Table
          style={{ width: '100%' }}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: handleSelectChange,
          }}
          columns={columns}
          dataSource={data.map((blog) => ({ ...blog, key: blog.id }))}
          pagination={false}
          scroll={{ x: 800 }}
        />
        {!loading && (
          <Pagination
            style={{ marginTop: 16, textAlign: 'center' }}
            current={Currentpage}
            total={pagination * 10}
            pageSize={limit}
            onChange={(page) => {
              setCurrentpage(page);
              fetchData(page, limit, searchText, sortField, sortOrder);
            }}
          />
        )}

        <AddBlogFormPopup
          open={isModalOpen}
          onClose={handleModalClose}
          onSubmit={() => {}}
          formData={formData!}
          isView={true}
          onChange={() => {}}
        />
        <ConfirmPopup
          open={ConfirmingPopup}
          onClose={() => setConfirmingPopup(false)}
          onSubmit={() => {
            if (action === "delete" && formData) {
              deleteAPI(formData);
            }
          }}
          Content={"Bạn có chắc chắn muốn thực hiện hành động này?"}
        />
      </Card>
    </>
  );
};
export default ProductsTable;
