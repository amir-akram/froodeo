'use client';

import { useAdmin } from '@/context/AdminContext';
import { ArrowLeft, LogOut, Search, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { GlobalSearchDialog } from './GlobalSearchDialog';

export function AdminTopbar() {
  const { admin, logout } = useAdmin();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && mobileSearchOpen) {
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileSearchOpen]);

  const openMobileSearch = () => {
    setMobileSearchOpen(true);
    window.setTimeout(() => mobileInputRef.current?.focus(), 260);
  };

  const handleMobileSearchClick = () => {
    setMobileSearchOpen(false);
    setSearchOpen(true);
  };

  return (
    <>
      <header className="relative flex h-14 shrink-0 items-center justify-between overflow-hidden border-b border-zinc-800/80 bg-zinc-950/95 px-3 backdrop-blur sm:px-4">
        {/* Desktop / tablet layout */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden w-72 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-500 transition-colors duration-150 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-400 sm:flex"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Search orders, products, users…</span>
          <kbd className="ml-auto shrink-0 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
            ⌘K
          </kbd>
        </button>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800">
              <User className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <span className="max-w-[10rem] truncate">{admin?.name || admin?.username}</span>
          </div>
          <button
            onClick={logout}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors duration-150 hover:bg-red-950/40 hover:text-red-400"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile layout: pill of 3 icons, or expanding search */}
        <div className="flex w-full items-center justify-end sm:hidden">
          {/* Icon pill — fades + scales out slowly when search opens */}
          <div
            className={
              mobileSearchOpen
                ? 'pointer-events-none flex scale-95 items-center gap-0.5 rounded-full border border-zinc-800 bg-zinc-900/60 p-1 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'
                : 'flex scale-100 items-center gap-0.5 rounded-full border border-zinc-800 bg-zinc-900/60 p-1 opacity-100 transition-all delay-150 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'
            }
          >
            <button
              onClick={openMobileSearch}
              aria-label="Search"
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors active:bg-zinc-800 active:text-zinc-100"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              aria-label="Account"
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors active:bg-zinc-800 active:text-zinc-100"
            >
              <User className="h-4 w-4" />
            </button>
            <button
              onClick={logout}
              aria-label="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors active:bg-red-950/60 active:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Expanding search bar — slow, eased width + fade, slightly delayed on open so the pill clears first */}
          <div
            className={
              mobileSearchOpen
                ? 'absolute inset-y-0 right-0 flex w-[85%] items-center gap-1.5 py-2 pr-3 opacity-100 transition-all delay-150 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'
                : 'pointer-events-none absolute inset-y-0 right-0 flex w-0 items-center gap-1.5 overflow-hidden py-2 pr-3 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'
            }
          >
            <button
              onClick={() => setMobileSearchOpen(false)}
              aria-label="Close search"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors active:bg-zinc-800 active:text-zinc-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleMobileSearchClick}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-left text-sm text-zinc-500"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Search…</span>
            </button>
          </div>
        </div>
      </header>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}