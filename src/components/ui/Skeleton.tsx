// Loading placeholders that mirror the shape of the real content.

/** A single pulsing block. Size and shape come from className (e.g. "h-3 w-24"). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse motion-reduce:animate-none rounded bg-slate-200/80 ${className}`} />;
}

const cellWidths = ["w-16", "w-32", "w-24", "w-20", "w-28", "w-14", "w-24", "w-12"];

/** Placeholder <tr> rows for a table body. Put inside <tbody>; `cols` should match the real column count. */
export function TableSkeleton({ rows = 6, cols }: { rows?: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="border-t border-slate-50" aria-hidden>
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className={c === 0 ? "px-5 py-4" : "px-4 py-4"}>
              <Skeleton className={`h-3 ${cellWidths[(r + c * 3) % cellWidths.length]}`} />
            </td>
          ))}
        </tr>
      ))}
      <tr className="sr-only"><td>Loading</td></tr>
    </>
  );
}

/** A row of stat cards (icon + number + label). */
export function StatCardsSkeleton({ count = 4, className = "grid-cols-4 gap-5" }: { count?: number; className?: string }) {
  return (
    <div className={`grid ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A card with a title line and a bar-chart-shaped body. */
export function ChartCardSkeleton({ className = "", height = 220 }: { className?: string; height?: number }) {
  const bars = [45, 62, 38, 75, 55, 82, 68];
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm p-5 ${className}`} role="status" aria-label="Loading">
      <Skeleton className="h-4 w-36 mb-1.5" />
      <Skeleton className="h-3 w-24 mb-5" />
      <div className="flex items-end gap-3" style={{ height }}>
        {bars.map((h, i) => (
          <div key={i} className="flex-1 animate-pulse motion-reduce:animate-none rounded-t-md bg-slate-200/80" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

/** A card containing a header line and table-like rows. */
export function TableCardSkeleton({ rows = 5, cols = 5, className = "" }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm ${className}`} aria-hidden>
      <div className="px-5 py-4 border-b border-slate-100"><Skeleton className="h-4 w-40" /></div>
      <table className="w-full"><tbody><TableSkeleton rows={rows} cols={cols} /></tbody></table>
    </div>
  );
}

/** Icon + two lines per row, in cards (Notifications). */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-start gap-4">
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Grid of simple cards (Categories, POS products). `className` sets the grid columns. */
export function CardGridSkeleton({ count = 6, className = "grid-cols-3 gap-4", cardClassName = "p-5" }: { count?: number; className?: string; cardClassName?: string }) {
  return (
    <div className={`grid ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`bg-white rounded-xl border border-slate-100 shadow-sm ${cardClassName}`}>
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
          </div>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      ))}
    </div>
  );
}

/** A card with a title, a donut-shaped body and legend lines (pie charts). */
export function DonutCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm p-5 ${className}`} role="status" aria-label="Loading">
      <Skeleton className="h-4 w-32 mb-1.5" />
      <Skeleton className="h-3 w-20 mb-5" />
      <Skeleton className="h-36 w-36 rounded-full mx-auto mb-5" />
      <div className="space-y-2.5">
        {[0, 1, 2].map(i => <Skeleton key={i} className="h-3 w-full" />)}
      </div>
    </div>
  );
}
