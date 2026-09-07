import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

// GET /api/products/:id — public, unchanged
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(id, name)')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ data });
}

// PUT /api/products/:id — admin only
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const body = await request.json();
  delete body.id;

  if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) {
    return NextResponse.json({ error: 'price must be a non-negative number' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// DELETE /api/products/:id — admin only
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  // A product referenced by past order_items can't be hard-deleted
  // without breaking order history (order_items.product_id FK, and
  // the order confirmation page joins products.name/image_url).
  // Soft-delete via is_available instead when there's order history.
  const { count, error: countError } = await supabaseAdmin
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (count && count > 0) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ is_available: false })
      .eq('id', id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({
      message: 'Product has order history — marked unavailable instead of deleted',
      data,
    });
  }

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: 'Product deleted' });
}