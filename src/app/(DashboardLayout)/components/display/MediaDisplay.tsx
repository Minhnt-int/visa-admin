import React from 'react';
import {
    Box,
    IconButton,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack
} from '@mui/material';
import Image from 'next/image'; // Sử dụng Next.js Image component nếu có
import { IconEdit, IconTrash, IconUpload } from '@tabler/icons-react'; // Import icons
import { ProductMedia, ProductAttributes } from '@/data/ProductAttributes';

// Định nghĩa kiểu cho formData (chỉ những thuộc tính cần thiết)
interface FormData {
    avatarUrl?: string;
    media?: ProductMedia[];
    // Thêm các thuộc tính khác cần thiết
}

// Định nghĩa kiểu cho props của MediaDisplay
interface MediaDisplayProps {
    formData: FormData;
    isView: boolean;
    handleInputChange: (field: keyof ProductAttributes, value: any) => void; // Đồng bộ với chữ ký ở ProductForm
    handleOpenUpdateMediaPopup: (media: ProductMedia, index: number) => void;
    handleRemoveMedia: (index: number) => void;
    updateMediaModalVisible: boolean;
    handleCloseUpdateMediaPopup: () => void;
    updatedMediaData: ProductMedia; // Dữ liệu media đang chỉnh sửa
    handleMediaUploadChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleUpdateMedia: () => void;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({
    formData,
    isView,
    handleInputChange,
    handleOpenUpdateMediaPopup,
    handleRemoveMedia,
    updateMediaModalVisible,
    handleCloseUpdateMediaPopup,
    updatedMediaData,
    handleMediaUploadChange,
    handleUpdateMedia,
}) => {
    return (
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
                                <source src={`${process.env.NEXT_PUBLIC_API_URL || ''}${media.url}`} />
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
                            {/* Đảm bảo process.env.NEXT_PUBLIC_API_URL được truy cập đúng */}
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL || ''}${media.url}`}
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
                        {updatedMediaData?.type === "image" && ( // Sử dụng optional chaining cho updatedMediaData
                            <>
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Hình ảnh hiện tại
                                    </Typography>
                                    {/* Đảm bảo process.env.NEXT_PUBLIC_API_URL được truy cập đúng */}
                                    <Image
                                        src={`${(process.env.NEXT_PUBLIC_API_URL || '') + updatedMediaData.url}`}
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
                        {updatedMediaData?.type === "video" && ( // Sử dụng optional chaining cho updatedMediaData
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
                                        {/* Đảm bảo process.env.NEXT_PUBLIC_API_URL được truy cập đúng */}
                                        <video
                                            controls
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                            }}
                                            preload="metadata"
                                        >
                                            <source src={`${process.env.NEXT_PUBLIC_API_URL || ''}${updatedMediaData.url}`} />
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
    );
};

export default MediaDisplay;
