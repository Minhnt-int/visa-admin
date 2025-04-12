import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Tag, Tooltip, Input, Select, Row, Col, DatePicker } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { Pagination } from "antd";
import ConfirmPopup from '../popup/ConfirmPopup';
import { Card } from "antd";
import { fetchOrderList, createOrder, updateOrder, deleteOrder, fetchOrderById } from "@/services/orderService";
import { OrderAttributes } from '@/data/Order';
import { 
  DeleteOutlined, 
  EyeOutlined, 
  EditOutlined, 
  CheckCircleOutlined,
  RollbackOutlined
} from '@ant-design/icons';
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

  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

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
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const fetchData = async (page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string) => {
    try {
      const params = {
        userId: userId || null,
        status: selectedStatus,
        page: page || 1,
        limit: limit || 10,
        startDate: startDate,
        endDate: endDate,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'DESC',
        search: search || ''
      };

      console.log("Fetching orders with params:", params);
      
      const response = await fetchOrderList(params) as any;
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
        fetchData(Currentpagination, limit, '', sortField, sortOrder);
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
    const params = {
      userId: userId || null,
      status: selectedStatus,
      page: 1,
      limit: limit,
      startDate: startDate,
      endDate: endDate,
      sortBy: sortField || 'createdAt',
      sortOrder: sortOrder || 'DESC',
      search: ''
    };
    
    console.log("Search with params:", params);
    
    fetchOrderList(params).then((response: any) => {
      setLoading(false);
      setTotal(response.pagination.total);
      setData(response.data);
      setPagination(response.pagination.totalPages);
      setCurrentpagination(response.pagination.currentPage);
    }).catch((error) => {
      console.error("Error fetching data on search:", error);
    });
  };

  const handleSortChange = (field: string, order: string) => {
    setSortField(field);
    setSortOrder(order);
    fetchData(1, limit, '', field, order);
  };

  const handleStatusChange = (value: string | null) => {
    const newStatus = value;
    setSelectedStatus(newStatus);
    
    const params = {
      userId: userId || null,
      status: newStatus,
      page: 1,
      limit: limit,
      startDate: startDate,
      endDate: endDate,
      sortBy: sortField || 'createdAt',
      sortOrder: sortOrder || 'DESC',
      search: ''
    };
    
    console.log("Status changed to:", newStatus, "Fetching with params:", params);
    
    fetchOrderList(params).then((response: any) => {
      setLoading(false);
      setTotal(response.pagination.total);
      setData(response.data);
      setPagination(response.pagination.totalPages);
      setCurrentpagination(response.pagination.currentPage);
    }).catch((error) => {
      console.error("Error fetching data after status change:", error);
    });
  };

  const handleDateChange = (date: any, dateString: string) => {
    const newStartDate = dateString;
    setStartDate(newStartDate);
    
    const params = {
      userId: userId || null,
      status: selectedStatus,
      page: 1,
      limit: limit,
      startDate: newStartDate,
      endDate: endDate,
      sortBy: sortField || 'createdAt',
      sortOrder: sortOrder || 'DESC',
      search: ''
    };
    
    console.log("Date changed to:", newStartDate, "Fetching with params:", params);
    
    fetchOrderList(params).then((response: any) => {
      setLoading(false);
      setTotal(response.pagination.total);
      setData(response.data);
      setPagination(response.pagination.totalPages);
      setCurrentpagination(response.pagination.currentPage);
    }).catch((error) => {
      console.error("Error fetching data after date change:", error);
    });
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  const handleAdd = () => {
    // Implement the logic to open the add new order form
  };

  useEffect(() => {
    fetchData(1, limit, '', sortField, sortOrder);
  }, []);
  const tableProps: TableProps<OrderAttributes> = {
    columns,
    dataSource: data,
    rowKey: 'id',
    pagination: false,
    loading,
  };
  return (
    <>
      <Card title="Orders Management" style={{ width: '100%', margin: '0 auto' }}>
        <Row style={{ marginBottom: 16 }}>
          <Col span={24} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Input
                placeholder="User ID"
                value={userId}
                onChange={handleUserIdChange}
                style={{ width: 120 }}
              />
              <DatePicker
                placeholder="Start Date"
                onChange={(date, dateString) => setStartDate(dateString as string)}
                style={{ width: 150 }}
              />
              <DatePicker
                placeholder="End Date"
                onChange={(date, dateString) => setEndDate(dateString as string)}
                style={{ width: 150 }}
              />
              <Select
                placeholder="Status"
                style={{ width: 150 }}
                value={selectedStatus}
                onChange={handleStatusChange}
                allowClear
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'shipped', label: 'Shipped' },
                ]}
              />
              <Select
                defaultValue="createdAt"
                style={{ width: 120 }}  
                value={sortField}
                onChange={(value) => handleSortChange(value, sortOrder)}
                options={[
                  { value: 'id', label: 'ID' },
                  { value: 'recipientName', label: 'Customer Name' },
                  { value: 'recipientPhone', label: 'Phone' },
                  { value: 'status', label: 'Status' },
                  { value: 'createdAt', label: 'Created Date' },
                  { value: 'updatedAt', label: 'Updated Date' },
                ]}
              />
              <Select
                defaultValue="DESC"
                style={{ width: 120 }}
                value={sortOrder}
                onChange={(value) => handleSortChange(sortField, value)}
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
          dataSource={data.map((order) => ({ ...order, key: order.id }))}
          pagination={false}
          scroll={{ x: 1500 }}
        />
        {!loading && (
          <Pagination
            style={{ marginTop: 16, textAlign: 'center' }}
            current={Currentpagination}
            total={total}
            pageSize={limit}
            onChange={(page) => {
              setCurrentpagination(page);
              fetchData(page, limit, '', sortField, sortOrder);
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
