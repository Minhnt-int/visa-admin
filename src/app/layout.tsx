"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useEffect, useState, Suspense } from "react";
import Cookies from "js-cookie";

const AppContent = ({ children }: { children: React.ReactNode }) => {

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

  return children;
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body>
        <ThemeProvider theme={baselightTheme}>
          <CssBaseline />
          <AppContent>{children}</AppContent>
        </ThemeProvider>
      </body>
    </html>
  );
}
