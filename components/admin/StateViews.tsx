import { Loader2, LucideIcon } from 'lucide-react';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-500 animate-fade-in">
      <Loader2 className="h-5 w-5 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-800 py-16 text-center animate-fade-up">
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900">
        <Icon className="h-5 w-5 text-zinc-600" />
      </div>
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      {description && <p className="max-w-sm text-sm text-zinc-600">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-900/40 bg-red-950/20 py-16 text-center animate-fade-up">
      <p className="text-sm text-red-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-900 active:scale-95"
        >
          Retry
        </button>
      )}
    </div>
  );
}