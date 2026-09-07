'use client';

import { OrderStatus, useUpdateOrderStatus } from '@/hooks/admin/useAdminOrders';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const NEXT_ACTION_LABEL: Record<OrderStatus, string | null> = {
  pending: 'Confirm order',
  confirmed: 'Start preparing',
  preparing: 'Out for delivery',
  out_for_delivery: 'Mark delivered',
  delivered: null,
  cancelled: null,
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered',
  delivered: null,
  cancelled: null,
};

export function OrderStatusStepper({
  orderId,
  status,
  paymentMethod,
}: {
  orderId: string;
  status: OrderStatus;
  paymentMethod: 'online' | 'cod';
}) {
  const updateStatus = useUpdateOrderStatus();

  if (status === 'cancelled') {
    return <p className="text-sm text-red-400">This order was cancelled.</p>;
  }

  const currentIndex = FLOW.indexOf(status);
  const nextStatus = NEXT_STATUS[status];
  const nextLabel = NEXT_ACTION_LABEL[status];

  // Online orders move pending → confirmed only via the verified
  // Razorpay callback (enforced server-side too) — the admin action
  // is disabled here to match, rather than showing a button that
  // will just 400.
  const advanceBlocked = status === 'pending' && paymentMethod === 'online';

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        {FLOW.map((step, i) => (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs',
                i <= currentIndex
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-700 text-zinc-600'
              )}
            >
              {i + 1}
            </div>
            {i < FLOW.length - 1 && (
              <div className={cn('h-px flex-1', i < currentIndex ? 'bg-emerald-500' : 'bg-zinc-800')} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        {FLOW.map((step) => (
          <span key={step} className="w-16 text-center capitalize first:text-left last:text-right">
            {step.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      {nextStatus && nextLabel && (
        <div className="flex items-center gap-3 pt-2">
          <button
            disabled={advanceBlocked || updateStatus.isPending}
            onClick={() => updateStatus.mutate({ id: orderId, status: nextStatus })}
            className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-40"
          >
            {updateStatus.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {nextLabel}
          </button>
          {advanceBlocked && (
            <span className="text-xs text-zinc-500">Waiting on payment confirmation</span>
          )}
          <button
            disabled={updateStatus.isPending}
            onClick={() => {
              if (confirm('Cancel this order?')) updateStatus.mutate({ id: orderId, status: 'cancelled' });
            }}
            className="ml-auto rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950/30 disabled:opacity-40"
          >
            Cancel order
          </button>
        </div>
      )}

      {updateStatus.isError && <p className="text-sm text-red-400">{(updateStatus.error as Error).message}</p>}
    </div>
  );
}