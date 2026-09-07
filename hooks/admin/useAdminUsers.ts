import { adminFetch } from '@/lib/adminApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface AdminUser {
  id: string;
  name: string | null;
  phone: string;
  phone_verified: boolean;
  loyalty_points_balance: number;
  referral_code: string | null;
  created_at: string;
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminFetch<{ data: AdminUser[] }>('/api/users').then((r) => r.data),
  });
}

export function useAdminUserOrders(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user-orders', userId],
    queryFn: () => adminFetch<{ data: unknown[] }>(`/api/admin/users/${userId}/orders`).then((r) => r.data),
    enabled: !!userId,
  });
}

export function useAdminUserLoyalty(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user-loyalty', userId],
    queryFn: () =>
      adminFetch<{ data: unknown[] }>(`/api/admin/users/${userId}/loyalty-transactions`).then((r) => r.data),
    enabled: !!userId,
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch(`/api/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useAdjustUserLoyalty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, loyalty_adjustment, loyalty_adjustment_note }: { id: string; loyalty_adjustment: number; loyalty_adjustment_note?: string }) =>
      adminFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ loyalty_adjustment, loyalty_adjustment_note }),
      }),
    onSuccess: (_d, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user-loyalty', variables.id] });
    },
  });
}