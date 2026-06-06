import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { AlertCircle, Layers, Receipt, Scissors, ListTree } from "lucide-react";
import { formatMm, formatPesos, formatKg } from "@/lib/calculoDespiece";
import type { ResultadoDespiece, NivelCorte } from "@/lib/motorDespiece";
import clsx from "clsx";

// Paleta de colores refinada estilo "Badge" industrial
const NIVEL_COLOR: Record<NivelCorte, string> = {
  Marco:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
  Hoja: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
  "Contravid. Int.":
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
  "Contravid. Ext.":
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20",
  Cruces:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20",
  Interior:
    "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20",
};

interface DespieceViewProps {
  resultado: ResultadoDespiece;
}

export default function DespieceView({ resultado }: DespieceViewProps) {
  const [activeTab, setActiveTab] = useState<string>("cortes");

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Resumen de Costos de Producción */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
              Aluminio Optimizado
            </span>
            <h3 className="text-xl font-black font-mono mt-0.5 text-zinc-800 dark:text-zinc-200">
              {formatPesos(resultado.costo_perfiles)}
            </h3>
          </div>
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-500">
            <Scissors className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
              Vidrios y Rellenos
            </span>
            <h3 className="text-xl font-black font-mono mt-0.5 text-zinc-800 dark:text-zinc-200">
              {formatPesos(resultado.costo_interiores)}
            </h3>
          </div>
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-500">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-500">
              Costo Materiales Total
            </span>
            <h3 className="text-xl font-black font-mono mt-0.5 text-amber-600 dark:text-amber-400">
              {formatPesos(resultado.costo_total)}
            </h3>
          </div>
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Selector de Paneles de Despiece */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(k: Set<string>) => setActiveTab(String(k))}
        // onSelectionChange={(k: React.Key) => setActiveTab(String(k))}
        variant="underlined"
        color="amber"
        classNames={{
          tabList: "border-b border-zinc-200 dark:border-zinc-800 w-full gap-6",
          tab: "h-10 px-1 font-medium text-sm",
        }}
      >
        <Tab
          key="cortes"
          title={
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              <span>Lista de Cortes ({resultado.cortes?.length ?? 0})</span>
            </div>
          }
        >
          <div className="mt-2 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-2 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Nivel
                    </th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Perfil / Componente
                    </th>
                    <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Cant
                    </th>
                    <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Medida
                    </th>
                    <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Subtotal
                    </th>
                    <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Ángulos
                    </th>
                    <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Peso
                    </th>
                    <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Costo Est.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                  {resultado.cortes?.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      <td className="p-3">
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border whitespace-nowrap",
                            NIVEL_COLOR[c.nivel] ?? NIVEL_COLOR["Marco"],
                          )}
                        >
                          {c.nivel}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-500 mr-2">
                            {c.nro_perfil}
                          </span>
                          <span className="text-zinc-600 dark:text-zinc-400 text-xs font-medium line-clamp-1">
                            {c.descripcion_perfil}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {c.cantidad}
                      </td>
                      <td className="p-3 text-right font-mono text-xs font-bold text-zinc-800 dark:text-zinc-100">
                        {formatMm(c.medida_mm)}
                      </td>
                      <td className="p-3 text-right font-mono text-xs text-zinc-500">
                        {c.total_mm.toLocaleString("es-AR")} mm
                      </td>
                      <td className="p-3 text-right font-mono text-xs text-zinc-400">
                        {c.angulo || "90°/90°"}
                      </td>
                      <td className="p-3 text-right font-mono text-xs text-zinc-500">
                        {formatKg(c.kg)}
                      </td>
                      <td className="p-3 text-right font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {formatPesos(c.precio_total)}
                      </td>
                    </tr>
                  ))}
                  {(!resultado.cortes || resultado.cortes.length === 0) && (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-8 text-center text-zinc-400 text-xs"
                      >
                        No hay perfiles calculados para esta abertura.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Tab>

        <Tab
          key="interiores"
          title={
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>
                Vidrios y Rellenos ({resultado.interiores?.length ?? 0})
              </span>
            </div>
          }
        >
          <div className="mt-2 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-2 shadow-sm">
            {!resultado.interiores || resultado.interiores.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
                <AlertCircle className="w-5 h-5 text-zinc-300" />
                No se registraron paños de vidrio ni lamas de revestimiento en
                esta abertura.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <th className="p-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Tipo
                      </th>
                      <th className="p-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Módulo/Ubicación
                      </th>
                      <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Cant
                      </th>
                      <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Medidas (Ancho x Alto)
                      </th>
                      <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Superficie Total
                      </th>
                      <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Costo Est.
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                    {resultado.interiores?.map((int, i) => (
                      <tr
                        key={i}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        <td className="p-3">
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border whitespace-nowrap",
                              int.tipo === "Vidrio"
                                ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20"
                                : "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
                            )}
                          >
                            {int.tipo}
                          </span>
                        </td>
                        <td className="p-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {int.modulo ?? `Paño ${i + 1}`}
                        </td>
                        <td className="p-3 text-right font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          {int.cantidad}
                        </td>
                        <td className="p-3 text-right font-mono text-xs text-zinc-800 dark:text-zinc-100">
                          {formatMm(int.ancho)} x {formatMm(int.alto)}
                        </td>
                        <td className="p-3 text-right font-mono text-xs text-zinc-500">
                          {int.area.toFixed(2)} m²
                        </td>
                        <td className="p-3 text-right font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {formatPesos(int.precio)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Tab>

        <Tab
          key="barras"
          title={
            <div className="flex items-center gap-2">
              <ListTree className="w-4 h-4" />
              <span>
                Optimización de Barras ({resultado.resumenes?.length ?? 0})
              </span>
            </div>
          }
        >
          <div className="mt-2 flex flex-col gap-3">
            {!resultado.resumenes || resultado.resumenes.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-2 shadow-sm">
                <AlertCircle className="w-5 h-5 text-zinc-300" />
                No hay perfiles para optimizar.
              </div>
            ) : (
              resultado.resumenes.map((r, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-50 dark:border-zinc-900 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-500">
                        {r.nro_perfil}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {r.descripcion_perfil}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        Tiras de {r.longitud_tira / 1000}m:{" "}
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          {r.tiras}
                        </span>
                      </div>
                      <div>
                        Eficiencia:{" "}
                        <span
                          className={clsx(
                            "font-bold",
                            r.eficiencia > 0.8
                              ? "text-emerald-600"
                              : "text-amber-600",
                          )}
                        >
                          {(r.eficiencia * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase mr-1">
                      Cortes:
                    </span>
                    {r.cortes?.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-xl font-mono text-[11px] flex items-center gap-1"
                      >
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          {c.medida_mm}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-sans">
                          x{c.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
