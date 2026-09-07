'use client';

import { useAdminCategories } from '@/hooks/admin/useAdminCategories';
import { Product, useCreateProduct, useUpdateProduct } from '@/hooks/admin/useAdminProducts';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Field, FormInput, FormSelect, FormTextarea, Modal } from './Modal';

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}) {
  const isEditing = !!product;
  const { data: categories } = useAdminCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const mutation = isEditing ? updateProduct : createProduct;

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category_id: '',
    loyalty_points: 0,
    is_available: true,
    is_featured: false,
  });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: product?.name ?? '',
        description: product?.description ?? '',
        price: product?.price ?? 0,
        image_url: product?.image_url ?? '',
        category_id: product?.category_id ?? '',
        loyalty_points: product?.loyalty_points ?? 0,
        is_available: product?.is_available ?? true,
        is_featured: product?.is_featured ?? false,
      });
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, category_id: form.category_id || null };
    const onSuccess = () => onOpenChange(false);

    if (isEditing) {
      updateProduct.mutate({ id: product!.id, ...payload }, { onSuccess });
    } else {
      createProduct.mutate(payload, { onSuccess });
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isEditing ? 'Edit product' : 'New product'} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <Field label="Name">
          <FormInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </Field>

        <Field label="Description">
          <FormTextarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (₹)">
            <FormInput
              type="number"
              step="0.01"
              min={0}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              required
            />
          </Field>
          <Field label="Loyalty points / unit">
            <FormInput
              type="number"
              min={0}
              value={form.loyalty_points}
              onChange={(e) => setForm((f) => ({ ...f, loyalty_points: Number(e.target.value) }))}
            />
          </Field>
        </div>

        <Field label="Category">
          <FormSelect
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
          >
            <option value="">Uncategorized</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FormSelect>
        </Field>

        <Field label="Image URL">
          <FormInput value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} />
        </Field>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))}
            />
            Available
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
            />
            Featured
          </label>
        </div>

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