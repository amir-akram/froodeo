import { requireAdmin } from '@/lib/adminAuth';
import { getIstDateRangeUtc, toIstDateKey } from '@/lib/dateRange';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/stats/revenue?range=7d|30d
export async function GET(request: NextRequest) {
    const admin = requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const range = request.nextUrl.searchParams.get('range') ?? '7d';
    const days = range === '30d' ? 30 : 7;
    if (range !== '7d' && range !== '30d') {
        return NextResponse.json({ error: "range must be '7d' or '30d'" }, { status: 400 });
    }

    // daysBack = days-1 so a 7-day range means "today + 6 prior days",
    // matching how someone reads "last 7 days" on a dashboard.
    const { startUtc, endUtc } = getIstDateRangeUtc(days - 1);

    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('total, status, created_at')
        .gte('created_at', startUtc)
        .lt('created_at', endUtc);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Bucket by IST calendar date, zero-filled for days with no orders
    // so the chart doesn't show gaps as missing x-axis points.
    const buckets = new Map<string, number>();
    for (let i = 0; i < days; i++) {
        const dayMs = new Date(startUtc).getTime() + i * 24 * 60 * 60 * 1000;
        buckets.set(toIstDateKey(new Date(dayMs).toISOString()), 0);
    }

    for (const order of data ?? []) {
        if (order.status === 'cancelled') continue;
        const key = toIstDateKey(order.created_at);
        buckets.set(key, (buckets.get(key) ?? 0) + Number(order.total));
    }

    const series = Array.from(buckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, revenue]) => ({ date, revenue }));

    return NextResponse.json({ data: series });
}