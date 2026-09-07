import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const admin = requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    // Re-fetch from DB rather than trusting the token body verbatim —
    // picks up is_active=false (deactivated since token was issued) and
    // gives fresh name/username for the session bootstrap.
    const { data, error } = await supabaseAdmin
        .from('admins')
        .select('id, username, name, is_active, last_login_at')
        .eq('id', admin.sub)
        .single();

    if (error || !data || !data.is_active) {
        const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        response.cookies.set('admin_token', '', { path: '/', maxAge: 0 });
        return response;
    }

    return NextResponse.json({ admin: data });
}