'use client';

import { Coupon, useCreateCoupon, useUpdateCoupon } from '@/hooks/admin/useAdminCoupons';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Field, FormInput, FormSelect, Modal } from './Modal';

export function CouponFormDialog({
  open,
  onOpenChange,
  coupon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
}) {
  const isEditing = !!coupon;
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const mutation = isEditing ? updateCoupon : createCoupon;

  const [form, setForm] = useState({
    code: '',
    discount_type: 'flat' as 'flat' | 'percentage',
    discount_value: 0,
    max_discount_amount: '',
    min_order_value: 0,
    usage_limit: '',
    usage_limit_per_user: 1,
    valid_until: '',
    is_active: true,
  });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        code: coupon?.code ?? '',
        discount_type: coupon?.discount_type ?? 'flat',
        discount_value: coupon?.discount_value ?? 0,
        max_discount_amount: coupon?.max_discount_amount?.toString() ?? '',
        min_order_value: coupon?.min_order_value ?? 0,
        usage_limit: coupon?.usage_limit?.toString() ?? '',
        usage_limit_per_user: coupon?.usage_limit_per_user ?? 1,
        valid_until: coupon?.valid_until ? coupon.valid_until.slice(0, 10) : '',
        is_active: coupon?.is_active ?? true,
      });
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, coupon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
      min_order_value: form.min_order_value,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      usage_limit_per_user: form.usage_limit_per_user,
      valid_until: form.valid_until || null,
      is_active: form.is_active,
    };
    const onSuccess = () => onOpenChange(false);

    if (isEditing) {
      updateCoupon.mutate({ id: coupon!.id, ...payload }, { onSuccess });
    } else {
      createCoupon.mutate(payload, { onSuccess });
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isEditing ? 'Edit coupon' : 'New coupon'} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <Field label="Code">
          <FormInput
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            required
            disabled={isEditing}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Discount type">
            <FormSelect
              value={form.discount_type}
              onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'flat' | 'percentage' }))}
            >
              <option value="flat">Flat (₹)</option>
              <option value="percentage">Percentage (%)</option>
            </FormSelect>
          </Field>
          <Field label="Discount value">
            <FormInput
              type="number"
              min={0}
              max={form.discount_type === 'percentage' ? 100 : undefined}
              value={form.discount_value}
              onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))}
              required
            />
          </Field>
        </div>

        {form.discount_type === 'percentage' && (
          <Field label="Max discount amount (₹, optional cap)">
            <FormInput
              type="number"
              min={0}
              value={form.max_discount_amount}
              onChange={(e) => setForm((f) => ({ ...f, max_discount_amount: e.target.value }))}
            />
          </Field>
        )}

        <Field label="Minimum order value (₹)">
          <FormInput
            type="number"
            min={0}
            value={form.min_order_value}
            onChange={(e) => setForm((f) => ({ ...f, min_order_value: Number(e.target.value) }))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Total usage limit (optional)">
            <FormInput
              type="number"
              min={1}
              value={form.usage_limit}
              onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))}
              placeholder="Unlimited"
            />
          </Field>
          <Field label="Uses per user">
            <FormInput
              type="number"
              min={1}
              value={form.usage_limit_per_user}
              onChange={(e) => setForm((f) => ({ ...f, usage_limit_per_user: Number(e.target.value) }))}
            />
          </Field>
        </div>

        <Field label="Valid until (optional)">
          <FormInput
            type="date"
            value={form.valid_until}
            onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
          />
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
            {isEditing ? 'Save changes' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}