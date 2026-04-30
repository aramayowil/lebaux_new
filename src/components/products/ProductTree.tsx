import { useState } from "react";
import {
  Button,
  Tooltip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Layers,
  Box,
  Grid2x2,
  Square,
} from "lucide-react";
import { useProductosStore } from "@/store/productosStore";
import { useCatalogosStore } from "@/store/catalogosStore";
import clsx from "clsx";
import type { Producto, Marco, Hoja, Interior } from "@/types";

export type TreeSelection =
  | { level: "producto"; id: number }
  | { level: "marco"; id: number; idProducto: number }
  | { level: "hoja"; id: number; idMarco: number; idProducto: number }
  | {
      level: "interior";
      id: number;
      idHoja: number;
      idMarco: number;
      idProducto: number;
    };

interface Props {
  selection: TreeSelection | null;
  onSelect: (sel: TreeSelection) => void;
}

export default function ProductTree({ selection, onSelect }: Props) {
  const {
    productos,
    tipos,
    addProducto,
    deleteProducto,
    addMarco,
    deleteMarco,
    addHoja,
    deleteHoja,
    addInterior,
    deleteInterior,
    getMarcosByProducto,
    getHojasByMarco,
    getInterioresByHoja,
  } = useProductosStore();
  const { extrusoras, lineas } = useCatalogosStore();

  const [expanded, setExpanded] = useState<Set<string>>(new Set(["p-1"]));
  const toggle = (key: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const newProd = useDisclosure();
  const [prodForm, setProdForm] = useState({
    descripcion: "",
    idExtrusora: extrusoras[0]?.id ?? 1,
    idLinea: lineas[0]?.id ?? 1,
    idTipo: 1,
  });
  const lineasDeExt = lineas.filter(
    (l) => l.idExtrusora === prodForm.idExtrusora,
  );

  function handleAddProducto(close: () => void) {
    if (!prodForm.descripcion.trim()) return;
    const p = addProducto(prodForm);
    onSelect({ level: "producto", id: p.id });
    setExpanded((s) => new Set([...s, `p-${p.id}`]));
    close();
  }

  function handleAddMarco(idProducto: number) {
    const m = addMarco({
      idProducto,
      descripcion: "Marco nuevo",
      predeterminado: false,
    });
    setExpanded((s) => new Set([...s, `p-${idProducto}`, `m-${m.id}`]));
    onSelect({ level: "marco", id: m.id, idProducto });
  }

  function handleAddHoja(idMarco: number, idProducto: number) {
    const h = addHoja({
      idMarco,
      descripcion: "Hoja nueva",
      cantidad: 1,
      predeterminado: false,
    });
    setExpanded((s) => new Set([...s, `m-${idMarco}`, `h-${h.id}`]));
    onSelect({ level: "hoja", id: h.id, idMarco, idProducto });
  }

  function handleAddInterior(
    idHoja: number,
    idMarco: number,
    idProducto: number,
  ) {
    // FIX: Interior solo tiene datos base. Las fórmulas/descuentos van en DespieceInterior (tabla separada en DB)
    const i = addInterior({
      idHoja,
      descripcion: "Interior nuevo",
      predeterminado: false,
    });
    onSelect({ level: "interior", id: i.id, idHoja, idMarco, idProducto });
  }

  const isSelected = (level: string, id: number) =>
    selection?.level === level && selection.id === id;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-steel-950">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-steel-100 dark:border-steel-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-steel-500 uppercase tracking-widest">
            Tipologias
          </span>
          <span className="text-[10px] text-steel-300 dark:text-steel-700 font-mono">
            {productos.length}
          </span>
        </div>
        <Tooltip content="Nuevo producto" size="sm">
          <button
            onClick={newProd.onOpen}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {productos.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 px-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-steel-100 dark:bg-steel-800 flex items-center justify-center">
              <Layers className="w-5 h-5 text-steel-400" />
            </div>
            <p className="text-xs text-steel-400">Sin productos aún</p>
            <button
              onClick={newProd.onOpen}
              className="text-[11px] font-semibold text-amber-500 hover:text-amber-600 underline underline-offset-2"
            >
              Crear el primero
            </button>
          </div>
        )}
        {productos.map((p) => (
          <ProductNode
            key={p.id}
            producto={p}
            expanded={expanded}
            toggle={toggle}
            selection={selection}
            isSelected={isSelected}
            onSelect={onSelect}
            onAddMarco={handleAddMarco}
            onAddHoja={handleAddHoja}
            onAddInterior={handleAddInterior}
            onDeleteProducto={deleteProducto}
            onDeleteMarco={deleteMarco}
            onDeleteHoja={deleteHoja}
            onDeleteInterior={deleteInterior}
            getMarcos={getMarcosByProducto}
            getHojas={getHojasByMarco}
            getInteriores={getInterioresByHoja}
            tipos={tipos}
          />
        ))}
      </div>

      {/* Modal nuevo producto */}
      <Modal
        isOpen={newProd.isOpen}
        onOpenChange={newProd.onOpenChange}
        size="md"
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="font-display text-sm">
                Nuevo producto
              </ModalHeader>
              <ModalBody className="gap-3">
                <Input
                  label="Descripción *"
                  placeholder="ej: Ventana corrediza 2 hojas"
                  value={prodForm.descripcion}
                  onValueChange={(v: string) =>
                    setProdForm((f) => ({ ...f, descripcion: v }))
                  }
                  size="sm"
                  autoFocus
                  classNames={{
                    inputWrapper:
                      "border border-steel-200 dark:border-steel-700 bg-steel-50 dark:bg-steel-900",
                  }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Extrusora"
                    selectedKeys={[String(prodForm.idExtrusora)]}
                    onSelectionChange={(k: Set<string>) => {
                      const extId = parseInt([...k][0] as string);
                      const primera = lineas.find(
                        (l) => l.idExtrusora === extId,
                      );
                      setProdForm((f) => ({
                        ...f,
                        idExtrusora: extId,
                        idLinea: primera?.id ?? f.idLinea,
                      }));
                    }}
                    size="sm"
                  >
                    {extrusoras.map((e) => (
                      <SelectItem key={String(e.id)}>{e.extrusora}</SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Línea"
                    selectedKeys={[String(prodForm.idLinea)]}
                    onSelectionChange={(k: Set<string>) =>
                      setProdForm((f) => ({
                        ...f,
                        idLinea: parseInt([...k][0] as string),
                      }))
                    }
                    size="sm"
                  >
                    {lineasDeExt.map((l) => (
                      <SelectItem key={String(l.id)}>{l.linea}</SelectItem>
                    ))}
                  </Select>
                </div>
                <Select
                  label="Tipo de producto"
                  selectedKeys={[String(prodForm.idTipo)]}
                  onSelectionChange={(k: Set<string>) =>
                    setProdForm((f) => ({
                      ...f,
                      idTipo: parseInt([...k][0] as string),
                    }))
                  }
                  size="sm"
                >
                  {useProductosStore.getState().tipos.map((t) => (
                    <SelectItem key={String(t.id)}>{t.formaTipo}</SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} size="sm">
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onPress={() => handleAddProducto(onClose)}
                  isDisabled={!prodForm.descripcion.trim()}
                  className="bg-amber-400 hover:bg-amber-500 text-white font-semibold"
                >
                  Crear producto
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

// ── ProductNode ───────────────────────────────────────────────────────────────

interface NodeProps {
  producto: Producto;
  expanded: Set<string>;
  toggle: (k: string) => void;
  selection: TreeSelection | null;
  isSelected: (level: string, id: number) => boolean;
  onSelect: (s: TreeSelection) => void;
  onAddMarco: (idProducto: number) => void;
  onAddHoja: (idMarco: number, idProducto: number) => void;
  onAddInterior: (idHoja: number, idMarco: number, idProducto: number) => void;
  onDeleteProducto: (id: number) => void;
  onDeleteMarco: (id: number) => void;
  onDeleteHoja: (id: number) => void;
  onDeleteInterior: (id: number) => void;
  getMarcos: (id: number) => Marco[];
  getHojas: (id: number) => Hoja[];
  getInteriores: (id: number) => Interior[];
  tipos: { id: number; formaTipo: string; orden: number }[];
}

function ProductNode({
  producto,
  expanded,
  toggle,
  isSelected,
  onSelect,
  onAddMarco,
  onAddHoja,
  onAddInterior,
  onDeleteProducto,
  onDeleteMarco,
  onDeleteHoja,
  onDeleteInterior,
  getMarcos,
  getHojas,
  getInteriores,
  tipos,
}: NodeProps) {
  const pKey = `p-${producto.id}`;
  const isPOpen = expanded.has(pKey);
  const marcos = getMarcos(producto.id);
  const tipo = tipos.find((t) => t.id === producto.idTipo);

  return (
    <div>
      <TreeRow
        depth={0}
        accentColor="amber"
        icon={<Layers className="w-3.5 h-3.5" />}
        label={producto.descripcion}
        badge={tipo?.formaTipo}
        isOpen={isPOpen}
        hasChildren
        isSelected={isSelected("producto", producto.id)}
        onToggle={() => toggle(pKey)}
        onClick={() => onSelect({ level: "producto", id: producto.id })}
        onAdd={() => onAddMarco(producto.id)}
        onDelete={() => onDeleteProducto(producto.id)}
        addLabel="Marco"
      />
      {isPOpen &&
        marcos.map((m) => {
          const mKey = `m-${m.id}`;
          const isMOpen = expanded.has(mKey);
          const hojas = getHojas(m.id);
          return (
            <div key={m.id}>
              <TreeRow
                depth={1}
                accentColor="blue"
                icon={<Box className="w-3 h-3" />}
                label={m.descripcion}
                isOpen={isMOpen}
                hasChildren
                isSelected={isSelected("marco", m.id)}
                onToggle={() => toggle(mKey)}
                onClick={() =>
                  onSelect({
                    level: "marco",
                    id: m.id,
                    idProducto: producto.id,
                  })
                }
                onAdd={() => onAddHoja(m.id, producto.id)}
                onDelete={() => onDeleteMarco(m.id)}
                addLabel="Hoja"
              />
              {isMOpen &&
                hojas.map((h) => {
                  const hKey = `h-${h.id}`;
                  const isHOpen = expanded.has(hKey);
                  const ints = getInteriores(h.id);
                  return (
                    <div key={h.id}>
                      <TreeRow
                        depth={2}
                        accentColor="emerald"
                        icon={<Grid2x2 className="w-3 h-3" />}
                        label={h.descripcion}
                        badge={`×${h.cantidad}`}
                        isOpen={isHOpen}
                        hasChildren
                        isSelected={isSelected("hoja", h.id)}
                        onToggle={() => toggle(hKey)}
                        onClick={() =>
                          onSelect({
                            level: "hoja",
                            id: h.id,
                            idMarco: m.id,
                            idProducto: producto.id,
                          })
                        }
                        onAdd={() => onAddInterior(h.id, m.id, producto.id)}
                        onDelete={() => onDeleteHoja(h.id)}
                        addLabel="Interior"
                      />
                      {isHOpen &&
                        ints.map((i) => (
                          <TreeRow
                            key={i.id}
                            depth={3}
                            accentColor="purple"
                            icon={<Square className="w-2.5 h-2.5" />}
                            label={i.descripcion}
                            isOpen={false}
                            hasChildren={false}
                            isSelected={isSelected("interior", i.id)}
                            onToggle={() => {}}
                            onClick={() =>
                              onSelect({
                                level: "interior",
                                id: i.id,
                                idHoja: h.id,
                                idMarco: m.id,
                                idProducto: producto.id,
                              })
                            }
                            onAdd={() => {}}
                            onDelete={() => onDeleteInterior(i.id)}
                            addLabel=""
                          />
                        ))}
                    </div>
                  );
                })}
            </div>
          );
        })}
    </div>
  );
}

// ── TreeRow ───────────────────────────────────────────────────────────────────

const ACCENT_DOT: Record<string, string> = {
  amber: "bg-amber-400",
  blue: "bg-blue-400",
  emerald: "bg-emerald-400",
  purple: "bg-purple-400",
};
const ACCENT_ICON: Record<string, string> = {
  amber: "text-amber-500",
  blue: "text-blue-500",
  emerald: "text-emerald-500",
  purple: "text-purple-500",
};

interface RowProps {
  depth: number;
  accentColor: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  isOpen: boolean;
  hasChildren: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onClick: () => void;
  onAdd: () => void;
  onDelete: () => void;
  addLabel: string;
}

function TreeRow({
  depth,
  accentColor,
  icon,
  label,
  badge,
  isOpen,
  hasChildren,
  isSelected,
  onToggle,
  onClick,
  onAdd,
  onDelete,
  addLabel,
}: RowProps) {
  const indent = depth * 14 + 6;

  return (
    <div
      className={clsx(
        "group relative flex items-center gap-1 pr-1.5 py-[5px] cursor-pointer transition-all select-none",
        isSelected
          ? "bg-steel-100 dark:bg-steel-800/80"
          : "hover:bg-steel-50 dark:hover:bg-steel-900/60",
      )}
      style={{ paddingLeft: `${indent}px` }}
    >
      {/* Barra de selección */}
      {isSelected && (
        <div
          className={clsx(
            "absolute left-0 top-0 bottom-0 w-0.5 rounded-r",
            ACCENT_DOT[accentColor],
          )}
        />
      )}

      {/* Chevron */}
      <button
        className="w-4 h-4 flex items-center justify-center shrink-0 text-steel-300 dark:text-steel-600 hover:text-steel-500 rounded transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) onToggle();
        }}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )
        ) : (
          <span className="w-3" />
        )}
      </button>

      {/* Dot de nivel */}
      <div
        className={clsx(
          "w-1.5 h-1.5 rounded-full shrink-0 transition-all",
          isSelected
            ? ACCENT_DOT[accentColor]
            : "bg-steel-200 dark:bg-steel-700",
        )}
      />

      {/* Icon */}
      <span
        className={clsx(
          "shrink-0 transition-colors",
          isSelected
            ? ACCENT_ICON[accentColor]
            : "text-steel-400 group-hover:text-steel-600 dark:group-hover:text-steel-300",
        )}
      >
        {icon}
      </span>

      {/* Label */}
      <span
        className={clsx(
          "flex-1 min-w-0 truncate text-xs leading-none py-0.5 transition-colors",
          isSelected
            ? "font-semibold text-steel-800 dark:text-steel-100"
            : "text-steel-600 dark:text-steel-400 group-hover:text-steel-800 dark:group-hover:text-steel-200",
        )}
        onClick={onClick}
      >
        {label}
      </span>

      {/* Badge */}
      {badge && (
        <span className="text-[9px] text-steel-400 dark:text-steel-600 shrink-0 font-mono bg-steel-100 dark:bg-steel-800 px-1 py-0.5 rounded">
          {badge}
        </span>
      )}

      {/* Actions — hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {addLabel && (
          <Tooltip content={`+ ${addLabel}`} size="sm">
            <button
              className="w-5 h-5 flex items-center justify-center rounded text-steel-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </Tooltip>
        )}
        <Tooltip content="Eliminar" size="sm">
          <button
            className="w-5 h-5 flex items-center justify-center rounded text-steel-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
