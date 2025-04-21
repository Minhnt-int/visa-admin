/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
  DatePicker,
  Select,
  Button,
  Space,
  Upload,
  message,
  Modal,
  Form,
} from "antd";
import { UploadOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button as MuiButton,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Paper,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import dayjs from "dayjs";
import Editor from "../editor/Editor";
import { ProductAttributes, ProductMedia } from "@/data/ProductAttributes";
import { useAppContext } from "@/contexts/AppContext";
import MediaPopup from "../popup/MediaPopup";
import { useRouter, useSearchParams } from "next/navigation";
import { convertToFormData } from "@/utils/productUtils";
import ConfirmPopup from "../popup/ConfirmPopup";
import { productMediaDelete } from "@/services/productService";
import Image from "next/image";

interface ProductFormProps {
  action?: string;
  onCancel: () => void;
  isView?: boolean;
  isLoading?: boolean;
}

interface AiSuggestionResponse {
  success: boolean;
  data: {
    title: string;
    description: string;
    keywords: string;
  };
  message?: string;
}

interface ExtendedProductMedia extends ProductMedia {
  previewUrl?: string;
  fileObj?: File;
}

const ProductForm: React.FC<ProductFormProps> = ({
  action,
  onCancel,
  isView = false,
  isLoading = false,
}) => {
  const {
    productCategories,
    fetchProductCategories,
    fetchProductBySlug,
    createProduct,
    updateProduct,
    selectedProduct,
    setSelectedProduct,
  } = useAppContext();

  const [mediaPopupOpen, setMediaPopupOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ProductMedia[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [aiSuggestions, setAiSuggestions] = useState<{
    title: string;
    description: string;
    keywords: string;
  }>({
    title: "",
    description: "",
    keywords: "",
  });
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);
  const [primaryMediaIndex, setPrimaryMediaIndex] = useState<number>(-1);
  const [updateMediaModalVisible, setUpdateMediaModalVisible] = useState(false);
  const [updatedMediaData, setUpdatedMediaData] = useState<ExtendedProductMedia>({
    id: 0,
    productId: 0,
    name: "",
    url: "",
    type: "image",
    altText: "",
    createdAt: "",
    updatedAt: "",
    mediaId: 0
  });

  const [formData, setFormData] = useState<ProductAttributes>({
    id: 0,
    name: "",
    description: "",
    shortDescription: "",
    categoryId: 0,
    avatarUrl: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    status: "active",
    media: [],
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const searchParams = useSearchParams();
  const slug = searchParams?.get("slug") || "";
  const router = useRouter();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        await fetchProductCategories();
      } catch (error) {
        console.error("Error loading product categories:", error);
        message.error("Failed to load product categories");
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [fetchProductCategories]);

  useEffect(() => {
    if (action === "edit" && slug) {
      fetchProductBySlug(slug).then(() => {
        console.log("selectedProduct after fetch", selectedProduct);
      });
    }
  }, [action, slug]);

  useEffect(() => {
    if (selectedProduct) {
      console.log("Cập nhật formData từ selectedProduct:", selectedProduct);
      setFormData(selectedProduct);
      setEditorContent(selectedProduct.description || "");
      setSelectedMedia((selectedProduct.media as any) || []);
    } else {
      setFormData({
        id: 0,
        name: "",
        description: "",
        shortDescription: "",
        categoryId: 0,
        avatarUrl: "",
        slug: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        status: "active",
        media: [],
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setEditorContent("");
      setSelectedMedia([]);
    }
  }, [selectedProduct]);

  useEffect(() => {
    console.log("formData.media đã thay đổi:", formData.media);
    setSelectedMedia((formData.media as any) || []);
  }, [formData.media]);

  const handleInputChange = (field: keyof ProductAttributes, value: any) => {
    console.log(`Cập nhật trường ${field} với giá trị:`, value);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    handleInputChange("description", content);
  };

  const handleMediaSelect = (media: ProductMedia) => {
    console.log("handleMediaSelect được gọi với:", media);

    const newProductMedia: any = {
      url: media.url,
      type: mediaType,
      altText: media.altText,
    };

    const newMedia = [...formData.media, newProductMedia];

    setFormData((prev) => ({
      ...prev,
      media: newMedia as any,
    }));

    console.log("Đã cập nhật media trong formData:", newMedia);
  };

  const handleRemoveMedia = async (index: number) => {
    await productMediaDelete(formData.media[index].id)
      .then(() => {
        console.log("Media đã được xóa thành công");
      })
      .catch((error) => {
        console.error("Lỗi khi xóa media:", error);
      });
    const newMedia = [...formData.media];
    newMedia.splice(index, 1);

    console.log("newMedia sau khi xóa:", newMedia);

    setFormData((prev) => ({
      ...prev,
      media: newMedia as any,
    }));

    console.log("Đã cập nhật media trong formData sau khi xóa");
  };

  const handleAddItem = () => {
    const newItems = [...formData.items];
    newItems.push({
      id: 0,
      name: "",
      color: "",
      price: 0,
      originalPrice: 0,
      status: "available",
    });

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const handleSubmit = () => {
    console.log("submit", formData);
    setConfirmPopupOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (action === "add") {
      createProduct(formData)
        .then(() => {
          message.success("Thêm sản phẩm thành công");
          router.push("/san-pham");
        })
        .catch((error) => {
          message.error("Thêm sản phẩm thất bại");
          console.error("Error creating product:", error);
        });
    } else if (action === "edit") {
      const productData: ProductAttributes = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      updateProduct(formData.id, productData)
        .then(() => {
          message.success("Cập nhật sản phẩm thành công");
          router.push("/san-pham");
        })
        .catch((error) => {
          message.error("Cập nhật sản phẩm thất bại");
          console.error("Error updating product:", error);
        });
    }
    setConfirmPopupOpen(false);
  };

  const handleGetSuggestions = async () => {
    try {
      setIsLoadingAi(true);
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.name,
          description: formData.description,
        }),
      });
      const data: AiSuggestionResponse = await response.json();
      if (data.success) {
        setAiSuggestions({
          title: data.data.title || "",
          description: data.data.description || "",
          keywords: data.data.keywords || "",
        });
        setShowAiSuggestions(true);
      } else {
        throw new Error(data.message || "Failed to get AI suggestions");
      }
    } catch (error) {
      message.error("Failed to get AI suggestions");
    } finally {
      setIsLoadingAi(false);
    }
  };
  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handlePrimaryMediaChange = (index: number) => {
    setPrimaryMediaIndex(index);

    const newMedia = [...formData.media];

    const selectedMedia = newMedia[index];

    newMedia.splice(index, 1);

    newMedia.unshift(selectedMedia);

    setFormData((prev) => ({
      ...prev,
      media: newMedia as any,
    }));

    console.log("Đã đặt media index", index, "lên đầu array");
  };

  const handleOpenUpdateMediaPopup = (media: ProductMedia, index: number) => {
    setUpdateMediaModalVisible(true);
    setUpdatedMediaData({
      id: media.id || 0,
      productId: media.productId || 0,
      name: media.name || "",
      url: media.url || "",
      type: media.type || "image",
      altText: media.altText || "",
      createdAt: media.createdAt || "",
      updatedAt: media.updatedAt || "",
      mediaId: media.mediaId || 0
    });
  };

  const handleCloseUpdateMediaPopup = () => {
    setUpdateMediaModalVisible(false);
  };

  const handleUpdateMedia = async () => {
    try {
      // Kiểm tra nếu có file mới được upload
      if (updatedMediaData.fileObj) {
        // Tạo FormData để upload file
        const formData = new FormData();
        formData.append('file', updatedMediaData.fileObj);
        formData.append('type', 'image');
        
        // Gọi API upload file
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/media`, {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Không thể upload file');
        }
        
        const uploadResult = await uploadResponse.json();
        
        // Cập nhật URL mới từ kết quả upload
        updatedMediaData.url = uploadResult.data.url;
      }
      
      // Gọi API cập nhật thông tin media thông qua API product/update
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formData.id,
          media: [
            {
              id: updatedMediaData.id,
              type: updatedMediaData.type,
              url: updatedMediaData.url,
              altText: updatedMediaData.altText
            }
          ]
        }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Không thể cập nhật thông tin media');
      }
      
      const updateResult = await updateResponse.json();
      
      // Cập nhật media trong formData
      const updatedMedia = [...(formData.media as ProductMedia[])];
      const mediaIndex = updatedMedia.findIndex(m => m.id === updatedMediaData.id);
      
      if (mediaIndex !== -1) {
        updatedMedia[mediaIndex] = {
          ...updatedMedia[mediaIndex],
          url: updatedMediaData.url,
          altText: updatedMediaData.altText,
          type: updatedMediaData.type
        };
        
        setFormData(prev => ({
          ...prev,
          media: updatedMedia
        }));
        
        message.success("Đã cập nhật thông tin media thành công");
      }
      
    } catch (error) {
      console.error("Lỗi khi cập nhật media:", error);
      message.error("Cập nhật media thất bại: " + (error instanceof Error ? error.message : "Lỗi không xác định"));
    } finally {
      handleCloseUpdateMediaPopup();
    }
  };

  const handleMediaUploadChange = (info: any) => {
    if (info.file) {
      // Xử lý upload file tại đây
      console.log("File được chọn:", info.file);
      
      // Cập nhật preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUpdatedMediaData(prev => ({
          ...prev,
          fileObj: info.file,
          previewUrl: e.target?.result as string
        }));
      };
      reader.readAsDataURL(info.file);
    }
    return false; // Ngăn chặn hành vi upload mặc định
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {action === "add"
            ? "Thêm sản phẩm"
            : action === "edit"
            ? "Chỉnh sửa sản phẩm"
            : "Xem sản phẩm"}
        </Typography>

        {/* Basic Information */}
        <Typography variant="h6" gutterBottom style={{ marginTop: "16px" }}>
          Thông tin sản phẩm
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Input
            placeholder="Nhập tên sản phẩm"
            value={formData.name}
            disabled={isView}
            onChange={(e) => handleInputChange("name", e.target.value)}
            style={{ flex: 1 }}
          />
          <MuiButton
            variant="outlined"
            color="primary"
            onClick={handleGetSuggestions}
            disabled={isView || !formData.name || isLoadingAi}
            startIcon={isLoadingAi ? <CircularProgress size={20} /> : null}
          >
            Gợi Ý (AI)
          </MuiButton>
        </Box>

        <Input
          placeholder="Nhập mô tả ngắn về sản phẩm"
          value={formData.shortDescription}
          disabled={isView}
          onChange={(e) =>
            handleInputChange("shortDescription", e.target.value)
          }
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Nhập đường dẫn slug (vd: san-pham-moi)"
          value={formData.slug}
          disabled={isView}
          onChange={(e) => handleInputChange("slug", e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        <Select
          placeholder="Chọn danh mục sản phẩm"
          value={formData.categoryId}
          disabled={isView || isCategoriesLoading}
          onChange={(value) => handleInputChange("categoryId", value)}
          style={{ width: "100%", marginBottom: "16px" }}
          loading={isCategoriesLoading}
        >
          {productCategories && productCategories.length > 0
            ? productCategories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))
            : null}
        </Select>

        <div style={{ marginBottom: "16px" }}>
          <Typography variant="body2" gutterBottom>
            Mô tả chi tiết
          </Typography>
          <Editor
            disabled={isView}
            value={editorContent}
            onChange={(content) => {
              handleInputChange("description", content);
              setEditorContent(content);
            }}
            placeholder="Nhập mô tả chi tiết về sản phẩm"
          />
        </div>

        {/* Media Section */}
        <Typography variant="h6" gutterBottom>
          Hình ảnh & Video
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setMediaType("image");
                setMediaPopupOpen(true);
              }}
              disabled={isView}
            >
              Thêm hình ảnh
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setMediaType("video");
                setMediaPopupOpen(true);
              }}
              disabled={isView}
            >
              Thêm video
            </Button>
          </Space>
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
            {formData?.media?.map((media, index) => (
              <Box
                key={index}
                sx={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {media.type === "image" ? (
                  <img
                    src={process.env.NEXT_PUBLIC_API_URL + media.url}
                    alt={media.altText}
                    style={{ width: 100, height: 100, objectFit: "cover" }}
                  />
                ) : (
                  <div className="item">
                  <img
                    src={"https://img.youtube.com/vi/" + getYoutubeVideoId(media.url) + "/hqdefault.jpg"}
                    style={{ width: 100, height: 100, objectFit: "cover" }}
                  />
                
                </div>
                )}
                {!isView && (
                  <>
                    <div style={{ 
                      position: "absolute", 
                      top: 0, 
                      right: 0, 
                      display: "flex", 
                      gap: "5px" 
                    }}>
                      {/* Nút Update */}
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenUpdateMediaPopup(media, index)}
                        style={{
                          backgroundColor: "white",
                          borderColor: "#1890ff",
                          borderWidth: "1.5px",
                          color: "#1890ff",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          width: "30px",
                          height: "30px",
                          padding: 0,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "#1890ff";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 8px rgba(0,0,0,0.3)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                          e.currentTarget.style.color = "#1890ff";
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 4px rgba(0,0,0,0.2)";
                        }}
                      />
                      
                      {/* Nút Delete */}
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveMedia(index)}
                        style={{
                          backgroundColor: "white",
                          borderColor: "red",
                          borderWidth: "1.5px",
                          color: "red",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          width: "30px",
                          height: "30px",
                          padding: 0,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "red";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 8px rgba(0,0,0,0.3)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                          e.currentTarget.style.color = "red";
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 4px rgba(0,0,0,0.2)";
                        }}
                      />
                    </div>
               
                  
                  </>
                )}
              </Box>
            ))}
          </Box>
          
          {/* Modal cập nhật Media */}
          <Modal
            title="Cập nhật Media"
            open={updateMediaModalVisible}
            onCancel={handleCloseUpdateMediaPopup}
            footer={[
              <Button key="cancel" onClick={handleCloseUpdateMediaPopup}>
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={handleUpdateMedia}
              >
                Cập nhật
              </Button>,
            ]}
          >
            <Form layout="vertical">
              {updatedMediaData.type === "image" && (
                <>
                  <Form.Item label="Hình ảnh hiện tại">
                    {updatedMediaData.previewUrl ? (
                      <img
                        src={updatedMediaData.previewUrl}
                        alt="Preview"
                        style={{ width: "100%", maxHeight: "200px", objectFit: "contain" }}
                      />
                    ) : (
                      <img
                        src={process.env.NEXT_PUBLIC_API_URL + updatedMediaData.url}
                        alt={updatedMediaData.altText}
                        style={{ width: "100%", maxHeight: "200px", objectFit: "contain" }}
                      />
                    )}
                  </Form.Item>
                  <Form.Item label="Alt Text">
                    <Input
                      value={updatedMediaData.altText}
                      onChange={(e) => setUpdatedMediaData({...updatedMediaData, altText: e.target.value})}
                      placeholder="Nhập mô tả hình ảnh cho SEO"
                    />
                  </Form.Item>
                  <Form.Item label="Thay đổi hình ảnh">
                    <Upload
                      name="file"
                      listType="picture"
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={handleMediaUploadChange}
                    >
                      <Button icon={<UploadOutlined />}>Chọn hình ảnh mới</Button>
                    </Upload>
                  </Form.Item>
                </>
              )}
              {updatedMediaData.type === "video" && (
                <>
                  <Form.Item label="Video hiện tại">
                    <img
                      src={"https://img.youtube.com/vi/" + getYoutubeVideoId(updatedMediaData.url) + "/hqdefault.jpg"}
                      style={{ width: "100%", maxHeight: "200px", objectFit: "contain" }}
                    />
                  </Form.Item>
                  <Form.Item label="YouTube URL">
                    <Input
                      value={updatedMediaData.url}
                      onChange={(e) => setUpdatedMediaData({...updatedMediaData, url: e.target.value})}
                      placeholder="Nhập URL YouTube (vd: https://www.youtube.com/watch?v=xxxx)"
                    />
                  </Form.Item>
                </>
              )}
            </Form>
          </Modal>
        </Box>

        {/* Product Items */}
        <Typography variant="h6" gutterBottom>
          Danh sách sản phẩm con
        </Typography>
        {formData?.items?.map((item, index) => (
          <Box
            key={index}
            sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Input
                placeholder="Nhập tên sản phẩm con"
                value={item.name}
                disabled={isView}
                onChange={(e) =>
                  handleItemChange(index, "name", e.target.value)
                }
              />
              <Input
                placeholder="Nhập màu sắc (vd: Đỏ, Xanh, v.v.)"
                value={item.color}
                disabled={isView}
                onChange={(e) =>
                  handleItemChange(index, "color", e.target.value)
                }
              />
              <Input
                type="number"
                placeholder="Nhập giá bán (VNĐ)"
                value={item.price}
                disabled={isView}
                onChange={(e) =>
                  handleItemChange(index, "price", Number(e.target.value))
                }
              />
              <Input
                type="number"
                placeholder="Nhập giá gốc (VNĐ)"
                value={item.originalPrice}
                disabled={isView}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "originalPrice",
                    Number(e.target.value)
                  )
                }
              />
              <Select
                placeholder="Chọn trạng thái"
                value={item.status}
                disabled={isView}
                onChange={(value) => handleItemChange(index, "status", value)}
                style={{ width: "100%" }}
              >
                <Select.Option value="available">Còn hàng</Select.Option>
                <Select.Option value="out_of_stock">Hết hàng</Select.Option>
                <Select.Option value="discontinued">Ngừng kinh doanh</Select.Option>
              </Select>
              {!isView && (
                <Button
                  type="link"
                  danger
                  onClick={() => handleRemoveItem(index)}
                >
                  Xóa sản phẩm con
                </Button>
              )}
            </Space>
          </Box>
        ))}
        {!isView && (
          <Button
            type="dashed"
            onClick={handleAddItem}
            style={{ width: "100%" }}
          >
            Thêm sản phẩm con
          </Button>
        )}

        {/* SEO Information */}
        <Typography variant="h6" gutterBottom>
          Thông tin SEO
        </Typography>
        <Input
          placeholder="Nhập tiêu đề cho SEO (Meta Title)"
          value={formData?.metaTitle || ""}
          disabled={isView}
          onChange={(e) => handleInputChange("metaTitle", e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Nhập mô tả cho SEO (Meta Description)"
          value={formData?.metaDescription || ""}
          disabled={isView}
          onChange={(e) => handleInputChange("metaDescription", e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        <Input
          placeholder="Nhập từ khóa cho SEO, phân cách bằng dấu phẩy (Meta Keywords)"
          value={formData?.metaKeywords || ""}
          disabled={isView}
          onChange={(e) => handleInputChange("metaKeywords", e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        {/* Dates */}
        <Typography variant="h6" gutterBottom>
          Thông tin thời gian
        </Typography>
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          <div style={{ width: "50%" }}>
            <Typography variant="body2" gutterBottom>
              Ngày tạo
            </Typography>
            <DatePicker
              value={formData?.createdAt ? dayjs(formData?.createdAt) : null}
              onChange={(date) => {
                handleInputChange(
                  "createdAt",
                  date ? date.toISOString() : null
                );
              }}
              format="YYYY-MM-DD HH:mm:ss"
              showTime
              disabled={true}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ width: "50%" }}>
            <Typography variant="body2" gutterBottom>
              Ngày cập nhật
            </Typography>
            <DatePicker
              value={formData?.updatedAt ? dayjs(formData?.updatedAt) : null}
              onChange={(date) => {
                handleInputChange(
                  "updatedAt",
                  date ? date.toISOString() : null
                );
              }}
              format="YYYY-MM-DD HH:mm:ss"
              showTime
              disabled={true}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          {onCancel && (
            <MuiButton onClick={onCancel} sx={{ mr: 1 }}>
              Hủy
            </MuiButton>
          )}
          {!isView && (
            <MuiButton
              onClick={handleSubmit}
              variant="contained"
              color="primary"
            >
              Lưu
            </MuiButton>
          )}
        </Box>

        <ConfirmPopup
          open={confirmPopupOpen}
          onClose={() => setConfirmPopupOpen(false)}
          onSubmit={handleConfirmSubmit}
          Content={
            action === "add"
              ? "Bạn có chắc chắn muốn thêm sản phẩm mới?"
              : "Bạn có chắc chắn muốn cập nhật sản phẩm?"
          }
        />

        {showAiSuggestions && (
          <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              AI Suggestions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Input
                placeholder="Tiêu đề SEO được đề xuất"
                value={aiSuggestions.title}
                onChange={(e) =>
                  setAiSuggestions((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
              <Input.TextArea
                placeholder="Mô tả SEO được đề xuất"
                value={aiSuggestions.description}
                onChange={(e) =>
                  setAiSuggestions((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Từ khóa SEO được đề xuất"
                value={aiSuggestions.keywords}
                onChange={(e) =>
                  setAiSuggestions((prev) => ({
                    ...prev,
                    keywords: e.target.value,
                  }))
                }
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <MuiButton
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleInputChange("metaTitle", aiSuggestions.title);
                    handleInputChange(
                      "metaDescription",
                      aiSuggestions.description
                    );
                    handleInputChange("metaKeywords", aiSuggestions.keywords);
                    setShowAiSuggestions(false);
                  }}
                >
                  Áp dụng gợi ý
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  onClick={() => setShowAiSuggestions(false)}
                >
                  Hủy
                </MuiButton>
              </Box>
            </Box>
          </Paper>
        )}
      </CardContent>
      <MediaPopup
        listMedia={formData.media}
        open={mediaPopupOpen}
        onClose={() => setMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
      />
    </Card>
  );
};

export default ProductForm;
