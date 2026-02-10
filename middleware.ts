import { NextRequest, NextResponse } from 'next/server';

// Note: These should match the supportedLanguages in config/site.yaml
// We hardcode them here because middleware runs in Edge Runtime and can't access fs
const SUPPORTED_LANGUAGES = ['en', 'nl', 'fr'];
const DEFAULT_LANGUAGE = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logo.') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  try {
    // Extract language from path
    const pathSegments = pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];
    
    // Check if first segment is a language code
    const detectedLang = SUPPORTED_LANGUAGES.includes(firstSegment) ? firstSegment : null;
    
    if (detectedLang && detectedLang !== DEFAULT_LANGUAGE) {
      // Remove language from path and rewrite
      const newPath = pathSegments.length > 1 ? '/' + pathSegments.slice(1).join('/') : '/';
      const url = request.nextUrl.clone();
      url.pathname = newPath;
      
      // Pass language via header
      const response = NextResponse.rewrite(url);
      response.headers.set('x-supersite-lang', detectedLang);
      return response;
    }
    
    // Default language - no rewrite needed, but set header
    const response = NextResponse.next();
    response.headers.set('x-supersite-lang', DEFAULT_LANGUAGE);
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
