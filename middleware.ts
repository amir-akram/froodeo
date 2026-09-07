import { NextRequest, NextResponse } from 'next/server';

// Edge-safe UX gate only. This does NOT verify the JWT signature —
// jsonwebtoken (lib/jwt.ts) needs Node's crypto, which the edge
// middleware runtime doesn't have. This just avoids a flash of the
// dashboard before the client-side session check redirects.
// The real security boundary is requireAdmin() inside every
// /api/admin/* route handler — never rely on this file for auth.
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
    if (!isAdminPage) return NextResponse.next();

    const hasCookie = request.cookies.has('admin_token');
    if (!hasCookie) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};