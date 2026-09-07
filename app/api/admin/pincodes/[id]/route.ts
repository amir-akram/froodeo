import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

// PUT /api/admin/pincodes/:id
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const body = await request.json();
  delete body.id;

  if (body.pincode && !/^\d{6}$/.test(body.pincode)) {
    return NextResponse.json({ error: 'pincode must be a 6-digit string' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('serviceable_pincodes')
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

// DELETE /api/admin/pincodes/:id
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const { error } = await supabaseAdmin.from('serviceable_pincodes').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Pincode removed' });
}