import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const publicPaths = [
    '/authentication/login',
    '/authentication/register',
    '/authentication/forgot-password',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/public'
  ];
  
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
  
  const cookieToken = request.cookies.get('accessToken')?.value;
  const nextAuthToken = request.cookies.get('next-auth.session-token')?.value || 
                        request.cookies.get('__Secure-next-auth.session-token')?.value;
      
  const hasAccessToken = !!cookieToken && cookieToken.trim().length > 0;
  const hasNextAuthToken = !!nextAuthToken && nextAuthToken.trim().length > 0;
  
  const isAuthenticated = hasAccessToken || hasNextAuthToken;
  
  if (!isAuthenticated) {
    console.warn('❌ Unauthenticated access attempt, redirecting to login:', path);
    const loginUrl = new URL('/authentication/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};