import { ArrowRight, LayoutPanelLeft } from "lucide-react";
import clsx from "clsx";

// ── Componente principal ──────────────────────────────────────────────────────

export function ProductFlowEditor() {
  return (
    <div className="flex-1 flex justify-center p-8 min-w-max select-none rounded-xl border border-steel-200 dark:border-steel-800 bg-steel-50 dark:bg-steel-950/60">
      <div className="flex flex-col gap-10 relative">
        {/* ── Fila 1: Marco → Hojas → Mosquitero ── */}
        <div className="flex items-start gap-12">
          <FlowNode title="Marco" subtitle="00152" active />
          <ArrowConnector className="mt-10" />
          <FlowNode
            title="Hojas"
            subtitle="1 H / 00151 - 00102\n2 H / 00151 - 00102"
            bottomLabel="Izquierda"
          />
          <ArrowConnector className="mt-10" />
          <FlowNode
            title="Mosquitero"
            subtitle="00404"
            bottomLabel="Sin mosquitero"
            disabled
          />
        </div>

        {/* ── Conector diagonal Hojas → Interior ── */}
        <div className="absolute top-[90px] left-[265px]">
          <CornerDownRightIcon className="w-10 h-16 text-lebaux-amber opacity-60" />
        </div>

        {/* ── Fila 2: Interior ── */}
        <div className="flex items-start" style={{ marginLeft: 258 }}>
          <FlowNode title="Interior" subtitle="VS" />
        </div>

        {/* ── Conectores ramificados Interior → CV/Cruces/VR ── */}
        <BranchLines />

        {/* ── Fila 3: CV Int. / CV Ext. / Cruces / Medidas ── */}
        <div
          className="flex items-start gap-8 relative"
          style={{ marginLeft: 35 }}
        >
          <FlowNode title="Contravidrio int." subtitle="v2" width={176} />
          <FlowNode title="Contravidrio ext." subtitle="v1" width={176} />
          <FlowNode
            title="Cruces"
            subtitle="00122"
            width={176}
            bottomLabel="Sin cruces"
          />
          <MeasuresPanel />
        </div>
      </div>
    </div>
  );
}

// ── BranchLines ───────────────────────────────────────────────────────────────

function BranchLines() {
  return (
    <div className="relative h-14" style={{ marginLeft: 35 }}>
      {/* Línea vertical desde Interior */}
      <div className="absolute top-0 left-[300px] w-px h-6 bg-lebaux-amber/30" />
      {/* Línea horizontal que une los tres nodos */}
      <div className="absolute top-6 left-[85px] right-[-100px] h-px bg-lebaux-amber/30" />
      {/* Tres líneas verticales hacia abajo */}
      <div className="absolute top-6 left-[85px]  w-px h-8 bg-lebaux-amber/30" />
      <div className="absolute top-6 left-[300px] w-px h-8 bg-lebaux-amber/30" />
      <div className="absolute top-6 left-[515px] w-px h-8 bg-lebaux-amber/30" />
      {/* Flecha hacia la derecha (hacia Medidas) */}
      <div className="absolute top-[22px] right-[-110px] text-lebaux-amber/60">
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </div>
    </div>
  );
}

// ── ArrowConnector ────────────────────────────────────────────────────────────

function ArrowConnector({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "flex items-center text-lebaux-amber -ml-6 -mr-6",
        className,
      )}
    >
      <div className="w-8 h-px bg-lebaux-amber/30" />
      <ArrowRight className="w-4 h-4 -ml-1" strokeWidth={2.5} />
    </div>
  );
}

// ── FlowNode ──────────────────────────────────────────────────────────────────

function FlowNode({
  title,
  subtitle,
  bottomLabel,
  active = false,
  disabled = false,
  width = 200,
}: {
  title: string;
  subtitle: string;
  bottomLabel?: string;
  active?: boolean;
  disabled?: boolean;
  width?: number;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-0 transition-opacity",
        disabled && "opacity-40",
      )}
      style={{ width }}
    >
      {/* Título + botón */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[10px] font-bold font-display uppercase tracking-widest text-steel-600 dark:text-steel-400">
          {title}
        </span>
        <button
          className="text-steel-300 dark:text-steel-600 hover:text-lebaux-amber dark:hover:text-lebaux-amber transition-colors"
          aria-label={`Configurar ${title}`}
        >
          <LayoutPanelLeft size={13} />
        </button>
      </div>

      {/* Cuerpo del nodo */}
      <div
        className={clsx(
          "flex flex-col h-[76px] rounded-lg overflow-hidden border transition-all",
          "bg-white dark:bg-steel-900",
          active
            ? "border-lebaux-amber ring-4 ring-lebaux-amber/10 shadow-sm shadow-lebaux-amber/10"
            : "border-steel-200 dark:border-steel-700 shadow-sm",
        )}
      >
        {/* Header con código */}
        <div
          className={clsx(
            "text-[10px] px-2.5 py-1 font-mono font-bold border-b",
            active
              ? "bg-lebaux-amber/10 text-lebaux-amber border-lebaux-amber/20"
              : "bg-steel-50 dark:bg-steel-800 text-steel-500 dark:text-steel-400 border-steel-100 dark:border-steel-700",
          )}
        >
          {subtitle.split("\\n")[0]}
        </div>

        {/* Cuerpo con líneas adicionales */}
        <div className="flex-1 px-2.5 py-1.5 text-[10px] font-medium text-steel-600 dark:text-steel-400 leading-snug">
          {subtitle
            .split("\\n")
            .slice(1)
            .map((line, i) => (
              <div key={i}>{line}</div>
            ))}
        </div>
      </div>

      {/* Selector inferior (ej: "Izquierda", "Sin mosquitero") */}
      {bottomLabel && (
        <select
          disabled={disabled}
          className={clsx(
            "mt-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg border appearance-none cursor-pointer transition-colors focus:outline-none",
            "border-steel-200 dark:border-steel-700",
            "bg-steel-100 dark:bg-steel-800",
            "text-steel-700 dark:text-steel-300",
            "hover:border-lebaux-amber dark:hover:border-lebaux-amber",
            "focus:border-lebaux-amber dark:focus:border-lebaux-amber",
          )}
        >
          <option>{bottomLabel}</option>
        </select>
      )}
    </div>
  );
}

// ── MeasuresPanel ─────────────────────────────────────────────────────────────

function MeasuresPanel() {
  return (
    <div className="flex flex-col ml-6 p-3 bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 rounded-xl shadow-sm gap-1.5 justify-center">
      <span className="text-[9px] font-bold font-display text-steel-400 uppercase tracking-widest mb-1">
        Cortes requeridos
      </span>

      {[1, 2, 3].map((n) => (
        <MeasureInput key={`mhor${n}`} label={`Medida hor ${n}`} />
      ))}

      <div className="my-1 border-t border-steel-100 dark:border-steel-800" />

      {[1, 2].map((n) => (
        <MeasureInput key={`mver${n}`} label={`Medida ver ${n}`} />
      ))}
    </div>
  );
}

// ── MeasureInput ──────────────────────────────────────────────────────────────

function MeasureInput({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        readOnly
        defaultValue="0"
        className={clsx(
          "w-12 text-right font-mono text-[10px] font-bold px-1.5 py-0.5 rounded",
          "bg-steel-50 dark:bg-steel-800",
          "border border-steel-200 dark:border-steel-700",
          "text-lebaux-amber",
        )}
      />
      <span className="text-[10px] font-medium text-steel-500 dark:text-steel-400">
        {label}
      </span>
    </div>
  );
}

// ── CornerDownRightIcon ───────────────────────────────────────────────────────

function CornerDownRightIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v10a2 2 0 002 2h6m-3-3l3 3-3 3"
      />
    </svg>
  );
}
