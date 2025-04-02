"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  Alert,
  CircularProgress
} from "@mui/material";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Gửi thông tin đăng nhập đến API server trước
      const apiResponse = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // Sau khi API xác thực thành công, sử dụng NextAuth để tạo session
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl
      });
      
      if (result?.error) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng");
      } else if (result?.url) {
        // Đăng nhập thành công, chuyển hướng đến trang được chỉ định
        router.push(result.url);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
      console.error("Lỗi đăng nhập:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleLogin}>
        <Stack>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="username"
              mb="5px"
            >
              Tên đăng nhập
            </Typography>
            <CustomTextField 
              id="username"
              variant="outlined" 
              fullWidth 
              value={username}
              onChange={(e:any) => setUsername(e.target.value)}
            />
          </Box>
          <Box mt="25px">
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              Mật khẩu
            </Typography>
            <CustomTextField 
              id="password"
              type="password" 
              variant="outlined" 
              fullWidth 
              value={password}
              onChange={(e:any) => setPassword(e.target.value)}
            />
          </Box>
          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
            my={2}
          >
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Ghi nhớ đăng nhập"
              />
            </FormGroup>
            <Typography
              component={Link}
              href="/authentication/forgot-password"
              fontWeight="500"
              sx={{
                textDecoration: "none",
                color: "primary.main",
              }}
            >
              Quên mật khẩu?
            </Typography>
          </Stack>
        </Stack>
        <Box>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? (
              <CircularProgress color="inherit" size={24} />
            ) : (
              "Đăng nhập"
            )}
          </Button>
        </Box>
      </form>
      {subtitle}
    </>
  );
};

export default AuthLogin;
