import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check if user is authenticated (you'll need to implement this)
  const isAuthenticated = false; // Replace with actual auth check
  const isAuthPage = request.nextUrl.pathname === '/' || 
                    request.nextUrl.pathname === '/auth/register';

  if (!isAuthenticated && !isAuthPage) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isAuthenticated && isAuthPage) {
    // Redirect to home if already authenticated
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 