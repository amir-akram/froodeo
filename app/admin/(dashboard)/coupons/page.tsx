'use client';

import { CouponFormDialog } from '@/components/admin/CouponFormDialog';
import { ColumnDef, ResponsiveTable } from '@/components/admin/ResponsiveTable';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { EmptyState, ErrorState } from '@/components/admin/StateViews';
import { Coupon, useAdminCoupons, useDeleteCoupon } from '@/hooks/admin/useAdminCoupons';
import { Pencil, Plus, Ticket, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function CouponsPage() {
  const { data: coupons, isLoading, isError, refetch } = useAdminCoupons();
  const deleteCoupon = useDeleteCoupon();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const openCreate = () => {
    setEditingCoupon(null);
    setDialogOpen(true);
  };
  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setDialogOpen(true);
  };

  const columns: ColumnDef<Coupon>[] = [
    { key: 'code', header: 'Code', isMobileTitle: true, cell: (c) => c.code, className: 'font-mono' },
    {
      key: 'discount',
      header: 'Discount',
      isMobileSubtitle: true,
      cell: (c) => (c.discount_type === 'flat' ? `₹${c.discount_value} off` : `${c.discount_value}% off`),
    },
    {
      key: 'usage',
      header: 'Usage',
      cell: (c) => `${c.used_count} / ${c.usage_limit ?? '∞'}`,
      className: 'tabular-nums text-zinc-400',
    },
    {
      key: 'valid_until',
      header: 'Valid until',
      cell: (c) => (c.valid_until ? new Date(c.valid_until).toLocaleDateString('en-IN') : 'No expiry'),
      className: 'text-zinc-400',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (c) => (
        <span
          className={
            c.is_active
              ? 'rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400'
              : 'rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500'
          }
        >
          {c.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Coupons</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-white active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      {isLoading && <TableSkeleton rows={5} cols={6} />}
      {isError && <ErrorState message="Failed to load coupons" onRetry={refetch} />}

      {coupons && coupons.length === 0 && (
        <EmptyState
          icon={Ticket}
          title="No coupons yet"
          description="Create discount codes for customers to use at checkout."
          action={
            <button
              onClick={openCreate}
              className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-white active:scale-[0.98]"
            >
              Create coupon
            </button>
          }
        />
      )}

      {coupons && coupons.length > 0 && (
        <ResponsiveTable
          data={coupons}
          columns={columns}
          rowActions={(coupon) => (
            <>
              <button
                onClick={() => openEdit(coupon)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Deactivate "${coupon.code}"?`)) deleteCoupon.mutate(coupon.id);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-950/40 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        />
      )}

      <CouponFormDialog open={dialogOpen} onOpenChange={setDialogOpen} coupon={editingCoupon} />
    </div>
  );
}