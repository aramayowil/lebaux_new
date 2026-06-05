import { Skeleton, Card, Divider } from "@heroui/react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  SplitSquareHorizontal,
  SplitSquareVertical,
  Layers,
  Eraser,
  Loader2,
  PanelRightClose,
  Settings2,
  PenLine,
} from "lucide-react";
import clsx from "clsx";

export default function ObraEditorPageSkeleton() {
  // Simulamos una lista fija de 3 elementos para rellenar visualmente el panel izquierdo
  const skeletonItems = [1, 2, 3];

  return (
    <div className="flex h-[calc(100vh-56px)] -m-6 w-[calc(100%+3rem)] flex-col bg-zinc-50 dark:bg-zinc-950 select-none overflow-hidden text-zinc-900 dark:text-zinc-100">
      {/* HEADER DE CONTROL FIJO */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg text-zinc-300 dark:text-zinc-700">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-1">
            {/* Nombre de la obra */}
            <Skeleton className="w-32 h-4 rounded-md" />
            <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              Editor Técnico de Aberturas & Presupuestos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="rounded-lg">
            <div className="h-8 w-36 bg-zinc-200 dark:bg-zinc-800" />
          </Skeleton>
          <div className="p-2 rounded-lg text-zinc-300 dark:text-zinc-700 border border-zinc-200 dark:border-zinc-800">
            <PanelRightClose className="h-4 w-4" />
          </div>
        </div>
      </header>

      {/* CUERPO PRINCIPAL DEL ENTORNO */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* PANEL IZQUIERDO: SKELETON LISTA DE TIPOLOGÍAS */}
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Tipologías en Obra
            </span>
            <div className="h-7 px-2.5 flex items-center gap-1 text-[11px] font-semibold text-zinc-300 dark:text-zinc-700 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <Plus className="h-3 w-3" /> Nueva
            </div>
          </div>

          {/* Tarjetas simuladas de aberturas */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {skeletonItems.map((item, idx) => (
              <div
                key={item}
                className={clsx(
                  "flex flex-col p-2.5 rounded-xl border border-transparent",
                  idx === 0
                    ? "bg-zinc-100/70 dark:bg-zinc-800/40"
                    : "bg-zinc-50/60 dark:bg-zinc-800/10",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Simula el texto del nombre/descripción de tipología */}
                  <Skeleton className="w-28 h-3.5 rounded-md" />

                  {/* Íconos de acción fijos y atenuados */}
                  <div className="flex items-center gap-1.5 text-zinc-300 dark:text-zinc-700">
                    <Copy className="h-3 w-3" />
                    <Trash2 className="h-3 w-3" />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {/* Dimensiones mm */}
                  <Skeleton className="w-16 h-3 rounded-md" />
                  {/* Cantidad */}
                  <Skeleton className="w-12 h-4 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CONTENEDOR CENTRAL: CANVAS GRÁFICO (SKELETON DE CARGA TÉCNICA) */}
        <main className="flex-1 bg-zinc-50 dark:bg-zinc-950 flex flex-col overflow-hidden relative">
          {/* Espacio del plano de dibujo */}
          <div className="flex-1 w-full flex items-center justify-center relative p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-100/60 to-zinc-50 dark:from-zinc-900/40 dark:to-zinc-950">
            <Card className="w-72 h-72 bg-white dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 shadow-none flex items-center justify-center rounded-2xl">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-300 dark:text-zinc-700" />
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-600 font-mono tracking-wider">
                  DIBUJANDO...
                </span>
              </div>
            </Card>
          </div>

          {/* SUB-TOOLBAR FLOTANTE INFERIOR CON ÍCONOS TOTALMENTE VISIBLES */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-2 flex items-center gap-1 z-50 text-zinc-400 dark:text-zinc-500">
            <div className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
              <SplitSquareHorizontal className="h-5 w-5" />
            </div>
            <div className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
              <SplitSquareVertical className="h-5 w-5" />
            </div>

            <Divider
              orientation="vertical"
              className="h-5 bg-zinc-200 dark:bg-zinc-800 mx-1"
            />

            <div className="p-2 rounded-xl text-amber-500 bg-amber-50/50 dark:bg-amber-950/20">
              <PenLine className="h-5 w-5" />
            </div>

            <Divider
              orientation="vertical"
              className="h-5 bg-zinc-200 dark:bg-zinc-800 mx-1"
            />

            <div className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
              <Layers className="h-5 w-5" />
            </div>
            <div className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
              <Eraser className="h-5 w-5" />
            </div>
          </div>
        </main>

        {/* PANEL DERECHO: ESPACIO RESERVADO PARA EL SKELETON DE CONFIGURACIÓN */}
        <aside className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 flex flex-col overflow-hidden">
          {/* Aquí encajaría el TipologiaConfigPanelSkeleton desarrollado anteriormente */}
          <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-zinc-400">
            <Settings2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Especificaciones
            </span>
          </div>
          <div className="p-4 space-y-4 flex-1">
            <div className="space-y-2">
              <Skeleton className="w-24 h-3 rounded-md" />
              <Skeleton className="w-full h-8 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-32 h-3 rounded-md" />
              <Skeleton className="w-full h-8 rounded-lg" />
            </div>
            <Divider className="my-2 bg-zinc-100 dark:bg-zinc-800" />
            <div className="space-y-2">
              <Skeleton className="w-20 h-3 rounded-md" />
              <Skeleton className="w-full h-16 rounded-xl" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
