import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export function useTokenRefresher() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(0);

  // Sử dụng useCallback để function không bị tạo lại mỗi khi component re-render
  const checkAndRefreshToken = useCallback(async (silent = true) => {
    // Nếu đã refresh trong 1 phút qua, không làm gì
    if (isRefreshing || (Date.now() - lastRefreshed < 60000 && silent)) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken || !refreshToken) {
        if (!silent) {
          router.push('/authentication/login');
        }
        return;
      }

      // Phân tích JWT payload 
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expiresAt = payload.exp * 1000; // Convert từ second sang millisecond
        
        // Nếu token còn hơn 5 phút và đây là silent check, không làm gì
        if (expiresAt - Date.now() > 5 * 60 * 1000 && silent) {
          return;
        }
        
        // Nếu token đã hết hạn hoàn toàn
        if (Date.now() > expiresAt) {
          console.warn('Token đã hết hạn, đang làm mới token...');
        } else {
          console.log('Token sắp hết hạn, đang làm mới token...');
        }
      } catch (parseError) {
        console.error('Lỗi phân tích token:', parseError);
        // Token có thể không hợp lệ, tiến hành refresh
      }

      // Token sắp hết hạn hoặc không hợp lệ, làm mới token
      setIsRefreshing(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Lưu token mới vào localStorage
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Đồng bộ với cookie cho middleware
      Cookies.set('accessToken', data.accessToken, { 
        expires: 1, // Hết hạn sau 1 ngày
        path: '/'
      });
      
      // Cập nhật thời gian refresh cuối cùng
      setLastRefreshed(Date.now());
      console.log('Token đã được làm mới thành công');
      
    } catch (error) {
      console.error('Lỗi khi làm mới token:', error);
      
      if (!silent) {
        // Nếu refresh thất bại, đăng xuất người dùng
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        Cookies.remove('accessToken');
        router.push('/authentication/login');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [router, isRefreshing, lastRefreshed]);

  useEffect(() => {
    // Kiểm tra token khi component mount
    checkAndRefreshToken(false);

    // Thiết lập interval để kiểm tra token mỗi phút
    const intervalId = setInterval(() => checkAndRefreshToken(true), 60 * 1000);

    return () => clearInterval(intervalId);
  }, [checkAndRefreshToken]);

  return { 
    isRefreshing,
    refreshToken: () => checkAndRefreshToken(false) // Exposed method to force refresh
  };
}