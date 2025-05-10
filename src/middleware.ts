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
  
  // Kiểm tra nextauth token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Kiểm tra token từ cookie (được lưu từ localStorage)
  const cookieToken = request.cookies.get('accessToken')?.value;
  
  // Kiểm tra token từ Authorization header (thêm vào từ client-side)
  const authHeader = request.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  // Kiểm tra xem có bất kỳ token nào tồn tại không
  const isAuthenticated = !!token || !!cookieToken || !!headerToken;

  
  // Nếu người dùng truy cập trang đăng nhập mà đã có token -> chuyển hướng đến trang dashboard
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Nếu người dùng truy cập trang cần xác thực mà không có token -> chuyển hướng đến trang đăng nhập
  if (!isPublicPath && !isAuthenticated && !path.startsWith('/api')) {
    const loginUrl = new URL('/authentication/login', request.url);
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