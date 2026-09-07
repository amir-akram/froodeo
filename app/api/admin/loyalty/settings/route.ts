import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/loyalty/settings
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { data, error } = await supabaseAdmin
    .from('loyalty_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PUT /api/admin/loyalty/settings
export async function PUT(request: NextRequest) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { redemption_rate, min_points_to_redeem, max_redeem_percent_of_order } = await request.json();

  if (redemption_rate !== undefined && (typeof redemption_rate !== 'number' || redemption_rate <= 0)) {
    return NextResponse.json({ error: 'redemption_rate must be a positive number' }, { status: 400 });
  }
  if (min_points_to_redeem !== undefined && (!Number.isInteger(min_points_to_redeem) || min_points_to_redeem < 0)) {
    return NextResponse.json({ error: 'min_points_to_redeem must be a non-negative integer' }, { status: 400 });
  }
  if (
    max_redeem_percent_of_order !== undefined &&
    (typeof max_redeem_percent_of_order !== 'number' || max_redeem_percent_of_order < 0 || max_redeem_percent_of_order > 100)
  ) {
    return NextResponse.json({ error: 'max_redeem_percent_of_order must be between 0 and 100' }, { status: 400 });
  }

  const update: Record<string, number> = {};
  if (redemption_rate !== undefined) update.redemption_rate = redemption_rate;
  if (min_points_to_redeem !== undefined) update.min_points_to_redeem = min_points_to_redeem;
  if (max_redeem_percent_of_order !== undefined) update.max_redeem_percent_of_order = max_redeem_percent_of_order;

  const { data, error } = await supabaseAdmin
    .from('loyalty_settings')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}