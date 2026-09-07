import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/coupons
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/admin/coupons
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const body = await request.json();
  const {
    code,
    discount_type,
    discount_value,
    max_discount_amount,
    min_order_value,
    usage_limit,
    usage_limit_per_user,
    valid_from,
    valid_until,
    is_active,
  } = body;

  if (!code?.trim()) {
    return NextResponse.json({ error: 'code is required' }, { status: 400 });
  }
  if (!['flat', 'percentage'].includes(discount_type)) {
    return NextResponse.json({ error: "discount_type must be 'flat' or 'percentage'" }, { status: 400 });
  }
  if (typeof discount_value !== 'number' || discount_value <= 0) {
    return NextResponse.json({ error: 'discount_value must be a positive number' }, { status: 400 });
  }
  if (discount_type === 'percentage' && discount_value > 100) {
    return NextResponse.json({ error: 'percentage discount_value cannot exceed 100' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .insert({
      code: code.trim().toUpperCase(),
      discount_type,
      discount_value,
      max_discount_amount: max_discount_amount ?? null,
      min_order_value: min_order_value ?? 0,
      usage_limit: usage_limit ?? null,
      usage_limit_per_user: usage_limit_per_user ?? 1,
      valid_from: valid_from || undefined,
      valid_until: valid_until ?? null,
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    // Postgres unique_violation on code
    const status = error.code === '23505' ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ data }, { status: 201 });
}