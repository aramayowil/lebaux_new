import { Plus } from "lucide-react";

function Minus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
    </svg>
  );
}

export default function CentradosCounter({
  label,
  value,
  max,
  onChange,
}: {
  label?: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20 px-2.5 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
      {label && (
        <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          disabled={value <= 0}
          onClick={() => onChange(value - 1)}
          className="p-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <Minus className="w-3 h-3 text-zinc-500" />
        </button>
        <span className="font-mono text-xs font-bold w-4 text-center text-zinc-700 dark:text-zinc-300">
          {value}
        </span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="p-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <Plus className="w-3 h-3 text-zinc-500" />
        </button>
      </div>
    </div>
  );
}
