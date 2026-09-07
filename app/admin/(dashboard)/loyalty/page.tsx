/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { CardSkeleton } from '@/components/admin/Skeleton';
import { ErrorState } from '@/components/admin/StateViews';
import { useLoyaltySettings, useUpdateLoyaltySettings } from '@/hooks/admin/useLoyaltySettings';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LoyaltySettingsPage() {
  const { data: settings, isLoading, isError, refetch } = useLoyaltySettings();
  const updateSettings = useUpdateLoyaltySettings();

  const [form, setForm] = useState({ redemption_rate: 0.5, min_points_to_redeem: 100, max_redeem_percent_of_order: 50 });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    updateSettings.mutate(form, { onSuccess: () => setSuccess(true) });
  };

  if (isLoading) {
    return (
      <div className="max-w-md space-y-6">
        <h1 className="text-lg font-semibold text-zinc-100">Loyalty Settings</h1>
        <CardSkeleton className="space-y-4" />
      </div>
    );
  }

  if (isError) return <ErrorState message="Failed to load loyalty settings" onRetry={refetch} />;

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-lg font-semibold text-zinc-100">Loyalty Settings</h1>

      <form onSubmit={handleSubmit} className="animate-fade-up space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <div className="space-y-1.5">
          <label className="text-sm text-zinc-400">Redemption rate (₹ per point)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            value={form.redemption_rate}
            onChange={(e) => setForm((f) => ({ ...f, redemption_rate: Number(e.target.value) }))}
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 transition-colors focus:border-zinc-600 focus:outline-none"
          />
          <p className="text-xs text-zinc-600">How much ₹ value each redeemed point is worth.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-zinc-400">Minimum points to redeem</label>
          <input
            type="number"
            min={0}
            value={form.min_points_to_redeem}
            onChange={(e) => setForm((f) => ({ ...f, min_points_to_redeem: Number(e.target.value) }))}
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 transition-colors focus:border-zinc-600 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-zinc-400">Max redeemable (% of order value)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.max_redeem_percent_of_order}
            onChange={(e) => setForm((f) => ({ ...f, max_redeem_percent_of_order: Number(e.target.value) }))}
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 transition-colors focus:border-zinc-600 focus:outline-none"
          />
        </div>

        {updateSettings.isError && (
          <p className="rounded-md bg-red-950/30 px-3 py-2 text-sm text-red-400 animate-fade-in">
            {(updateSettings.error as Error).message}
          </p>
        )}
        {success && (
          <p className="flex items-center gap-2 rounded-md bg-emerald-950/30 px-3 py-2 text-sm text-emerald-400 animate-fade-in">
            <CheckCircle2 className="h-4 w-4" /> Settings saved
          </p>
        )}

        <button
          type="submit"
          disabled={updateSettings.isPending}
          className="flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-white active:scale-[0.98] disabled:opacity-50"
        >
          {updateSettings.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save settings
        </button>
      </form>
    </div>
  );
}