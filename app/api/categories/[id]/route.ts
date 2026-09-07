import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

// GET /api/categories/:id — public, unchanged
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ data });
}

// PUT /api/categories/:id — admin only
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const body = await request.json();

  // Don't let the body silently overwrite the primary key.
  delete body.id;

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// DELETE /api/categories/:id — admin only
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  // Refuse to delete a category that still has products attached —
  // otherwise those products' category_id silently becomes an
  // orphaned FK reference (or fails, depending on FK action).
  const { count, error: countError } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }
  if (count && count > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${count} product(s) still reference this category` },
      { status: 409 }
    );
  }

  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: 'Category deleted' });
}