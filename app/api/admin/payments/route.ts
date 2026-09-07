import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/payments?order_id=&status=
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const orderId = request.nextUrl.searchParams.get('order_id');
  const status = request.nextUrl.searchParams.get('status');

  let query = supabaseAdmin.from('payments').select('*, orders(customer_name, customer_phone)');
  if (orderId) query = query.eq('order_id', orderId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}