import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { BlogPostAttributes } from '@/data/BlogPost';
import { fetchBlogList } from '@/services/blogService';
import { Table, Pagination, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import AddBlogFormPopup from '../popup/AddBlogFormPopup';

interface PickBlogProps {
  onBlogSelect: (blog: BlogPostAttributes) => void;
  disabled?: boolean; // Thêm prop disabled
}

const PickBlog: React.FC<PickBlogProps> = ({ onBlogSelect, disabled = false }) => {
  // States
  const [blogs, setBlogs] = useState<BlogPostAttributes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBlog, setSelectedBlog] = useState<BlogPostAttributes | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // States cho popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewBlog, setViewBlog] = useState<BlogPostAttributes | null>(null);

  // Số lượng blog mỗi trang
  const blogsPerPage = 10;

  // Hàm fetch danh sách blog
  const fetchBlogs = async (page: number, blogsPerPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchBlogList({
        page: page,
        limit: blogsPerPage,
        categoryId: '',
        search: '',
        sortBy: '',
        sortOrder: '',
      }) as any;

      if (response.data) {
        console.log(response);
        
        setBlogs(response.data);
        setTotalPages(Math.ceil(response.pagination.totalPages));
      } else {
        setError('Dữ liệu không đúng định dạng');
      }
    } catch (err) {
      setError('Không thể tải danh sách blog. Vui lòng thử lại sau.');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch blogs khi component mount
  useEffect(() => {
    fetchBlogs(page, blogsPerPage);
  }, [page]);

  // Xử lý chọn blog
  const handleSelectBlog = (blog: BlogPostAttributes) => {
    if (disabled) return; // Không cho phép chọn nếu disabled
    
    setSelectedBlog(blog);
    setSelectedRowKeys([blog.id]);
    onBlogSelect(blog);
  };

  // Xử lý mở modal xem blog
  const handleViewBlog = (blog: BlogPostAttributes) => {
    setViewBlog(blog);
    setIsModalOpen(true);
  };

  // Xử lý đóng modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setViewBlog(null);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    if (disabled) return; // Không cho phép đổi trang nếu disabled
    
    setPage(page);
  };

  // Format ngày tháng
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Tạo excerpt từ content
  const createExcerpt = (content: string, maxLength: number = 100) => {
    // Loại bỏ HTML tags
    const plainText = content.replace(/<[^>]*>/g, '');
    
    if (plainText.length <= maxLength) return plainText;
    
    // Cắt đến khoảng trắng gần nhất để không cắt giữa từ
    return plainText.substr(0, plainText.lastIndexOf(' ', maxLength)) + '...';
  };

  // Định nghĩa cột cho bảng
  const columns: ColumnsType<BlogPostAttributes> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      render: (content) => createExcerpt(content, 150),
    },
    {
      title: 'Danh mục',
      dataIndex: 'blogCategoryId',
      key: 'blogCategoryId',
      width: 120,
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 150,
      render: (date) => formatDate(date || new Date()),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180, // Tăng chiều rộng để chứa thêm nút
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            variant="outlined" 
            color="info" 
            size="small"
            onClick={() => handleViewBlog(record)}
            disabled={disabled}
          >
            Xem
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            onClick={() => handleSelectBlog(record)}
            disabled={disabled}
          >
            Chọn
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardCard title="Chọn Blog để đánh giá">
      <>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button 
              size="small" 
              variant="outlined" 
              sx={{ ml: 2 }} 
              onClick={() => fetchBlogs(page, blogsPerPage)}
              disabled={disabled}
            >
              Thử lại
            </Button>
          </Alert>
        ) : (
          <>
            <Table
              style={{ width: '90%', margin: '0 auto', maxWidth: '90%' }}
              loading={loading}
              rowSelection={{
                type: 'radio',
                selectedRowKeys,
                onChange: (selectedKeys) => {
                  if (disabled) return; // Không cho phép chọn nếu disabled
                  
                  setSelectedRowKeys(selectedKeys);
                  const selectedBlog = blogs.find(blog => blog.id === selectedKeys[0]);
                  if (selectedBlog) {
                    setSelectedBlog(selectedBlog);
                    onBlogSelect(selectedBlog);
                  }
                },
                getCheckboxProps: () => ({
                  disabled: disabled // Disable checkbox khi disabled
                })
              }}
              columns={columns}
              dataSource={blogs.map(blog => ({ ...blog, key: blog.id }))}
              pagination={false}
              scroll={{ x: 800 }} // Kích hoạt cuộn ngang nếu nội dung vượt quá
              rowClassName={(record) => record.id === selectedBlog?.id ? 'ant-table-row-selected' : ''}
            />

            {/* Phân trang */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  current={page}
                  total={totalPages * blogsPerPage}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  disabled={disabled} // Disable phân trang khi disabled
                />
              </Box>
            )}
          </>
        )}

        {/* Thêm AddBlogFormPopup */}
        <AddBlogFormPopup
          open={isModalOpen}
          isView={true} // Chỉ cho phép xem, không cho phép chỉnh sửa
          onClose={handleModalClose}
          onSubmit={() => {}} // Không cần xử lý submit vì chỉ xem
          formData={viewBlog || {
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
          }}
          onChange={() => {}} // Không cần xử lý onChange vì chỉ xem
        />
      </>
    </DashboardCard>
  );
};

export default PickBlog;
