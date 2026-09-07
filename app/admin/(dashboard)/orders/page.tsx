'use client';

import { ColumnDef, ResponsiveTable } from '@/components/admin/ResponsiveTable';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { EmptyState, ErrorState } from '@/components/admin/StateViews';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { OrderListItem, OrderStatus, useAdminOrders } from '@/hooks/admin/useAdminOrders';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUS_TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useAdminOrders({ status, page });

  const columns: ColumnDef<OrderListItem>[] = [
    {
      key: 'customer',
      header: 'Customer',
      isMobileTitle: true,
      cell: (o) => o.customer_name,
    },
    {
      key: 'phone',
      header: 'Phone',
      isMobileSubtitle: true,
      cell: (o) => o.customer_phone,
      className: 'text-zinc-500',
    },
    { key: 'items', header: 'Items', cell: (o) => `${o.order_items.length} item(s)`, className: 'text-zinc-400' },
    { key: 'total', header: 'Total', cell: (o) => `₹${o.total}`, className: 'tabular-nums' },
    { key: 'payment', header: 'Payment', cell: (o) => o.payment_method, className: 'uppercase text-zinc-400' },
    { key: 'status', header: 'Status', cell: (o) => <StatusBadge status={o.status} /> },
    {
      key: 'placed',
      header: 'Placed',
      showOnMobile: false,
      cell: (o) => new Date(o.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      className: 'text-zinc-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-zinc-100">Orders</h1>

      <div className="flex gap-1 overflow-x-auto border-b border-zinc-800 pb-px">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={
              status === tab.value
                ? 'relative whitespace-nowrap px-3 py-2 text-sm font-medium text-zinc-100'
                : 'relative whitespace-nowrap px-3 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300'
            }
          >
            {tab.label}
            {status === tab.value && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 animate-scale-in rounded-full bg-zinc-100" />
            )}
          </button>
        ))}
      </div>

      {isLoading && <TableSkeleton rows={6} cols={6} />}
      {isError && <ErrorState message="Failed to load orders" onRetry={refetch} />}

      {data && data.data.length === 0 && (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description="Orders will show up here once customers start checking out."
        />
      )}

      {data && data.data.length > 0 && (
        <>
          <ResponsiveTable data={data.data} columns={columns} onRowClick={(o) => router.push(`/admin/orders/${o.id}`)} />

          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>
              Page {data.pagination.page} · {data.pagination.total} order(s)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-zinc-800 px-3 py-1 transition-colors hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Previous
              </button>
              <button
                disabled={page * data.pagination.page_size >= data.pagination.total}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-zinc-800 px-3 py-1 transition-colors hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}