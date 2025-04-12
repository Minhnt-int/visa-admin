import { Box, CircularProgress, Typography } from "@mui/material";

const Loading = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 9999
      }}
    >
      <CircularProgress color="primary" />
      <Typography variant="body2" sx={{ mt: 2 }}>
        Đang tải dữ liệu...
      </Typography>
    </Box>
  );
};

export default Loading;