import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import AddFormPopup from '../popup/AddFormPopup';
import products from '@/data/products.json';
import axios from 'axios';
import axioss from '../../../../../axiosConfig';
import { Pagination } from "antd";
import { set } from 'lodash';
import { Modal } from 'antd';
import ConfirmPopup from '../popup/ConfirmPopup';
import { Card } from "antd";
import { ProductAttributes } from '@/data/ProductAttributes';
import AddProductFormPopup from '../popup/AddProductFormPopup';
import {  fetchProductList, createProduct, updateProduct, deleteProduct  } from "@/services/productService";
const initialProducts: ProductAttributes[] = []


const initialFormData: ProductAttributes = {
  id: 0,
  name: "",
  description: "",
  categoryId: 0,
  slug: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  media: [
    {
        type: "image",
        url: "https://example.com/image-main.jpg",
        createdAt:  new Date(),
        updatedAt:  new Date()
    }
],
  items: [
    {
      name: "",
      color: "",
      price: 0,
      originalPrice: 0,
      status: "available"
  },
  {
      name: "",
      color: "",
      price: 0,
      originalPrice: 0,
      status: "available"
  }
  ],
};



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
  const [limit, setLimit] = useState(10);
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
    setAction("edit");
    setIsModalOpen(true);
  };
  const handleAdd = () => {
    setIsView(false);
    setFormData(initialFormData);
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

  const fetchData = async (page: number, limit: number) => {
    try {
      const response = await fetchProductList({
        page: page,
        limit: limit,
        // Thêm các tham số khác nếu cần
        categoryId: '',
        search: '',
        sortBy: '',
        sortOrder: '',
      }) as any; // hoặc as { data: { data: ProductAttributes[], pagination: { totalPages: number, currentPage: number } } };
      
      console.log(page, "Response data:", response.data);
      
      setLoading(false);
      setData(response.data);
      setPagination(response.pagination.totalPages);
      setCurrentpagination(response.pagination.currentPage);
      console.log("Pagination updated:", response.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const deleteAPI = async (record: ProductAttributes) => {
    try {
      // Gọi hàm deleteProduct từ productService
      await deleteProduct(record.id);
      // Cập nhật danh sách sản phẩm sau khi xóa thành công
      fetchData(Currentpagination, limit);
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
    setConfirmingPopup(false);
    setFormData(null);
  };
  
  const createAPI = async () => {
    console.log("Create API called with formData:", formData);
    
    if (formData) {
      try {
        // Gọi hàm createProduct từ productService
        const response = await createProduct(formData);
        fetchData(Currentpagination, limit);
        message.success('Product created successfully!');
      } catch (error) {
        console.error('Error submitting product:', error);
        message.error('Failed to submit product.');
      }
      handleModalClose(); // Đóng modal sau khi xử lý xong
    }
  };
  const updateAPI = async () => {
    console.log("Update API called with formData:", formData);
    
    if (formData) {
      try {

        // Gọi hàm updateProduct từ productService
        const response = await updateProduct(formData);
        fetchData(Currentpagination, limit);
        message.success('Product updated successfully!');
      } catch (error) {
        console.error('Error updating product:', error);
        message.error('Failed to update product.');
      }
      handleModalClose(); // Đóng modal sau khi xử lý xong
    }
  };

  const handleModalSubmit = (action: string) => {
    setConfirmingPopup(true);
    setAction(action === 'create' ? "create" : "update");
  };
  // Thêm useEffect để gửi request GET
  useEffect(() => {
    fetchData(1, limit);

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
            setFormData(initialFormData);
            setAction("create");
            handleAdd();

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
              fetchData(page, limit); // Gọi API để lấy dữ liệu trang mới
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
