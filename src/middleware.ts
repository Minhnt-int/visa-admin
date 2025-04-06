import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Thêm logs chi tiết
  console.log('Full URL:', request.url);
  console.log('Cookies:', request.cookies.getAll());
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  // Danh sách các đường dẫn công khai (không cần xác thực)
  const publicPaths = [
    '/authentication/login',
    '/authentication/register',
    '/authentication/forgot-password'
  ];
  
  const isPublicPath = publicPaths.some(pp => path.startsWith(pp));
  console.log(`[Middleware] Đường dẫn: ${path} | Đường dẫn công khai: ${isPublicPath}`);
  
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
  
  console.log(`[Middleware] Token NextAuth: ${!!token}`);
  console.log(`[Middleware] Token Cookie: ${!!cookieToken}`);
  console.log(`[Middleware] Token Header: ${!!headerToken}`);
  console.log(`[Middleware] Đã xác thực: ${isAuthenticated}`);
  
  // Nếu người dùng truy cập trang đăng nhập mà đã có token -> chuyển hướng đến trang dashboard
  if (isPublicPath && isAuthenticated) {
    console.log(`[Middleware] Đã đăng nhập, chuyển hướng từ ${path} đến /`);
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Nếu người dùng truy cập trang cần xác thực mà không có token -> chuyển hướng đến trang đăng nhập
  if (!isPublicPath && !isAuthenticated && !path.startsWith('/api')) {
    console.log(`[Middleware] Chưa đăng nhập, chuyển hướng từ ${path} đến /authentication/login`);
    const loginUrl = new URL('/authentication/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  console.log(`[Middleware] Cho phép truy cập đường dẫn: ${path}`);
  return NextResponse.next();
}

// Chỉ định những đường dẫn cần áp dụng middleware
export const config = {
  matcher: [
    // Loại trừ các đường dẫn tĩnh và API của NextAuth
    '/((?!api/auth|_next/static|_next/image|public|favicon.ico).*)',
  ],
};