'use client';

import { cn } from '@/lib/utils';
import {
    ChevronsLeft,
    ChevronsRight,
    Coins,
    CreditCard,
    FolderTree,
    LayoutDashboard,
    MapPin,
    Package,
    Settings,
    ShoppingCart,
    Ticket,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/pincodes', label: 'Pincodes', icon: MapPin },
  { href: '/admin/loyalty', label: 'Loyalty', icon: Coins },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-zinc-800/80 bg-zinc-950 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 px-3">
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight text-zinc-100 animate-fade-in">
            Froodeo Admin
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors duration-150 hover:bg-zinc-900 hover:text-zinc-200"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150',
                collapsed && 'justify-center px-0',
                isActive ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'
              )}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-md bg-zinc-800/80 animate-scale-in" />
              )}
              <Icon
                className={cn(
                  'relative h-4 w-4 shrink-0 transition-transform duration-150',
                  !isActive && 'group-hover:translate-x-0.5'
                )}
              />
              {!collapsed && <span className="relative truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}