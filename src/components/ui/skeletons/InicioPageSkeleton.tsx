import { Card, CardBody, Skeleton } from "@heroui/react";

export default function InicioPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* ── SECCIÓN B: GRID DE MÉTRICAS (KPI CARDS SIMULADOS) ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50"
          >
            <CardBody className="p-4 flex flex-row items-center justify-between gap-2">
              <div className="space-y-2 w-full">
                {/* Etiqueta superior */}
                <Skeleton className="w-16 h-2.5 rounded-md" />
                {/* Valor numérico grande */}
                <Skeleton className="w-12 h-7 rounded-lg" />
                {/* Tendencia inferior */}
                <Skeleton className="w-20 h-3 rounded-md" />
              </div>
              {/* Icono contenedor */}
              <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
            </CardBody>
          </Card>
        ))}
      </div>

      {/* ── SECCIÓN C: LAYOUT PRINCIPAL DEL DASHBOARD REPLICADO ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL IZQUIERDO Y CENTRAL */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico Analítico de Área Simulado */}
          <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
            <CardBody className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="w-48 h-4 rounded-md" />
                  <Skeleton className="w-64 h-3 rounded-md" />
                </div>
                <Skeleton className="w-14 h-5 rounded-md" />
              </div>
              {/* Simulación física del cuerpo del gráfico de líneas */}
              <div className="h-[220px] w-full flex flex-col justify-between pt-4">
                <div className="w-full h-full relative flex items-end">
                  {/* Línea simulada subiendo y bajando en ondas */}
                  <div className="absolute inset-x-0 bottom-12 h-32 w-full flex items-end justify-between px-2">
                    <Skeleton className="w-[15%] h-[30%] rounded-t-lg opacity-40" />
                    <Skeleton className="w-[15%] h-[50%] rounded-t-lg opacity-40" />
                    <Skeleton className="w-[15%] h-[75%] rounded-t-lg opacity-40" />
                    <Skeleton className="w-[15%] h-[65%] rounded-t-lg opacity-40" />
                    <Skeleton className="w-[15%] h-[95%] rounded-t-lg opacity-40" />
                  </div>
                </div>
                {/* Eje X */}
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                  <Skeleton className="w-8 h-3 rounded-md" />
                  <Skeleton className="w-8 h-3 rounded-md" />
                  <Skeleton className="w-8 h-3 rounded-md" />
                  <Skeleton className="w-8 h-3 rounded-md" />
                  <Skeleton className="w-8 h-3 rounded-md" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Gestión de Proyectos / Últimas Obras Simuladas */}
          <Card className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 shadow-none">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="space-y-1.5">
                  <Skeleton className="w-40 h-4 rounded-md" />
                  <Skeleton className="w-56 h-3 rounded-md" />
                </div>
                <Skeleton className="w-16 h-6 rounded-lg" />
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 w-full">
                      {/* Avatar circular */}
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="space-y-2 w-1/3">
                        <Skeleton className="h-3.5 w-full rounded-md" />
                        <Skeleton className="h-2.5 w-3/4 rounded-md" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <Skeleton className="w-24 h-5 rounded-md hidden sm:block" />
                      <Skeleton className="w-7 h-7 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* PANEL LATERAL DERECHO */}
        <div className="space-y-6">
          {/* Mix de Producción (Gráfico de Dona) Simulado */}
          <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
            <CardBody className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="w-32 h-4 rounded-md" />
                <Skeleton className="w-48 h-3 rounded-md" />
              </div>

              {/* Círculo central simulando la dona de ECharts */}
              <div className="h-[160px] w-full flex items-center justify-center relative">
                <div className="w-28 h-28 rounded-full border-[14px] border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                  <Skeleton className="w-10 h-3 rounded-md" />
                </div>
              </div>

              {/* Filas inferiores del desglose por líneas de producción */}
              <div className="space-y-2 pt-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-1"
                  >
                    <div className="flex items-center gap-2 w-1/2">
                      <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
                      <Skeleton className="h-3 w-full rounded-md" />
                    </div>
                    <Skeleton className="w-10 h-4 rounded-md" />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Accesos de Control de Configuración */}
          <Card className="bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900/50 dark:to-zinc-900/10 border border-zinc-200/60 dark:border-zinc-800/60 shadow-none">
            <CardBody className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="w-28 h-4 rounded-md" />
                <Skeleton className="w-40 h-3 rounded-md" />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Skeleton className="w-full h-8 rounded-lg" />
                <Skeleton className="w-full h-8 rounded-lg" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
