import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import AddProductPopup from '../popup/AddFormPopup';
import products from '@/data/products.json';
import axios from 'axios';
import axioss from '../../../../../axiosConfig';
import { Pagination } from "antd";
import { set } from 'lodash';
import { Modal } from 'antd';
import ConfirmPopup from '../popup/ConfirmPopup';
import { Card } from "antd";
interface ProductAttributes {
  id: number;
  name: string;
  price: number;
  description: string;
  categoryId: number;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const initialProducts: ProductAttributes[] = products

const ProductsTable: React.FC = () => {

  const [products, setProducts] = useState<ProductAttributes[]>(initialProducts);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isView, setIsView] = useState(true);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState("");
  const [formData, setFormData] = useState<ProductAttributes | null>(null);


  const [data, setData] = useState<ProductAttributes[]>([]);
  const [pagination, setPagination] = useState(1);
  const [Currentpagination, setCurrentpagination] = useState(1);
  const [loading, setLoading] = useState(true);

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleLogSelected = () => {
    console.log('Selected Products:', selectedRowKeys);
    message.info(`Selected Products: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = (record: ProductAttributes) => {
    setIsView(true);
    setFormData(record);
    setIsModalOpen(true);
  };

  const handleEdit = (record: ProductAttributes) => {
    setIsView(false);
    setFormData(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (record: ProductAttributes) => {
    setFormData(record);
    setConfirmingPopup(true);
    setAction("delete");
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
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100, // Chiều rộng hợp lý cho cột Price
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200, // Chiều rộng hợp lý cho cột Description
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

  const fetchData = async (page: number) => {
    try {
      const response = await axios.get(`/api/product/get-list?page=${page}&limit=10`);
      setLoading(false);
      setData(response.data.data);
      setPagination(response.data.meta.totalPages); // Cập nhật tổng số trang
      setCurrentpagination(response.data.meta.currentPage); // Cập nhật trang hiện tại
      console.log("Pagination updated:", response.data.meta.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const deleteAPI = async (record: ProductAttributes) => {
    try {
      // Gửi yêu cầu DELETE đến API
      const response = await axios.delete(`/api/product/delete/${record.id}`);
      // Cập nhật danh sách sản phẩm sau khi xóa thành công
      fetchData(Currentpagination);
      message.success(`Deleted Product: ${record.name}`);
      console.log('Deleted Product:', record);
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error(`Failed to delete product: ${record.name}`);
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
        const formatFormData = {
          id: Number(formData.id),
          name: formData.name,
          price: formData.price,
          description: formData.description,
          categoryId: Number(formData.categoryId),
          slug: formData.slug,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          metaKeywords: formData.metaKeywords,
        };
        
        console.log("formatFormData", formatFormData);
        
        const response = await axioss.put(`/api/product/update`, formatFormData);
        console.log(response.status);
        fetchData(Currentpagination);
        message.success('Product updated successfully!');
      } catch (error) {
        console.error('Error submitting product:', error);
        message.error('Failed to submit product.');
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
            Add Product
          </Button>
        </Space>
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
            current={Currentpagination} // Trang hiện tại
            total={pagination * 10} // Tổng số mục (giả sử mỗi trang có 10 mục)
            onChange={(page) => {
              setCurrentpagination(page); // Cập nhật trang hiện tại
              fetchData(page); // Gọi API để lấy dữ liệu trang mới
            }}
          />
        )}
        <AddProductPopup
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
export default ProductsTable;
