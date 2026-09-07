'use client';

import { useGlobalSearch } from '@/hooks/admin/useGlobalSearch';
import { ArrowLeft, Loader2, PackageSearch, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data, isLoading, isFetching } = useGlobalSearch(query);

  const hasQuery = query.trim().length >= 2;
  const hasResults = !!data && (data.orders.length || data.products.length || data.users.length);

  // Mount immediately, then flip a class on the next frame so the
  // enter transition actually animates instead of snapping in at
  // its final state (and the reverse on close, kept mounted for
  // the exit transition's duration before fully unmounting).
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Reset the query once the dialog fully closes, not on open, so it
  // doesn't visibly clear mid-close-animation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setQuery('');
  }, [open]);

  // Escape-to-close and body-scroll lock — Radix's Dialog gave us both
  // for free; a plain overlay needs them wired up by hand.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onOpenChange]);

  const goTo = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  if (!mounted) return null;

  return (
    <div
      className={
        open
          ? 'fixed inset-0 z-50 flex items-start justify-center bg-black/60 opacity-100 backdrop-blur-sm transition-opacity duration-300 ease-out sm:pt-24'
          : 'fixed inset-0 z-50 flex items-start justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 ease-out sm:pt-24'
      }
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={
          open
            ? 'flex h-full w-full translate-y-0 flex-col overflow-hidden border-zinc-800 bg-zinc-950 opacity-100 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:h-auto sm:max-h-[32rem] sm:w-full sm:max-w-lg sm:rounded-lg sm:border'
            : 'flex h-full w-full translate-y-3 flex-col overflow-hidden border-zinc-800 bg-zinc-950 opacity-0 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:h-auto sm:max-h-[32rem] sm:w-full sm:max-w-lg sm:rounded-lg sm:border sm:scale-95 sm:translate-y-0'
        }
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 px-4 py-3">
          {/* Back arrow on mobile instead of a bare X, matches native full-screen search patterns */}
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close search"
            className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300 sm:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Search className="hidden h-4 w-4 shrink-0 text-zinc-500 sm:block" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, products, users…"
            className="min-w-0 flex-1 bg-transparent text-base text-zinc-100 placeholder:text-zinc-600 focus:outline-none sm:text-sm"
          />
          {isFetching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-600" />}
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close search"
            className="hidden h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-zinc-300 sm:flex"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 sm:max-h-80 sm:flex-none">
          {!hasQuery && (
            <div className="flex flex-col items-center gap-2 py-16 text-zinc-600 sm:py-10">
              <Search className="h-6 w-6" />
              <p className="text-sm">Type at least 2 characters to search</p>
            </div>
          )}

          {hasQuery && isLoading && (
            <div className="flex flex-col items-center gap-2 py-16 text-zinc-600 sm:py-10">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Searching…</p>
            </div>
          )}

          {hasQuery && !isLoading && !hasResults && (
            <div className="flex flex-col items-center gap-2 py-16 text-zinc-600 sm:py-10">
              <PackageSearch className="h-6 w-6" />
              <p className="max-w-[80%] text-center text-sm">No results for &quot;{query}&quot;</p>
            </div>
          )}

          {hasQuery && !isLoading && hasResults && (
            <div className="animate-fade-in space-y-3">
              {data!.orders.length > 0 && (
                <SearchSection title="Orders">
                  {data!.orders.map((o) => (
                    <SearchRow
                      key={o.id}
                      primary={o.customer_name}
                      secondary={`₹${o.total}`}
                      onClick={() => goTo(`/admin/orders/${o.id}`)}
                    />
                  ))}
                </SearchSection>
              )}
              {data!.products.length > 0 && (
                <SearchSection title="Products">
                  {data!.products.map((p) => (
                    <SearchRow key={p.id} primary={p.name} onClick={() => goTo(`/admin/products/${p.id}`)} />
                  ))}
                </SearchSection>
              )}
              {data!.users.length > 0 && (
                <SearchSection title="Users">
                  {data!.users.map((u) => (
                    <SearchRow
                      key={u.id}
                      primary={u.name || 'Unnamed'}
                      secondary={u.phone}
                      onClick={() => goTo(`/admin/users/${u.id}`)}
                    />
                  ))}
                </SearchSection>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-zinc-600">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SearchRow({ primary, secondary, onClick }: { primary: string; secondary?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-md px-2 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:bg-zinc-900 active:bg-zinc-800 sm:py-2"
    >
      <span className="truncate">{primary}</span>
      {secondary && <span className="ml-2 shrink-0 text-xs text-zinc-500">{secondary}</span>}
    </button>
  );
}