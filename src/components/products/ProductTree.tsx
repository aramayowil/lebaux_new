import { useEffect, useState } from "react";
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
  Spinner,
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
  AlertCircle,
} from "lucide-react";
import clsx from "clsx";
import type { Producto, Marco, Hoja, Tipos } from "@/types";
import { useExtrusoras } from "@/hooks/catalogo/useExtrusoras";
import { useLineas } from "@/hooks/catalogo/useLineas";
import { useTipos } from "@/hooks/obra/useTipos";
import {
  useCreateProducto,
  useDeleteProducto,
  useProductos,
} from "@/hooks/productos/useProducto";
import {
  useCreateMarco,
  useDeleteMarco,
  useMarcosByProducto,
} from "@/hooks/productos/useMarco";
import {
  useCreateHoja,
  useDeleteHoja,
  useHojasByMarco,
} from "@/hooks/productos/useHojas";
import {
  useCreateInterior,
  useDeleteInterior,
  useInterioresByHoja,
} from "@/hooks/productos/useInteriores";
import ProductoPanelSkeleton from "./skeletons/ProductPanelSkeleton";
import { ProductTreeSkeleton } from "./skeletons/ProductTreeSkeletor";

export type TreeSelection =
  | { level: "producto"; id: number }
  | { level: "marco"; id: number; id_producto: number }
  | { level: "hoja"; id: number; id_marco: number; id_producto: number }
  | {
      level: "interior";
      id: number;
      id_hoja: number;
      id_marco: number;
      id_producto: number;
    };

interface Props {
  selection: TreeSelection | null;
  onSelect: (sel: TreeSelection) => void;
}

export default function ProductTree({ selection, onSelect }: Props) {
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
  const {
    data: tipos = [],
    isLoading: isLoadingTipos,
    isError: isErrorTipos,
  } = useTipos();

  const {
    data: productos = [],
    isLoading: isLoadingProductos,
    isError: isErrorProductos,
  } = useProductos();

  const isLoading =
    isLoadingExtrusoras ||
    isLoadingLineas ||
    isLoadingTipos ||
    isLoadingProductos;
  const isError =
    isErrorExtrusoras || isErrorLineas || isErrorTipos || isErrorProductos;

  const { mutateAsync: createProducto } = useCreateProducto();
  const { mutateAsync: deleteProducto } = useDeleteProducto();
  const { mutateAsync: createMarco } = useCreateMarco();
  const { mutateAsync: deleteMarco } = useDeleteMarco();
  const { mutateAsync: createHoja } = useCreateHoja();
  const { mutateAsync: deleteHoja } = useDeleteHoja();
  const { mutateAsync: createInterior } = useCreateInterior();
  const { mutateAsync: deleteInterior } = useDeleteInterior();

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
    id_extrusora: 0,
    id_linea: 0,
    id_tipo: 0,
  });

  const lineasDeExt = lineas.filter(
    (l) => l.id_extrusora === prodForm.id_extrusora,
  );

  async function handleAddProducto(close: () => void) {
    if (!prodForm.descripcion.trim()) return;
    const p = await createProducto(prodForm);
    onSelect({ level: "producto", id: p.id });
    setExpanded((s) => new Set([...s, `p-${p.id}`]));
    close();
  }

  async function handleAddMarco(id_producto: number) {
    const m = await createMarco({
      id_producto: id_producto,
      descripcion: "Marco nuevo",
      predeterminado: false,
    });
    setExpanded((s) => new Set([...s, `p-${id_producto}`, `m-${m.id}`]));
    onSelect({ level: "marco", id: m.id, id_producto });
  }

  async function handleAddHoja(id_marco: number, id_producto: number) {
    const h = await createHoja({
      id_marco: id_marco,
      descripcion: "Hoja nueva",
      cantidad: 1,
      predeterminado: false,
    });
    setExpanded((s) => new Set([...s, `m-${id_marco}`, `h-${h.id}`]));
    onSelect({ level: "hoja", id: h.id, id_marco, id_producto });
  }

  async function handleAddInterior(
    id_hoja: number,
    id_marco: number,
    id_producto: number,
  ) {
    const i = await createInterior({
      id_hoja: id_hoja,
      descripcion: "Interior nuevo",
      predeterminado: false,
    });
    onSelect({ level: "interior", id: i.id, id_hoja, id_marco, id_producto });
  }

  const isSelected = (level: string, id: number) =>
    selection?.level === level && selection.id === id;

  useEffect(() => {
    if (extrusoras.length > 0 && lineas.length > 0) {
      const primeraLinea = lineas.find(
        (l) => l.id_extrusora === extrusoras[0].id,
      );
      setProdForm((f) => ({
        ...f,
        id_extrusora: extrusoras[0].id,
        id_linea: primeraLinea?.id ?? f.id_linea,
        id_tipo: tipos[0]?.id ?? f.id_tipo,
      }));
    }
  }, [extrusoras, lineas, tipos]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-steel-950">
      {isError && (
        <div className="px-4 bg-red-500">
          <div className="text-white text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Error al cargar los productos
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="p-4">
          <ProductTreeSkeleton />
        </div>
      ) : (
        <>
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
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-lebaux-amber hover:bg-lebaux-amber-hover text-white transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto py-1">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-6">
                <ProductoPanelSkeleton />
                {/* <Spinner size="sm" color="warning" />
            <span className="text-xs text-steel-400">Cargando...</span> */}
              </div>
            )}
            {!isLoadingProductos && productos.length === 0 && (
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
                tipos={tipos}
              />
            ))}
          </div>
        </>
      )}

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
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Extrusora"
                    selectedKeys={String(prodForm.id_extrusora)}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const extId = parseInt(e.target.value);
                      const primera = lineas.find(
                        (l) => l.id_extrusora === extId,
                      );
                      setProdForm((f) => ({
                        ...f,
                        id_extrusora: extId,
                        id_linea: primera?.id ?? f.id_linea,
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
                    selectedKeys={String(prodForm.id_linea)}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setProdForm((f) => ({
                        ...f,
                        id_linea: parseInt(e.target.value),
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
                  selectedKeys={String(prodForm.id_tipo)}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setProdForm((f) => ({
                      ...f,
                      id_tipo: parseInt(e.target.value),
                    }))
                  }
                  size="sm"
                  isDisabled={tipos.length === 0}
                  placeholder={
                    tipos.length === 0 ? "Cargando..." : "Seleccioná un tipo"
                  }
                >
                  {tipos.map((t) => (
                    <SelectItem key={String(t.id)} textValue={t.forma_tipo}>
                      {t.forma_tipo}
                    </SelectItem>
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
                  isDisabled={
                    !prodForm.descripcion.trim() ||
                    !prodForm.id_extrusora ||
                    !prodForm.id_linea ||
                    !prodForm.id_tipo
                  }
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
  tipos: Tipos[];
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
  tipos,
}: NodeProps) {
  const pKey = `p-${producto.id}`;
  const isPOpen = expanded.has(pKey);
  const { data: marcos = [], isLoading: isLoadingMarcos } = useMarcosByProducto(
    producto.id,
  );
  const tipo = tipos.find((t) => t.id === producto.id_tipo);

  return (
    <div>
      {isLoadingMarcos && (
        <div className="flex items-center gap-2 px-4 py-1">
          <Spinner size="sm" color="warning" />
          <span className="text-xs text-steel-400">Cargando marcos...</span>
        </div>
      )}
      <TreeRow
        depth={0}
        accentColor="amber"
        icon={<Layers className="w-3.5 h-3.5" />}
        label={producto.descripcion}
        badge={tipo?.forma_tipo}
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
        marcos.map((m) => (
          // ✅ Fix 1: MarcoNode es un componente separado — hooks NO dentro de .map()
          <MarcoNode
            key={m.id}
            marco={m}
            producto={producto}
            expanded={expanded}
            toggle={toggle}
            isSelected={isSelected}
            onSelect={onSelect}
            onAddHoja={onAddHoja}
            onAddInterior={onAddInterior}
            onDeleteMarco={onDeleteMarco}
            onDeleteHoja={onDeleteHoja}
            onDeleteInterior={onDeleteInterior}
          />
        ))}
    </div>
  );
}

// ── MarcoNode ─────────────────────────────────────────────────────────────────

interface MarcoNodeProps {
  marco: Marco;
  producto: Producto;
  expanded: Set<string>;
  toggle: (k: string) => void;
  isSelected: (level: string, id: number) => boolean;
  onSelect: (s: TreeSelection) => void;
  onAddHoja: (idMarco: number, idProducto: number) => void;
  onAddInterior: (idHoja: number, idMarco: number, idProducto: number) => void;
  onDeleteMarco: (id: number) => void;
  onDeleteHoja: (id: number) => void;
  onDeleteInterior: (id: number) => void;
}

function MarcoNode({
  marco: m,
  producto,
  expanded,
  toggle,
  isSelected,
  onSelect,
  onAddHoja,
  onAddInterior,
  onDeleteMarco,
  onDeleteHoja,
  onDeleteInterior,
}: MarcoNodeProps) {
  const mKey = `m-${m.id}`;
  const isMOpen = expanded.has(mKey);
  // ✅ Hook llamado en el nivel del componente, no dentro de .map()
  const { data: hojas = [], isLoading: isLoadingHojas } = useHojasByMarco(m.id);

  return (
    <div>
      {isLoadingHojas && (
        <div className="flex items-center gap-2 px-8 py-1">
          <Spinner size="sm" color="warning" />
          <span className="text-xs text-steel-400">Cargando hojas...</span>
        </div>
      )}
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
          onSelect({ level: "marco", id: m.id, id_producto: producto.id })
        }
        onAdd={() => onAddHoja(m.id, producto.id)}
        onDelete={() => onDeleteMarco(m.id)}
        addLabel="Hoja"
      />
      {isMOpen &&
        hojas.map((h) => (
          // ✅ Fix 1: HojaNode es un componente separado
          <HojaNode
            key={h.id}
            hoja={h}
            marco={m}
            producto={producto}
            expanded={expanded}
            toggle={toggle}
            isSelected={isSelected}
            onSelect={onSelect}
            onAddInterior={onAddInterior}
            onDeleteHoja={onDeleteHoja}
            onDeleteInterior={onDeleteInterior}
          />
        ))}
    </div>
  );
}

// ── HojaNode ──────────────────────────────────────────────────────────────────

interface HojaNodeProps {
  hoja: Hoja;
  marco: Marco;
  producto: Producto;
  expanded: Set<string>;
  toggle: (k: string) => void;
  isSelected: (level: string, id: number) => boolean;
  onSelect: (s: TreeSelection) => void;
  onAddInterior: (idHoja: number, idMarco: number, idProducto: number) => void;
  onDeleteHoja: (id: number) => void;
  onDeleteInterior: (id: number) => void;
}

function HojaNode({
  hoja: h,
  marco: m,
  producto,
  expanded,
  toggle,
  isSelected,
  onSelect,
  onAddInterior,
  onDeleteHoja,
  onDeleteInterior,
}: HojaNodeProps) {
  const hKey = `h-${h.id}`;
  const isHOpen = expanded.has(hKey);
  // ✅ Hook llamado en el nivel del componente, no dentro de .map()
  const { data: ints = [] } = useInterioresByHoja(h.id);

  return (
    <div>
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
            id_marco: m.id,
            id_producto: producto.id,
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
                id_hoja: h.id,
                id_marco: m.id,
                id_producto: producto.id,
              })
            }
            onAdd={() => {}}
            onDelete={() => onDeleteInterior(i.id)}
            addLabel=""
          />
        ))}
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
      {isSelected && (
        <div
          className={clsx(
            "absolute left-0 top-0 bottom-0 w-0.5 rounded-r",
            ACCENT_DOT[accentColor],
          )}
        />
      )}
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
      <div
        className={clsx(
          "w-1.5 h-1.5 rounded-full shrink-0 transition-all",
          isSelected
            ? ACCENT_DOT[accentColor]
            : "bg-steel-200 dark:bg-steel-700",
        )}
      />
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
      {badge && (
        <span className="text-[9px] text-steel-400 dark:text-steel-600 shrink-0 font-mono bg-steel-100 dark:bg-steel-800 px-1 py-0.5 rounded">
          {badge}
        </span>
      )}
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
