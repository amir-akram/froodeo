'use client';

import { ColumnDef, ResponsiveTable } from '@/components/admin/ResponsiveTable';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { EmptyState, ErrorState } from '@/components/admin/StateViews';
import { AdminUser, useAdminUsers, useDeleteUser } from '@/hooks/admin/useAdminUsers';
import { Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const { data: users, isLoading, isError, refetch } = useAdminUsers();
  const deleteUser = useDeleteUser();
  const router = useRouter();

  const columns: ColumnDef<AdminUser>[] = [
    { key: 'name', header: 'Name', isMobileTitle: true, cell: (u) => u.name || 'Unnamed' },
    { key: 'phone', header: 'Phone', isMobileSubtitle: true, cell: (u) => u.phone },
    { key: 'points', header: 'Loyalty points', cell: (u) => u.loyalty_points_balance, className: 'tabular-nums' },
    {
      key: 'joined',
      header: 'Joined',
      cell: (u) => new Date(u.created_at).toLocaleDateString('en-IN'),
      className: 'text-zinc-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-zinc-100">Users</h1>

      {isLoading && <TableSkeleton rows={6} cols={5} />}
      {isError && <ErrorState message="Failed to load users" onRetry={refetch} />}

      {users && users.length === 0 && (
        <EmptyState icon={Users} title="No users found" description="Users appear here once they sign up." />
      )}

      {users && users.length > 0 && (
        <ResponsiveTable
          data={users}
          columns={columns}
          onRowClick={(u) => router.push(`/admin/users/${u.id}`)}
          rowActions={(user) => (
            <button
              onClick={() => {
                if (confirm(`Delete ${user.name || user.phone}?`)) deleteUser.mutate(user.id);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-950/40 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        />
      )}
    </div>
  );
}