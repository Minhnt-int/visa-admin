/**
 * Utility function để refresh access token
 * Có thể sử dụng ngoài React component (trong axios interceptor)
 */

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      console.warn('Không có refresh token');
      return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || errorData.message || `Lỗi HTTP: ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    
    // Backend trả về format: { success: true, data: { accessToken } }
    if (data.success && data.data?.accessToken) {
      const newAccessToken = data.data.accessToken;
      
      // Lưu token mới vào localStorage
      localStorage.setItem('accessToken', newAccessToken);
      
      // Nếu có refresh token mới, cũng lưu lại
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      
      console.log('Token đã được làm mới thành công');
      return newAccessToken;
    } else {
      throw new Error(data.error?.message || data.message || 'Không thể refresh token');
    }
  } catch (error) {
    console.error('Lỗi khi làm mới token:', error);
    
    // Nếu refresh thất bại, xóa tokens và redirect về login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/authentication/login')) {
      window.location.href = '/authentication/login';
    }
    
    return null;
  }
}

