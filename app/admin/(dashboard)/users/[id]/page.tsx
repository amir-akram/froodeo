'use client';

import { LoyaltyAdjustmentDialog } from '@/components/admin/LoyaltyAdjustmentDialog';
import { CardSkeleton, Skeleton } from '@/components/admin/Skeleton';
import { EmptyState } from '@/components/admin/StateViews';
import { useAdminUserLoyalty, useAdminUserOrders, useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { Coins, ShoppingCart } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: orders, isLoading: ordersLoading } = useAdminUserOrders(id);
  const { data: loyaltyTx, isLoading: loyaltyLoading } = useAdminUserLoyalty(id);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const user = users?.find((u) => u.id === id);

  if (usersLoading) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!user) return <EmptyState icon={ShoppingCart} title="User not found" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex animate-fade-up items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">{user.name || 'Unnamed user'}</h1>
          <p className="text-sm text-zinc-500">{user.phone}</p>
        </div>
        <button
          onClick={() => setAdjustOpen(true)}
          className="flex items-center gap-2 rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:bg-zinc-900 active:scale-[0.98]"
        >
          <Coins className="h-4 w-4" /> Adjust points
        </button>
      </div>

      <div className="animate-fade-up rounded-lg border border-zinc-800 bg-zinc-950 p-5" style={{ animationDelay: '0.05s' }}>
        <p className="text-sm text-zinc-500">Loyalty balance</p>
        <p className="text-2xl font-semibold tabular-nums text-zinc-100">{user.loyalty_points_balance} pts</p>
      </div>

      <div className="animate-fade-up rounded-lg border border-zinc-800 bg-zinc-950 p-5" style={{ animationDelay: '0.1s' }}>
        <h2 className="mb-3 text-sm font-medium text-zinc-300">Order history</h2>
        {ordersLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        {orders && orders.length === 0 && <p className="text-sm text-zinc-600">No orders yet</p>}
        {orders && orders.length > 0 && (
          <p className="text-sm text-zinc-400">{orders.length} order(s) — see Orders tab for full list</p>
        )}
      </div>

      <div className="animate-fade-up rounded-lg border border-zinc-800 bg-zinc-950 p-5" style={{ animationDelay: '0.15s' }}>
        <h2 className="mb-3 text-sm font-medium text-zinc-300">Loyalty history</h2>
        {loyaltyLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
        {loyaltyTx && loyaltyTx.length === 0 && <p className="text-sm text-zinc-600">No transactions yet</p>}
      </div>

      <LoyaltyAdjustmentDialog open={adjustOpen} onOpenChange={setAdjustOpen} userId={id} />
    </div>
  );
}