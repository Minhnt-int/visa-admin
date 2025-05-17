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
  
  // Xác thực chặt chẽ hơn
  const isAuthenticated = !!token || !!cookieToken || !!headerToken;

  // Log để debug
  // console.log('Middleware running', {
  //   path,
  //   isPublicPath,
  //   token: !!token,
  //   cookieToken: !!cookieToken,
  //   headerToken: !!headerToken,
  //   isAuthenticated
  // });

  // Nếu người dùng truy cập trang đăng nhập mà đã có token -> chuyển hướng đến trang dashboard
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Chuyển hướng nghiêm ngặt hơn
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/authentication/login', request.url));
  }
  
  return NextResponse.next();
}

// Chỉ định những đường dẫn cần áp dụng middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon\\.ico|public).*)'
  ],
};