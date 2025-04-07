import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Card, Input, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Pagination } from "antd";
import ConfirmPopup from '../popup/ConfirmPopup';
import { ProductCategory } from '@/data/ProductCategory';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';

const initialFormData: ProductCategory = {
  id: 0,
  name: "",
  parentId: null,
  slug: "",
  description: "",
  createdAt: new Date(),
  updatedAt: new Date(),
}

const ProductCategoryTable: React.FC = () => {
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [formData, setFormData] = useState<ProductCategory | null>(null);

  const [limit, setLimit] = useState(10);
  const [Currentpagination, setCurrentpagination] = useState(1);

  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  const {
    // ProductCategory State
    productCategories,
    
    // Shared State
    loading,
    
    // ProductCategory Actions
    fetchProductCategories,
    deleteProductCategory,
    
    // Shared Actions
    setLoadingState,
    setErrorState,
  } = useAppContext();

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleLogSelected = () => {
    message.info(`Đã chọn danh mục: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = (record: ProductCategory) => {
    router.push(`/danh-muc-san-pham/view/${record.id}`);
  };

  const handleEdit = (record: ProductCategory) => {
    router.push(`/danh-muc-san-pham/action?id=${record.id}&mode=edit`);
  };

  const handleAdd = () => {
    router.push(`/danh-muc-san-pham/action?mode=create`);
  };

  const handleDelete = (record: ProductCategory) => {
    setFormData(record);
    setConfirmingPopup(true);
  };

  const columns: ColumnsType<ProductCategory> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      width: 80,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 200,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (text) => (
        <div
          style={{
            maxHeight: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ),
    },
    {
      title: 'Danh mục cha',
      dataIndex: 'parentId',
      key: 'parentId',
      width: 120,
      render: (parentId) => parentId === null ? <span style={{ color: 'gray' }}>Danh mục gốc</span> : parentId,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date) => date ? new Date(date).toLocaleString() : '',
      sorter: (a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (date) => date ? new Date(date).toLocaleString() : '',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 180,
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

  const fetchData = async () => {
    try {
      setLoadingState(true);
      await fetchProductCategories();
      setLoadingState(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorState(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  const handleDeleteCategory = async () => {
    if (formData && formData.id) {
      try {
        await deleteProductCategory(formData.id);
        message.success(`Đã xóa danh mục: ${formData.name}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting category:', error);
        message.error(`Không thể xóa danh mục: ${formData.name}`);
      }
      setConfirmingPopup(false);
      setFormData(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Card title="Danh mục sản phẩm" style={{ width: '100%', margin: '0 auto' }}>
        <Row style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Space>
              <Button type="primary" onClick={handleLogSelected} disabled={selectedRowKeys.length === 0}>
                Xem đã chọn
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
          dataSource={productCategories}
          rowKey="id"
          pagination={false}
          loading={loading}
          scroll={{ x: 1100 }}
          rowSelection={{
            selectedRowKeys,
            onChange: handleSelectChange,
          }}
        />
        {productCategories.length > 0 && (
          <Pagination
            style={{ marginTop: 16, textAlign: 'center' }}
            current={Currentpagination}
            total={productCategories.length}
            pageSize={limit}
            onChange={(page) => {
              setCurrentpagination(page);
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

export default ProductCategoryTable;
