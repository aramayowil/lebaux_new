import { Input, Select, SelectItem, Chip } from "@heroui/react";
import { useProductosStore } from "@/store/productosStore";
import { useCatalogosStore } from "@/store/catalogosStore";
import type { Producto } from "@/types";
import { Factory, Layout, Info, ChevronRight } from "lucide-react";

interface Props {
  producto: Producto;
}

export default function ProductoPanel({ producto }: Props) {
  const { updateProducto, tipos } = useProductosStore();
  const { extrusoras, lineas } = useCatalogosStore();

  const upd = (data: Partial<Producto>) => updateProducto(producto.id, data);
  const lineasDeExt = lineas.filter(
    (l) => l.idExtrusora === producto.idExtrusora,
  );
  const ext = extrusoras.find((e) => e.id === producto.idExtrusora);
  const linea = lineas.find((l) => l.id === producto.idLinea);
  const tipo = tipos.find((t) => t.id === producto.idTipo);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
      {/* Cabecera */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-1.5 h-5 rounded-full bg-amber-400 shrink-0" />
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <Layout className="w-3.5 h-3.5" />
          <span>Producto</span>
        </div>
        <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
        {/* Breadcrumb: Extrusora / Línea */}
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
              content: "text-[10px] font-bold text-zinc-600 dark:text-zinc-300",
            }}
          >
            {tipo?.formaTipo ?? "Sin tipo"}
          </Chip>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p-4 space-y-4">
        {/* Descripción */}
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Descripción
          </p>
          <Input
            value={producto.descripcion}
            onValueChange={(v: string) => upd({ descripcion: v })}
            placeholder="ej: Ventana corrediza 2 hojas"
            size="sm"
            classNames={{
              inputWrapper:
                "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 focus-within:!border-amber-400 transition-colors shadow-none",
              input: "font-medium",
            }}
          />
        </div>

        {/* Extrusora / Línea / Tipo */}
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Clasificación
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Extrusora"
              size="sm"
              selectedKeys={[String(producto.idExtrusora)]}
              onSelectionChange={(k: Set<string>) => {
                const extId = parseInt([...k][0] as string);
                const primera = lineas.find((l) => l.idExtrusora === extId);
                upd({
                  idExtrusora: extId,
                  idLinea: primera?.id ?? producto.idLinea,
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
              selectedKeys={[String(producto.idLinea)]}
              onSelectionChange={(k: Set<string>) =>
                upd({ idLinea: parseInt([...k][0] as string) })
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
              selectedKeys={[String(producto.idTipo)]}
              onSelectionChange={(k: Set<string>) =>
                upd({ idTipo: parseInt([...k][0] as string) })
              }
              classNames={{
                trigger:
                  "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 transition-colors",
              }}
            >
              {tipos.map((t) => (
                <SelectItem key={String(t.id)} textValue={t.formaTipo}>
                  {t.formaTipo}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Footer de ayuda */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50/60 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/30">
        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          Seleccioná un <strong className="text-amber-500">Marco</strong> en el
          árbol para configurar perfiles y accesorios de corte.
        </p>
      </div>
    </div>
  );
}
