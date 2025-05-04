"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Snackbar,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Paper
} from '@/config/mui';
import { IconUpload, IconTrash, IconEdit, IconPlus } from '@tabler/icons-react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
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
  formData: ProductAttributes;
  isView?: boolean;
  isEdit?: boolean;
  onSubmit: (data: ProductAttributes) => Promise<void>;
  onCancel: () => void;
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

interface MediaPopupProps {
  listMedia: ProductMedia[];
  open: boolean;
  onClose: () => void;
  onSelect: (media: ProductMedia) => void;
  onSubmit: () => void;
}

interface ConfirmPopupProps {
  open: boolean;
  onClose: () => void;
  content: string;
  onConfirm: () => void;
  title: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  formData: initialFormData,
  isView = false,
  isEdit = false,
  onSubmit,
  onCancel,
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

  const [formData, setFormData] = useState<ProductAttributes>(initialFormData);
  const [editorContent, setEditorContent] = useState("");
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
  const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);
  const [primaryMediaIndex, setPrimaryMediaIndex] = useState<number>(-1);
  const [updateMediaModalVisible, setUpdateMediaModalVisible] = useState(false);
  const [updatedMediaData, setUpdatedMediaData] = useState<ExtendedProductMedia>({
    id: 0,
    url: "",
    type: "image",
    isPrimary: false,
    createdAt: "",
    updatedAt: ""
  });
  const [mediaPopupOpen, setMediaPopupOpen] = useState(false);

  const searchParams = useSearchParams();
  const slug = searchParams?.get("slug") || "";
  const router = useRouter();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showError = (msg: string) => {
    setSnackbar({
      open: true,
      message: msg,
      severity: 'error'
    });
  };

  const showSuccess = (msg: string) => {
    setSnackbar({
      open: true,
      message: msg,
      severity: 'success'
    });
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        await fetchProductCategories();
      } catch (error) {
        console.error("Error loading product categories:", error);
        showError("Failed to load product categories");
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [fetchProductCategories]);

  useEffect(() => {
    if (isEdit && slug) {
      fetchProductBySlug(slug).then(() => {
        console.log("selectedProduct after fetch", selectedProduct);
      });
    }
  }, [isEdit, slug]);

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
        slug: "",
        description: "",
        shortDescription: "",
        price: 0,
        salePrice: 0,
        status: "draft",
        categoryId: 0,
        avatarUrl: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
        media: []
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
    setFormData((prev: ProductAttributes) => ({
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

    const newProductMedia: ProductMedia = {
      id: 0,
      url: media.url,
      type: mediaType,
      isPrimary: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newMedia = [...formData.media, newProductMedia];

    setFormData((prev: ProductAttributes) => ({
      ...prev,
      media: newMedia
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

    setFormData((prev: ProductAttributes) => ({
      ...prev,
      media: newMedia
    }));

    console.log("Đã cập nhật media trong formData sau khi xóa");
  };

  const handleAddItem = () => {
    const newItems = [...formData.items];
    newItems.push({
      id: 0,
      name: "",
      price: 0,
      salePrice: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    setFormData((prev: ProductAttributes) => ({
      ...prev,
      items: newItems
    }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);

    setFormData((prev: ProductAttributes) => ({
      ...prev,
      items: newItems
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    setFormData((prev: ProductAttributes) => ({
      ...prev,
      items: newItems
    }));
  };

  const handleSubmit = () => {
    console.log("submit", formData);
    setConfirmPopupOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (isEdit) {
      const productData: ProductAttributes = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      updateProduct(formData.id, productData)
        .then(() => {
          showSuccess("Cập nhật sản phẩm thành công");
          router.push("/san-pham");
        })
        .catch((error) => {
          showError("Cập nhật sản phẩm thất bại");
          console.error("Error updating product:", error);
        });
    } else {
      createProduct(formData)
        .then(() => {
          showSuccess("Thêm sản phẩm thành công");
          router.push("/san-pham");
        })
        .catch((error) => {
          showError("Thêm sản phẩm thất bại");
          console.error("Error creating product:", error);
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
      showError("Failed to get AI suggestions");
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
      url: media.url || "",
      type: media.type || "image",
      isPrimary: false,
      createdAt: media.createdAt || "",
      updatedAt: media.updatedAt || "",
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
              isPrimary: updatedMediaData.isPrimary
            }
          ]
        }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Không thể cập nhật thông tin media');
      }
      
      const updateResult = await updateResponse.json();
      
      // Cập nhật media trong formData
      const updatedMedia = [...formData.media];
      const mediaIndex = updatedMedia.findIndex(m => m.id === updatedMediaData.id);
      
      if (mediaIndex !== -1) {
        updatedMedia[mediaIndex] = {
          ...updatedMedia[mediaIndex],
          url: updatedMediaData.url,
          isPrimary: updatedMediaData.isPrimary,
          type: updatedMediaData.type
        };
        
        setFormData((prev: ProductAttributes) => ({
          ...prev,
          media: updatedMedia
        }));
        
        showSuccess("Đã cập nhật thông tin media thành công");
      }
      
    } catch (error) {
      console.error("Lỗi khi cập nhật media:", error);
      showError("Cập nhật media thất bại: " + (error instanceof Error ? error.message : "Lỗi không xác định"));
    } finally {
      handleCloseUpdateMediaPopup();
    }
  };

  const handleMediaUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUpdatedMediaData({
          ...updatedMediaData,
          previewUrl: reader.result as string,
          fileObj: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Suspense fallback={<p>Loading</p>}>
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        </Typography>

        {/* Basic Information */}
        <Typography variant="h6" gutterBottom style={{ marginTop: "16px" }}>
          Thông tin sản phẩm
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 2, marginTop: "16px" }}>
          <TextField
            placeholder="Nhập tên sản phẩm"
            value={formData.name}
            disabled={isView}
            onChange={(e) => handleInputChange("name", e.target.value)}
            style={{ flex: 1}}
            label="Tên sản phẩm"
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={handleGetSuggestions}
            disabled={isView || !formData.name || isLoadingAi}
            startIcon={isLoadingAi ? <CircularProgress size={20} /> : null}
          >
            Gợi Ý (AI)
          </Button>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Mô tả ngắn"
          value={formData.shortDescription}
          onChange={(e) => handleInputChange("shortDescription", e.target.value)}
          disabled={isView}
        />

        <TextField
          placeholder="Nhập đường dẫn slug (vd: san-pham-moi)"
          value={formData.slug}
          disabled={isView}
          onChange={(e) => handleInputChange("slug", e.target.value)}
          style={{ marginBottom: "16px", width: "100%", marginTop: "16px" }}
          label="Slug"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="category-label" style={{ backgroundColor: "white" }}>Chọn danh mục sản phẩm</InputLabel>
          <Select
            labelId="category-label"
            value={formData.categoryId}
            onChange={(e) => handleInputChange("categoryId", e.target.value)}
            disabled={isView || isCategoriesLoading}
          >
            {productCategories && productCategories.length > 0
              ? productCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))
              : null}
          </Select>
        </FormControl>

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
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={() => {
                setMediaType("image");
                setMediaPopupOpen(true);
              }}
              disabled={isView}
            >
              Thêm hình ảnh
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setMediaType("video");
                setMediaPopupOpen(true);
              }}
              disabled={isView}
            >
              Thêm video
            </Button>
          </Stack>
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
                    alt=""
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
                      <IconButton
                        color="primary"
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
                      >
                        <IconEdit />
                      </IconButton>
                      
                      {/* Nút Delete */}
                      <IconButton
                        color="error"
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
                      >
                        <IconTrash />
                      </IconButton>
                    </div>
               
                  
                  </>
                )}
              </Box>
            ))}
          </Box>
          
          {/* Modal cập nhật Media */}
          <Dialog
            open={updateMediaModalVisible}
            onClose={handleCloseUpdateMediaPopup}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Cập nhật Media
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {updatedMediaData.type === "image" && (
                  <>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Hình ảnh hiện tại
                      </Typography>
                      <Image
                        src={updatedMediaData.previewUrl || process.env.NEXT_PUBLIC_API_URL + updatedMediaData.url}
                        alt=""
                        width={300}
                        height={200}
                        style={{ objectFit: "contain" }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Thay đổi hình ảnh
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<IconUpload />}
                        component="label"
                      >
                        Chọn hình ảnh mới
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleMediaUploadChange}
                        />
                      </Button>
                    </Box>
                  </>
                )}
                {updatedMediaData.type === "video" && (
                  <>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Video hiện tại
                      </Typography>
                      <Image
                        src={`https://img.youtube.com/vi/${getYoutubeVideoId(updatedMediaData.url)}/hqdefault.jpg`}
                        alt=""
                        width={300}
                        height={200}
                        style={{ objectFit: "contain" }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="YouTube URL"
                      value={updatedMediaData.url}
                      onChange={(e) => setUpdatedMediaData({
                        ...updatedMediaData,
                        url: e.target.value
                      })}
                      placeholder="Nhập URL YouTube (vd: https://www.youtube.com/watch?v=xxxx)"
                    />
                  </>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseUpdateMediaPopup}>
                Hủy
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateMedia}
              >
                Cập nhật
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        {/* Product Items */}
        <Typography variant="h6" gutterBottom>
          Danh sách sản phẩm con
        </Typography>
        <Stack spacing={2}>
          {formData.items.map((item, index) => (
            <Box
              key={index}
              sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
            >
              <Stack spacing={2} sx={{ width: "100%", alignItems: "center" }}>
                <TextField
                  placeholder="Nhập tên sản phẩm con"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, "name", e.target.value)}
                  disabled={isView}
                  sx={{ width: "100%" }}
                />
                {!isView && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                    sx={{ width: "30px" }}
                  >
                    <IconTrash />
                  </Button>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          {!isView && (
            <Button
              variant="outlined"
              onClick={handleAddItem}
              startIcon={<IconPlus size={20} />}
              sx={{ 
                minWidth: 200,
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white'
                }
              }}
            >
              Thêm sản phẩm con
            </Button>
          )}
        </Box>

        {/* SEO Information */}
        <Typography variant="h6" gutterBottom>
          Thông tin SEO
        </Typography>
        <TextField
          placeholder="Nhập tiêu đề cho SEO (Meta Title)"
          value={formData?.metaTitle || ""}
          disabled={isView}
          onChange={(e) => handleInputChange("metaTitle", e.target.value)}
          style={{ marginBottom: "16px" }}
          sx={{ width: "100%" }}
        />

        <TextField
          placeholder="Nhập mô tả cho SEO (Meta Description)"
          value={formData?.metaDescription || ""}
          disabled={isView}
          onChange={(e) => handleInputChange("metaDescription", e.target.value)}
          style={{ marginBottom: "16px" }}
          sx={{ width: "100%" }}
        />

        <TextField
          placeholder="Nhập từ khóa cho SEO, phân cách bằng dấu phẩy (Meta Keywords)"
          value={formData?.metaKeywords || ""}
          disabled={isView}
          onChange={(e) => handleInputChange("metaKeywords", e.target.value)}
          style={{ marginBottom: "16px" }}
          sx={{ width: "100%" }}
        />

        {/* Dates */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Thông tin thời gian
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack spacing={2}>
            <DateTimePicker
              label="Ngày tạo"
              value={dayjs(formData.createdAt)}
              onChange={(date) => handleInputChange("createdAt", date?.toISOString())}
              disabled={true}
              sx={{ width: "100%" }}
            />
            <DateTimePicker
              label="Ngày cập nhật"
              value={dayjs(formData.updatedAt)}
              onChange={(date) => handleInputChange("updatedAt", date?.toISOString())}
              disabled={true}
              sx={{ width: "100%" }}
            />
          </Stack>
        </LocalizationProvider>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={onCancel}
            >
              {isView ? "Quay lại" : "Hủy"}
            </Button>
            {!isView && (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : "Thêm mới"}
              </Button>
            )}
          </Stack>
        </Box>

        <ConfirmPopup
          open={confirmPopupOpen}
          onClose={() => setConfirmPopupOpen(false)}
          content="Bạn có chắc chắn muốn lưu thông tin sản phẩm?"
          onConfirm={handleConfirmSubmit}
          title="Thêm sản phẩm mới"
        />

        {showAiSuggestions && (
          <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              AI Suggestions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <TextField
                placeholder="Tiêu đề SEO được đề xuất"
                value={aiSuggestions.title}
                onChange={(e) =>
                  setAiSuggestions((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mô tả SEO được đề xuất"
                value={aiSuggestions.description}
                onChange={(e) =>
                  setAiSuggestions((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <TextField
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
                <Button
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
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowAiSuggestions(false)}
                >
                  Hủy
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Add MUI Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
      <MediaPopup
        listMedia={selectedMedia}
        open={mediaPopupOpen}
        onClose={() => setMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
        onSubmit={() => {}}
      />
    </Card>
    </Suspense>
  );
};

export default ProductForm;
