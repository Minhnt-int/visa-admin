import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axioss from '../../../../../axiosConfig';
import { Pagination } from "antd";
import ConfirmPopup from '../popup/ConfirmPopup';
import AddProductCategoryFormPopup from '../popup/AddProductCategoryFormPopup';
import { ProductCategory } from '@/data/ProductCategory';
import { fetchProductCategories, updateProductCategory, createProductCategory, deleteProduct, deleteProductCategory } from "@/services/productService";

const initialFormData: ProductCategory = {
  id: 0,
  name: "",
  parentId: 0,
  slug: "",
  description: "",
  createdAt: "",
  updatedAt: "",
}

interface ProductCategoryTableProps {
}

const ProductCategoryTable: React.FC<ProductCategoryTableProps> = () => {

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isView, setIsView] = useState(true);
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [action, setAction] = useState("");
  const [formData, setFormData] = useState<ProductCategory | null>(null);

const [total, setTotal] = useState(1);
const [limit, setLimit] = useState(10);
  const [data, setData] = useState<ProductCategory[]>([]);
  const [pagination, setPagination] = useState(1);
  const [Currentpagination, setCurrentpagination] = useState(1);
  const [loading, setLoading] = useState(true);

  const handleSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleLogSelected = () => {
    message.info(`Selected Product Category: ${selectedRowKeys.join(', ')}`);
  };

  const handleView = (record: ProductCategory) => {
    setIsView(true);
    setFormData(record);
    setIsModalOpen(true);
  };

  const handleEdit = (record: ProductCategory) => {
    setIsView(false);
    setAction("update");
    setFormData(record);
    setIsModalOpen(true);
  };
  const handleAdd = () => {
    setIsView(false);
    setAction("create");
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
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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

    try {
      // Gọi API với trang mới và categorySlug
      const data : any = await fetchProductCategories(page, limit); // Gọi API để lấy dữ liệu
      
      // categoryId: categoryId // Thêm slug danh mục vào params
      setLoading(false);
      setData(data.data);
      setLimit(data.pagination.limit);
      setTotal(data.pagination.total); // Cập nhật tổng số trang
      setPagination(data.pagination.totalPages); // Cập nhật tổng số trang
      setCurrentpagination(data.pagination.page); // Cập nhật trang hiện tại

      console.log(data);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const deleteAPI = async (record: ProductCategory) => {
    try {
      // Gửi yêu cầu DELETE đến API
      const response = await deleteProductCategory(record.id);
      // Cập nhật danh sách sản phẩm sau khi xóa thành công
      await fetchData(Currentpagination, limit);
      message.success(`Deleted Product Category: ${record.name}`);
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
        const response = await createProductCategory(formatFormData);
        await fetchData(Currentpagination, limit);
        message.success('Product Category created successfully!');
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
          id: formData.id,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
        };
        const response = await updateProductCategory(formatFormData);
        await fetchData(Currentpagination, limit);
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
            total={total} // Tổng số mục (giả sử mỗi trang có 10 mục)
            pageSize={limit} // Số lượng mục trên mỗi trang
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
