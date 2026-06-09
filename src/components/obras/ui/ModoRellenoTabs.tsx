import clsx from "clsx";
type ModoRelleno = "simple" | "dvh" | "revestimiento";

export default function ModoRellenoTabs({
  value,
  onChange,
}: {
  value: ModoRelleno;
  onChange: (v: ModoRelleno) => void;
}) {
  const opciones: { id: ModoRelleno; label: string }[] = [
    { id: "simple", label: "Simple" },
    { id: "dvh", label: "DVH" },
    { id: "revestimiento", label: "Revest." },
  ];

  return (
    <div className="flex bg-zinc-200/60 dark:bg-zinc-800/60 p-0.5 rounded-lg border border-zinc-200/20">
      {opciones.map((opc) => (
        <button
          key={opc.id}
          type="button"
          onClick={() => onChange(opc.id)}
          className={clsx(
            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all",
            value === opc.id
              ? "bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
          )}
        >
          {opc.label}
        </button>
      ))}
    </div>
  );
}
