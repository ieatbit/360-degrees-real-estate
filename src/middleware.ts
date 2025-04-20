/*
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define credentials from environment variables
// Fallback to default values if environment variables are not set
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin360';

// For debugging, log the admin username (not the password for security)
console.log('Middleware loaded. Admin username from env:', ADMIN_USERNAME);

export function middleware(request: NextRequest) {
  // Skip admin-login page from authentication checks
  if (request.nextUrl.pathname === '/admin-login') {
    console.log('Middleware: Allowing access to login page');
    return NextResponse.next();
  }
  
  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Middleware: Protecting admin route:', request.nextUrl.pathname);
    
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      console.log('Middleware: No Authorization header found, redirecting to login');
      // No Authorization header, redirect to login page
      const url = request.nextUrl.clone();
      url.pathname = '/admin-login';
      url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }
    
    // Check if the Authorization header is a Basic auth header
    if (!authHeader.startsWith('Basic ')) {
      console.log('Middleware: Not a Basic auth header, redirecting to login');
      // Not a Basic auth header, redirect to login page
      const url = request.nextUrl.clone();
      url.pathname = '/admin-login';
      url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }
    
    // Decode the base64 encoded credentials
    const credentials = atob(authHeader.substring(6));
    const [username, password] = credentials.split(':');
    
    console.log('Middleware: Checking credentials for username:', username);
    
    // Check if the credentials are valid
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      console.log('Middleware: Invalid credentials, redirecting to login');
      // Invalid credentials, redirect to login page with error
      const url = request.nextUrl.clone();
      url.pathname = '/admin-login';
      url.search = `?error=invalid_credentials&redirect=${encodeURIComponent(request.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }
    
    console.log('Middleware: Valid credentials, allowing access to', request.nextUrl.pathname);
    // Valid credentials, allow the request to proceed
    return NextResponse.next();
  }
  
  // Not an admin route, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  // Only run middleware on admin routes and admin-login
  matcher: ['/admin/:path*', '/admin-login'],
};
*/

// Middleware disabled temporarily
export const config = {
  matcher: [],
}; 