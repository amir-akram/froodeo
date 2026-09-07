import { requireAdmin } from '@/lib/adminAuth';
import { createRazorpayRefund } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

// POST /api/admin/payments/:id/refund   body: { amount?: number } (rupees, optional = full refund)
export async function POST(request: NextRequest, { params }: { params: Params }) {
  const admin = requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const { amount } = (await request.json().catch(() => ({}))) as { amount?: number };

  const { data: payment, error: fetchError } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }
  if (payment.status !== 'captured') {
    return NextResponse.json({ error: `Cannot refund a payment with status '${payment.status}'` }, { status: 400 });
  }
  if (!payment.razorpay_payment_id) {
    return NextResponse.json({ error: 'Payment has no Razorpay payment id on record' }, { status: 400 });
  }

  let amountPaise: number | undefined;
  if (amount !== undefined) {
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
    }
    amountPaise = Math.round(amount * 100);
    if (amountPaise > payment.amount) {
      return NextResponse.json({ error: 'Refund amount cannot exceed the captured amount' }, { status: 400 });
    }
  }

  try {
    // Idempotency key ties this specific admin action to a specific
    // payment, so a retried request reuses the same refund attempt
    // rather than issuing a second one against Razorpay.
    const refund = await createRazorpayRefund(
      payment.razorpay_payment_id,
      amountPaise,
      `refund_${payment.id}_${amountPaise ?? 'full'}`
    );

    const isFullRefund = amountPaise === undefined || amountPaise === payment.amount;

    const { data: updatedPayment, error: updateError } = await supabaseAdmin
      .from('payments')
      .update({ status: isFullRefund ? 'refunded' : payment.status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Refund succeeded at Razorpay but local update failed: ${updateError.message}`, razorpay_refund: refund },
        { status: 500 }
      );
    }

    if (isFullRefund) {
      await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('id', payment.order_id);
    }

    return NextResponse.json({ data: updatedPayment, razorpay_refund: refund });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Refund failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}