import { adminFetch } from '@/lib/adminApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Payment {
  id: string;
  order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  status: string;
  method: string | null;
  created_at: string;
  orders?: { customer_name: string; customer_phone: string } | null;
}

export function useAdminPayments(filters: { status?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  return useQuery({
    queryKey: ['admin-payments', filters],
    queryFn: () => adminFetch<{ data: Payment[] }>(`/api/admin/payments?${params.toString()}`).then((r) => r.data),
  });
}

export function useRefundPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount?: number }) =>
      adminFetch(`/api/admin/payments/${id}/refund`, { method: 'POST', body: JSON.stringify({ amount }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-payments'] }),
  });
}