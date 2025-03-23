import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import AddFormPopup from '../popup/AddFormPopup';
import axios from 'axios';
import axioss from '../../../../../axiosConfig';
import { Pagination } from "antd";
import { set } from 'lodash';
import { Modal } from 'antd';
import ConfirmPopup from '../popup/ConfirmPopup';
import { Card } from "antd";
import blogCategory from '@/data/blogCategory.json';

const ProductsTable: React.FC = () => {

  const [blogs, setBlogs] = useState<BlogPostAttributes[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isView, setIsView] = useState(true);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState("");
  const [formData, setFormData] = useState<BlogPostAttributes | null>(null);

  const [data, setData] = useState<BlogPostAttributes[]>([]);
  const [pagination, setPagination] = useState(1);
  const [Currentpagination, setCurrentpagination] = useState(1);
  const [loading, setLoading] = useState(true);

  

  const convertToJsonList = (data: Record<string, any>) => {
    return Object.keys(data).map((key) => ({
      name: key,
      type: typeof data[key] === 'object' && data[key] instanceof Date
        ? 'date'
        : typeof data[key],
    }));
  };

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
    console.log('Selected blogCategory:', selectedRowKeys);
    message.info(`Selected blogCategory: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = (record: BlogPostAttributes) => {
    setIsView(true);
    setFormData(record);
    setIsModalOpen(true);
  };

  const handleEdit = (record: BlogPostAttributes) => {
    setIsView(false);
    setFormData(record);
    setIsModalOpen(true);
  };
  const handleAdd = () => {
    setIsView(false);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleDelete = async (record: BlogPostAttributes) => {
    setFormData(record);
    setConfirmingPopup(true);
    setAction("delete");
  };

  const columns: ColumnsType<BlogPostAttributes> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80, // Chiều rộng hợp lý cho cột ID
      fixed: 'left', // Cố định cột ID bên trái
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200, // Chiều rộng hợp lý cho cột Title
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      width: 150, // Chiều rộng hợp lý cho cột Author
    },
    {
      title: 'Category ID',
      dataIndex: 'blogCategoryId',
      key: 'blogCategoryId',
      width: 120, // Chiều rộng hợp lý cho cột Category ID
    },
    {
      title: 'Published At',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 150, // Chiều rộng hợp lý cho cột Published At
      render: (value) => (value ? new Date(value).toLocaleString() : ''), // Hiển thị ngày ở định dạng dễ đọc
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150, // Chiều rộng hợp lý cho cột Created At
      render: (value) => (value ? new Date(value).toLocaleString() : ''), // Hiển thị ngày ở định dạng dễ đọc
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150, // Chiều rộng hợp lý cho cột Updated At
      render: (value) => (value ? new Date(value).toLocaleString() : ''), // Hiển thị ngày ở định dạng dễ đọc
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200, // Chiều rộng hợp lý cho cột Actions
      fixed: 'right', // Cố định cột Actions bên phải
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
      const response = await axios.get(`/api/blog/get-blogs?page=${page}&limit=10`);
      setLoading(false);
      setData(response.data.data);
      setPagination(response.data.meta.totalPages); // Cập nhật tổng số trang
      setCurrentpagination(response.data.meta.currentPage); // Cập nhật trang hiện tại
      console.log("Pagination updated:", response.data.meta.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const deleteAPI = async (record: BlogPostAttributes) => {
    try {
      // Gửi yêu cầu DELETE đến API
      const response = await axios.delete(`/api/blog/delete/${record.id}`);
      // Cập nhật danh sách sản phẩm sau khi xóa thành công
      fetchData(Currentpagination);
      message.success(`Deleted blog: ${record.id}`);
      console.log('Deleted blog:', record);
    } catch (error) {
      console.error('Error deleting blog:', error);
      message.error(`Failed to delete blog: ${record.id}`);
    }
    handleModalClose(); // Đóng modal sau khi xử lý xong
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setConfirmingPopup(false);
    setFormData(null);
  };

  const createAPI = async () => {
    if (formData) {
      try {
        const formatFormData = {
          id: Number(formData.id),
          title: formData.title,
          content: formData.content,
          slug: formData.slug,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          metaKeywords:  formData.metaKeywords,
          author: formData.author,
          publishedAt: formData.publishedAt,
          createdAt: formData.createdAt,
          updatedAt: formData.updatedAt,
          blogCategoryId: Number(formData.blogCategoryId),
        };
        
        console.log("formatFormData", formatFormData);
        
        const response = await axioss.put(`/api/blog/create-blog`, formatFormData);
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
  const updateAPI = async () => {
    if (formData) {
      try {
        const formatFormData = {
          id: Number(formData.id),
          title: formData.title,
          content: formData.content,
          slug: formData.slug,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          metaKeywords:  formData.metaKeywords,
          author: formData.author,
          publishedAt: formData.publishedAt,
          createdAt: formData.createdAt,
          updatedAt: formData.updatedAt,
          blogCategoryId: Number(formData.blogCategoryId),
        };
        
        console.log("formatFormData", formatFormData);
        
        const response = await axioss.put(`/api/blog/update-blog`, formatFormData);
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

  const handleModalSubmit = (action: string) => {
    setConfirmingPopup(true);
    setAction(action === 'create' ? "create" : "update");
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
            setFormData(initialFormData);
            setAction("create");
            handleAdd();
          }}>
            Add Blog
          </Button>
        </Space>
        <Table
         style={{ width: '90%', margin: '0 auto', maxWidth: '90%' }}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: handleSelectChange,
          }}
          columns={columns} // Sử dụng cấu hình cột mới
          dataSource={data.map((blogCategory) => ({ ...blogCategory, key: blogCategory.id }))}
          pagination={false}
          scroll={{ x: 800 }} // Kích hoạt cuộn ngang nếu nội dung vượt quá
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
          onSubmit={() => handleModalSubmit(action)}
          formData={formData || initialFormData}
          formObject={convertToJsonList(initialFormData)} // Gọi hàm và truyền kết quả
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
