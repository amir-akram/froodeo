'use client';

import { OrderStatusStepper } from '@/components/admin/OrderStatusStepper';
import { CardSkeleton, Skeleton } from '@/components/admin/Skeleton';
import { ErrorState } from '@/components/admin/StateViews';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useAdminOrder } from '@/hooks/admin/useAdminOrders';
import { useParams } from 'next/navigation';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useAdminOrder(id);

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <CardSkeleton />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !order) return <ErrorState message="Failed to load order" onRetry={refetch} />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex animate-fade-up items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-zinc-500">
            {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="animate-fade-up rounded-lg border border-zinc-800 bg-zinc-950 p-5" style={{ animationDelay: '0.05s' }}>
        <h2 className="mb-4 text-sm font-medium text-zinc-300">Status</h2>
        <OrderStatusStepper orderId={order.id} status={order.status} paymentMethod={order.payment_method} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="animate-fade-up rounded-lg border border-zinc-800 bg-zinc-950 p-5" style={{ animationDelay: '0.1s' }}>
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Customer</h2>
          <p className="text-sm text-zinc-200">{order.customer_name}</p>
          <p className="text-sm text-zinc-500">{order.customer_phone}</p>
          <p className="mt-3 text-sm text-zinc-400">{order.delivery_address}</p>
          {order.delivery_date && (
            <p className="mt-1 text-sm text-zinc-500">
              {order.delivery_date} {order.delivery_time ?? ''}
            </p>
          )}
        </div>

        <div className="animate-fade-up rounded-lg border border-zinc-800 bg-zinc-950 p-5" style={{ animationDelay: '0.15s' }}>
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Payment</h2>
          <p className="text-sm uppercase text-zinc-200">{order.payment_method}</p>
          {order.payments.map((p) => (
            <div key={p.id} className="mt-2 flex items-center justify-between text-sm">
              <StatusBadge status={p.status} />
              <span className="tabular-nums text-zinc-500">₹{(p.amount / 100).toFixed(2)}</span>
            </div>
          ))}
          {order.payments.length === 0 && <p className="text-sm text-zinc-600">No payment record</p>}
        </div>
      </div>

      <div className="animate-fade-up rounded-lg border border-zinc-800 bg-zinc-950 p-5" style={{ animationDelay: '0.2s' }}>
        <h2 className="mb-3 text-sm font-medium text-zinc-300">Items</h2>
        <div className="divide-y divide-zinc-800">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <span className="text-zinc-200">{item.products?.name ?? 'Deleted product'}</span>
                <span className="ml-2 text-zinc-500">× {item.quantity}</span>
              </div>
              <span className="tabular-nums text-zinc-300">₹{item.total_price}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1 border-t border-zinc-800 pt-4 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span className="tabular-nums">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Delivery charge</span>
            <span className="tabular-nums">₹{order.delivery_charge}</span>
          </div>
          {order.coupon_discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Coupon {order.coupons?.code ? `(${order.coupons.code})` : ''}</span>
              <span className="tabular-nums">−₹{order.coupon_discount}</span>
            </div>
          )}
          {order.points_discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Loyalty points</span>
              <span className="tabular-nums">−₹{order.points_discount}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-800 pt-2 text-base font-medium text-zinc-100">
            <span>Total</span>
            <span className="tabular-nums">₹{order.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}