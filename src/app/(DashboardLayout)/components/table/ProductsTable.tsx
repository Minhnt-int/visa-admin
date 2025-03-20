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
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category ID',
      dataIndex: 'categoryId',
      key: 'categoryId',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Meta Title',
      dataIndex: 'metaTitle',
      key: 'metaTitle',
    },
    {
      title: 'Meta Description',
      dataIndex: 'metaDescription',
      key: 'metaDescription',
    },
    {
      title: 'Meta Keywords',
      dataIndex: 'metaKeywords',
      key: 'metaKeywords',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => (value ? new Date(value).toLocaleString() : ''),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value) => (value ? new Date(value).toLocaleString() : ''),
    },
    {
      title: 'Actions',
      key: 'actions',
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
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: handleSelectChange,
          }}
          columns={columns}
          dataSource={data.map((product) => ({ ...product, key: product.id }))}
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
      </>
    );
  };
export default ProductsTable;
