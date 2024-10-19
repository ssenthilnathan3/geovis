import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');

  if (token) {
    // User is authenticated
    if (isAuthPage) {
      // Redirect to home if trying to access login or signup
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    // User is not authenticated
    if (!isAuthPage) {
      // Redirect to login if trying to access a protected route
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
