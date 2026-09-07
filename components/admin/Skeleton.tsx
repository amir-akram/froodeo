import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-md', className)} />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-7 w-16" />
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-lg border border-zinc-800 sm:block">
        <div className="flex items-center gap-6 border-b border-zinc-800 bg-zinc-900/60 px-4 py-2.5">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className={cn('h-2.5', i === 0 ? 'w-24' : 'w-12')} />
          ))}
        </div>
        <div className="divide-y divide-zinc-800/60">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-6 px-4 py-3.5 opacity-0"
              style={{ animation: `fade-in 0.3s ease-out ${i * 0.04}s forwards` }}
            >
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton key={j} className={cn('h-3.5', j === 0 ? 'w-36' : 'w-14')} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="space-y-2 sm:hidden">
        {Array.from({ length: Math.min(rows, 5) }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 opacity-0"
            style={{ animation: `fade-in 0.3s ease-out ${i * 0.05}s forwards` }}
          >
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-1/3" />
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-zinc-800/80 pt-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-zinc-800 bg-zinc-950 p-5', className)}>
      <Skeleton className="mb-4 h-3 w-32" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}