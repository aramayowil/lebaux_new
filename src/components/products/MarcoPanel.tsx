import { useState } from "react";
import { Input, Switch } from "@heroui/react";
import { Box, ChevronRight, Settings2, Package2 } from "lucide-react";
import { useProductosStore } from "@/store/productosStore";
import DespiecePerfilesPanel from "./DespiecePerfilesPanel";
import DespieceAccesoriosPanel from "./DespieceAccesoriosPanel";
import type { Marco } from "@/types";
import clsx from "clsx";

interface Props {
  marco: Marco;
  idProducto: number;
}

export default function MarcoPanel({ marco, idProducto }: Props) {
  const { updateMarco, getHojasByMarco, productos } = useProductosStore();
  const [tab, setTab] = useState<"perfiles" | "accesorios">("perfiles");

  const producto = productos.find((p) => p.id === idProducto);
  const hojas = getHojasByMarco(marco.id);
  const upd = (data: Partial<Marco>) => updateMarco(marco.id, data);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
      {/* Cabecera */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-1.5 h-5 rounded-full bg-blue-400 shrink-0" />
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <span className="text-zinc-300 dark:text-zinc-600">
            {producto?.descripcion}
          </span>
          <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
          <Box className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-blue-500">Marco</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
            {hojas.length} {hojas.length === 1 ? "hoja" : "hojas"}
          </span>
        </div>
      </div>

      {/* Datos del marco */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
        <Input
          value={marco.descripcion}
          onValueChange={(v: string) => upd({ descripcion: v })}
          placeholder="Descripción del marco"
          size="sm"
          classNames={{
            inputWrapper:
              "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 focus-within:!border-blue-400 transition-colors shadow-none",
            input: "font-medium",
          }}
          className="flex-1 max-w-sm"
        />
        <div className="flex items-center gap-2 shrink-0">
          {marco.predeterminado && (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              Predeterminado
            </span>
          )}
          <Switch
            isSelected={marco.predeterminado}
            onValueChange={(v: boolean) => upd({ predeterminado: v })}
            size="sm"
            aria-label="Predeterminado"
          />
        </div>
      </div>

      {/* Tabs pill */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800">
        {(
          [
            { key: "perfiles", label: "Perfiles", icon: Settings2 },
            { key: "accesorios", label: "Accesorios", icon: Package2 },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all",
              tab === t.key
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700",
            )}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {tab === "perfiles" && (
          <DespiecePerfilesPanel
            nivel="marco"
            idParent={marco.id}
            label="Perfiles del marco"
          />
        )}
        {tab === "accesorios" && (
          <DespieceAccesoriosPanel
            nivel="marco"
            idParent={marco.id}
            label="Accesorios del marco"
          />
        )}
      </div>
    </div>
  );
}
