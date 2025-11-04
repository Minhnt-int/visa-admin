"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side authentication guard
 * Bảo vệ các route ở phía client nếu middleware bị bypass
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Danh sách public paths
      const publicPaths = [
        '/authentication/login',
        '/authentication/register',
        '/authentication/forgot-password',
      ];

      // Nếu là public path, không cần check
      if (publicPaths.includes(pathname)) {
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      // Kiểm tra token từ localStorage và cookie
      const accessToken = localStorage.getItem('accessToken');
      const cookieToken = Cookies.get('accessToken');

      const hasToken = (accessToken && accessToken.trim().length > 0) || 
                      (cookieToken && cookieToken.trim().length > 0);

      if (!hasToken) {
        // Không có token, redirect về login
        console.warn('🚫 No token found, redirecting to login');
        router.push('/authentication/login');
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      // Có token, cho phép truy cập
      setIsAuthenticated(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Đang kiểm tra
  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Đang kiểm tra xác thực...</div>
      </div>
    );
  }

  // Không được xác thực
  if (!isAuthenticated) {
    return null; // Sẽ redirect trong useEffect
  }

  // Đã xác thực, render children
  return <>{children}</>;
}

