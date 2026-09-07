import { cn } from '@/lib/utils';

const ORDER_STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    preparing: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    out_for_delivery: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    captured: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    refunded: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    created: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export function StatusBadge({ status }: { status: string }) {
    return (
        <span
        className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
            ORDER_STATUS_STYLES[status] || 'border-zinc-700 bg-zinc-800 text-zinc-400'
        )}
        >
        {status.replace(/_/g, ' ')}
        </span>
    );
}