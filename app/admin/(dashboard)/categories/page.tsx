'use client';

import { CategoryFormDialog } from '@/components/admin/CategoryFormDialog';
import { ColumnDef, ResponsiveTable } from '@/components/admin/ResponsiveTable';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { EmptyState, ErrorState } from '@/components/admin/StateViews';
import { Category, useAdminCategories, useDeleteCategory } from '@/hooks/admin/useAdminCategories';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function CategoriesPage() {
  const { data: categories, isLoading, isError, refetch } = useAdminCategories();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const openCreate = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };
  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const columns: ColumnDef<Category>[] = [
    { key: 'name', header: 'Name', isMobileTitle: true, cell: (c) => c.name },
    { key: 'sort_order', header: 'Sort order', cell: (c) => c.sort_order, className: 'tabular-nums text-zinc-400' },
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
        <h1 className="text-lg font-semibold text-zinc-100">Categories</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-white active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> New Category
        </button>
      </div>

      {isLoading && <TableSkeleton rows={5} cols={4} />}
      {isError && <ErrorState message="Failed to load categories" onRetry={refetch} />}

      {categories && categories.length === 0 && (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description="Categories group products in the customer-facing menu. Create your first one to get started."
          action={
            <button
              onClick={openCreate}
              className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-white active:scale-[0.98]"
            >
              Create category
            </button>
          }
        />
      )}

      {categories && categories.length > 0 && (
        <ResponsiveTable
          data={categories}
          columns={columns}
          rowActions={(category) => (
            <>
              <button
                onClick={() => openEdit(category)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${category.name}"?`)) deleteCategory.mutate(category.id);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-950/40 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        />
      )}

      <CategoryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editingCategory} />
    </div>
  );
}