import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const isPublicPath = path === '/login' || path.startsWith('/pay');

  // Check for session cookie
  const session = request.cookies.get('auth_session')?.value;

  // Redirect to login if accessing a protected route without a session
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // Redirect to home if accessing login while already authenticated
  if (path === '/login' && session) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  // Set a header to expose the pathname to Server Components (like layout.js)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

// Ensure middleware only runs on actual app routes, not static files or API
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
