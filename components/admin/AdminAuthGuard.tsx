'use client';

import { useAdmin } from '@/context/AdminContext';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

export function AdminAuthGuard({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAdmin();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
        router.replace('/admin/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
        );
    }

    if (!isAuthenticated) return null; // redirect in flight

    return <>{children}</>;
}