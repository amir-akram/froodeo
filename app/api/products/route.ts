import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/products?category_id=&featured=&available=  — public, unchanged
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get('category_id');
  const featured = searchParams.get('featured');
  const available = searchParams.get('available');

  let query = supabaseAdmin.from('products').select('*, categories(id, name)');

  if (categoryId) query = query.eq('category_id', categoryId);
  if (featured === 'true') query = query.eq('is_featured', true);
  if (available !== 'false') query = query.eq('is_available', true);

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// POST /api/products — admin only
export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const body = await request.json();
  const { category_id, name, description, price, image_url, rating, is_available, is_featured, loyalty_points } = body;

  if (!name || price === undefined) {
    return NextResponse.json({ error: 'name and price are required' }, { status: 400 });
  }
  if (typeof price !== 'number' || price < 0) {
    return NextResponse.json({ error: 'price must be a non-negative number' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({ category_id, name, description, price, image_url, rating, is_available, is_featured, loyalty_points })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 201 });
}