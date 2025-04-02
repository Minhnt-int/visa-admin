import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Danh sách các đường dẫn công khai (không cần xác thực)
  const publicPaths = [
    '/authentication/login',
    '/authentication/register',
    '/authentication/forgot-password'
  ];
  
  const isPublicPath = publicPaths.some(pp => path.startsWith(pp));
  
  // Kiểm tra token xác thực
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Nếu người dùng truy cập trang đăng nhập mà đã có token -> chuyển hướng đến trang dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Nếu người dùng truy cập trang cần xác thực mà không có token -> chuyển hướng đến trang đăng nhập
  if (!isPublicPath && !token && !path.startsWith('/api')) {
    const loginUrl = new URL('/authentication/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

// Chỉ định những đường dẫn cần áp dụng middleware
export const config = {
  matcher: [
    // Loại trừ các đường dẫn tĩnh và API của NextAuth
    '/((?!api/auth|_next/static|_next/image|public|favicon.ico).*)',
  ],
};