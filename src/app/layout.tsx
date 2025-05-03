"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, Suspense } from "react";
import Cookies from "js-cookie";
import { usePathname, useSearchParams } from 'next/navigation';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';

const AppContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Cấu hình NProgress
    nProgress.configure({ 
      showSpinner: false,
      minimum: 0.1,
      speed: 500,
      easing: 'ease',
      trickleSpeed: 200
    });
      
    // Xử lý chuyển trang - bắt đầu và kết thúc progress
    const handleRouteChangeStart = () => {
      nProgress.start();
    };
    
    const handleRouteChangeComplete = () => {
      nProgress.done();
    };
    
    // Bắt đầu hiệu ứng loading khi pathname hoặc searchParams thay đổi
    handleRouteChangeStart();
    
    // Sau đó hoàn thành sau 100ms
    const timer = setTimeout(() => {
      handleRouteChangeComplete();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      nProgress.done();
    };
  }, [pathname, searchParams]);

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
        <style dangerouslySetInnerHTML={{
          __html: `
          #nprogress {
            pointer-events: none;
          }
          #nprogress .bar {
            background: #0078D7;
            position: fixed;
            z-index: 9999;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
          }
          #nprogress .peg {
            display: block;
            position: absolute;
            right: 0px;
            width: 100px;
            height: 100%;
            box-shadow: 0 0 10px #0078D7, 0 0 5px #0078D7;
            opacity: 1.0;
            transform: rotate(3deg) translate(0px, -4px);
          }
        `}} />
      </head>
      <body>
        <ThemeProvider theme={baselightTheme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <Suspense fallback={<div>Loading...</div>}>
            <AppContent>
              {children}
            </AppContent>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
