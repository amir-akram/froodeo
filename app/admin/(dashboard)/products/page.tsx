'use client';

import { ProductFormDialog } from '@/components/admin/ProductFormDialog';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { EmptyState, ErrorState } from '@/components/admin/StateViews';
import { useAdminCategories } from '@/hooks/admin/useAdminCategories';
import { Product, useAdminProducts, useDeleteProduct } from '@/hooks/admin/useAdminProducts';
import { Package, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ProductsPage() {
  const [categoryId, setCategoryId] = useState('');
  const { data: categories } = useAdminCategories();
  const { data: products, isLoading, isError, refetch } = useAdminProducts({ category_id: categoryId || undefined });
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openCreate = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };
  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-zinc-100">Products</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-white active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> New Product
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={categoryId === ''} onClick={() => setCategoryId('')}>
          All
        </FilterChip>
        {categories?.map((c) => (
          <FilterChip key={c.id} active={categoryId === c.id} onClick={() => setCategoryId(c.id)}>
            {c.name}
          </FilterChip>
        ))}
      </div>

      {isLoading && <TableSkeleton rows={6} cols={5} />}
      {isError && <ErrorState message="Failed to load products" onRetry={refetch} />}

      {products && products.length === 0 && (
        <EmptyState
          icon={Package}
          title="No products found"
          description={categoryId ? 'Try a different category.' : 'Add your first product to get started.'}
          action={
            !categoryId ? (
              <button
                onClick={openCreate}
                className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-white"
              >
                Add product
              </button>
            ) : undefined
          }
        />
      )}

      {products && products.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Category</th>
                <th className="px-4 py-2 text-left font-medium">Price</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {products.map((product, i) => (
                <tr
                  key={product.id}
                  className="row-enter text-zinc-200 transition-colors hover:bg-zinc-900/50"
                  style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {product.name}
                      {product.is_featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{product.categories?.name ?? '—'}</td>
                  <td className="px-4 py-3 tabular-nums">₹{product.price}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.is_available
                          ? 'rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400'
                          : 'rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500'
                      }
                    >
                      {product.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${product.name}"?`)) deleteProduct.mutate(product.id);
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

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editingProduct} />
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-950 transition-colors'
          : 'rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200'
      }
    >
      {children}
    </button>
  );
}