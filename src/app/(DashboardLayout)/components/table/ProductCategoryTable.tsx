import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import AddFormPopup from '../popup/AddFormPopup';
import products from '@/data/products.json';
import axios from 'axios';
import axioss from '../../../../../axiosConfig';
import { Pagination } from "antd";
import { set } from 'lodash';
import { Modal } from 'antd';
import ConfirmPopup from '../popup/ConfirmPopup';

const ProductCategoryTable: React.FC = () => {

  const [productCategory, setProductCategory] = useState<ProductCategory[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isView, setIsView] = useState(true);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState("");
  const [formData, setFormData] = useState<ProductCategory | null>(null);


  const [data, setData] = useState<ProductCategory[]>([]);
  const [pagination, setPagination] = useState(1);
  const [Currentpagination, setCurrentpagination] = useState(1);
  const [loading, setLoading] = useState(true);

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleLogSelected = () => {
    console.log('Selected Product Category:', selectedRowKeys);
    message.info(`Selected Product Category: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = (record: ProductCategory) => {
    setIsView(true);
    setFormData(record);
    setIsModalOpen(true);
  };

  const handleEdit = (record: ProductCategory) => {
    setIsView(false);
    setFormData(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (record: ProductCategory) => {
    setFormData(record);
    setConfirmingPopup(true);
    setAction("delete");
  };

  const columns: ColumnsType<ProductCategory> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      width: 100,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'parentId',
      dataIndex: 'parentId',
      key: 'parentId',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 250,
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

  const fetchData = async (page: number) => {
    try {
      const response = await axios.get(`/api/product-category/get-categories?page=${page}&limit=10`);
      setLoading(false);
      setData(response.data.data);
      setPagination(response.data.meta.totalPages); // Cập nhật tổng số trang
      setCurrentpagination(response.data.meta.currentPage); // Cập nhật trang hiện tại
      console.log("Pagination updated:", response.data.meta.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const deleteAPI = async (record: ProductCategory) => {
    try {
      // Gửi yêu cầu DELETE đến API
      const response = await axios.delete(`/api/product-category/delete/${record.id}`);
      // Cập nhật danh sách sản phẩm sau khi xóa thành công
      fetchData(Currentpagination);
      message.success(`Deleted Product Category: ${record.name}`);
      console.log('Deleted Product Category:', record);
    } catch (error) {
      console.error('Error deleting Product Category:', error);
      message.error(`Failed to delete Product Category: ${record.name}`);
    }
    handleModalClose(); // Đóng modal sau khi xử lý xong
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData(null);
  };

  const updateAPI = async () => {
    if (formData) {
      try {
        const response = await axioss.put(`/api/product-category/update-category`, formData);
        console.log(response.status);
        fetchData(Currentpagination);
        message.success('Product Category updated successfully!');
      } catch (error) {
        console.error('Error submitting Product Category:', error);
        message.error('Failed to submit Product Category.');
      }
      handleModalClose(); // Đóng modal sau khi xử lý xong
    }
  };

    const handleModalSubmit = () => {
      setConfirmingPopup(true);
      setAction("update");
    };
    // Thêm useEffect để gửi request GET
    useEffect(() => {
      fetchData(1);
      console.log("first", Currentpagination, pagination);

    }, []); // Chỉ chạy một lần khi component được mount

    useEffect(() => {
      console.log("Pagination updated:", pagination);
    }, [pagination]); // Chạy khi `pagination` thay đổi

    return (
      <>
      <Card title="Products Table" style={{ width: '100%', margin: '0 auto', maxWidth: '100%' }}>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={handleLogSelected} disabled={selectedRowKeys.length === 0}>
            Log Selected
          </Button>
          <Button type="primary" onClick={() => {
            setIsView(false);
            setFormData(null);
            setIsModalOpen(true);
          }}>
            Add Product Category
          </Button>
        </Space>
        <Table
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: handleSelectChange,
          }}
          columns={columns}
          scroll={{ x: 700 }}
          dataSource={data.map((productCategory) => ({ ...productCategory, key: productCategory.id }))}
          pagination={false}
        />
        {!loading && (
          <Pagination
            align="center"
            current={Currentpagination} // Trang hiện tại
            total={pagination * 10} // Tổng số mục (giả sử mỗi trang có 10 mục)
            onChange={(page) => {
              setCurrentpagination(page); // Cập nhật trang hiện tại
              fetchData(page); // Gọi API để lấy dữ liệu trang mới
            }}
          />
        )}
        <AddFormPopup
          open={isModalOpen}
          isView={isView}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          formData={formData!}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev!,
              [e.target.name]: e.target.value,
            }))
          }
        />
        <ConfirmPopup
          open={ConfirmingPopup}
          onClose={setConfirmingPopup.bind(this, false)}
          onSubmit={action === "delete" ? () => deleteAPI(formData!) : updateAPI}
          Content={""}
        />
        </Card>
      </>
    );
  };
export default ProductCategoryTable;
