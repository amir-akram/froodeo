import { adminFetch } from '@/lib/adminApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface LoyaltySettings {
  id: number;
  redemption_rate: number;
  min_points_to_redeem: number;
  max_redeem_percent_of_order: number;
}

export function useLoyaltySettings() {
  return useQuery({
    queryKey: ['loyalty-settings'],
    queryFn: () => adminFetch<{ data: LoyaltySettings }>('/api/admin/loyalty/settings').then((r) => r.data),
  });
}

export function useUpdateLoyaltySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<LoyaltySettings>) =>
      adminFetch<{ data: LoyaltySettings }>('/api/admin/loyalty/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loyalty-settings'] }),
  });
}