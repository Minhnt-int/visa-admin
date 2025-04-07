import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Input, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Pagination } from "antd";
import ConfirmPopup from '../popup/ConfirmPopup';
import { Card } from "antd";
import { BlogCategory, initBlogCategory } from '@/data/blogCategory';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';

const BlogCategoryTable: React.FC = () => {
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [formData, setFormData] = useState<BlogCategory | null>(null);

  const [limit, setLimit] = useState(10);
  const [Currentpagination, setCurrentpagination] = useState(1);

  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  const {
    // BlogCategory State
    blogCategories,
    selectedBlogCategory,
    
    // Shared State
    loading,
    error,
    
    // BlogCategory Actions
    fetchBlogCategories,
    fetchBlogCategoryById,
    deleteBlogCategory,
    
    // Shared Actions
    setLoadingState,
    setErrorState,
    setCurrentAction,
  } = useAppContext();

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleLogSelected = () => {
    message.info(`Selected Categories: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = async (record: BlogCategory) => {
    router.push(`/danh-muc-bai-viet/view/${record.id}`);
  };
  
  const handleEdit = async (record: BlogCategory) => {
    router.push(`/danh-muc-bai-viet/action?id=${record.id}&mode=edit`);
  };

  const handleAdd = () => {
    router.push(`/danh-muc-bai-viet/action?mode=create`);
  };

  const handleDelete = async (record: BlogCategory) => {
    setFormData(record);
    setConfirmingPopup(true);
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
      title: 'Tên danh mục',
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
      title: 'Hình ảnh',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      width: 150,
      render: (url) => url ? <img src={url} alt="Avatar" style={{ width: 50, height: 50, objectFit: 'cover' }} /> : 'Không có hình',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (value) => (value ? new Date(value).toLocaleString() : ''),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (value) => (value ? new Date(value).toLocaleString() : ''),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleView(record)}>
            Xem
          </Button>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const fetchData = async (page: number, pageLimit: number, search?: string, sortBy?: string, order?: string) => {
    try {
      setLoadingState(true);
      await fetchBlogCategories();
      setLoadingState(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorState(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
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

  const handleDeleteCategory = async () => {
    if (formData) {
      try {
        await deleteBlogCategory(formData.id);
        message.success(`Đã xóa danh mục: ${formData.name}`);
        fetchData(Currentpagination, limit, searchText, sortField, sortOrder);
      } catch (error) {
        console.error('Error deleting category:', error);
        message.error(`Không thể xóa danh mục: ${formData.name}`);
      }
      handleModalClose();
    }
  };

  const handleModalClose = () => {
    setConfirmingPopup(false);
    setFormData(null);
  };

  useEffect(() => {
    fetchData(1, limit, searchText, sortField, sortOrder);
  }, []);

  console.log("blogCategoriesTable", blogCategories);

  return (
    <>
      <Card title="Danh mục bài viết" style={{ width: '100%', margin: '0 auto' }}>
        <Row style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Space>
              <Button type="primary" onClick={handleLogSelected} disabled={selectedRowKeys.length === 0}>
                Đã chọn
              </Button>
              <Button type="primary" onClick={handleAdd}>
                Thêm danh mục
              </Button>
            </Space>
          </Col>
          <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Input
                placeholder="Tìm kiếm..."
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
                  { value: 'name', label: 'Tên' },
                  { value: 'createdAt', label: 'Ngày tạo' },
                ]}
              />
              <Select
                defaultValue="DESC"
                style={{ width: 120 }}
                onChange={(value) => setSortOrder(value)}
                options={[
                  { value: 'ASC', label: 'Tăng dần' },
                  { value: 'DESC', label: 'Giảm dần' },
                ]}
              />
              <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
            </Space>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={blogCategories}
          rowKey="id"
          pagination={false}
          loading={loading}
          scroll={{ x: 1100 }}
          rowSelection={{
            selectedRowKeys,
            onChange: handleSelectChange,
          }}
        />
        {blogCategories.length > 0 && (
          <Pagination
            style={{ marginTop: 16, textAlign: 'center' }}
            current={Currentpagination}
            total={blogCategories.length}
            pageSize={limit}
            onChange={(page) => {
              setCurrentpagination(page);
              fetchData(page, limit, searchText, sortField, sortOrder);
            }}
          />
        )}
        <ConfirmPopup
          open={ConfirmingPopup}
          onClose={() => setConfirmingPopup(false)}
          onSubmit={handleDeleteCategory}
          Content={`Bạn có chắc chắn muốn xóa danh mục "${formData?.name}"?`}
        />
      </Card>
    </>
  );
};

export default BlogCategoryTable;
