import { adminFetch } from '@/lib/adminApi';
import { useQuery } from '@tanstack/react-query';

interface StatsSummary {
    orders_today: number;
    revenue_today: number;
    pending_orders: number;
    unavailable_products: number;
    total_users: number;
}

interface RevenuePoint {
    date: string;
    revenue: number;
}

export function useAdminStats() {
    return useQuery({
        queryKey: ['admin-stats-summary'],
        queryFn: () => adminFetch<{ data: StatsSummary }>('/api/admin/stats/summary').then((r) => r.data),
        refetchInterval: 60_000, // dashboard numbers drift as new orders land
    });
}

export function useRevenueChart(range: '7d' | '30d') {
    return useQuery({
        queryKey: ['admin-stats-revenue', range],
        queryFn: () =>
        adminFetch<{ data: RevenuePoint[] }>(`/api/admin/stats/revenue?range=${range}`).then((r) => r.data),
    });
}