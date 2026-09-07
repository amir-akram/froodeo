import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

// PATCH /api/admin/orders/:id/delivery — admin override of delivery details
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const { delivery_address, delivery_date, delivery_time } = await request.json();

  const update: Record<string, string> = {};
  if (delivery_address !== undefined) update.delivery_address = delivery_address;
  if (delivery_date !== undefined) update.delivery_date = delivery_date;
  if (delivery_time !== undefined) update.delivery_time = delivery_time;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}