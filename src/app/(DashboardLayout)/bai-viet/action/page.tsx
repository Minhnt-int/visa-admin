'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import BlogsTable from '../../components/table/BlogsTable';
import Editor from '../../components/editor/Editor';
import BlogPostForm from '../../components/forms/BlogPostForm';
import { useState } from 'react';
import { BlogPostAttributes } from '@/data/BlogPost';
import { createBlog, updateBlog } from '@/services/blogService';
import ConfirmPopup from '../../components/popup/ConfirmPopup';
import { Snackbar, Alert } from '@/config/mui';
import { useRouter} from 'next/navigation';
import { useAppContext, ActionType } from '@/contexts/AppContext';


const Dashboard = () => {

  const { 
    selectedBlog, 
    loading, 
    error,
    currentAction
  } = useAppContext();
  const router = useRouter();
  const [ConfirmingPopup, setConfirmingPopup] = useState(false);
  const [formData, setFormData] = useState<BlogPostAttributes | null>(selectedBlog || null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <BlogPostForm onChange={({ name, value }) => {
            setFormData((prev : any) => ({
              ...prev!,
              [name]: value,
            }))
            }
          } 
          action={currentAction.type}

           formData={formData!} />
          <ConfirmPopup
            open={ConfirmingPopup}
            onClose={() => setConfirmingPopup(false)}
            onConfirm={async () => {
              if (currentAction.type === ActionType.EDIT) {
                await updateBlog(formData!);
              } else if (currentAction.type === ActionType.CREATE) {
                await createBlog(formData!);
              } else {
                setSnackbar({
                  open: true,
                  message: "Có lỗi xảy ra",
                  severity: 'error'
                });
              }
              setConfirmingPopup(false)
              router.push('/bai-viet')
            }}
            title="Xác nhận"
            content={currentAction.type === ActionType.EDIT ? "Bạn có chắc chắn muốn lưu bài viết này?" : "Bạn có chắc chắn muốn tạo bài viết mới?"}
          />
          </Grid>
        </Grid>
      </Box>
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
    </PageContainer>
  )
}

export default Dashboard;
