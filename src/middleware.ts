import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public routes
  if (
    pathname === '/api/auth/login' ||
    pathname === '/login' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Protect API routes
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
  }

  // Protect dashboard routes
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/rehabilitation') ||
    pathname.startsWith('/alternative') ||
    pathname.startsWith('/seizures') ||
    pathname.startsWith('/deposits') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/audit') ||
    pathname.startsWith('/private-depo-acc') ||
    pathname.startsWith('/correspondence')
  ) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
