'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext } from 'react';

interface AdminUser {
    id: string;
    username: string;
    name: string | null;
}

interface AdminContextValue {
    admin: AdminUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

async function fetchAdminSession(): Promise<AdminUser | null> {
    const res = await fetch('/api/auth/admin/me', { credentials: 'include' });
    if (!res.ok) return null;
    const { admin } = await res.json();
    return admin;
}

export function AdminProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: admin, isLoading } = useQuery({
        queryKey: ['admin-session'],
        queryFn: fetchAdminSession,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const logout = async () => {
        await fetch('/api/auth/admin/logout', { method: 'POST', credentials: 'include' });
        queryClient.setQueryData(['admin-session'], null);
        queryClient.clear();
        router.push('/admin/login');
    };

    return (
        <AdminContext.Provider
        value={{
            admin: admin ?? null,
            isLoading,
            isAuthenticated: !!admin,
            logout,
        }}
        >
        {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
    return ctx;
}