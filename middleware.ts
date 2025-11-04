import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Danh sách các đường dẫn không cần xác thực (chính xác hơn)
  const publicPaths = [
    '/authentication/login',
    '/authentication/register',
    '/authentication/forgot-password',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/public'
  ];
  
  // Kiểm tra nếu đường dẫn hiện tại là public
  const isPublicPath = publicPaths.some(pp => {
    if (pp === '/_next') {
      return path.startsWith('/_next');
    }
    if (pp === '/api/auth') {
      return path.startsWith('/api/auth');
    }
    return path === pp || path.startsWith(pp + '/');
  });
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // KIỂM TRA TOKEN - BẮT BUỘC PHẢI CÓ
  const cookieToken = request.cookies.get('accessToken')?.value;
  const nextAuthToken = request.cookies.get('next-auth.session-token')?.value || 
                        request.cookies.get('__Secure-next-auth.session-token')?.value;
  
  // Ưu tiên kiểm tra accessToken từ cookie (hệ thống mới)
  const hasAccessToken = !!cookieToken && cookieToken.trim().length > 0;
  const hasNextAuthToken = !!nextAuthToken && nextAuthToken.trim().length > 0;
  
  const isAuthenticated = hasAccessToken || hasNextAuthToken;
  
  // Debug log
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Middleware Auth Check:', {
      path,
      isPublicPath,
      hasAccessToken: !!cookieToken,
      hasNextAuthToken: !!nextAuthToken,
      isAuthenticated,
    });
  }
  
  // NẾU KHÔNG CÓ TOKEN, CHUYỂN HƯỚNG ĐẾN TRANG ĐĂNG NHẬP
  if (!isAuthenticated) {
    console.warn('❌ Unauthenticated access attempt, redirecting to login:', path);
    const loginUrl = new URL('/authentication/login', request.url);
    // Thêm redirect URL để có thể quay lại sau khi login
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // Có token, cho phép truy cập
  return NextResponse.next();
}

// Cấu hình matcher đơn giản hơn để đảm bảo middleware chạy cho mọi route
export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};