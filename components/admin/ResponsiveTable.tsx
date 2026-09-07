'use client';

import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

export type ColumnDef<T> = {
  key: string;
  header: string;
  /** Rendered in the desktop table cell AND used as the value in the mobile card row. */
  cell: (row: T) => ReactNode;
  /** Show this column's label:value pair as a mobile card row. Defaults to true. */
  showOnMobile?: boolean;
  /** Render this column as the card's title line on mobile instead of a label:value row. */
  isMobileTitle?: boolean;
  /** Render this column as the card's subtitle line (under the title) on mobile. */
  isMobileSubtitle?: boolean;
  align?: 'left' | 'right';
  className?: string;
};

export function ResponsiveTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  rowActions,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  /** Rendered at the end of each desktop row and inside each mobile card (e.g. edit/delete buttons). */
  rowActions?: (row: T) => ReactNode;
}) {
  const titleCol = columns.find((c) => c.isMobileTitle);
  const subtitleCol = columns.find((c) => c.isMobileSubtitle);
  const bodyCols = columns.filter((c) => !c.isMobileTitle && !c.isMobileSubtitle && c.showOnMobile !== false);

  return (
    <>
      {/* Desktop / tablet: real table */}
      <div className="hidden overflow-hidden rounded-lg border border-zinc-800 sm:block">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-500">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-2 font-medium',
                    col.align === 'right' ? 'text-right' : 'text-left'
                  )}
                >
                  {col.header}
                </th>
              ))}
              {rowActions && <th className="px-4 py-2 text-right font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {data.map((row, i) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'row-enter text-zinc-200 transition-colors hover:bg-zinc-900/50',
                  onRowClick && 'cursor-pointer'
                )}
                style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('px-4 py-3', col.align === 'right' ? 'text-right' : undefined, col.className)}
                  >
                    {col.cell(row)}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">{rowActions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <div className="space-y-2 sm:hidden">
        {data.map((row, i) => (
          <div
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className={cn(
              'row-enter rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition-colors',
              onRowClick && 'cursor-pointer active:bg-zinc-900/60'
            )}
            style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {titleCol && (
                  <p className="truncate text-sm font-medium text-zinc-100">{titleCol.cell(row)}</p>
                )}
                {subtitleCol && (
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{subtitleCol.cell(row)}</p>
                )}
              </div>
              {onRowClick && !rowActions && (
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
              )}
            </div>

            {bodyCols.length > 0 && (
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-zinc-800/80 pt-3">
                {bodyCols.map((col) => (
                  <div key={col.key}>
                    <dt className="text-[11px] uppercase tracking-wide text-zinc-600">{col.header}</dt>
                    <dd className="mt-0.5 truncate text-sm text-zinc-300">{col.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            )}

            {rowActions && (
              <div
                className="mt-3 flex justify-end gap-1 border-t border-zinc-800/80 pt-3"
                onClick={(e) => e.stopPropagation()}
              >
                {rowActions(row)}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}