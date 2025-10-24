import { auth } from './app/(auth)/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    if (session && session.user) {
      if (
        session.user.role === 'admin' ||
        session.user.role === 'super_admin'
      ) {
        return NextResponse.redirect(new URL('/admin/stores', request.url));
      } else if (session.user.role === 'user') {
        return NextResponse.redirect(new URL('/user/stores', request.url));
      }
    }
    return NextResponse.next();
  }

  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/stores', request.url));
  }
  if (pathname === '/user') {
    return NextResponse.redirect(new URL('/user/stores', request.url));
  }

  const authPages = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];
  const isAuthPage = authPages.includes(pathname);

  const loginOnlyPages = ['/login', '/register'];
  const isLoginOnlyPage = loginOnlyPages.includes(pathname);

  if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
    if (!session || !('user' in session)) {
      if (!isAuthPage) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } else {
      if (isLoginOnlyPage) {
        if (
          session.user.role === 'admin' ||
          session.user.role === 'super_admin'
        ) {
          return NextResponse.redirect(new URL('/admin/stores', request.url));
        } else if (session.user.role === 'user') {
          return NextResponse.redirect(new URL('/user/stores', request.url));
        }
      }

      if (
        pathname.startsWith('/admin') &&
        session.user.role !== 'admin' &&
        session.user.role !== 'super_admin'
      ) {
        return NextResponse.redirect(new URL('/user/stores', request.url));
      }
      if (
        pathname.startsWith('/user') &&
        session.user.role !== 'user' &&
        session.user.role !== 'super_admin'
      ) {
        return NextResponse.redirect(new URL('/admin/stores', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/user/:path*'],
};
