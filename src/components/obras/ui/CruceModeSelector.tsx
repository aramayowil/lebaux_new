import clsx from "clsx";

export default function CruceModeSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const modes = [
    { id: 0, label: "Entero" },
    { id: 1, label: "Centrados" },
    { id: 2, label: "Variables" },
  ];

  return (
    <div className="grid grid-cols-3 gap-1 bg-zinc-100/80 dark:bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-200/30 dark:border-zinc-800/30">
      {modes.map((m) => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={clsx(
              "flex flex-col items-center gap-1 py-1.5 rounded-md transition-all outline-none",
              active
                ? "bg-white dark:bg-zinc-800 shadow-sm text-amber-600/80 dark:text-amber-400/80 font-bold"
                : "text-zinc-400 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-400 font-medium",
            )}
          >
            <span className="text-[11px] ">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
