import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Tag, Tooltip, Input, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Pagination } from "antd";
import ConfirmPopup from '../popup/ConfirmPopup';
import { Card } from "antd";
import { fetchOrderList, createOrder, updateOrder, deleteOrder, fetchOrderById } from "@/services/orderService";
import { OrderAttributes } from '@/data/Order';

const OrderTable: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState("");
  const [formData, setFormData] = useState<OrderAttributes | null>(null);

  const [data, setData] = useState<OrderAttributes[]>([]);
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

  const handleDelete = async (record: OrderAttributes) => {
    setFormData(record);
    setConfirmingPopup(true);
    setAction("delete");
  };

  // Định nghĩa các cột cho bảng đơn hàng
  const columns: ColumnsType<OrderAttributes> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: 'Recipient Name',
      dataIndex: 'recipientName',
      key: 'recipientName',
      width: 150,
    },
    {
      title: 'Phone',
      dataIndex: 'recipientPhone',
      key: 'recipientPhone',
      width: 120,
    },
    {
      title: 'Address',
      dataIndex: 'recipientAddress',
      key: 'recipientAddress',
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (address) => (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (notes) => (
        notes ? (
          <Tooltip placement="topLeft" title={notes}>
            {notes}
          </Tooltip>
        ) : <span>-</span>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 100,
      render: (items) => items?.length || 0,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = 'default';
        if (status === 'pending') color = 'gold';
        if (status === 'processing') color = 'blue';
        if (status === 'completed') color = 'green';
        if (status === 'cancelled') color = 'red';
        
        return <Tag color={color}>{status?.toUpperCase() || 'PENDING'}</Tag>;
      },
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
          <Button type="link" danger onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const fetchData = async (page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string) => {
    try {
      const response = await fetchOrderList({
        page: page,
        limit: limit,
        startDate: null, 
        endDate: null,
        userId: null, 
        status: null,
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

  const deleteAPI = async (record: OrderAttributes) => {
    try {
      if (record.id) {
        await deleteOrder(record.id);
        fetchData(Currentpagination, limit, searchText, sortField, sortOrder);
        message.success(`Deleted Order #${record.id}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      message.error(`Failed to delete order #${record.id}`);
    }
    handleModalClose();
  };

  const handleModalClose = () => {
    setConfirmingPopup(false);
  };

  const handleSearch = () => {
    fetchData(1, limit, searchText, sortField, sortOrder);
  };

  const handleSortChange = (field: string, order: string) => {
    setSortField(field);
    setSortOrder(order);
    fetchData(1, limit, searchText, field, order);
  };

  useEffect(() => {
    fetchData(1, limit, searchText, sortField, sortOrder);
  }, []);

  return (
    <>
      <Card title="Orders Management" style={{ width: '100%', margin: '0 auto', maxWidth: '100%' }}>
        <Row style={{ marginBottom: 16 }}>
          <Col span={24} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Input.Search
                placeholder="Tìm kiếm đơn hàng..."
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
                  { value: 'id', label: 'ID' },
                  { value: 'recipientName', label: 'Tên khách hàng' },
                  { value: 'recipientPhone', label: 'Số điện thoại' },
                  { value: 'status', label: 'Trạng thái' },
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
          dataSource={data.map((order) => ({ ...order, key: order.id }))}
          pagination={false}
          scroll={{ x: 1500 }}
        />
        {!loading && (
          <Pagination
            align="center"
            current={Currentpagination}
            total={total}
            pageSize={limit}
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
          Content={`Are you sure to delete order #${formData?.id}?`}
        />
      </Card>
    </>
  );
};

export default OrderTable;
