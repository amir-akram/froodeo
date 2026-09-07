import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { current_password, new_password } = (await request.json()) as {
    current_password: string;
    new_password: string;
  };

  if (!current_password || !new_password) {
    return NextResponse.json({ error: 'current_password and new_password are required' }, { status: 400 });
  }
  if (new_password.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
  }

  const { data: record, error: fetchError } = await supabaseAdmin
    .from('admins')
    .select('id, password_hash')
    .eq('id', admin.sub)
    .single();

  if (fetchError || !record) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }

  const matches = await bcrypt.compare(current_password, record.password_hash);
  if (!matches) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  const sameAsOld = await bcrypt.compare(new_password, record.password_hash);
  if (sameAsOld) {
    return NextResponse.json({ error: 'New password must be different from the current one' }, { status: 400 });
  }

  const newHash = await bcrypt.hash(new_password, 10);
  const { error: updateError } = await supabaseAdmin
    .from('admins')
    .update({ password_hash: newHash })
    .eq('id', admin.sub);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Password updated' });
}