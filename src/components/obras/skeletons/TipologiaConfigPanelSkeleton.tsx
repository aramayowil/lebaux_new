import { Skeleton } from "@heroui/react";
import {
  ChevronDown,
  Palette,
  Layers,
  Grid2X2,
  AlignCenter,
  LayoutGrid,
  Waves,
} from "lucide-react";
import clsx from "clsx";

// Reutilizamos el estilo base para mantener las proporciones exactas del contenedor original
const SEL_TRIGGER_SKELETON =
  "h-8 min-h-8 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-700/60 rounded-lg";

// ── Subcomponentes Estáticos Estilo Skeleton ───────────────────────────────────

function SectionHeaderSkeleton({
  icon: Icon,
  label,
}: {
  icon: any;
  label: string;
}) {
  return (
    <div className="px-3 py-2.5 flex items-center justify-between bg-white dark:bg-zinc-950">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <Icon className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" />
        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-600 truncate">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 ml-2">
        <ChevronDown className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
      </div>
    </div>
  );
}

function RowSelectSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider block">
        {label}
      </label>
      <Skeleton className="rounded-lg">
        <div className={SEL_TRIGGER_SKELETON} />
      </Skeleton>
    </div>
  );
}

function CruceModeSelectorSkeleton() {
  const modes = [
    { id: 0, label: "Liso", icon: AlignCenter },
    { id: 1, label: "Centrados", icon: AlignCenter }, // Placeholder simple para esqueleto
    { id: 2, label: "Variables", icon: AlignCenter },
  ];

  return (
    <div className="grid grid-cols-3 gap-1 bg-zinc-100/80 dark:bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-200/30 dark:border-zinc-800/30">
      {modes.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className="flex flex-col items-center gap-1 py-1 text-zinc-300 dark:text-zinc-700"
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] tracking-wide font-medium">
              {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ModoRellenoTabsSkeleton() {
  const tabs = ["Simple", "DVH", "Revest."];
  return (
    <div className="flex p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200/40 dark:border-zinc-700/40 w-32">
      {tabs.map((label, idx) => (
        <div
          key={idx}
          className={clsx(
            "flex-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md text-center text-zinc-400",
            idx === 0 &&
              "bg-white dark:bg-zinc-700 text-zinc-300 dark:text-zinc-500 shadow-sm",
          )}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

// ── Componente Principal de Carga (Skeleton) ──────────────────────────────────

export default function TipologiaConfigPanelSkeleton() {
  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-zinc-950 border-l border-zinc-200/80 dark:border-zinc-800/80 select-none">
      {/* Encabezado Fijo */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
              Componentes
            </h3>
            <Skeleton className="w-16 h-3 rounded mt-0.5" />
          </div>
        </div>
      </div>

      {/* Cuerpo scrolleable de Skeletons */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {/* ══════════ ACABADO ══════════ */}
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-700/40 overflow-hidden">
          <SectionHeaderSkeleton icon={Palette} label="Acabado y Terminación" />
          <div className="px-3 pb-3 pt-2 space-y-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
            <RowSelectSkeleton label="Tratamiento / Color" />

            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 px-2.5 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800/40">
              <div className="flex items-center gap-2">
                <Waves className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-600">
                  Mosquitero Incorporado
                </span>
              </div>
              <Skeleton className="w-8 h-4 rounded-full" />
            </div>
          </div>
        </div>

        {/* ══════════ ESTRUCTURA E INTERIOR ══════════ */}
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-700/40 overflow-hidden">
          <SectionHeaderSkeleton
            icon={Layers}
            label="Especificaciones Estructura"
          />
          <div className="px-3 pb-3 pt-2 space-y-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
            <RowSelectSkeleton label="Componente Interior / Acoplado" />

            {/* Simulamos la carga del Relleno Base */}
            <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800/60 space-y-2">
              <div className="space-y-2 p-2.5 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">
                    Material de relleno
                  </span>
                  <ModoRellenoTabsSkeleton />
                </div>
                <Skeleton className="rounded-lg">
                  <div className={SEL_TRIGGER_SKELETON} />
                </Skeleton>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ CRUCES ══════════ */}
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-700/40 overflow-hidden">
          <SectionHeaderSkeleton icon={Grid2X2} label="Cruces y Divisiones" />
          <div className="px-3 pb-3 pt-2 space-y-3 border-t border-zinc-100 dark:border-zinc-800/60">
            <CruceModeSelectorSkeleton />
            <p className="text-[10px] text-zinc-300 dark:text-zinc-700 italic text-center py-1">
              Un solo paño entero sin divisiones transversales
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
