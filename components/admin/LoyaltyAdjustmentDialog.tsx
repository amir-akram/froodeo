'use client';

import { useAdjustUserLoyalty } from '@/hooks/admin/useAdminUsers';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Field, FormInput, FormTextarea, Modal } from './Modal';

export function LoyaltyAdjustmentDialog({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}) {
  const [points, setPoints] = useState(0);
  const [note, setNote] = useState('');
  const adjust = useAdjustUserLoyalty();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (points === 0) return;
    adjust.mutate(
      { id: userId, loyalty_adjustment: points, loyalty_adjustment_note: note || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setPoints(0);
          setNote('');
        },
      }
    );
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Adjust loyalty points">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Points (use negative to deduct)">
          <FormInput type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} required />
        </Field>
        <Field label="Note (optional)">
          <FormTextarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        </Field>

        {adjust.isError && <p className="text-sm text-red-400">{(adjust.error as Error).message}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={adjust.isPending || points === 0}
            className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
          >
            {adjust.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Apply
          </button>
        </div>
      </form>
    </Modal>
  );
}