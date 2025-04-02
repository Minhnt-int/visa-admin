import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import axioss from '../../../../../axiosConfig';
import { Pagination } from "antd";
import ConfirmPopup from '../popup/ConfirmPopup';
import { Card } from "antd";
import AddBlogFormPopup from '../popup/AddBlogFormPopup';
import { BlogPostAttributes } from '@/data/BlogPost';
import { createBlog, deleteBlog, fetchBlogList, updateBlog } from "@/services/blogService";
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
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);

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
    setAction("edit");
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

  const fetchData = async (page: number, limit: number) => {
    try {
      const response = await fetchBlogList({
        page: page,
        limit: limit,
        // Thêm các tham số khác nếu cần
        categoryId: '',
        search: '',
        sortBy: '',
        sortOrder: '',
      }) as any;
      
      setLoading(false);
      setData(response.data);
      setPagination(response.pagination.totalPages); // Cập nhật tổng số trang
      setCurrentpagination(response.pagination.page); // Cập nhật trang hiện tại
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const deleteAPI = async (record: BlogPostAttributes) => {
    try {
      // Gửi yêu cầu DELETE đến API
      const response = await deleteBlog(record.id);
      // Cập nhật danh sách sản phẩm sau khi xóa thành công
      await fetchData(Currentpagination, limit);
      message.success(`Deleted blog: ${record.id}`);
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
        
        const response = await createBlog(formData);
        await fetchData(Currentpagination, limit);
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
        
        const response = await updateBlog(formData);
        fetchData(Currentpagination , limit);
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
      fetchData(1, limit); // Gọi hàm fetchData với trang đầu tiên và số lượng sản phẩm trên mỗi trang

    }, []); // Chỉ chạy một lần khi component được mount

    useEffect(() => {
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
              fetchData(page,limit); // Gọi API để lấy dữ liệu trang mới
            }}
          />
        )}
        <AddBlogFormPopup
          open={isModalOpen}
          isView={isView}
          onClose={handleModalClose}
          onSubmit={() => handleModalSubmit(action)}
          formData={formData || initialFormData}
          onChange={({ name, value }) =>
            setFormData((prev : any) => ({
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
