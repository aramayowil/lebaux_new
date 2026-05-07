import { Skeleton } from "@heroui/react";

export const InteriorSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      {/* ── Cabecera Skeleton ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Skeleton className="w-1.5 h-5 rounded-full shrink-0" />
        <Skeleton className="h-8 w-full max-w-xs rounded-lg" />
        <div className="flex items-center gap-2 ml-auto">
          <Skeleton className="h-4 w-16 rounded-full" />{" "}
          {/* Badge predeterminado */}
          <Skeleton className="h-5 w-10 rounded-full" /> {/* Switch */}
        </div>
      </div>

      {/* ── ① DIMENSIONES Skeleton ── */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-full flex items-center gap-3 px-4 py-3">
          <Skeleton className="w-1 h-4 rounded-full shrink-0" />
          <Skeleton className="h-3 w-32 rounded-lg" />
          <Skeleton className="h-4 w-4 rounded-md ml-auto" />
        </div>

        {/* Simulación de acordeón abierto para evitar CLS */}
        <div className="px-4 pb-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-12 rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-2 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center">
            <Skeleton className="h-3 w-24 rounded-lg mb-4 self-start" />
            <Skeleton className="h-32 w-48 rounded-xl" /> {/* Diagrama */}
          </div>
        </div>
      </div>

      {/* ── ② COMPONENTES Skeleton ── */}
      <div className="flex flex-col border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800/60">
          <Skeleton className="h-3 w-20 rounded-lg mr-1" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full shrink-0" />
          ))}
        </div>
        <div className="min-h-[260px] p-4">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>

      {/* ── ③ PERFILES & ④ ACCESORIOS Skeleton ── */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ContravidrioFormSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* ── FormHeader Skeleton ── */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-48 rounded-lg" /> {/* Nombre */}
          <Skeleton className="h-5 w-24 rounded-full" />{" "}
          {/* Badge Predeterminado */}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />{" "}
          {/* Botón borrar/acción */}
        </div>
      </div>

      {/* ── FieldGroup Title ── */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-40 rounded-lg" />{" "}
        {/* Título: Perfiles del contravidrio */}
        <div className="space-y-3">
          {/* ── Perfil Item Cards (Simulamos 2 para el efecto de carga) ── */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-3 space-y-4"
            >
              {/* Fila de Selects superiores */}
              <div className="flex items-center gap-2">
                <Skeleton className="flex-1 h-8 rounded-lg" />{" "}
                {/* Select Perfil */}
                <Skeleton className="w-16 h-8 rounded-lg" />{" "}
                {/* Select Angulo */}
                <Skeleton className="w-7 h-7 rounded-lg" /> {/* Botón Trash */}
              </div>

              {/* Grid de FormulaInputs */}
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded-md" /> {/* Label */}
                    <Skeleton className="h-9 w-full rounded-lg" /> {/* Input */}
                    <Skeleton className="h-2 w-full rounded-md" />{" "}
                    {/* Help text */}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ── Botón "Agregar perfil" (Dashed) ── */}
          <div className="w-full h-10 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CrucesFormSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* ── FormHeader Skeleton ── */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-40 rounded-lg" /> {/* Nombre del cruce */}
          <Skeleton className="h-5 w-24 rounded-full" />{" "}
          {/* Badge Predeterminado */}
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" /> {/* Botón Delete */}
      </div>

      {/* ── FieldGroup: Perfil del cruce ── */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-32 rounded-lg" /> {/* Título sección */}
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-8 rounded-lg" /> {/* Select Perfil */}
          <Skeleton className="w-16 h-8 rounded-lg" /> {/* Select Angulo */}
        </div>
      </div>

      {/* ── FieldGroup: Medidas de corte (3 Columnas) ── */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-36 rounded-lg" /> {/* Título sección */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16 rounded-md" /> {/* Label */}
              <Skeleton className="h-9 w-full rounded-lg" />{" "}
              {/* FormulaInput */}
              <Skeleton className="h-2 w-full rounded-md" /> {/* Description */}
            </div>
          ))}
        </div>
      </div>

      {/* ── FieldGroup: Descuentos (2 Columnas) ── */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-48 rounded-lg" /> {/* Título sección */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-full rounded-lg" />{" "}
              {/* Input de número */}
              <Skeleton className="h-2 w-full rounded-md" /> {/* Descripción */}
            </div>
          ))}
        </div>
      </div>

      {/* ── FieldGroup: Accesorios ── */}
      <div className="space-y-3 pt-2">
        <Skeleton className="h-3 w-40 rounded-lg" /> {/* Título sección */}
        <Skeleton className="h-24 w-full rounded-xl" />{" "}
        {/* Panel de accesorios */}
      </div>
    </div>
  );
};

export const VidrioRepartidoFormSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* ── FormHeader Skeleton ── */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-44 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>

      {/* ── Perfil de Contorno (Selects + 2x2 Grid) ── */}
      <div className="space-y-4">
        <Skeleton className="h-3.5 w-32 rounded-lg" /> {/* Title */}
        <div className="flex gap-2 mb-2">
          <Skeleton className="flex-1 h-8 rounded-lg" />
          <Skeleton className="w-16 h-8 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-2 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Perfil de Cruceta (Selects + 2x2 Grid con Inputs mixtos) ── */}
      <div className="space-y-4">
        <Skeleton className="h-3.5 w-32 rounded-lg" /> {/* Title */}
        <div className="flex gap-2 mb-2">
          <Skeleton className="flex-1 h-8 rounded-lg" />
          <Skeleton className="w-16 h-8 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-2 w-2/3 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Interiores y Diagrama ── */}
      <div className="space-y-4">
        <Skeleton className="h-3.5 w-48 rounded-lg" /> {/* Title */}
        {/* 3 Columnas de Fórmulas */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-14 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
        {/* Skeleton del Diagrama de Descuentos */}
        <div className="flex flex-col items-center pt-4">
          <Skeleton className="h-3 w-32 rounded-lg self-start mb-6" />
          <div className="relative w-56 h-36 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center">
            {/* El "vidrio" central */}
            <Skeleton className="w-32 h-16 rounded-lg opacity-40" />

            {/* Simulando los 4 DescInput en los bordes */}
            <Skeleton className="absolute top-0 -translate-y-1/2 w-12 h-8 rounded-md" />
            <Skeleton className="absolute bottom-0 translate-y-1/2 w-12 h-8 rounded-md" />
            <Skeleton className="absolute left-0 -translate-x-1/2 w-12 h-8 rounded-md" />
            <Skeleton className="absolute right-0 translate-x-1/2 w-12 h-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};
