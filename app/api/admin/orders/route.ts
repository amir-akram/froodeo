import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

// GET /api/admin/orders?status=&date_from=&date_to=&search=&page=&page_size=
export async function GET(request: NextRequest) {
    const admin = requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const params = request.nextUrl.searchParams;
    const status = params.get('status');
    const dateFrom = params.get('date_from');
    const dateTo = params.get('date_to');
    const search = params.get('search')?.trim();
    const page = Math.max(1, parseInt(params.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(params.get('page_size') || '20', 10)));

    if (status && !VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
    }

    let query = supabaseAdmin
        .from('orders')
        .select('*, order_items(id, quantity, total_price, products(name))', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);
    if (search) {
        // customer_name/customer_phone are plain text columns on orders,
        // so this covers guest orders too (not just registered users).
        query = query.or(`customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
        data,
        pagination: { page, page_size: pageSize, total: count ?? 0 },
    });
}