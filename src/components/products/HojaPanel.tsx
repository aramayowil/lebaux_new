import { useState } from "react";
import { Input, Switch } from "@heroui/react";
import {
  Grid2x2,
  Square,
  ChevronRight,
  Settings2,
  Package2,
} from "lucide-react";
import { useProductosStore } from "@/store/productosStore";
import DespiecePerfilesPanel from "./DespiecePerfilesPanel";
import DespieceAccesoriosPanel from "./DespieceAccesoriosPanel";
import type { Hoja } from "@/types";
import type { TreeSelection } from "./ProductTree";
import clsx from "clsx";

interface Props {
  hoja: Hoja;
  idMarco: number;
  idProducto: number;
  onSelect: (sel: TreeSelection) => void;
}

export default function HojaPanel({
  hoja,
  idMarco,
  idProducto,
  onSelect,
}: Props) {
  const { updateHoja, getInterioresByHoja, productos, marcos } =
    useProductosStore();
  const [tab, setTab] = useState<"perfiles" | "accesorios">("perfiles");

  const producto = productos.find((p) => p.id === idProducto);
  const marco = marcos.find((m) => m.id === idMarco);
  const interiores = getInterioresByHoja(hoja.id);
  const upd = (data: Partial<Hoja>) => updateHoja(hoja.id, data);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
      {/* Cabecera */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        <div className="w-1.5 h-5 rounded-full bg-emerald-400 shrink-0" />
        <span className="text-zinc-300 dark:text-zinc-600">
          {producto?.descripcion}
        </span>
        <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
        <span className="text-zinc-300 dark:text-zinc-600">
          {marco?.descripcion}
        </span>
        <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
        <Grid2x2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-emerald-500">Hoja</span>
      </div>

      {/* Datos de la hoja */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          {/* Descripción */}
          <Input
            value={hoja.descripcion}
            onValueChange={(v: string) => upd({ descripcion: v })}
            placeholder="Descripción de la hoja"
            size="sm"
            classNames={{
              inputWrapper:
                "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 focus-within:!border-emerald-400 transition-colors shadow-none",
              input: "font-medium",
            }}
            className="flex-1"
          />
          {/* FIX: NumberInput no existe en HeroUI — usar Input type=number */}
          <Input
            label="Cantidad"
            type="number"
            value={String(hoja.cantidad)}
            onValueChange={(v: string) => upd({ cantidad: parseInt(v) || 1 })}
            size="sm"
            startContent={
              <span className="text-zinc-400 text-xs font-bold">×</span>
            }
            classNames={{
              inputWrapper:
                "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 focus-within:!border-emerald-400 transition-colors shadow-none w-20",
              input: "font-bold text-center",
            }}
            className="w-24 shrink-0"
          />
          {/* Predeterminada */}
          <div className="flex items-center gap-2 shrink-0">
            {hoja.predeterminado && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                Pred.
              </span>
            )}
            <Switch
              isSelected={hoja.predeterminado}
              onValueChange={(v: boolean) => upd({ predeterminado: v })}
              size="sm"
            />
          </div>
        </div>

        {/* Acceso rápido a interiores */}
        {interiores.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Interiores
            </p>
            <div className="flex flex-wrap gap-1.5">
              {interiores.map((i) => (
                <button
                  key={i.id}
                  onClick={() =>
                    onSelect({
                      level: "interior",
                      id: i.id,
                      idHoja: hoja.id,
                      idMarco,
                      idProducto,
                    })
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500 hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-all"
                >
                  <Square className="w-2.5 h-2.5" />
                  {i.descripcion}
                </button>
              ))}
            </div>
          </div>
        )}
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
            nivel="hoja"
            idParent={hoja.id}
            label="Perfiles de la hoja"
          />
        )}
        {tab === "accesorios" && (
          <DespieceAccesoriosPanel
            nivel="hoja"
            idParent={hoja.id}
            label="Accesorios de la hoja"
          />
        )}
      </div>
    </div>
  );
}
