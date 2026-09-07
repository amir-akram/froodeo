import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/pincodes
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { data, error } = await supabaseAdmin
    .from('serviceable_pincodes')
    .select('*')
    .order('pincode', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/admin/pincodes
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { pincode, area_name, is_active } = await request.json();

  if (!/^\d{6}$/.test(pincode || '')) {
    return NextResponse.json({ error: 'pincode must be a 6-digit string' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('serviceable_pincodes')
    .insert({ pincode, area_name, is_active: is_active ?? true })
    .select()
    .single();

  if (error) {
    const status = error.code === '23505' ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ data }, { status: 201 });
}