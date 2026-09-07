import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

// GET /api/admin/payments/:id
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*, orders(*)')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  return NextResponse.json({ data });
}