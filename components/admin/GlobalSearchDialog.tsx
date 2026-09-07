'use client';

import { useGlobalSearch } from '@/hooks/admin/useGlobalSearch';
import { Loader2, PackageSearch, Search, X } from 'lucide-react';
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
  const router = useRouter();
  const { data, isLoading, isFetching } = useGlobalSearch(query);

  const hasQuery = query.trim().length >= 2;
  const hasResults = !!data && (data.orders.length || data.products.length || data.users.length);

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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-24"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, products, users…"
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          />
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />}
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close search"
            className="flex h-6 w-6 items-center justify-center rounded text-zinc-600 hover:bg-zinc-900 hover:text-zinc-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {!hasQuery && (
            <div className="flex flex-col items-center gap-2 py-10 text-zinc-600">
              <Search className="h-6 w-6" />
              <p className="text-sm">Type at least 2 characters to search</p>
            </div>
          )}

          {hasQuery && isLoading && (
            <div className="flex flex-col items-center gap-2 py-10 text-zinc-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Searching…</p>
            </div>
          )}

          {hasQuery && !isLoading && !hasResults && (
            <div className="flex flex-col items-center gap-2 py-10 text-zinc-600">
              <PackageSearch className="h-6 w-6" />
              <p className="text-sm">No results for &quot;{query}&quot;</p>
            </div>
          )}

          {hasQuery && !isLoading && hasResults && (
            <div className="space-y-3">
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
      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
    >
      <span className="truncate">{primary}</span>
      {secondary && <span className="shrink-0 text-xs text-zinc-500">{secondary}</span>}
    </button>
  );
}