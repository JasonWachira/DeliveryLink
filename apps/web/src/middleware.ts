import { type NextRequest, NextResponse } from 'next/server';
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/about', '/auth'];

  const isRootPath = pathname === '/';


  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || isRootPath;


  const sessionCookie = request.cookies.get('better-auth.session_token') ||
                        request.cookies.get('__Secure-better-auth.session_token');
  const isAuthenticated = !!sessionCookie?.value;

  if (pathname.startsWith('/auth') && isAuthenticated) {
    const returnTo = request.nextUrl.searchParams.get('returnTo');
    const redirectUrl = new URL(returnTo || '/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }


  if (!isPublicRoute && !isAuthenticated) {
    const authUrl = new URL('/auth', request.url);
    const intendedUrl = request.nextUrl.pathname + request.nextUrl.search;
    authUrl.searchParams.set('returnTo', intendedUrl);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [

    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
};
