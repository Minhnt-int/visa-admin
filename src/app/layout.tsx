"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    useEffect(() => {
      // Lấy token từ localStorage và lưu vào cookie để middleware có thể đọc
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        Cookies.set('accessToken', accessToken, { expires: 1 }); // Hết hạn sau 1 ngày
      }
      
      // Thêm token vào header cho mỗi request
      const originalFetch = window.fetch;
      window.fetch = function(url, options = {}) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
          };
        }
        return originalFetch(url, options);
      };
      
      return () => {
        // Restore original fetch when component unmounts
        window.fetch = originalFetch;
      };
    }, []);
  
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={baselightTheme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
