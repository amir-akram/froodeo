import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/loyalty/transactions?user_id=&type=&page=&page_size=
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const params = request.nextUrl.searchParams;
  const userId = params.get('user_id');
  const type = params.get('type');
  const page = Math.max(1, parseInt(params.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(params.get('page_size') || '50', 10)));

  if (type && !['earn', 'redeem', 'adjustment'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type filter' }, { status: 400 });
  }

  let query = supabaseAdmin
    .from('loyalty_transactions')
    .select('*, users(name, phone)', { count: 'exact' });

  if (userId) query = query.eq('user_id', userId);
  if (type) query = query.eq('type', type);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, pagination: { page, page_size: pageSize, total: count ?? 0 } });
}