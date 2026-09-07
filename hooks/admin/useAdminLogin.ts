import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface LoginPayload {
    username: string;
    password: string;
}

async function loginRequest(payload: LoginPayload) {
    const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
}

export function useAdminLogin() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: loginRequest,
        onSuccess: (data) => {
        queryClient.setQueryData(['admin-session'], data.admin);
        router.push('/admin');
        },
    });
}