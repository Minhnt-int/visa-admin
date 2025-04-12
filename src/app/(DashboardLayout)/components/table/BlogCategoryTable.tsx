import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Input, Select, Row, Col } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { Pagination } from "antd";
import ConfirmPopup from '../popup/ConfirmPopup';
import { Card } from "antd";
import { BlogCategory, initBlogCategory } from '@/data/blogCategory';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import AddBlogCategoryFormPopup from '../popup/AddBlogCategoryFormPopup';
import { ActionType } from '@/contexts/AppContext';
import { 
  DeleteOutlined, 
  EyeOutlined, 
  EditOutlined, 
  CheckCircleOutlined,
  RollbackOutlined
} from '@ant-design/icons';


const BlogCategoryTable: React.FC = () => {
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [formData, setFormData] = useState<BlogCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limit, setLimit] = useState(10);
  const [Currentpagination, setCurrentpagination] = useState(1);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  const {
    // BlogCategory State
    blogCategories,
    
    setSelectedBlogCategory,

    
    // Shared State
    loading,
    error,
    
    // BlogCategory Actions
    fetchBlogCategories,
    deleteBlogCategory,
    
    // Shared Actions
    setLoadingState,
    setErrorState,
    setCurrentAction,
  } = useAppContext();

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleView = async (record: BlogCategory) => {
    setIsModalOpen(true);
    setFormData(record);
    setCurrentId(record.id || null);
  };
  
  const handleEdit = async (record: BlogCategory) => {
    setSelectedBlogCategory(record);
    setCurrentAction(ActionType.EDIT, 'blogCategory', record.id);
    router.push(`/danh-muc-bai-viet/action?id=${record.id}&mode=edit`);
  };

  const handleAdd = () => {
    router.push(`/danh-muc-bai-viet/action?mode=create`);
  };

  const handleDelete = async (record: BlogCategory) => {
    try {
      setFormData(record);
      setConfirmingPopup(true);
    } catch (error) {
      console.error("Error deleting blog category:", error);
      message.error("Failed to delete blog category");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData(null);
    setCurrentId(null);
  };

  const handleChange = (data: { name: string; value: any }) => {
    // This function is only needed for the interface props but not actually used in view mode
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
      width: 200,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
    },
    {
      title: 'Parent ID',
      dataIndex: 'parentId',
      key: 'parentId',
      width: 120,
      render: (value) => value ? value : 'None',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date) => date ? new Date(date).toLocaleString() : '',
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (date) => date ? new Date(date).toLocaleString() : '',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleView(record)}>
            <EyeOutlined />
          </Button>
          <Button type="link" onClick={() => handleEdit(record)}>
            <EditOutlined />
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = () => {
    fetchData({
      page: Currentpagination,
      limit: limit,
      name: searchText,
      sortBy: sortField,
      sortOrder: sortOrder as 'ASC' | 'DESC'
    });
  };

  const handleDeleteCategory = async () => {
    if (formData && formData.id) {
      try {
        await deleteBlogCategory(formData.id);
        message.success(`Deleted blog category: ${formData.name}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting blog category:', error);
        message.error(`Failed to delete blog category: ${formData.name}`);
      }
      setConfirmingPopup(false);
      setFormData(null);
    }
  };

  const fetchData = async (params?: {
    page?: number;
    limit?: number;
    name?: string;
    parentId?: number | null;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    try {
      setLoadingState(true);
      await fetchBlogCategories(params);
      setLoadingState(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorState(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchData({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
  }, []);
  
  const tableProps: TableProps<BlogCategory> = {
    columns,
    dataSource: blogCategories,
    rowKey: 'id',
    pagination: false,
    loading,
  };
  return (
    <>
      <Card title="Blog Categories Management" style={{ width: '100%', margin: '0 auto' }}>
        <Row style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Space>
              <Button type="primary" onClick={handleAdd}>
                Add New Category
              </Button>
            </Space>
          </Col>
          <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Input
                placeholder="Search..."
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
                  { value: 'name', label: 'Name' },
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
          dataSource={blogCategories}
          pagination={false}
          scroll={{ x: 1100 }}
        />
        {blogCategories.length > 0 && (
          <Pagination
            style={{ marginTop: 16, textAlign: 'center' }}
            current={Currentpagination}
            total={blogCategories.length}
            pageSize={limit}
            onChange={(page) => {
              setCurrentpagination(page);
              fetchData({
                page,
                limit,
                name: searchText,
                sortBy: sortField,
                sortOrder: sortOrder as 'ASC' | 'DESC'
              });
            }}
          />
        )}
        
        {formData && (
          <AddBlogCategoryFormPopup
            open={isModalOpen}
            onClose={handleModalClose}
            onSubmit={() => {}}
            formData={formData}
            onChange={handleChange}
            isView={true}
            categoryId={currentId}
          />
        )}
        
        <ConfirmPopup
          open={ConfirmingPopup}
          onClose={() => setConfirmingPopup(false)}
          onSubmit={handleDeleteCategory}
          Content={`Are you sure you want to delete the category "${formData?.name}"?`}
        />
      </Card>
    </>
  );
};

export default BlogCategoryTable;
