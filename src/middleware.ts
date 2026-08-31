import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files, api auth, public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/fonts') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.png')
  ) {
    return NextResponse.next();
  }

  const sessionToken =
    req.cookies.get('authjs.session-token')?.value ||
    req.cookies.get('__Secure-authjs.session-token')?.value ||
    req.cookies.get('next-auth.session-token')?.value;

  const isPublicRoute = 
    pathname === '/' || 
    pathname.startsWith('/catalog') || 
    pathname.startsWith('/contact') || 
    pathname.startsWith('/about');

  const hostname = req.headers.get('host') || '';
  const isWebsiteDomain = hostname.includes('rajasthan-tools-website') || process.env.NEXT_PUBLIC_APP_MODE === 'website';
  
  // Software Domain (Desktop / rt-billing-system): Redirect root to login
  if (!isWebsiteDomain && pathname === '/') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Security: Block Dashboard routes on Public Vercel Deployment
  const isDashboardRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/pos') ||
    pathname.startsWith('/invoices') ||
    pathname.startsWith('/customers') ||
    pathname.startsWith('/suppliers') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/reports') ||
    pathname === '/login';

  if (isWebsiteDomain && isDashboardRoute) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const isAuthPage = pathname === '/login';

  if (!sessionToken && !isAuthPage && !isPublicRoute) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionToken && isAuthPage) {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
