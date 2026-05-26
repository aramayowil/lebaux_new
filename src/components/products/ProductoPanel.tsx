import { useState, useEffect } from "react";
import { Input, Select, SelectItem, Chip, Alert } from "@heroui/react";
import type { Producto } from "@/types";
import {
  Factory,
  Layout,
  Info,
  ChevronRight,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useTipos } from "@/hooks/obra/useTipos";
import { useUpdateProducto } from "@/hooks/productos/useProducto";
import { useLineas } from "@/hooks/catalogo/useLineas";
import { useExtrusoras } from "@/hooks/catalogo/useExtrusoras";
import { Skeleton } from "@heroui/react";

interface Props {
  producto: Producto;
}

export default function ProductoPanel({ producto }: Props) {
  // Estado local para el texto del input
  const [localDescripcion, setLocalDescripcion] = useState(
    producto.descripcion,
  );
  // Estado visual para avisar al usuario qué pasa con la DB
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  // Sincronizar el estado local si el producto cambia desde el árbol
  useEffect(() => {
    setLocalDescripcion(producto.descripcion);
    setSyncStatus("idle");
  }, [producto.descripcion, producto.id]);

  // Queries
  const {
    data: tipos = [],
    isLoading: isLoadingTipos,
    isError: isErrorTipos,
  } = useTipos();
  const {
    data: extrusoras = [],
    isLoading: isLoadingExtrusoras,
    isError: isErrorExtrusoras,
  } = useExtrusoras();
  const {
    data: lineas = [],
    isLoading: isLoadingLineas,
    isError: isErrorLineas,
  } = useLineas();

  const { mutateAsync: updateProducto } = useUpdateProducto();

  const isLoading = isLoadingTipos || isLoadingExtrusoras || isLoadingLineas;
  const isError = isErrorTipos || isErrorExtrusoras || isErrorLineas;

  // Función genérica de actualización
  const upd = (data: Producto) => updateProducto({ ...producto, ...data });

  // 1. MANEJADOR DEL EVENTO ONBLUR (Foco perdido)
  const handleBlur = async () => {
    // Si el texto no cambió, no gastamos peticiones a la DB
    if (localDescripcion === producto.descripcion) return;

    try {
      setSyncStatus("saving"); // Cambia el icono a "Cargando..."
      await upd({ ...producto, descripcion: localDescripcion });
      setSyncStatus("saved"); // Cambia el icono a "Guardado con éxito"

      // Limpia el check verde después de 2 segundos
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      setSyncStatus("idle");
    }
  };

  const lineasDeExt = lineas.filter(
    (l) => l.id_extrusora === producto.id_extrusora,
  );
  const ext = extrusoras.find((e) => e.id === producto.id_extrusora);
  const linea = lineas.find((l) => l.id === producto.id_linea);
  const tipo = tipos.find((t) => t.id === producto.id_tipo);

  return (
    <>
      {isError && (
        <Alert
          status="error"
          icon={<X className="w-4 h-4" />}
          classNames={{
            base: "mb-3 rounded-lg border border-transparent shadow-sm",
            title: "text-sm font-medium",
          }}
        >
          Error al cargar los datos del producto.
        </Alert>
      )}
      <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        {/* Cabecera */}
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="w-1.5 h-5 rounded-full bg-amber-400 shrink-0" />
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <Layout className="w-3.5 h-3.5" />
            <span>Producto</span>
          </div>
          <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />

          <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <Factory className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] font-medium text-zinc-500">
              {ext?.extrusora || "S/E"}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">
              {linea?.linea || "S/L"}
            </span>
          </div>
          <div className="ml-auto">
            <Chip
              size="sm"
              variant="flat"
              classNames={{
                base: "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                content:
                  "text-[10px] font-bold text-zinc-600 dark:text-zinc-300",
              }}
            >
              {tipo?.forma_tipo ?? "Sin tipo"}
            </Chip>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-4 space-y-4">
          {/* Descripción */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Descripción
              </p>

              {/* 2. INDICADOR DE ESTADO VISUAL */}
              {syncStatus === "saving" && (
                <span className="text-[10px] text-zinc-400 flex items-center gap-1 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin text-amber-500" />{" "}
                  Guardando...
                </span>
              )}
              {syncStatus === "saved" && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3" /> Cambios guardados
                </span>
              )}
            </div>

            <Input
              value={localDescripcion}
              onValueChange={setLocalDescripcion}
              onBlur={handleBlur} // Se ejecuta solo cuando el usuario hace clic afuera
              placeholder="ej: Ventana corrediza 2 hojas"
              size="sm"
              classNames={{
                inputWrapper:
                  "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 focus-within:!border-amber-400 transition-colors shadow-none",
                input: "font-medium",
              }}
            />
          </div>

          {/* Clasificación */}
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Clasificación
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Select
                label="Extrusora"
                size="sm"
                selectedKeys={[String(producto.id_extrusora)]}
                onSelectionChange={(k: Set<string>) => {
                  const extId = parseInt([...k][0] as string);
                  const primera = lineas.find((l) => l.id_extrusora === extId);
                  upd({
                    ...producto,
                    id_extrusora: extId,
                    id_linea: primera?.id ?? producto.id_linea,
                  });
                }}
                classNames={{
                  trigger:
                    "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 transition-colors",
                }}
              >
                {extrusoras.map((e) => (
                  <SelectItem key={String(e.id)} textValue={e.extrusora}>
                    {e.extrusora}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Línea"
                size="sm"
                selectedKeys={[String(producto.id_linea)]}
                onSelectionChange={(k: Set<string>) =>
                  upd({
                    ...producto,
                    id_linea: parseInt([...k][0] as string),
                  })
                }
                classNames={{
                  trigger:
                    "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 transition-colors",
                }}
              >
                {lineasDeExt.map((l) => (
                  <SelectItem key={String(l.id)} textValue={l.linea}>
                    {l.linea}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Tipo"
                size="sm"
                selectedKeys={[String(producto.id_tipo)]}
                onSelectionChange={(k: Set<string>) =>
                  upd({ ...producto, id_tipo: parseInt([...k][0] as string) })
                }
                classNames={{
                  trigger:
                    "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 transition-colors",
                }}
              >
                {tipos.map((t) => (
                  <SelectItem key={String(t.id)} textValue={t.forma_tipo}>
                    {t.forma_tipo}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Footer de ayuda */}
        {/* Footer de ayuda con Skeleton de HeroUI */}
        <div
          className={`flex items-start gap-2.5 px-4 py-3 border-t transition-all duration-300 min-h-[53px] ${
            isLoading
              ? "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800"
              : "bg-amber-50/60 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30"
          }`}
        >
          {isLoading ? (
            // ── ESTADO SKELETON: REPLICA LAS MEDIDAS EXACTAS DEL CONTENIDO REAL ──
            <>
              {/* Simula el icono de Info girando/titilando */}
              <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 bg-zinc-200 dark:bg-zinc-800" />

              {/* Simula los dos renglones del párrafo de ayuda */}
              <div className="flex-1 space-y-1.5 pt-0.5">
                <Skeleton className="h-2.5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <Skeleton className="h-2.5 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </>
          ) : (
            // ── ESTADO REAL: CONTENIDO TÉCNICO OPERATIVO ─────────────────────────
            <>
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 animate-in fade-in zoom-in duration-300" />
              <p className="text-[10px] text-zinc-500 leading-relaxed animate-in fade-in duration-300">
                Seleccioná un{" "}
                <strong className="text-amber-500 font-bold">Marco</strong> en
                el árbol para configurar perfiles y accesorios de corte.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
