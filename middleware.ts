import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Danh sách các đường dẫn không cần xác thực
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
  const isPublicPath = publicPaths.some(pp => 
    path === pp || path.startsWith(pp)
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Kiểm tra tất cả các token có thể
  const nextAuthToken = request.cookies.get('next-auth.session-token')?.value || 
                        request.cookies.get('__Secure-next-auth.session-token')?.value;
  const cookieToken = request.cookies.get('accessToken')?.value;
  const authHeader = request.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  const isAuthenticated = !!nextAuthToken || !!cookieToken || !!headerToken;
  
  console.log('Middleware check:', {
    path,
    isPublicPath,
    hasToken: isAuthenticated,
  });
  
  // Nếu không có token, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    console.log('Redirecting to login, no valid token found');
    return NextResponse.redirect(new URL('/authentication/login', request.url));
  }
  
  return NextResponse.next();
}

// Cấu hình matcher đơn giản hơn để đảm bảo middleware chạy cho mọi route
export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};