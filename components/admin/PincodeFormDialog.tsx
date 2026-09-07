'use client';

import { Pincode, useCreatePincode, useUpdatePincode } from '@/hooks/admin/useAdminPincodes';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Field, FormInput, Modal } from './Modal';

export function PincodeFormDialog({
  open,
  onOpenChange,
  pincode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pincode: Pincode | null;
}) {
  const isEditing = !!pincode;
  const createPincode = useCreatePincode();
  const updatePincode = useUpdatePincode();
  const mutation = isEditing ? updatePincode : createPincode;

  const [code, setCode] = useState('');
  const [areaName, setAreaName] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCode(pincode?.pincode ?? '');
      setAreaName(pincode?.area_name ?? '');
      setIsActive(pincode?.is_active ?? true);
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pincode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { pincode: code, area_name: areaName || null, is_active: isActive };
    const onSuccess = () => onOpenChange(false);

    if (isEditing) {
      updatePincode.mutate({ id: pincode!.id, ...payload }, { onSuccess });
    } else {
      createPincode.mutate(payload, { onSuccess });
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isEditing ? 'Edit pincode' : 'Add pincode'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Pincode">
          <FormInput
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            pattern="\d{6}"
            maxLength={6}
            title="6-digit pincode"
          />
        </Field>

        <Field label="Area name">
          <FormInput value={areaName} onChange={(e) => setAreaName(e.target.value)} />
        </Field>

        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>

        {mutation.isError && <p className="text-sm text-red-400">{(mutation.error as Error).message}</p>}

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
            disabled={mutation.isPending}
            className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEditing ? 'Save changes' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}