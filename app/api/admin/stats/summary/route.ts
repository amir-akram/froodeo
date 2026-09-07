import { requireAdmin } from '@/lib/adminAuth';
import { getIstDateRangeUtc } from '@/lib/dateRange';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const admin = requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const { startUtc, endUtc } = getIstDateRangeUtc(0); // today, IST

    const [todayOrdersRes, pendingOrdersRes, unavailableProductsRes, totalUsersRes] = await Promise.all([
        supabaseAdmin
        .from('orders')
        .select('total, status', { count: 'exact' })
        .gte('created_at', startUtc)
        .lt('created_at', endUtc),
        supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
        supabaseAdmin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_available', false),
        supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true }),
    ]);

    if (todayOrdersRes.error) return NextResponse.json({ error: todayOrdersRes.error.message }, { status: 500 });

    // Revenue counts only non-cancelled orders — a cancelled order was
    // never actually collected, so summing its `total` would overstate
    // today's takings.
    const todayOrders = todayOrdersRes.data ?? [];
    const revenueToday = todayOrders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + Number(o.total), 0);

    return NextResponse.json({
        data: {
        orders_today: todayOrders.length,
        revenue_today: revenueToday,
        pending_orders: pendingOrdersRes.count ?? 0,
        unavailable_products: unavailableProductsRes.count ?? 0,
        total_users: totalUsersRes.count ?? 0,
        },
    });
}