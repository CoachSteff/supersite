import { NextRequest, NextResponse } from 'next/server';

// Note: These should match the supportedLanguages in config/site.yaml
// We hardcode them here because middleware runs in Edge Runtime and can't access fs
const SUPPORTED_LANGUAGES = ['en', 'nl', 'fr'];
const DEFAULT_LANGUAGE = 'en';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Reject oversized bodies on API requests. Chat streaming has its own tighter limit,
// but every other JSON endpoint on this site handles small payloads — 1 MB is generous.
const MAX_API_BODY_BYTES = 1 * 1024 * 1024;

/**
 * Reject cross-origin state-changing API requests.
 * Compares Origin (or Referer as fallback) against the request's own host.
 * This is a defense-in-depth against CSRF on top of SameSite=Lax cookies.
 */
function isCsrfBlocked(request: NextRequest): boolean {
  if (!UNSAFE_METHODS.has(request.method)) return false;

  const expectedHost = request.headers.get('host');
  if (!expectedHost) return false; // behind misconfigured proxy — fail open rather than lock users out

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).host !== expectedHost;
    } catch {
      return true;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).host !== expectedHost;
    } catch {
      return true;
    }
  }

  // No Origin and no Referer on an unsafe method is suspicious — block.
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF check on state-changing API calls
  if (pathname.startsWith('/api/') && isCsrfBlocked(request)) {
    return NextResponse.json(
      { error: 'Cross-origin request blocked' },
      { status: 403 }
    );
  }

  // Reject oversized API bodies early
  if (pathname.startsWith('/api/') && UNSAFE_METHODS.has(request.method)) {
    const len = request.headers.get('content-length');
    if (len && Number(len) > MAX_API_BODY_BYTES) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      );
    }
  }

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

      // Pass language via request header (readable by Server Components)
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-supersite-lang', detectedLang);
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    // Default language - no rewrite needed, but set header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-supersite-lang', DEFAULT_LANGUAGE);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     *
     * API routes ARE matched so the CSRF Origin check above runs on them.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
