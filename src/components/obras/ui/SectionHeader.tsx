import clsx from "clsx";
import { CheckCircle2, ChevronDown } from "lucide-react";

// ── Subcomponentes de UI ──────────────────────────────────────────────────────
export default function SectionHeader({
  icon: Icon,
  label,
  isOpen,
  isComplete,
  badge,
  onClick,
}: {
  icon: any;
  label: string;
  isOpen: boolean;
  isComplete?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "px-3 py-2.5 flex items-center justify-between cursor-pointer transition-colors select-none",
        isOpen
          ? "bg-zinc-50/80 dark:bg-zinc-900/40"
          : "bg-white hover:bg-zinc-50/40 dark:bg-zinc-950 dark:hover:bg-zinc-900/20",
      )}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <Icon
          className={clsx(
            "w-4 h-4 transition-colors shrink-0",
            isOpen
              ? "text-amber-500"
              : isComplete
                ? "text-emerald-500 dark:text-emerald-400"
                : "text-zinc-400",
          )}
        />
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
          {label}
        </span>
        {badge && !isOpen && (
          <span className="text-[10px] font-bold font-mono text-zinc-400 dark:text-zinc-500 truncate max-w-[120px] bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 ml-2">
        {isComplete && !isOpen && (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
        )}
        <ChevronDown
          className={clsx(
            "w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180",
          )}
        />
      </div>
    </div>
  );
}
