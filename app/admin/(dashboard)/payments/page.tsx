'use client';

import { ColumnDef, ResponsiveTable } from '@/components/admin/ResponsiveTable';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { EmptyState, ErrorState } from '@/components/admin/StateViews';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Payment, useAdminPayments, useRefundPayment } from '@/hooks/admin/useAdminPayments';
import { CreditCard } from 'lucide-react';
import { useState } from 'react';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'created', label: 'Created' },
  { value: 'captured', label: 'Captured' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

export default function PaymentsPage() {
  const [status, setStatus] = useState('');
  const { data: payments, isLoading, isError, refetch } = useAdminPayments({ status: status || undefined });
  const refund = useRefundPayment();

  const columns: ColumnDef<Payment>[] = [
    {
      key: 'customer',
      header: 'Customer',
      isMobileTitle: true,
      cell: (p) => p.orders?.customer_name ?? '—',
    },
    {
      key: 'phone',
      header: 'Phone',
      isMobileSubtitle: true,
      cell: (p) => p.orders?.customer_phone ?? '',
    },
    { key: 'amount', header: 'Amount', cell: (p) => `₹${(p.amount / 100).toFixed(2)}`, className: 'tabular-nums' },
    { key: 'status', header: 'Status', cell: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'date',
      header: 'Date',
      showOnMobile: false,
      cell: (p) => new Date(p.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      className: 'text-zinc-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-zinc-100">Payments</h1>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={
              status === f.value
                ? 'rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-950 transition-colors'
                : 'rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200'
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <TableSkeleton rows={6} cols={5} />}
      {isError && <ErrorState message="Failed to load payments" onRetry={refetch} />}

      {payments && payments.length === 0 && (
        <EmptyState icon={CreditCard} title="No payments found" description="Payments will appear here as orders are placed." />
      )}

      {payments && payments.length > 0 && (
        <ResponsiveTable
          data={payments}
          columns={columns}
          rowActions={(p) =>
            p.status === 'captured' ? (
              <button
                onClick={() => {
                  if (confirm('Issue a full refund for this payment?')) refund.mutate({ id: p.id });
                }}
                className="rounded-md border border-zinc-800 px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-950/30"
              >
                Refund
              </button>
            ) : null
          }
        />
      )}
    </div>
  );
}