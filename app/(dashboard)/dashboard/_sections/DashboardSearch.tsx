"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DashboardSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * DashboardSearch
 *
 * Search bar untuk mencari dokumen dan materi.
 * Controlled internally; callback `onSearch` dipanggil on change.
 * Sambungkan ke filter logic existing kamu via `onSearch`.
 *
 * @example
 * <DashboardSearch onSearch={(q) => setQuery(q)} />
 */
export function DashboardSearch({
  onSearch,
  placeholder = "Search documents, topics, flashcards…",
  className,
}: DashboardSearchProps) {
  const [value, setValue] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onSearch?.(e.target.value);
  }

  function handleClear() {
    setValue("");
    onSearch?.("");
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-9",
          "text-sm text-neutral-800 placeholder:text-neutral-400",
          "transition-colors outline-none",
          "focus:border-blue-300 focus:ring-2 focus:ring-blue-100",
        )}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}