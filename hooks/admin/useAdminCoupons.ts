import { adminFetch } from '@/lib/adminApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  max_discount_amount: number | null;
  min_order_value: number;
  usage_limit: number | null;
  usage_limit_per_user: number;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

const KEY = ['admin-coupons'];

export function useAdminCoupons() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => adminFetch<{ data: Coupon[] }>('/api/admin/coupons').then((r) => r.data),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Coupon>) =>
      adminFetch<{ data: Coupon }>('/api/admin/coupons', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Coupon> & { id: string }) =>
      adminFetch<{ data: Coupon }>(`/api/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}