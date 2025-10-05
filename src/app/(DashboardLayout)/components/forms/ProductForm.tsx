"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Paper,
  Chip,
  Box
} from '@/config/mui';
import { Rating, FormControlLabel, Checkbox } from '@mui/material';
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
import { convertToSlug } from "../function/TittleToSlug";
import ApiService from "@/services/ApiService";
import { Divider } from "@mui/material";

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
  data: string;
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
    generateAIContent,
  } = useAppContext();

  const [formData, setFormData] = useState<ProductAttributes>(initialFormData);
  const [editorContent, setEditorContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<ProductMedia[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
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
    createdAt: "",
    updatedAt: "",
    productId: 0,
    previewUrl: "",
    fileObj: undefined,
  });
  const [mediaPopupOpen, setMediaPopupOpen] = useState(false);
  const [contentScore, setContentScore] = useState<number | null>(null);
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: React.ReactNode;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const [itemMediaPopupOpen, setItemMediaPopupOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams?.get('slug');

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
        if (productCategories.length === 0) {
          setIsCategoriesLoading(true);
          await fetchProductCategories();
        }
      } catch (error) {
        showError("Failed to load product categories");
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [fetchProductCategories, productCategories.length]);

  useEffect(() => {
    if (isEdit && slug) {
      fetchProductBySlug(slug).then(() => {
        // Xử lý sau khi fetch hoàn tất
      });
    }
  }, [isEdit, slug, fetchProductBySlug]);

  useEffect(() => {
    if (selectedProduct) {
      const productMedias = selectedProduct.media || [];
      
      const itemsWithMediaIndex = selectedProduct.items.map(item => {
        let mediaIds: number[] = [];
        
        if (item.mediaIds) {
          if (typeof item.mediaIds === 'string') {
            try {
              mediaIds = JSON.parse(item.mediaIds);
            } catch (error) {
              mediaIds = [];
            }
          } else if (Array.isArray(item.mediaIds)) {
            mediaIds = item.mediaIds;
          }
        }
        
        if (mediaIds && Array.isArray(mediaIds) && mediaIds.length > 0) {
          const mediaIndex = mediaIds.map(mediaId => {
            const foundIndex = productMedias.findIndex(media => media.id === mediaId);
            return foundIndex !== -1 ? foundIndex : -1;
          }).filter(index => index !== -1);
          
          return {
            ...item,
            mediaIds: mediaIds,
            mediaIndex: mediaIndex
          };
        }
        
        return {
          ...item,
          mediaIds: mediaIds,
          mediaIndex: []
        };
      });
      
      setFormData({
        ...selectedProduct,
        media: productMedias,
        items: itemsWithMediaIndex
      });
      setEditorContent(selectedProduct.description || "");
      setSelectedMedia(productMedias as any);
    } else {
      setFormData({
        id: 0,
        name: "",
        slug: "",
        description: "",
        shortDescription: "",
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
    setSelectedMedia((formData.media as any) || []);
  }, [formData.media]);

  useEffect(() => {
    if (formData.name) {
      setFormData(prev => ({
        ...prev,
        slug: convertToSlug(formData.name)
      }));
    }
  }, [formData.name]);

  const [shortDescriptionContent, setShortDescriptionContent] = useState('');
  const [descriptionContent, setDescriptionContent] = useState('');

  useEffect(() => {
    setShortDescriptionContent(formData?.shortDescription || '');
    setDescriptionContent(formData?.description || '');
  }, [formData?.id, formData?.shortDescription, formData?.description]);

  useEffect(() => {
    if (formData) {
      setShortDescriptionContent(formData.shortDescription || '');
      setDescriptionContent(formData.description || '');
    }
  }, [formData]);

  useEffect(() => {
    if (initialFormData && isEdit) {
      setShortDescriptionContent(initialFormData.shortDescription || '');
      setDescriptionContent(initialFormData.description || '');
    }
  }, [initialFormData, isEdit]);

  const handleInputChange = (field: keyof ProductAttributes, value: any) => {
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
    const newProductMedia: ProductMedia = {
      id: 0,
      url: media.url,
      type: mediaType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productId: 0,
    };

    const newMedia = [...formData.media, newProductMedia];

    const newAvatarUrl = (!formData.avatarUrl && newMedia.length === 1)
      ? media.url
      : formData.avatarUrl;

    setFormData((prev: ProductAttributes) => ({
      ...prev,
      media: newMedia,
      avatarUrl: newAvatarUrl
    }));
  };

  const handleRemoveMedia = async (index: number) => {
    await productMediaDelete(formData.media[index].id)
      .then(() => {
        // Media deleted successfully
      })
      .catch((error) => {
        // Error deleting media
      });
    const newMedia = [...formData.media];
    const removedMedia = newMedia.splice(index, 1)[0];

    let newAvatarUrl = formData.avatarUrl;
    if (removedMedia.url === formData.avatarUrl) {
      newAvatarUrl = newMedia.length > 0 ? newMedia[0].url : "";
    }

    setFormData((prev: ProductAttributes) => ({
      ...prev,
      media: newMedia,
      avatarUrl: newAvatarUrl
    }));
  };

  const handleAddItem = () => {
    const newItems = [...formData.items];
    newItems.push({
      id: 0,
      name: "",
      price: 0,
      originalPrice: 0,
      status: "available",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: "",
      mediaIds: [],
      mediaIndex: []
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

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await updateProduct(formData.id, formData);
      } else {
        await createProduct(formData);
      }
      router.push("/san-pham");
    } catch (error) {
      handleErrorDisplay(error);
      setConfirmPopupOpen(false);
    }
  };

  const isFormValid = () => {
    return Boolean(
      formData?.name &&
      formData?.description
    );
  };

  const handleGetSuggestions = async () => {
    try {
      setIsLoadingAi(true);

      const result = await generateAIContent(formData.description || '', 'evaluate');

      if (result.data) {
        setAiSuggestions(result.data);
        setShowAiSuggestions(true);
        setSnackbar({
          open: true,
          message: 'Gợi ý AI đã được tạo thành công',
          severity: 'success'
        });
      }
    } catch (error) {
      const errorResult = ApiService.handleError(error);

      setSnackbar({
        open: true,
        message: errorResult.message,
        severity: 'error'
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleGenerateContent = async () => {
    try {
      setIsLoadingAi(true);
      const result = await generateAIContent(formData.name, 'product') as any;

      if (result.data && result.data.result) {
        setAiSuggestions(result.data);
        setShowAiSuggestions(true);
        handleInputChange("description", result.data.result);
        handleEditorChange(result.data.result);
        setSnackbar({
          open: true,
          message: 'Tạo nội dung bằng AI thành công',
          severity: 'success'
        });
      }
    } catch (error) {
      const errorResult = ApiService.handleError(error);

      setSnackbar({
        open: true,
        message: errorResult.message,
        severity: 'error'
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleScoreContent = async () => {
    try {
      setIsLoadingAi(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/score-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: formData.description,
          type: 'product',
        }),
      });

      const data = await response.json();

      if (data.success && data.data && data.data.score) {
        setContentScore(data.data.score);
        showSuccess('Đã chấm điểm nội dung thành công');
      } else {
        showError('Không thể chấm điểm nội dung');
      }
    } catch (error) {
      handleErrorDisplay(error);
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
  };

  const handleOpenUpdateMediaPopup = (media: ProductMedia, index: number) => {
    setUpdateMediaModalVisible(true);
    setUpdatedMediaData({
      id: media.id || 0,
      url: media.url || "",
      type: media.type || "image",
      createdAt: media.createdAt || "",
      updatedAt: media.updatedAt || "",
      fileObj: undefined,
      previewUrl: media.url || "",
      productId: media.productId || 0,
    });
  };

  const handleCloseUpdateMediaPopup = () => {
    setUpdateMediaModalVisible(false);
  };

  const handleUpdateMedia = async () => {
    try {
      if (updatedMediaData.fileObj) {
        const formData = new FormData();
        formData.append('file', updatedMediaData.fileObj);
        formData.append('type', 'image');

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/media`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Không thể upload file');
        }

        const uploadResult = await uploadResponse.json();
        updatedMediaData.url = uploadResult.data.url;
      }

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
            }
          ]
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Không thể cập nhật thông tin media');
      }

      const updateResult = await updateResponse.json();

      const updatedMedia = [...formData.media];
      const mediaIndex = updatedMedia.findIndex(m => m.id === updatedMediaData.id);

      if (mediaIndex !== -1) {
        updatedMedia[mediaIndex] = {
          ...updatedMedia[mediaIndex],
          url: updatedMediaData.url,
          type: updatedMediaData.type
        };

        setFormData((prev: ProductAttributes) => ({
          ...prev,
          media: updatedMedia
        }));

        showSuccess("Đã cập nhật thông tin media thành công");
      }

    } catch (error) {
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

  const handleErrorDisplay = (error: any) => {
    console.error("Error occurred:", error);
    const errorMessage = error?.response?.data?.message ||
      error?.response?.data?.message ||
      error?.message ||
      'Đã xảy ra lỗi không xác định';

    if (error?.data && Array.isArray(error.data) && error.data.length > 0) {
      const errorMessages = error.data.map((err: any) => {
        if (typeof err === 'string') return err;
        if (err.message) return err.message;
        return JSON.stringify(err);
      });

      setSnackbar({
        open: true,
        message: (
          <Box>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Đã xảy ra các lỗi sau:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errorMessages.map((msg: string, index: number) => (
                <li key={index}>
                  <Typography variant="body2">{msg}</Typography>
                </li>
              ))}
              <li key={`0`}>
                <Typography variant="body2">{errorMessage}</Typography>
              </li>
            </ul>
          </Box>
        ),
        severity: 'error'
      });
      return;
    } else {
      showError(errorMessage);
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      if (isEdit) {
        const productData: ProductAttributes = {
          ...formData,
          updatedAt: new Date().toISOString(),
        };
        await updateProduct(formData.id, productData);
        showSuccess("Cập nhật sản phẩm thành công");
        router.push("/san-pham");
      } else {
        await createProduct(formData);
        showSuccess("Thêm sản phẩm thành công");
        router.push("/san-pham");
      }

      setConfirmPopupOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleItemMediaSelect = (media: ProductMedia) => {
    if (selectedItemIndex === -1) return;

    const newProductMedia: ProductMedia = {
      id: 0,
      url: media.url,
      type: media.type,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
      productId: media.productId,
    };

    const newMedia = [...(formData.media || []), newProductMedia];
    const newMediaIndex = newMedia.length - 1;

    const newItems = [...formData.items];
    const currentItem = newItems[selectedItemIndex];
    
    if (!currentItem.mediaIds) {
      currentItem.mediaIds = [];
    }
    currentItem.mediaIds.push(media.id);
    
    if (!currentItem.mediaIndex) {
      currentItem.mediaIndex = [];
    }
    currentItem.mediaIndex.push(newMediaIndex);
  
    setFormData((prev: ProductAttributes) => ({
      ...prev,
      media: newMedia,
      items: newItems
    }));

    setItemMediaPopupOpen(false);
    setSelectedItemIndex(-1);
  };

  const handleRemoveItemMedia = (itemIndex: number, mediaIndexInItem: number) => {
    const newItems = [...formData.items];
    const currentItem = newItems[itemIndex];
    
    if (currentItem.mediaIndex && currentItem.mediaIndex.length > mediaIndexInItem) {
      const globalMediaIndex = currentItem.mediaIndex[mediaIndexInItem];
      
      const newMedia = [...(formData.media || [])];
      newMedia.splice(globalMediaIndex, 1);
      
      currentItem.mediaIds?.splice(mediaIndexInItem, 1);
      currentItem.mediaIndex.splice(mediaIndexInItem, 1);
      
      const updatedItems = newItems.map(itm => {
        if (itm.mediaIndex) {
          itm.mediaIndex = itm.mediaIndex.map(idx => 
            idx > globalMediaIndex ? idx - 1 : idx
          ).filter(idx => idx >= 0);
        }
        return itm;
      });

      let newAvatarUrl = formData.avatarUrl;
      const removedMedia = formData.media[globalMediaIndex];
      if (removedMedia && removedMedia.url === formData.avatarUrl) {
        newAvatarUrl = newMedia.length > 0 ? newMedia[0].url : "";
      }

      setFormData((prev: ProductAttributes) => ({
        ...prev,
        media: newMedia,
        items: updatedItems,
        avatarUrl: newAvatarUrl
      }));
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
          </Typography>
          
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom style={{ marginTop: "16px" }}>
            Thông tin sản phẩm
          </Typography>

          <Box sx={{ display: "flex", gap: 1, width: '100%', mb: 2 }}>
            <TextField
              label="Tên sản phẩm"
              placeholder="Nhập tên sản phẩm"
              value={formData.name || ""}
              disabled={isView}
              onChange={(e) => handleInputChange("name", e.target.value)}
              fullWidth
              required
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGenerateContent}
              disabled={isView || !formData.name || isLoadingAi}
              startIcon={isLoadingAi ? <CircularProgress size={20} /> : null}
            >
              Viết mô tả (AI)
            </Button>
          </Box>

          {/* Editor cho shortDescription */}
          <Box sx={{ marginBottom: "16px" }}>
            <Typography variant="body2" gutterBottom>
              Mô tả ngắn
            </Typography>
            <Editor
              disabled={isView}
              value={shortDescriptionContent}
              onChange={(content) => {
                handleInputChange("shortDescription", content);
                setShortDescriptionContent(content);
              }}
              placeholder="Nhập mô tả ngắn về sản phẩm"
            />
          </Box>

          {/* Editor cho description */}
          <Box sx={{ marginBottom: "16px" }}>
            <Typography variant="body2" gutterBottom>
              Mô tả chi tiết
            </Typography>
            <Editor
              disabled={isView}
              value={descriptionContent}
              onChange={(content) => {
                handleInputChange("description", content);
                setDescriptionContent(content);
              }}
              placeholder="Nhập mô tả chi tiết về sản phẩm"
            />
          </Box>

          <TextField
            placeholder="Nhập đường dẫn slug (vd: san-pham-moi)"
            value={formData.slug}
            disabled={isView}
            onChange={(e) => handleInputChange("slug", e.target.value)}
            style={{ marginBottom: "16px", width: "100%", marginTop: "16px" }}
            label="Slug"
            helperText="Tự động tạo từ tên sản phẩm. Thay đổi tên vẫn sẽ cập nhật slug."
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label" style={{ backgroundColor: "white" }}>
              Chọn danh mục sản phẩm
            </InputLabel>
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
          </Box>

          {/* Media Display */}
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
            {formData?.media?.map((media, index) => (
              <Box
                key={index}
                sx={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  border: formData.avatarUrl === media.url ? "2px solid #1976d2" : "1px solid #e0e0e0",
                  borderRadius: "4px",
                  padding: "4px",
                  transition: "all 0.3s ease",
                  cursor: !isView ? "pointer" : "default",
                  "&:hover": !isView ? {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    transform: "translateY(-2px)",
                    borderColor: "#1976d2",
                } : {}
                }}
                onClick={() => {
                  if (!isView) {
                    handleInputChange("avatarUrl", media.url);
                  }
                }}
              >
                {/* Hiển thị media dựa trên type */}
                {media.type === "video" ? (
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      position: "relative",
                      backgroundColor: "#000",
                      borderRadius: "4px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <video
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      preload="metadata"
                      muted
                    >
                      <source src={process.env.NEXT_PUBLIC_API_URL + media.url} />
                    </video>
                    {/* Video play icon overlay */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "30px",
                        height: "30px",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "14px",
                        pointerEvents: "none",
                      }}
                    >
                      ▶
                    </Box>
                    {/* Video type badge */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 2,
                        left: 2,
                        backgroundColor: "#f44336",
                        color: "white",
                        px: 0.5,
                        py: 0.2,
                        borderRadius: "2px",
                        fontSize: "10px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      VIDEO
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      position: "relative",
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}
                  >
                    <img
                      src={process.env.NEXT_PUBLIC_API_URL + media.url}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {/* Image type badge */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 2,
                        left: 2,
                        backgroundColor: "#4caf50",
                        color: "white",
                        px: 0.5,
                        py: 0.2,
                        borderRadius: "2px",
                        fontSize: "10px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      IMAGE
                    </Box>
                  </Box>
                )}

                {!isView && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      display: "flex",
                      gap: "4px",
                      zIndex: 10,
                    }}
                  >
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenUpdateMediaPopup(media, index);
                      }}
                      sx={{
                        backgroundColor: "white",
                        border: "1.5px solid #1890ff",
                        color: "#1890ff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        width: "30px",
                        height: "30px",
                        padding: 0,
                        "&:hover": {
                          backgroundColor: "#1890ff",
                          color: "white",
                          transform: "scale(1.1)",
                        }
                      }}
                    >
                      <IconEdit />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMedia(index);
                      }}
                      sx={{
                        backgroundColor: "white",
                        border: "1.5px solid red",
                        color: "red",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        width: "30px",
                        height: "30px",
                        padding: 0,
                        "&:hover": {
                          backgroundColor: "red",
                          color: "white",
                          transform: "scale(1.1)",
                        }
                      }}
                    >
                      <IconTrash />
                    </IconButton>
                  </Box>
                )}
                
                {formData.avatarUrl === media.url && (
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      borderRadius: 1,
                      mt: 1,
                      fontWeight: 'bold'
                    }}
                  >
                    Avatar
                  </Typography>
                )}
              </Box>
            ))}

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
                        <Box
                          sx={{
                            width: 300,
                            height: 200,
                            backgroundColor: "#000",
                            borderRadius: "4px",
                            overflow: "hidden",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <video
                            controls
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                            preload="metadata"
                          >
                            <source src={process.env.NEXT_PUBLIC_API_URL + updatedMediaData.url} />
                          </video>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          Thay đổi video
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<IconUpload />}
                          component="label"
                        >
                          Chọn video mới
                          <input
                            type="file"
                            hidden
                            accept="video/*"
                            onChange={handleMediaUploadChange}
                          />
                        </Button>
                      </Box>
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
                sx={{ mb: 2, p: 3, border: "1px solid #ddd", borderRadius: 1 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tên sản phẩm con"
                      placeholder="Nhập tên sản phẩm con"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      disabled={isView}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Loại"
                      placeholder="Loại"
                      value={item.color}
                      onChange={(e) => handleItemChange(index, "color", e.target.value)}
                      disabled={isView}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.price === -1}
                          onChange={(e) => {

                            if (e.target.checked) {
                              // Chọn "Liên hệ báo giá" - set CẢ HAI giá trị thành -1
                              const newItems = [...formData.items];
                              newItems[index] = {
                                ...newItems[index],
                                price: -1,
                                originalPrice: -1
                              };

                              setFormData((prev: ProductAttributes) => ({
                                ...prev,
                                items: newItems
                              }));

                            } else {
                              // Bỏ chọn "Liên hệ báo giá" - reset CẢ HAI về 0
                              const newItems = [...formData.items];
                              newItems[index] = {
                                ...newItems[index],
                                price: 0,
                                originalPrice: 0
                              };

                              setFormData((prev: ProductAttributes) => ({
                                ...prev,
                                items: newItems
                              }));

                            }
                          }}
                          disabled={isView}
                        />
                      }
                      label="Liên hệ báo giá"
                      sx={{ minWidth: '150px', m: 0 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    {item.originalPrice !== -1 ? (
                      <TextField
                        fullWidth
                        label="Giá gốc"
                        type="number"
                        placeholder="Nhập giá gốc"
                        value={item.originalPrice || ''}

                        onChange={(e) => handleItemChange(index, "originalPrice", Number(e.target.value))}
                        disabled={isView}
                        InputProps={{
                          endAdornment: <Typography>₫</Typography>
                        }}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label="Giá gốc"
                        type="text"
                        value={'Đã chọn liên hệ báo giá'}
                        disabled={true}
                      />

                    )}
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {item.price !== -1 ? (
                        <TextField
                          fullWidth
                          label="Giá khuyến mãi"
                          type="number"
                          placeholder="Nhập giá khuyến mãi"
                          value={item.price || ''}
                          onChange={(e) => handleItemChange(index, "price", Number(e.target.value))}
                          disabled={isView}
                          InputProps={{
                            endAdornment: <Typography>₫</Typography>
                          }}
                        />
                      ) : (
                        <TextField
                          fullWidth
                          label="Giá gốc"
                          type="text"
                          value={'Đã chọn liên hệ báo giá'}
                          disabled={true}
                        />
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        value={item.status}
                        onChange={(e) => handleItemChange(index, "status", e.target.value)}
                        disabled={isView}
                      >
                        <MenuItem value="available">Hoạt động</MenuItem>
                        <MenuItem value="discontinued">Không hoạt động</MenuItem>
                        <MenuItem value="out_of_stock">Hết hàng</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {!isView && (
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setSelectedItemIndex(index);
                            setMediaType("image");
                            setItemMediaPopupOpen(true);
                          }}
                          startIcon={<IconUpload />}
                        >
                          Thêm ảnh
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemoveItem(index)}
                          startIcon={<IconTrash />}
                        >
                          Xóa sản phẩm con
                        </Button>
                      </Stack>
                    )}
                  </Grid>

                  {/* Hiển thị media của item */}
                  {item.mediaIndex && item.mediaIndex.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Hình ảnh sản phẩm con:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {item.mediaIndex.map((mediaId, mediaIndexInItem) => {
                          const media = formData.media && formData.media[mediaId];
                          if (!media) return null;
                          
                          return (
                            <Box
                              key={`${index}-${mediaIndexInItem}`}
                              sx={{
                                position: "relative",
                                border: "1px solid #e0e0e0",
                                borderRadius: "4px",
                                padding: "4px",
                                width: 68,
                                height: 68,
                              }}
                            >
                              {media.type === "video" ? (
                                <Box
                                  sx={{
                                    width: 60,
                                    height: 60,
                                    backgroundColor: "#000",
                                    borderRadius: "4px",
                                    overflow: "hidden",
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}
                                >
                                  <video
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    preload="metadata"
                                    muted
                                  >
                                    <source src={process.env.NEXT_PUBLIC_API_URL + media.url} />
                                  </video>
                                  {/* Mini play icon */}
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: "50%",
                                      left: "50%",
                                      transform: "translate(-50%, -50%)",
                                      width: "20px",
                                      height: "20px",
                                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontSize: "10px",
                                      pointerEvents: "none",
                                    }}
                                  >
                                    ▶
                                  </Box>
                                </Box>
                              ) : (
                                <img
                                  src={process.env.NEXT_PUBLIC_API_URL + media.url}
                                  alt=""
                                  style={{ width: 60, height: 60, objectFit: "cover" }}
                                />
                              )}
                              
                              {!isView && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveItemMedia(index, mediaIndexInItem)}
                                  sx={{
                                    position: "absolute",
                                    top: -5,
                                    right: -5,
                                    backgroundColor: "white",
                                    width: 20,
                                    height: 20,
                                    "& .MuiSvgIcon-root": {
                                      fontSize: 14
                                    }
                                  }}
                                >
                                  <IconTrash />
                                </IconButton>
                              )}
                              
                              {/* Type badge */}
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 2,
                                  left: 2,
                                  backgroundColor: media.type === "video" ? "#f44336" : "#4caf50",
                                  color: "white",
                                  px: 0.5,
                                  borderRadius: "2px",
                                  fontSize: "8px",
                                  fontWeight: "bold",
                                  textTransform: "uppercase",
                                }}
                              >
                                {media.type === "video" ? "VID" : "IMG"}
                              </Box>
                              
                              <Typography
                                variant="caption"
                                sx={{
                                  position: "absolute",
                                  bottom: 2,
                                  right: 2,
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                  px: 0.5,
                                  borderRadius: 0.5,
                                  fontSize: '8px'
                                }}
                              >
                                #{mediaId}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Grid>
                  )}
                </Grid>
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
            label="Meta Title"
            placeholder="Nhập tiêu đề cho SEO (Meta Title)"
            value={formData?.metaTitle || ""}
            disabled={isView}
            onChange={(e) => handleInputChange("metaTitle", e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            helperText={`${(formData.metaTitle || '').length}/60 ký tự`}
          />

          <TextField
            label="Meta Description"
            placeholder="Nhập mô tả cho SEO (Meta Description)"
            value={formData?.metaDescription || ""}
            disabled={isView}
            onChange={(e) => handleInputChange("metaDescription", e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
            helperText={`${(formData.metaDescription || '').length}/160 ký tự`}
          />

          <TextField
            label="Meta Keywords"
            placeholder="Nhập từ khóa cho SEO, phân cách bằng dấu phẩy"
            value={formData?.metaKeywords || ""}
            disabled={isView}
            onChange={(e) => handleInputChange("metaKeywords", e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
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

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
            <Box>
              <Tooltip title={!isFormValid() && !isLoadingAi ? "Vui lòng điền đầy đủ các trường thông tin trước khi sử dụng gợi ý AI" : ""}>
                <span>
                  <Button
                    disabled={isView || !isFormValid() || isLoadingAi}
                    onClick={handleGetSuggestions}
                    variant="outlined"
                    color="secondary"
                    startIcon={isLoadingAi ? <CircularProgress size={20} /> : null}
                    sx={{
                      borderRadius: '4px',
                      textTransform: 'none',
                      fontWeight: 'medium',
                      borderWidth: '1.5px',
                      '&:hover': {
                        borderWidth: '1.5px',
                        backgroundColor: 'rgba(156, 39, 176, 0.04)'
                      }
                    }}
                  >
                    {isLoadingAi ? "Đang phân tích..." : "Gợi ý (AI)"}
                  </Button>
                </span>
              </Tooltip>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={onCancel}
                sx={{
                  minWidth: '100px',
                  textTransform: 'none',
                  fontWeight: 'medium'
                }}
              >
                {isView ? "Quay lại" : "Hủy"}
              </Button>
              {!isView && (
                <Button
                  variant="contained"
                  onClick={() => setConfirmPopupOpen(true)}
                  disabled={isLoading}
                  sx={{
                    minWidth: '120px',
                    textTransform: 'none',
                    fontWeight: 'medium',
                    boxShadow: 2
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : isEdit ? "Cập nhật" : "Thêm mới"}
                </Button>
              )}
            </Stack>
          </Box>

          <ConfirmPopup
            open={confirmPopupOpen}
            onClose={() => setConfirmPopupOpen(false)}
            content="Bạn có chắc chắn muốn lưu thông tin sản phẩm?"
            onConfirm={async () => {
              try {
                await handleConfirmSubmit();
              } catch (error) {
                handleErrorDisplay(error);
                setConfirmPopupOpen(false);
              }
            }}
            title={isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
          />

          {showAiSuggestions && aiSuggestions && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Gợi ý và Phân tích từ AI
              </Typography>

              {aiSuggestions.seoAnalysis && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Phân tích SEO
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2,
                          height: '100%',
                          bgcolor: '#f8f9fa',
                          borderTop: '4px solid #4caf50'
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" gutterBottom color="success.main">
                          Điểm mạnh
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {Array.isArray(aiSuggestions.seoAnalysis.strengths) ? (
                          <Box component="ul" sx={{ paddingLeft: '20px', margin: 0 }}>
                            {aiSuggestions.seoAnalysis.strengths.map((item: string, index: number) => (
                              <Box component="li" key={index}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {item}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2">
                            {aiSuggestions.seoAnalysis.strengths || 'Không có thông tin'}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2,
                          height: '100%',
                          bgcolor: '#f8f9fa',
                          borderTop: '4px solid #ff9800'
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" gutterBottom color="warning.main">
                          Cần cải thiện
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {Array.isArray(aiSuggestions.seoAnalysis.improvements) ? (
                          <Box component="ul" sx={{ paddingLeft: '20px', margin: 0 }}>
                            {aiSuggestions.seoAnalysis.improvements.map((item: string, index: number) => (
                              <Box component="li" key={index}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {item}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2">
                            {aiSuggestions.seoAnalysis.improvements || 'Không có thông tin'}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2,
                          height: '100%',
                          bgcolor: '#f8f9fa',
                          borderTop: '4px solid #2196f3'
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" gutterBottom color="info.main">
                          Gợi ý từ khóa
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {Array.isArray(aiSuggestions.seoAnalysis.keywords) ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {aiSuggestions.seoAnalysis.keywords.map((keyword: string, index: number) => (
                              <Chip
                                key={index}
                                label={keyword}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ margin: '2px' }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2">
                            {aiSuggestions.seoAnalysis.keywords || 'Không có từ khóa được gợi ý'}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {aiSuggestions.result && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Gợi ý nội dung
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
                      bgcolor: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px'
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {aiSuggestions.result}
                    </Typography>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          handleInputChange("description", aiSuggestions.result);
                          showSuccess('Đã áp dụng gợi ý vào mô tả');
                        }}
                      >
                        Áp dụng gợi ý này
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              )}

              {aiSuggestions.analysis && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Phân tích chung
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {aiSuggestions.analysis}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </>
          )}

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            style={{ marginTop: '60px' }}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
      </Card>

      <MediaPopup
        listMedia={selectedMedia}
        open={mediaPopupOpen}
        onClose={() => setMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
        onSubmit={() => { }}
      />

      <MediaPopup
        listMedia={selectedMedia}
        open={itemMediaPopupOpen}
        onClose={() => {
          setItemMediaPopupOpen(false);
          setSelectedItemIndex(-1);
        }}
        onSelect={handleItemMediaSelect}
        onSubmit={() => { }}
      />
    </Suspense>
  );
};

export default ProductForm;
