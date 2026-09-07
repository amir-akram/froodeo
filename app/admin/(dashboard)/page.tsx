'use client';

import { StatCardSkeleton } from '@/components/admin/Skeleton';
import { ErrorState } from '@/components/admin/StateViews';
import { useAdminStats, useRevenueChart } from '@/hooks/admin/useAdminStats';
import { cn } from '@/lib/utils';
import { Clock, IndianRupee, PackageX, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useAdminStats();
  const { data: revenue, isLoading: revenueLoading } = useRevenueChart('7d');

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-zinc-100">Dashboard</h1>

      {isError && <ErrorState message="Failed to load dashboard stats" onRetry={refetch} />}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={ShoppingCart} label="Orders today" value={stats.orders_today} delay={0} />
            <StatCard
              icon={IndianRupee}
              label="Revenue today"
              value={`₹${stats.revenue_today.toLocaleString('en-IN')}`}
              delay={0.05}
            />
            <StatCard
              icon={Clock}
              label="Pending orders"
              value={stats.pending_orders}
              tone={stats.pending_orders > 0 ? 'warn' : undefined}
              delay={0.1}
            />
            <StatCard icon={PackageX} label="Unavailable products" value={stats.unavailable_products} delay={0.15} />
          </div>

          <div className="animate-fade-up rounded-lg border border-zinc-800 bg-zinc-950 p-4" style={{ animationDelay: '0.2s' }}>
            <h2 className="mb-4 text-sm font-medium text-zinc-300">Revenue — last 7 days</h2>
            {revenueLoading && (
              <div className="flex h-40 items-end gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="skeleton w-full rounded-t" style={{ height: `${30 + (i % 3) * 20}%` }} />
                ))}
              </div>
            )}
            {revenue && revenue.every((p) => p.revenue === 0) && (
              <p className="py-10 text-center text-sm text-zinc-600">No revenue recorded in this period yet</p>
            )}
            {revenue && revenue.some((p) => p.revenue > 0) && <RevenueBarChart data={revenue} />}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone?: 'warn';
  delay?: number;
}) {
  return (
    <div
      className="animate-fade-up rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition-colors duration-150 hover:border-zinc-700"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{label}</p>
        <Icon className={cn('h-4 w-4', tone === 'warn' ? 'text-amber-400' : 'text-zinc-600')} />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-100">{value}</p>
    </div>
  );
}

function RevenueBarChart({ data }: { data: { date: string; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((point, i) => (
        <div
          key={point.date}
          className="group flex flex-1 flex-col items-center gap-2"
          onMouseEnter={() => setHovered(point.date)}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="relative flex w-full flex-1 items-end">
            {hovered === point.date && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-200 animate-fade-in">
                ₹{point.revenue}
              </span>
            )}
            <div
              className="w-full origin-bottom rounded-t bg-zinc-700 opacity-0 transition-[transform,background-color] duration-150 group-hover:bg-zinc-500"
              style={{
                height: `${Math.max((point.revenue / max) * 100, 2)}%`,
                animation: `fade-up 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s forwards`,
              }}
            />
          </div>
          <span className="text-[10px] text-zinc-600">{point.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}