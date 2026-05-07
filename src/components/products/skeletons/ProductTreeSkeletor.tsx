import { Skeleton } from "@heroui/react";

export function ProductTreeSkeleton() {
  const SkeletonRow = ({ depth }: { depth: number }) => (
    <div
      className="flex items-center gap-2 py-1.5"
      style={{ paddingLeft: `${depth * 14 + 6}px` }}
    >
      <Skeleton className="w-4 h-4 rounded shrink-0" /> {/* Chevron */}
      <Skeleton className="w-1.5 h-1.5 rounded-full shrink-0" /> {/* Dot */}
      <Skeleton className="w-3.5 h-3.5 rounded shrink-0" /> {/* Icon */}
      <Skeleton className="h-3 w-32 rounded-md shrink-0" /> {/* Label */}
      <div className="flex-1" />
      <Skeleton className="w-8 h-3 rounded-md shrink-0 opacity-30" />{" "}
      {/* Badge */}
    </div>
  );

  return (
    <div className="space-y-1 w-full">
      {/* Nivel 0: Producto */}
      <SkeletonRow depth={0} />

      {/* Nivel 1: Marcos */}
      <div className="space-y-1">
        <SkeletonRow depth={1} />

        {/* Nivel 2: Hoja */}
        <div className="space-y-1">
          <SkeletonRow depth={2} />
          {/* Nivel 3: Interior */}
          <SkeletonRow depth={3} />
        </div>

        <SkeletonRow depth={1} />
      </div>

      {/* Repetir estructura para llenar el panel */}
      <div className="pt-2">
        <SkeletonRow depth={1} />
        <SkeletonRow depth={2} />
      </div>
    </div>
  );
}
