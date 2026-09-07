'use client';

import { PincodeFormDialog } from '@/components/admin/PincodeFormDialog';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { EmptyState, ErrorState } from '@/components/admin/StateViews';
import { Pincode, useAdminPincodes, useDeletePincode } from '@/hooks/admin/useAdminPincodes';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function PincodesPage() {
  const { data: pincodes, isLoading, isError, refetch } = useAdminPincodes();
  const deletePincode = useDeletePincode();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Pincode | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (p: Pincode) => {
    setEditing(p);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Serviceable Pincodes</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-white active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Add Pincode
        </button>
      </div>

      {isLoading && <TableSkeleton rows={5} cols={4} />}
      {isError && <ErrorState message="Failed to load pincodes" onRetry={refetch} />}

      {pincodes && pincodes.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="No pincodes added"
          description="Add pincodes to define where deliveries are accepted."
          action={
            <button
              onClick={openCreate}
              className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-white active:scale-[0.98]"
            >
              Add pincode
            </button>
          }
        />
      )}

      {pincodes && pincodes.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Pincode</th>
                <th className="px-4 py-2 text-left font-medium">Area</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {pincodes.map((p, i) => (
                <tr
                  key={p.id}
                  className="row-enter text-zinc-200 transition-colors hover:bg-zinc-900/50"
                  style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
                >
                  <td className="px-4 py-3 font-mono">{p.pincode}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.area_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.is_active
                          ? 'rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400'
                          : 'rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500'
                      }
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${p.pincode}?`)) deletePincode.mutate(p.id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-950/40 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PincodeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} pincode={editing} />
    </div>
  );
}