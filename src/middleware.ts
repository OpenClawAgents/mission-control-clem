import { NextResponse, type NextRequest } from 'next/server'

// Simple auth: check for a session cookie set after login
// For a personal dashboard behind a tunnel, we use a simple password gate
// instead of full Supabase auth which requires email verification etc.

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'missioncontrol'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow: static assets, API routes, auth routes, favicon, root
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname === '/favicon.ico' ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('mc-auth')
  if (authCookie?.value === 'authenticated') {
    return NextResponse.next()
  }

  // Redirect to login
  const loginUrl = new URL('/auth/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}