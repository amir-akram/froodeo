import { adminFetch } from '@/lib/adminApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderListItem {
    id: string;
    status: OrderStatus;
    customer_name: string;
    customer_phone: string;
    total: number;
    payment_method: 'online' | 'cod';
    created_at: string;
    order_items: { id: string; quantity: number; total_price: number; products: { name: string } | null }[];
}

interface OrderFilters {
    status?: OrderStatus | 'all';
    search?: string;
    page?: number;
    page_size?: number;
}

// add to existing file — full order detail shape
export interface OrderDetail {
    id: string;
    status: OrderStatus;
    customer_name: string;
    customer_phone: string;
    subtotal: number;
    delivery_charge: number;
    discount: number;
    coupon_discount: number;
    points_discount: number;
    total: number;
    delivery_address: string;
    delivery_date: string | null;
    delivery_time: string | null;
    payment_method: 'online' | 'cod';
    created_at: string;
    order_items: {
        id: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        products: { id: string; name: string; image_url: string | null } | null;
    }[];
    payments: { id: string; status: string; amount: number; created_at: string }[];
    coupons: { code: string; discount_type: string; discount_value: number } | null;
}

interface OrderListResponse {
    data: OrderListItem[];
    pagination: { page: number; page_size: number; total: number };
}

export function useAdminOrders(filters: OrderFilters) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    params.set('page', String(filters.page ?? 1));
    params.set('page_size', String(filters.page_size ?? 20));

    return useQuery({
        queryKey: ['admin-orders', filters],
        queryFn: () => adminFetch<OrderListResponse>(`/api/admin/orders?${params.toString()}`),
    });
}

export function useAdminOrder(id: string | null) {
    return useQuery({
        queryKey: ['admin-order', id],
        queryFn: () => adminFetch<{ data: OrderDetail }>(`/api/admin/orders/${id}`).then((r) => r.data),
        enabled: !!id,
    });
}

export function useUpdateOrderStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
        adminFetch(`/api/admin/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
        onSuccess: (_data, variables) => {
        qc.invalidateQueries({ queryKey: ['admin-orders'] });
        qc.invalidateQueries({ queryKey: ['admin-order', variables.id] });
        qc.invalidateQueries({ queryKey: ['admin-stats-summary'] });
        },
    });
}