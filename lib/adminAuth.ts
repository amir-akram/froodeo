import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from './auth';
import { AdminTokenPayload } from './jwt';

// Use at the top of every /api/admin/* handler (and any other route
// that should be admin-only). Returns the admin payload on success,
// or an already-built 401 NextResponse to return immediately.
//
// Usage:
//   const admin = requireAdmin(request);
//   if (admin instanceof NextResponse) return admin;
//   // admin is AdminTokenPayload from here on
export function requireAdmin(request: NextRequest): AdminTokenPayload | NextResponse {
    const admin = getAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return admin;
}