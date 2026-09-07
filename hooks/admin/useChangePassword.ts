import { adminFetch } from '@/lib/adminApi';
import { useMutation } from '@tanstack/react-query';

interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (payload: ChangePasswordPayload) =>
        adminFetch<{ message: string }>('/api/auth/admin/change-password', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
    });
}