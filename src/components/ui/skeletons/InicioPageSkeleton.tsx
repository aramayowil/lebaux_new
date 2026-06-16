import { Skeleton } from "@heroui/react";

// Contenedor base idéntico a la función "Panel" del componente original
function PanelSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-zinc-800/70 rounded-2xl overflow-hidden">
      {children}
    </div>
  );
}

// Estructura de cabecera idéntica a "PanelHeader"
function PanelHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
      <div className="space-y-2">
        <Skeleton className="w-28 h-4 rounded-md" />
        <Skeleton className="w-44 h-3 rounded-md" />
      </div>
    </div>
  );
}

export default function InicioPageSkeleton() {
  return (
    <div className="flex flex-col h-full w-full animate-pulse">
      {/* ── FIXED HEADER SKELETON ─────────────────────────────────────── */}
      <header className="shrink-0 px-6 pt-3 pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2.5">
            {/* Saludo */}
            <Skeleton className="w-56 h-7 rounded-lg" />
            {/* Fecha */}
            <Skeleton className="w-48 h-3.5 rounded-md" />
          </div>

          {/* Mini KPI Strip (visibles en md+) */}
          <div className="hidden md:flex items-center gap-2">
            <Skeleton className="w-32 h-8 rounded-xl" />
            <Skeleton className="w-40 h-8 rounded-xl" />
          </div>
        </div>
      </header>

      {/* ── SCROLLABLE BODY SKELETON ──────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto p-5 space-y-5 pb-12">
          {/* ── KPI CARDS ROW (4 Tarjetas de Estadísticas) ───────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-zinc-800/70 rounded-2xl p-4 space-y-3"
              >
                {/* Icon Badge */}
                <Skeleton className="w-8 h-8 rounded-xl" />
                {/* Grande Valor Monospaced */}
                <Skeleton className="w-16 h-8 rounded-lg" />
                {/* Etiqueta y Tendencia */}
                <div className="space-y-2">
                  <Skeleton className="w-24 h-2.5 rounded-md" />
                  <Skeleton className="w-14 h-3 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* ── MAIN LAYOUT (2/3 + 1/3) ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* COLUMNA IZQUIERDA (Gráfico + Últimas Obras) ────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Rendimiento de Proyectos (Area Chart) */}
              <PanelSkeleton>
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="w-44 h-4 rounded-md" />
                      <Skeleton className="w-14 h-5 rounded-md" />
                    </div>
                    <Skeleton className="w-56 h-3 rounded-md ml-6" />
                  </div>
                  {/* Selector de Período */}
                  <Skeleton className="w-24 h-6 rounded-lg" />
                </div>

                <div className="px-5 pt-4 pb-5 space-y-5">
                  {/* Contenedor del EChart original */}
                  <Skeleton className="w-full h-[210px] rounded-xl" />
                  {/* Fila de Resumen Inferior (chartSummary) */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center space-y-2"
                      >
                        <Skeleton className="w-20 h-2.5 rounded-md" />
                        <Skeleton className="w-14 h-4 rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>
              </PanelSkeleton>

              {/* Últimas Obras (Lista con Avatares) */}
              <PanelSkeleton>
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4 rounded-md" />
                    <Skeleton className="w-48 h-3 rounded-md" />
                  </div>
                  {/* Botón "Ver todas" */}
                  <Skeleton className="w-20 h-8 rounded-xl" />
                </div>

                {/* Lista de Filas Simuladas */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-5 py-3.5"
                    >
                      {/* Avatar */}
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      {/* Nombre y Dirección */}
                      <div className="flex-1 space-y-2">
                        <Skeleton className="w-32 h-3.5 rounded-md" />
                        <Skeleton className="w-48 h-2.5 rounded-md" />
                      </div>
                      {/* Estado (Oculto en móviles como en el original) */}
                      <Skeleton className="hidden sm:block w-16 h-5 rounded-lg shrink-0" />
                      {/* Icono Flecha */}
                      <Skeleton className="w-4 h-4 rounded-md shrink-0" />
                    </div>
                  ))}
                </div>
              </PanelSkeleton>
            </div>

            {/* COLUMNA DERECHA (Actividad + Mix + Estado) ─────────────── */}
            <div className="space-y-5">
              {/* Actividad Reciente */}
              <PanelSkeleton>
                <PanelHeaderSkeleton />
                <div className="px-5 py-4 space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {/* Icono Caja */}
                      <Skeleton className="w-6 h-6 rounded-lg shrink-0 mt-0.5" />
                      {/* Título y Subtítulo */}
                      <div className="flex-1 space-y-2">
                        <Skeleton className="w-32 h-3 rounded-md" />
                        <Skeleton className="w-40 h-2.5 rounded-md" />
                      </div>
                      {/* Tiempo transcurrido */}
                      <Skeleton className="w-10 h-2.5 rounded-md shrink-0 mt-0.5" />
                    </div>
                  ))}
                </div>
              </PanelSkeleton>

              {/* Mix de Producción (Donut Chart) */}
              <PanelSkeleton>
                <PanelHeaderSkeleton />
                <div className="px-5 pb-5 pt-3 flex flex-col items-center space-y-5">
                  {/* Anillo de la Dona central */}
                  <Skeleton className="w-28 h-28 rounded-full" />
                  {/* Desglose inferior de las líneas */}
                  <div className="w-full space-y-2">
                    <Skeleton className="w-full h-7 rounded-lg" />
                    <Skeleton className="w-full h-7 rounded-lg" />
                    <Skeleton className="w-full h-7 rounded-lg" />
                  </div>
                </div>
              </PanelSkeleton>

              {/* Estado del Catálogo + Accesos Rápidos */}
              <PanelSkeleton>
                <PanelHeaderSkeleton />
                {/* Barras de progreso de salud */}
                <div className="px-5 pt-4 pb-2 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Skeleton className="w-16 h-2.5 rounded-md" />
                        <Skeleton className="w-12 h-2.5 rounded-md" />
                      </div>
                      <Skeleton className="w-full h-1.5 rounded-full" />
                    </div>
                  ))}
                </div>
                {/* Botones de acciones rápidas */}
                <div className="px-5 pb-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4 space-y-2">
                  <Skeleton className="w-24 h-3 rounded-md mb-2" />
                  <Skeleton className="w-full h-[38px] rounded-xl" />
                  <Skeleton className="w-full h-[38px] rounded-xl" />
                </div>
              </PanelSkeleton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
