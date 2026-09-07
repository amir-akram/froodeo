'use client';

import { useAdmin } from '@/context/AdminContext';
import { LogOut, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlobalSearchDialog } from './GlobalSearchDialog';

export function AdminTopbar() {
  const { admin, logout } = useAdmin();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95 px-4 backdrop-blur">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex w-72 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-500 transition-colors duration-150 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-400"
        >
          <Search className="h-4 w-4" />
          <span className="truncate">Search orders, products, users…</span>
          <kbd className="ml-auto shrink-0 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800">
              <User className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <span className="hidden sm:inline">{admin?.name || admin?.username}</span>
          </div>
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors duration-150 hover:bg-red-950/40 hover:text-red-400"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}