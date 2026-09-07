import { requireAdmin } from '@/lib/adminAuth';
import { awardLoyaltyPoints } from '@/lib/loyalty';
import { completeReferralIfEligible } from '@/lib/referrel';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

// Legal forward transitions. Cancellation is allowed from any
// non-terminal state; nothing is allowed out of delivered/cancelled.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
};

// PATCH /api/admin/orders/:id/status
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
    const admin = requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;
    const { status: nextStatus } = (await request.json()) as { status: string };

    if (!VALID_STATUSES.includes(nextStatus as OrderStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data: order, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('id, status, user_id, payment_method')
        .eq('id', id)
        .single();

    if (fetchError || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = order.status as OrderStatus;
    const target = nextStatus as OrderStatus;

    if (currentStatus === target) {
        return NextResponse.json({ error: `Order is already ${target}` }, { status: 400 });
    }
    if (!ALLOWED_TRANSITIONS[currentStatus].includes(target)) {
        return NextResponse.json(
        { error: `Cannot move order from ${currentStatus} to ${target}` },
        { status: 400 }
        );
    }

    // For an online-payment order, don't allow "confirmed" via this
    // route — confirmation should only happen through the verified
    // Razorpay payment callback, otherwise an admin could mark an
    // unpaid online order as confirmed.
    if (target === 'confirmed' && order.payment_method === 'online') {
        return NextResponse.json(
        { error: 'Online orders are confirmed automatically on payment verification' },
        { status: 400 }
        );
    }

    const { data: updated, error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ status: target })
        .eq('id', id)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Loyalty points: COD orders already get points at creation time
    // (see orders POST route). For everything else, award on delivery
    // rather than at order-placement to avoid rewarding unfulfilled/
    // cancelled orders. awardLoyaltyPoints is expected to be idempotent
    // (no-op if already awarded for this order) — confirm in lib/loyalty.ts.
    if (target === 'delivered' && order.payment_method !== 'cod') {
        await awardLoyaltyPoints(id);
        if (order.user_id) {
        await completeReferralIfEligible(order.user_id);
        }
    }

    // TODO: on cancellation of an order that already earned loyalty
    // points (COD path awards at creation), decide whether to reverse
    // those points via a loyalty_transactions 'adjustment' entry.
    // Flagging rather than guessing the business rule here.

    return NextResponse.json({ data: updated });
}