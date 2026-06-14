// import { useState } from "react";
// import { Tabs, Tab, Chip, Divider, Spinner } from "@heroui/react";
// import {
//   Layers,
//   Wrench,
//   Grid2x2,
//   BarChart3,
//   TrendingUp,
//   AlertCircle,
// } from "lucide-react";
// import { formatMm, formatPesos } from "@/lib/calculoDespiece";
// import type { ResultadoDespiece } from "@/lib/motorDespiece";
// import { useOpciones } from "@/hooks/catalogo/useOpciones";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";

// interface Props {
//   resultado: ResultadoDespiece;
//   titulo?: string;
// }

// const NIVEL_COLOR: Record<string, string> = {
//   Marco: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
//   Hoja: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
//   "Contravid. Int.":
//     "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
//   "Contravid. Ext.":
//     "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
//   Cruces:
//     "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
//   Interior: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
// };

// const nivelChip = (n: string) => (
//   <span
//     className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${NIVEL_COLOR[n] ?? "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"}`}
//   >
//     {n}
//   </span>
// );

// export default function DespieceView({ resultado, titulo }: Props) {
//   const [view, setView] = useState<"detalle" | "resumen">("resumen");
//   const { data: opciones } = useOpciones();

//   if (!opciones) {
//     return (
//       <div className="h-48 flex items-center justify-center">
//         <Spinner color="amber" label="Cargando configuración de costos..." />
//       </div>
//     );
//   }

//   // 🌟 Desestructuración adaptada al snake_case estricto del motor con salvaguarda nullish
//   const {
//     cortes = [],
//     interiores = [],
//     resumenes = [],
//     costo_perfiles = 0,
//     costo_interiores = 0,
//     multiplicador = 1,
//     contexto = {
//       ancho: 0,
//       alto: 0,
//       hojas: 0,
//       cruces_h: 0,
//       cruces_v: 0,
//       pos_h: [],
//       pos_v: [],
//     },
//   } = resultado || {};

//   const costoAccesoriosEfectivo = 0;
//   const costoTratamientos = 0;
//   const costoMOTaller = 0;
//   const costoMOColocacion = 0;
//   const costoItemsManuales = 0;

//   // Aplicación de márgenes comerciales parametrizados
//   const margenPerf = 1 + (opciones?.porcentaje_sobre_perfiles ?? 0) / 100;
//   const margenAcc = 1 + (opciones?.porcentaje_sobre_accesorios ?? 0) / 100;
//   const margenVid = 1 + (opciones?.porcentaje_sobre_vidrios ?? 0) / 100;
//   const iva = 1 + (opciones?.iva ?? 0) / 100;

//   const totalKg = resumenes.reduce((s, r) => s + (r.kg || 0), 0);
//   const totalTiras = resumenes.reduce((s, r) => s + (r.tiras || 0), 0);

//   // Helpers para la tabla comparativa
//   const calcFila = (costoBase: number, margen: number) => {
//     return {
//       sinIva: costoBase,
//       conIva: costoBase * iva,
//       conGanancia: costoBase * iva * margen,
//     };
//   };

//   const fPerf = calcFila(costo_perfiles, margenPerf);
//   const fTrat = calcFila(costoTratamientos, 1);
//   const fAcc = calcFila(costoAccesoriosEfectivo, margenAcc);
//   const fVid = calcFila(costo_interiores, margenVid);
//   const fMOT = calcFila(costoMOTaller, 1);
//   const fMOC = calcFila(costoMOColocacion, 1);
//   const fMan = calcFila(costoItemsManuales, 1);

//   const totalSinIva =
//     fPerf.sinIva +
//     fTrat.sinIva +
//     fAcc.sinIva +
//     fVid.sinIva +
//     fMOT.sinIva +
//     fMOC.sinIva +
//     fMan.sinIva;
//   const totalConIva =
//     fPerf.conIva +
//     fTrat.conIva +
//     fAcc.conIva +
//     fVid.conIva +
//     fMOT.conIva +
//     fMOC.conIva +
//     fMan.conIva;
//   const totalConGanancia =
//     fPerf.conGanancia +
//     fTrat.conGanancia +
//     fAcc.conGanancia +
//     fVid.conGanancia +
//     fMOT.conGanancia +
//     fMOC.conGanancia +
//     fMan.conGanancia;

//   // Chart Data (Costo final = Costo + IVA + Ganancia)
//   const chartData = [
//     { name: "Perfiles", value: fPerf.conGanancia, color: "#3b82f6" }, // Blue
//     { name: "Vid/Int", value: fVid.conGanancia, color: "#ef4444" }, // Red
//     { name: "Accesorios", value: fAcc.conGanancia, color: "#22c55e" }, // Green
//     { name: "M.O. Taller", value: fMOT.conGanancia, color: "#eab308" }, // Yellow
//   ].filter((d) => d.value > 0);

//   if (chartData.length === 0) {
//     chartData.push({ name: "Sin costos", value: 1, color: "#d6d3d1" });
//   }

//   const renderCustomizedLabel = ({
//     cx,
//     cy,
//     midAngle,
//     innerRadius,
//     outerRadius,
//     percent,
//   }: any) => {
//     if (percent < 0.05) return null;
//     const RADIAN = Math.PI / 180;
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);

//     return (
//       <text
//         x={x}
//         y={y}
//         fill="white"
//         textAnchor={x > cx ? "start" : "end"}
//         dominantBaseline="central"
//         className="text-[10px] font-bold drop-shadow-md"
//       >
//         {`${(percent * 100).toFixed(1)}%`}
//       </text>
//     );
//   };

//   return (
//     <div className="space-y-4">
//       {/* ── Banner de Contexto de Manufactura ── */}
//       <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
//         {titulo && (
//           <span className="font-semibold text-stone-700 dark:text-stone-200">
//             {titulo}
//           </span>
//         )}
//         <Chip size="sm" variant="flat">
//           ×{multiplicador} unidad{multiplicador !== 1 ? "es" : ""}
//         </Chip>
//         <span className="font-mono">
//           {contexto?.ancho ?? 0} × {contexto?.alto ?? 0} mm
//         </span>
//         <span>·</span>
//         <span>
//           {contexto?.hojas ?? 0} hoja{(contexto?.hojas ?? 0) !== 1 ? "s" : ""}
//         </span>
//         {((contexto?.cruces_h ?? 0) > 0 || (contexto?.cruces_v ?? 0) > 0) && (
//           <span>
//             · {contexto?.cruces_h ?? 0}H + {contexto?.cruces_v ?? 0}V cruces
//           </span>
//         )}
//       </div>

//       {/* ── Pestañas de Visualización Operativa ── */}
//       <Tabs
//         selectedKey={view}
//         onSelectionChange={(k: React.Key) =>
//           setView(k as "detalle" | "resumen")
//         }
//         size="sm"
//         variant="underlined"
//         classNames={{
//           tabList:
//             "border-b border-stone-200 dark:border-stone-700 w-full gap-0",
//           cursor: "bg-stone-600 dark:bg-stone-400 h-0.5",
//           tab: "px-4 h-8 text-xs font-medium",
//         }}
//       >
//         {/* ── VISTA RESUMEN: Agrupación por barras óptimas ── */}
//         <Tab
//           key="resumen"
//           title={
//             <span className="flex items-center gap-1.5">
//               <BarChart3 className="w-3.5 h-3.5" /> Resumen optimizado
//             </span>
//           }
//         >
//           <div className="pt-4 space-y-4">
//             {resumenes.length > 0 && (
//               <section>
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
//                   Consolidado de Aluminio (Costos Base)
//                 </p>
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-xs">
//                     <thead>
//                       <tr className="border-b border-stone-200 dark:border-stone-700">
//                         <Th>Perfil</Th>
//                         <Th right>Cortes</Th>
//                         <Th right>Total Metros</Th>
//                         <Th right>Tiras (6m)</Th>
//                         <Th right>Efic.</Th>
//                         <Th right>Peso Kg</Th>
//                         <Th right>Costo Neto</Th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
//                       {resumenes.map((r) => (
//                         <tr
//                           key={r.nro_perfil}
//                           className="hover:bg-stone-50 dark:hover:bg-stone-800/30"
//                         >
//                           <td className="py-2 pr-3">
//                             <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">
//                               {r.nro_perfil}
//                             </span>
//                             <span className="text-stone-400 ml-2 text-xs">
//                               {r.descripcion_perfil.charAt(0).toUpperCase() +
//                                 r.descripcion_perfil.slice(1)}
//                             </span>
//                           </td>
//                           <Td right mono>
//                             {r.total_cortes}
//                           </Td>
//                           <Td right mono>
//                             {((r.total_mm || 0) / 1000).toFixed(2)} m
//                           </Td>
//                           <Td right mono>
//                             {r.tiras}
//                           </Td>
//                           <Td right>
//                             <EficienciaChip v={r.eficiencia} />
//                           </Td>
//                           <Td right mono>
//                             {(r.kg || 0).toFixed(3)}
//                           </Td>
//                           <Td right bold>
//                             {formatPesos(r.precio_total || 0)}
//                           </Td>
//                         </tr>
//                       ))}
//                     </tbody>
//                     <tfoot>
//                       <tr className="border-t-2 border-stone-300 dark:border-stone-600 font-semibold">
//                         <td className="py-2 text-xs text-stone-500">TOTALES</td>
//                         <td />
//                         <td className="text-right font-mono text-xs py-2 pr-2">
//                           {(
//                             resumenes.reduce(
//                               (s, r) => s + (r.total_mm || 0),
//                               0,
//                             ) / 1000
//                           ).toFixed(2)}{" "}
//                           <span className="text-stone-400">m</span>
//                         </td>
//                         <td className="text-right font-mono text-xs py-2">
//                           {totalTiras}{" "}
//                           <span className="text-stone-400">barras</span>
//                         </td>
//                         <td />
//                         <td className="text-right font-mono text-xs py-2 pr-2">
//                           {totalKg.toFixed(3)}
//                         </td>
//                         <td className="text-right font-semibold text-sm py-2 pr-2">
//                           {formatPesos(costo_perfiles)}
//                         </td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//               </section>
//             )}

//             {/* Interiores / Vidrios / Revestimientos */}
//             {interiores.length > 0 && (
//               <section>
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
//                   Paños y Rellenos de Estructura (Costos Base)
//                 </p>
//                 <table className="w-full text-xs">
//                   <thead>
//                     <tr className="border-b border-stone-200 dark:border-stone-700">
//                       <Th>Ubicación / Módulo</Th>
//                       <Th>Tipo</Th>
//                       <Th right>Ancho</Th>
//                       <Th right>Alto</Th>
//                       <Th right>Área</Th>
//                       <Th right>Costo Neto</Th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
//                     {interiores.map((i, idx) => (
//                       <tr
//                         key={idx}
//                         className="hover:bg-stone-50 dark:hover:bg-stone-800/30"
//                       >
//                         <td className="py-1.5 pr-3 font-medium text-stone-600 dark:text-stone-400">
//                           {i.modulo ?? `Paño ${idx + 1}`}
//                         </td>
//                         <td className="py-1.5 pr-3">
//                           <IntTipoChip tipo={i.tipo} />
//                         </td>
//                         <Td right mono>
//                           {formatMm(i.ancho)}
//                         </Td>
//                         <Td right mono>
//                           {formatMm(i.alto)}
//                         </Td>
//                         <Td right mono>
//                           {(i.area ?? 0).toFixed(3)} m²
//                         </Td>
//                         <Td right bold>
//                           {i.precio > 0 ? formatPesos(i.precio || 0) : "—"}
//                         </Td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </section>
//             )}
//           </div>
//         </Tab>

//         {/* ── VISTA DETALLE: Listado de cortes individuales para taller ── */}
//         <Tab
//           key="detalle"
//           title={
//             <span className="flex items-center gap-1.5">
//               <Layers className="w-3.5 h-3.5" /> Planilla de Cortes
//             </span>
//           }
//         >
//           <div className="pt-4 overflow-x-auto">
//             {cortes.length === 0 ? (
//               <div className="text-center py-8 text-stone-400">
//                 <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
//                 <p className="text-sm">
//                   Sin cortes calculados para esta tipología
//                 </p>
//               </div>
//             ) : (
//               <table className="w-full text-xs">
//                 <thead>
//                   <tr className="border-b border-stone-200 dark:border-stone-700">
//                     <Th>Ubicación</Th>
//                     <Th>Código Perfil</Th>
//                     <Th right>Cant.</Th>
//                     <Th right>Medida Corte</Th>
//                     <Th right>Total m</Th>
//                     <Th>Ángulos</Th>
//                     <Th right>Peso (Kg)</Th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
//                   {cortes.map((c) => (
//                     <tr
//                       key={c.id}
//                       className="hover:bg-stone-50 dark:hover:bg-stone-800/30"
//                     >
//                       <td className="py-1.5 pr-2">{nivelChip(c.nivel)}</td>
//                       <td className="py-1.5 pr-3">
//                         <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">
//                           {c.nro_perfil}
//                         </span>
//                         <span className="text-stone-400 ml-4 text-xs">
//                           {c.descripcion_perfil.charAt(0).toUpperCase() +
//                             c.descripcion_perfil.slice(1)}
//                         </span>
//                       </td>
//                       <Td right mono>
//                         {c.cantidad}
//                       </Td>
//                       <Td right mono>
//                         {formatMm(c.medida_mm)}
//                       </Td>
//                       <Td right mono>
//                         {((c.total_mm || 0) / 1000).toFixed(3)} m
//                       </Td>
//                       <td className="py-1.5 px-4">
//                         <span className="font-mono text-xs text-stone-500 bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">
//                           {c.angulo}
//                         </span>
//                       </td>
//                       <Td right mono>
//                         {(c.kg || 0).toFixed(3)}
//                       </Td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </Tab>
//       </Tabs>

//       <Divider />

//       {/* ── SECCIÓN INFERIOR: Tabla Comparativa y Gráfico ── */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
//         {/* Tabla Comparativa de Costos */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-xs">
//             <thead>
//               <tr className="border-b border-stone-300 dark:border-stone-700">
//                 <th className="py-2 text-left font-semibold text-stone-500">
//                   Ítem
//                 </th>
//                 <th className="py-2 text-right font-semibold text-stone-500">
//                   Costo sin IVA
//                 </th>
//                 <th className="py-2 text-right font-semibold text-stone-500">
//                   Costo + IVA
//                 </th>
//                 <th className="py-2 text-right font-semibold text-stone-500">
//                   Costo + IVA + Ganancia
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50">
//               <CostRow label="Perfiles natural" fila={fPerf} />
//               <CostRow label="Tratamientos" fila={fTrat} />
//               <CostRow label="Accesorios" fila={fAcc} />
//               <CostRow label="Vidrios/Interiores" fila={fVid} />
//               <CostRow label="Telas" fila={calcFila(0, 1)} />
//               <CostRow label="M.O. Taller" fila={fMOT} />
//               <CostRow label="M.O. Colocación" fila={fMOC} />
//               <CostRow label="Ítems manuales" fila={fMan} />
//             </tbody>
//             <tfoot>
//               <tr className="border-t-2 border-stone-300 dark:border-stone-600 bg-amber-50/50 dark:bg-amber-900/10">
//                 <td className="py-2 font-bold text-stone-800 dark:text-stone-200">
//                   Total
//                 </td>
//                 <td className="py-2 text-right font-bold text-stone-800 dark:text-stone-200">
//                   {formatPesos(totalSinIva)}
//                 </td>
//                 <td className="py-2 text-right font-bold text-stone-800 dark:text-stone-200">
//                   {formatPesos(totalConIva)}
//                 </td>
//                 <td className="py-2 text-right font-bold text-amber-600 dark:text-amber-400">
//                   {formatPesos(totalConGanancia)}
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>

//         {/* Gráfico Donut */}
//         <div className="flex flex-col items-center justify-center min-h-[250px] bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
//           <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2 w-full text-center">
//             Distribución de Costo Final
//           </p>
//           <div className="w-full h-full flex-1 min-h-[200px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={chartData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={50}
//                   outerRadius={80}
//                   paddingAngle={2}
//                   dataKey="value"
//                   labelLine={false}
//                   label={renderCustomizedLabel}
//                 >
//                   {chartData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   formatter={(value: number) => formatPesos(value)}
//                   contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
//                 />
//                 <Legend
//                   verticalAlign="middle"
//                   align="right"
//                   layout="vertical"
//                   iconType="circle"
//                   wrapperStyle={{ fontSize: "11px" }}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Sub-componentes Internos Modulares ──────────────────────────────────────────

// function CostRow({
//   label,
//   fila,
// }: {
//   label: string;
//   fila: { sinIva: number; conIva: number; conGanancia: number };
// }) {
//   return (
//     <tr className="hover:bg-stone-50 dark:hover:bg-stone-800/30">
//       <td className="py-1.5 text-stone-600 dark:text-stone-400">{label}</td>
//       <td className="py-1.5 text-right font-mono">
//         {formatPesos(fila.sinIva)}
//       </td>
//       <td className="py-1.5 text-right font-mono">
//         {formatPesos(fila.conIva)}
//       </td>
//       <td className="py-1.5 text-right font-mono font-medium">
//         {formatPesos(fila.conGanancia)}
//       </td>
//     </tr>
//   );
// }

// function EficienciaChip({ v }: { v: number }) {
//   const pct = Math.round(v * 100);
//   const color =
//     v >= 0.85
//       ? "text-emerald-600 font-bold"
//       : v >= 0.7
//         ? "text-amber-600 font-medium"
//         : "text-red-500 font-medium";
//   return <span className={`font-mono text-[10px] ${color}`}>{pct}%</span>;
// }

// function IntTipoChip({
//   tipo,
// }: {
//   tipo: "Vidrio" | "Revestimiento" | "CV Int." | "CV Ext." | "VR" | string;
// }) {
//   const map: Record<string, string> = {
//     Vidrio: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
//     Revestimiento:
//       "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
//     "CV Int.":
//       "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
//     "CV Ext.":
//       "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
//     VR: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
//   };
//   return (
//     <span
//       className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${map[tipo] ?? "bg-stone-100 text-stone-600"}`}
//     >
//       {tipo}
//     </span>
//   );
// }

// function Th({
//   children,
//   right,
// }: {
//   children?: React.ReactNode;
//   right?: boolean;
// }) {
//   return (
//     <th
//       className={`pb-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide whitespace-nowrap ${right ? "text-right" : "text-left"} pr-3`}
//     >
//       {children}
//     </th>
//   );
// }

// function Td({
//   children,
//   right,
//   mono,
//   bold,
// }: {
//   children: React.ReactNode;
//   right?: boolean;
//   mono?: boolean;
//   bold?: boolean;
// }) {
//   return (
//     <td
//       className={`py-1.5 pr-3 whitespace-nowrap ${right ? "text-right" : ""} ${mono ? "font-mono" : ""} ${bold ? "font-semibold" : ""}`}
//     >
//       {children}
//     </td>
//   );
// }
