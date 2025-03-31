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
import AddProductCategoryFormPopup from '../popup/AddProductCategoryFormPopup';
import { ProductCategory } from '@/data/ProductCategory';


const initialFormData: ProductCategory = {
  id: 0,
  name: "",
  parentId: 0,
  slug: "",
  description: "",
  createdAt: "",
  updatedAt: "",
}


const convertToJsonList = (data: Record<string, any>) => {
  return Object.keys(data).map((key) => ({
    name: key,
    type: typeof data[key] === 'object' && data[key] instanceof Date
      ? 'date'
      : typeof data[key],
  }));
};
interface ProductCategoryTableProps {
  limit: number;
}

const ProductCategoryTable: React.FC<ProductCategoryTableProps> = ({ limit }) => {

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
  const handleAdd = () => {
    setIsView(false);
    setFormData(initialFormData);
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
      width: 80,
    },
    {
      title: 'Name',
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
      title: 'Description',
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
      title: 'Parent ID',
      dataIndex: 'parentId',
      key: 'parentId',
      width: 120,
      render: (parentId) => parentId === null ? <span style={{ color: 'gray' }}>Root category</span> : parentId,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a : any, b : any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 180,
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
    console.log("Fetching data for page:", page, "with limit:", limit);
    
    try {
      const response = await axioss.get(`/api/product-category/get-list?page=${page}&limit=${limit}`);
      console.log("Response data:", response.data);

      setLoading(false);
      setData(response.data.data);
      setPagination(response.data.pagination.totalPages); // Cập nhật tổng số trang
      setCurrentpagination(response.data.pagination.page); // Cập nhật trang hiện tại
      console.log("setCurrentpagination" , response.data.pagination.page, Currentpagination);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const deleteAPI = async (record: ProductCategory) => {
    try {
      // Gửi yêu cầu DELETE đến API
      const response = await axioss.delete(`/api/product-category/delete/${record.id}`);
      // Cập nhật danh sách sản phẩm sau khi xóa thành công
      fetchData(Currentpagination, limit);
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
    setConfirmingPopup(false);
    setFormData(null);
  };

  const createAPI = async () => {
    if (formData) {
      try {
        const formatFormData = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
        };
        const response = await axioss.post(`/api/product-category/create-category`, formatFormData);
        console.log(response.status);
        fetchData(Currentpagination, limit);
        message.success('Product Category updated successfully!');
      } catch (error) {
        console.error('Error submitting Product Category:', error);
        message.error('Failed to submit Product Category.');
      }
      handleModalClose(); // Đóng modal sau khi xử lý xong
    }
  };
  const updateAPI = async () => {
    if (formData) {
      try {
        const formatFormData = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
        };
        const response = await axioss.put(`/api/product-category/update-category`, formatFormData);
        console.log(response.status);
        fetchData(Currentpagination, limit);
        message.success('Product Category updated successfully!');
      } catch (error) {
        console.error('Error submitting Product Category:', error);
        message.error('Failed to submit Product Category.');
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
            Add Product Category
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
              fetchData(page, limit); // Gọi API để lấy dữ liệu trang mới
            }}
          />
        )}
        <AddProductCategoryFormPopup
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
export default ProductCategoryTable;
