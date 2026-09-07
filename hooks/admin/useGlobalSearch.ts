import { adminFetch } from '@/lib/adminApi';
import { useQuery } from '@tanstack/react-query';

interface SearchResults {
  orders: { id: string; customer_name: string; total: number }[];
  products: { id: string; name: string }[];
  users: { id: string; name: string | null; phone: string }[];
}

// Reuses existing list endpoints with their search/filter params
// rather than a dedicated /api/admin/search — keeps this additive
// instead of introducing a new backend surface for v1.
export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['admin-global-search', query],
    queryFn: async (): Promise<SearchResults> => {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        adminFetch<{ data: SearchResults['orders'] }>(
          `/api/admin/orders?search=${encodeURIComponent(query)}&page_size=5`
        ).catch(() => ({ data: [] })),
        adminFetch<{ data: SearchResults['products'] }>('/api/products?available=all').catch(() => ({ data: [] })),
        adminFetch<{ data: SearchResults['users'] }>('/api/users').catch(() => ({ data: [] })),
      ]);

      const lowerQuery = query.toLowerCase();
      return {
        orders: ordersRes.data,
        products: productsRes.data.filter((p) => p.name.toLowerCase().includes(lowerQuery)).slice(0, 5),
        users: usersRes.data
          .filter((u) => u.name?.toLowerCase().includes(lowerQuery) || u.phone.includes(query))
          .slice(0, 5),
      };
    },
    enabled: query.trim().length >= 2,
  });
}