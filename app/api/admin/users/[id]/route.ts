import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

// PATCH /api/admin/users/:id — admin-only edits: phone_verified toggle,
// or a manual loyalty balance correction WITH an audit trail entry.
// Deliberately not reusing app/api/users/[id]/route.ts's PUT (self-only,
// name-only) — admin capabilities are wider and need their own guard.
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const { phone_verified, loyalty_adjustment, loyalty_adjustment_note } = await request.json();

  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('loyalty_points_balance')
    .eq('id', id)
    .single();

  if (fetchError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const update: Record<string, boolean | number> = {};
  if (phone_verified !== undefined) update.phone_verified = phone_verified;

  let newBalance = user.loyalty_points_balance;
  if (loyalty_adjustment !== undefined) {
    if (!Number.isInteger(loyalty_adjustment) || loyalty_adjustment === 0) {
      return NextResponse.json({ error: 'loyalty_adjustment must be a non-zero integer' }, { status: 400 });
    }
    newBalance = user.loyalty_points_balance + loyalty_adjustment;
    if (newBalance < 0) {
      return NextResponse.json({ error: 'Adjustment would make balance negative' }, { status: 400 });
    }
    update.loyalty_points_balance = newBalance;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data: updatedUser, error: updateError } = await supabaseAdmin
    .from('users')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Audit trail: every manual balance change must leave a row in
  // loyalty_transactions, or the balance drifts from an unexplainable
  // number with no history — same pattern the loyalty lib presumably
  // uses for earn/redeem.
  if (loyalty_adjustment !== undefined) {
    const { error: txError } = await supabaseAdmin.from('loyalty_transactions').insert({
      user_id: id,
      order_id: null,
      type: 'adjustment',
      points: loyalty_adjustment,
      balance_after: newBalance,
      note: loyalty_adjustment_note || `Manual adjustment by admin ${admin.username}`,
    });
    if (txError) {
      return NextResponse.json({ error: `User updated but audit log failed: ${txError.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ data: updatedUser });
}