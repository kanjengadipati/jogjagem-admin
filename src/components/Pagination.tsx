"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { PaginationMeta } from "@/types";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  /** Max page buttons shown (excluding first/last). Default: 5 */
  maxButtons?: number;
}

export default function Pagination({ meta, onPageChange, maxButtons = 5 }: PaginationProps) {
  const { page, total_pages, total, limit } = meta;
  if (total_pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  // Build page number window
  const half  = Math.floor(maxButtons / 2);
  let start   = Math.max(1, page - half);
  let end     = Math.min(total_pages, start + maxButtons - 1);
  if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  let btnCounter = 0;
  const btn = (
    label: React.ReactNode,
    target: number,
    disabled: boolean,
    active = false
  ) => {
    const key = `p-${btnCounter++}`;
    return (
    <button
      key={key}
      onClick={() => !disabled && onPageChange(target)}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center h-8 min-w-[2rem] px-2 rounded-lg text-xs font-semibold border transition-all duration-150 select-none",
        active
          ? "bg-primary text-white border-primary shadow-sm"
          : disabled
          ? "bg-transparent text-gray-300 border-transparent cursor-not-allowed"
          : "bg-white text-gray-600 border-border hover:border-primary/40 hover:text-primary cursor-pointer",
      ].join(" ")}
    >
      {label}
    </button>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
      {/* Result info */}
      <p className="text-[11px] font-semibold text-gray-400 shrink-0">
        Showing <span className="text-gray-700">{from}–{to}</span> of{" "}
        <span className="text-gray-700">{total.toLocaleString()}</span> results
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {btn(<ChevronsLeft className="w-3.5 h-3.5" />, 1,           page === 1)}
        {btn(<ChevronLeft  className="w-3.5 h-3.5" />, page - 1,    page === 1)}

        {start > 1 && (
          <>
            {btn(1, 1, false)}
            {start > 2 && <span className="px-1 text-xs text-gray-400">…</span>}
          </>
        )}

        {pages.map(p => btn(p, p, false, p === page))}

        {end < total_pages && (
          <>
            {end < total_pages - 1 && <span className="px-1 text-xs text-gray-400">…</span>}
            {btn(total_pages, total_pages, false)}
          </>
        )}

        {btn(<ChevronRight  className="w-3.5 h-3.5" />, page + 1,    page === total_pages)}
        {btn(<ChevronsRight className="w-3.5 h-3.5" />, total_pages, page === total_pages)}
      </div>

      {/* Page size hint */}
      <p className="text-[11px] font-semibold text-gray-400 shrink-0 hidden sm:block">
        Page <span className="text-gray-700">{page}</span> / {total_pages}
      </p>
    </div>
  );
}
