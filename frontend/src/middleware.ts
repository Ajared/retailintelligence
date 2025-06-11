import { auth } from './app/(auth)/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  if (!session || !('user' in session)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session.user.role === 'user' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/user/stores', request.url));
  }
  if (session.user.role === 'admin' && pathname.startsWith('/user')) {
    return NextResponse.redirect(new URL('/admin/users', request.url));
  }
  if (session.user.role === 'super_admin' && pathname.startsWith('/user')) {
    return NextResponse.redirect(new URL('/admin/users', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};
