import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

// GET /api/admin/coupons/:id
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const { data, error } = await supabaseAdmin.from('coupons').select('*').eq('id', id).single();
  if (error || !data) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
  return NextResponse.json({ data });
}

// PUT /api/admin/coupons/:id
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const body = await request.json();
  delete body.id;
  delete body.used_count; // never client-settable — only recordCouponRedemption should touch this

  if (body.code) body.code = body.code.trim().toUpperCase();
  if (body.discount_type && !['flat', 'percentage'].includes(body.discount_type)) {
    return NextResponse.json({ error: "discount_type must be 'flat' or 'percentage'" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const status = error.code === '23505' ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ data });
}

// DELETE /api/admin/coupons/:id — soft delete (deactivate), since a
// hard delete would break the FK from orders.coupon_id / coupon_redemptions
// for any order that already used this code.
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('coupons')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Coupon deactivated', data });
}