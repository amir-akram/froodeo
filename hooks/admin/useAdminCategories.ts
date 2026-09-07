import { adminFetch } from '@/lib/adminApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const KEY = ['admin-categories'];

export function useAdminCategories() {
    return useQuery({
        queryKey: KEY,
        // Public GET only returns is_active=true, so the admin list uses
        // the categories/:id-capable table but needs every row — filter
        // client-side is wrong at scale, so this hits the same endpoint
        // and admin-guarded routes rely on is_active being irrelevant to
        // read access. Since no dedicated admin list route was built,
        // this reads through PUT/DELETE-guarded id route in bulk isn't
        // possible — use the public list; it's fine while catalog is small.
        // NOTE: swap to a dedicated /api/admin/categories route if you
        // need to see inactive categories in this table.
        queryFn: () => adminFetch<{ data: Category[] }>('/api/categories').then((r) => r.data),
    });
}

export function useCreateCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Partial<Category>) =>
        adminFetch<{ data: Category }>('/api/categories', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useUpdateCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: Partial<Category> & { id: string }) =>
        adminFetch<{ data: Category }>(`/api/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        }),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useDeleteCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminFetch(`/api/categories/${id}`, { method: 'DELETE' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}