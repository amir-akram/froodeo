import { adminFetch } from '@/lib/adminApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Pincode {
  id: string;
  pincode: string;
  area_name: string | null;
  is_active: boolean;
}

const KEY = ['admin-pincodes'];

export function useAdminPincodes() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => adminFetch<{ data: Pincode[] }>('/api/admin/pincodes').then((r) => r.data),
  });
}

export function useCreatePincode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Pincode>) =>
      adminFetch<{ data: Pincode }>('/api/admin/pincodes', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdatePincode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Pincode> & { id: string }) =>
      adminFetch<{ data: Pincode }>(`/api/admin/pincodes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeletePincode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch(`/api/admin/pincodes/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}