import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

// GET /api/admin/orders/:id — full detail, admin-only.
// Separate from GET /api/orders/:id (customer/token-scoped) rather
// than bolting an admin bypass onto that route, so customer-facing
// access logic doesn't grow admin-shaped branches.
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, products(id, name, image_url)), payments(*), coupons(code, discount_type, discount_value)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json({ data });
}