import { useEffect, useState, useMemo } from "react";
import {
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
  Button,
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
  Search,
  X,
  AlertCircle,
} from "lucide-react";
import clsx from "clsx";
import type { Producto, Marco, Hoja } from "@/types";
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
  useAddInterior,
  useDeleteInterior,
  useInterioresByHoja,
} from "@/hooks/productos/useInteriores";
import { ProductTreeSkeleton } from "./skeletons/ProductTreeSkeleton";

export type TreeSelection = {
  level: "producto" | "marco" | "hoja" | "interior";
  id: number;
  id_producto: number;
  id_marco: number;
  id_hoja: number;
};

interface ProductTreeProps {
  selection: TreeSelection | null;
  onSelect: (selection: TreeSelection | null) => void;
}

// ── Highlight helper ──────────────────────────────────────────────────────────
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-200 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 rounded-[2px] px-px not-italic"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// ── ProductTree (raíz) ────────────────────────────────────────────────────────
export default function ProductTree({ selection, onSelect }: ProductTreeProps) {
  const { data: productos = [], isLoading, isError } = useProductos();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Modales
  const productModal = useDisclosure();
  const marcoModal = useDisclosure();
  const hojaModal = useDisclosure();
  const interiorModal = useDisclosure();

  // IDs de referencia para creaciones subordinadas
  const [selectedProdId, setSelectedProdId] = useState<number | null>(null);
  const [selectedMarcoId, setSelectedMarcoId] = useState<number | null>(null);
  const [selectedHojaId, setSelectedHojaId] = useState<number | null>(null);

  // Estados de formularios
  const [selectedExtrusora, setSelectedExtrusora] = useState<string>("");
  const [newProd, setNewProd] = useState({
    descripcion: "",
    id_linea: "",
    id_tipo: "",
  });
  const [newMarco, setNewMarco] = useState({ descripcion: "" });
  const [newHoja, setNewHoja] = useState({ descripcion: "" });
  const [newInterior, setNewInterior] = useState({ descripcion: "" });

  // Catálogos
  const { data: extrusoras = [] } = useExtrusoras();
  const { data: lineas = [] } = useLineas();
  const { data: tipos = [] } = useTipos();

  // Mutations
  const createProducto = useCreateProducto();
  const createMarco = useCreateMarco();
  const createHoja = useCreateHoja();
  const addInterior = useAddInterior();

  const filteredProductos = useMemo(() => {
    if (!searchQuery.trim()) return productos;
    const q = searchQuery.toLowerCase();
    return productos.filter((p) => p.descripcion?.toLowerCase().includes(q));
  }, [productos, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900/50">
      {/* Error banner */}
      {isError && (
        <div className="px-3 py-2 bg-red-500/10 border-b border-red-200 dark:border-red-900 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Error al cargar los productos
        </div>
      )}

      {/* ── CABECERA Y BUSCADOR (SIEMPRE VISIBLES POR DISEÑO) ───────────────── */}
      <div className="px-3 pt-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 antialiased">
              Catálogo
            </h3>
            <span className="text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-md tabular-nums">
              {isLoading ? (
                <span className="inline-block w-3 h-2 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
              ) : (
                filteredProductos.length
              )}
              {!isLoading &&
                searchQuery &&
                productos.length !== filteredProductos.length && (
                  <span className="text-zinc-300 dark:text-zinc-600 font-medium">
                    {" "}
                    / {productos.length}
                  </span>
                )}
            </span>
          </div>
          <Tooltip content="Nuevo Producto" size="sm" closeDelay={100}>
            <button
              disabled={isLoading}
              onClick={productModal.onOpen}
              className="w-6 h-6 flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </Tooltip>
        </div>

        <div
          className={clsx(
            "flex items-center gap-2 rounded-lg px-2.5 h-8 transition-all border",
            searchFocused
              ? "bg-white dark:bg-zinc-900 border-amber-500 shadow-sm shadow-amber-100 dark:shadow-amber-900/20"
              : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800",
          )}
        >
          <Search
            className={clsx(
              "w-3 h-3 shrink-0 transition-colors",
              searchFocused || searchQuery ? "text-amber-500" : "text-zinc-400",
            )}
          />
          <input
            type="text"
            disabled={isLoading}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={
              isLoading ? "Cargando componentes..." : "Buscar producto..."
            }
            className="flex-1 bg-transparent text-xs text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none min-w-0 disabled:opacity-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-500 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── CONTENEDOR DEL ÁRBOL MÓVIL ─────────────────────────────────────── */}
      <div className="p-2 space-y-0.5 overflow-y-auto flex-1">
        {isLoading ? (
          /* Aquí se inyecta el esqueleto estructural de HeroUI sin perder la cabecera */
          <ProductTreeSkeleton />
        ) : (
          <>
            {filteredProductos.length === 0 && !searchQuery && (
              <div className="flex flex-col items-center gap-3 py-10 px-4 text-center animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Box className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-xs text-zinc-400">Sin productos aún</p>
                <button
                  onClick={productModal.onOpen}
                  className="text-[11px] font-semibold text-amber-500 hover:text-amber-600 underline underline-offset-2"
                >
                  Crear el primero
                </button>
              </div>
            )}

            {filteredProductos.map((producto) => (
              <ProductoNode
                key={producto.id}
                producto={producto}
                selection={selection}
                onSelect={onSelect}
                searchQuery={searchQuery}
                onAddMarco={() => {
                  setSelectedProdId(producto.id);
                  marcoModal.onOpen();
                }}
                onAddHoja={(marcoId) => {
                  setSelectedMarcoId(marcoId);
                  hojaModal.onOpen();
                }}
                onAddInterior={(hojaId) => {
                  setSelectedHojaId(hojaId);
                  interiorModal.onOpen();
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* ── Modal Producto ── */}
      <Modal
        isOpen={productModal.isOpen}
        onOpenChange={productModal.onOpenChange}
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="text-sm">Nuevo Producto</ModalHeader>
              <ModalBody>
                <Input
                  label="Descripción"
                  placeholder="ej: Ventana corrediza 2 hojas"
                  value={newProd.descripcion}
                  onValueChange={(v: string) =>
                    setNewProd({ ...newProd, descripcion: v })
                  }
                  autoFocus
                  size="sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Extrusora"
                    placeholder="Seleccionar extrusora"
                    size="sm"
                    selectedKeys={selectedExtrusora ? [selectedExtrusora] : []}
                    onSelectionChange={(keys: Set<string>) => {
                      const val = Array.from(keys)[0]?.toString() || "";
                      setSelectedExtrusora(val);
                      const lineasDeExt = lineas.filter(
                        (l) => l.id_extrusora.toString() === val,
                      );
                      if (lineasDeExt.length > 0) {
                        setNewProd((prev) => ({
                          ...prev,
                          id_linea: lineasDeExt[0].id.toString(),
                        }));
                      }
                    }}
                  >
                    {extrusoras.map((ex) => (
                      <SelectItem key={ex.id.toString()}>
                        {ex.extrusora}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Línea"
                    placeholder="Seleccionar línea"
                    selectedKeys={newProd.id_linea ? [newProd.id_linea] : []}
                    size="sm"
                    onSelectionChange={(keys: Set<string>) => {
                      const val = Array.from(keys)[0]?.toString() || "";
                      setNewProd((prev) => ({ ...prev, id_linea: val }));
                    }}
                  >
                    {lineas
                      .filter(
                        (l) =>
                          !selectedExtrusora ||
                          l.id_extrusora.toString() === selectedExtrusora,
                      )
                      .map((l) => (
                        <SelectItem key={l.id.toString()}>{l.linea}</SelectItem>
                      ))}
                  </Select>
                </div>
                <Select
                  label="Tipología"
                  placeholder="Seleccionar tipología"
                  selectedKeys={newProd.id_tipo ? [newProd.id_tipo] : []}
                  size="sm"
                  onSelectionChange={(keys: Set<string>) => {
                    const val = Array.from(keys)[0]?.toString() || "";
                    setNewProd((prev) => ({ ...prev, id_tipo: val }));
                  }}
                >
                  {tipos.map((t) => (
                    <SelectItem key={t.id.toString()}>
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
                  isDisabled={
                    !newProd.descripcion ||
                    !newProd.id_linea ||
                    !newProd.id_tipo ||
                    !selectedExtrusora // 👈 Asegurás que hayan elegido la extrusora antes de habilitar
                  }
                  className="bg-amber-400 hover:bg-amber-500 text-white font-semibold"
                  onPress={async () => {
                    try {
                      await createProducto.mutateAsync({
                        descripcion: newProd.descripcion,
                        id_linea: parseInt(newProd.id_linea),
                        id_tipo: parseInt(newProd.id_tipo),
                        id_extrusora: parseInt(selectedExtrusora), // 👈 Agregado para cumplir con Omit<Producto, "id">
                      });

                      setNewProd({
                        descripcion: "",
                        id_linea: "",
                        id_tipo: "",
                      });
                      setSelectedExtrusora("");
                      onClose();
                    } catch (error) {
                      console.error("Error al crear el producto:", error);
                    }
                  }}
                >
                  {createProducto.isPending ? "Creando..." : "Crear"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Modal Marco ── */}
      <Modal isOpen={marcoModal.isOpen} onOpenChange={marcoModal.onOpenChange}>
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="text-sm">Nuevo Marco</ModalHeader>
              <ModalBody>
                <Input
                  label="Descripción"
                  placeholder="Ej: Marco perimetral"
                  value={newMarco.descripcion}
                  onValueChange={(v: string) => setNewMarco({ descripcion: v })}
                  autoFocus
                  size="sm"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} size="sm">
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  // Añadimos createMarco.isPending para evitar doble click accidental
                  isDisabled={
                    !newMarco.descripcion ||
                    !selectedProdId ||
                    createMarco.isPending
                  }
                  className="bg-amber-400 hover:bg-amber-500 text-white font-semibold"
                  onPress={async () => {
                    try {
                      await createMarco.mutateAsync({
                        descripcion: newMarco.descripcion,
                        id_producto: selectedProdId!,
                        predeterminado: false, // 👈 Agregado para cumplir con el tipo Omit<Marco, "id">
                      });
                      setNewMarco({ descripcion: "" });
                      onClose();
                    } catch (error) {
                      console.error("Error al añadir el marco:", error);
                    }
                  }}
                >
                  {createMarco.isPending ? "Añadiendo..." : "Añadir Marco"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Modal Hoja ── */}
      <Modal isOpen={hojaModal.isOpen} onOpenChange={hojaModal.onOpenChange}>
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="text-sm">Nueva Hoja</ModalHeader>
              <ModalBody>
                <Input
                  label="Descripción"
                  placeholder="Ej: Hoja corrediza principal"
                  value={newHoja.descripcion}
                  onValueChange={(v: string) => setNewHoja({ descripcion: v })}
                  autoFocus
                  size="sm"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} size="sm">
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  // Añadimos createHoja.isPending para evitar doble click accidental
                  isDisabled={
                    !newHoja.descripcion ||
                    !selectedMarcoId ||
                    createHoja.isPending
                  }
                  className="bg-amber-400 hover:bg-amber-500 text-white font-semibold"
                  onPress={async () => {
                    try {
                      await createHoja.mutateAsync({
                        descripcion: newHoja.descripcion,
                        id_marco: selectedMarcoId!,
                        cantidad: 1, // 👈 Agregado: cantidad inicial por defecto
                        predeterminado: false, // 👈 Agregado: flag obligatorio para TS
                      });
                      setNewHoja({ descripcion: "" });
                      onClose();
                    } catch (error) {
                      console.error("Error al añadir la hoja:", error);
                    }
                  }}
                >
                  {createHoja.isPending ? "Añadiendo..." : "Añadir Hoja"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Modal Interior ── */}
      <Modal
        isOpen={interiorModal.isOpen}
        onOpenChange={interiorModal.onOpenChange}
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="text-sm">
                Nuevo Interior (Vidrio / Panel)
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Descripción"
                  placeholder="Ej: DVH 4-12-4 o Vidrio Entero 4mm"
                  value={newInterior.descripcion}
                  onValueChange={(v: string) =>
                    setNewInterior({ descripcion: v })
                  }
                  autoFocus
                  size="sm"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} size="sm">
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  isDisabled={
                    !newInterior.descripcion ||
                    !selectedHojaId ||
                    addInterior.isPending
                  }
                  className="bg-amber-400 hover:bg-amber-500 text-white font-semibold"
                  onPress={async () => {
                    try {
                      await addInterior.mutateAsync({
                        descripcion: newInterior.descripcion,
                        id_hoja: selectedHojaId!,
                        predeterminado: false, // 👈 Agregás esta propiedad obligatoria aquí
                      });
                      setNewInterior({ descripcion: "" });
                      onClose();
                    } catch (error) {
                      console.error("Error al añadir el interior:", error);
                    }
                  }}
                >
                  {addInterior.isPending ? "Añadiendo..." : "Añadir Interior"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

// ── ProductoNode ──────────────────────────────────────────────────────────────
function ProductoNode({
  producto,
  selection,
  onSelect,
  searchQuery,
  onAddMarco,
  onAddHoja,
  onAddInterior,
}: {
  producto: Producto;
  selection: TreeSelection | null;
  onSelect: (s: TreeSelection | null) => void;
  searchQuery: string;
  onAddMarco: () => void;
  onAddHoja: (marcoId: number) => void;
  onAddInterior: (hojaId: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: marcos = [], isLoading } = useMarcosByProducto(producto.id);
  const deleteProducto = useDeleteProducto();
  const isSelected =
    selection?.level === "producto" && selection.id === producto.id;

  useEffect(() => {
    if (selection?.id_producto === producto.id) setIsOpen(true);
  }, [selection, producto.id]);

  return (
    <div>
      <TreeItem
        label={producto.descripcion}
        icon={Box}
        depth={0}
        accentColor="amber"
        isSelected={isSelected}
        isOpen={isOpen}
        hasChildren={marcos.length > 0 || isLoading}
        badge="P"
        addLabel="Marco"
        searchQuery={searchQuery}
        onToggle={() => setIsOpen((o) => !o)}
        onClick={() =>
          onSelect({
            level: "producto",
            id: producto.id,
            id_producto: producto.id,
            id_marco: 0,
            id_hoja: 0,
          })
        }
        onAdd={onAddMarco}
        onDelete={async () => {
          if (confirm("¿Eliminar producto y toda su estructura?")) {
            await deleteProducto.mutateAsync(producto.id);
            if (isSelected) onSelect(null);
          }
        }}
      />
      {isOpen && (
        <div className="pl-3 border-l border-zinc-100 dark:border-zinc-800 ml-3 mt-0.5 space-y-0.5">
          {isLoading ? (
            <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-zinc-400">
              <Spinner size="sm" color="warning" /> Cargando marcos...
            </div>
          ) : marcos.length === 0 ? (
            <p className="text-[10px] text-zinc-400 italic px-2 py-1.5">
              Sin marcos
            </p>
          ) : (
            marcos.map((marco) => (
              <MarcoNode
                key={marco.id}
                marco={marco}
                productoId={producto.id}
                selection={selection}
                onSelect={onSelect}
                searchQuery={searchQuery}
                onAddHoja={onAddHoja}
                onAddInterior={onAddInterior}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── MarcoNode ─────────────────────────────────────────────────────────────────
function MarcoNode({
  marco,
  productoId,
  selection,
  onSelect,
  searchQuery,
  onAddHoja,
  onAddInterior,
}: {
  marco: Marco;
  productoId: number;
  selection: TreeSelection | null;
  onSelect: (s: TreeSelection | null) => void;
  searchQuery: string;
  onAddHoja: (marcoId: number) => void;
  onAddInterior: (hojaId: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: hojas = [], isLoading } = useHojasByMarco(marco.id);
  const deleteMarco = useDeleteMarco();
  const isSelected = selection?.level === "marco" && selection.id === marco.id;

  useEffect(() => {
    if (selection?.id_marco === marco.id) setIsOpen(true);
  }, [selection, marco.id]);

  return (
    <div>
      <TreeItem
        label={marco.descripcion}
        icon={Layers}
        depth={1}
        accentColor="blue"
        isSelected={isSelected}
        isOpen={isOpen}
        hasChildren={hojas.length > 0 || isLoading}
        badge="M"
        addLabel="Hoja"
        searchQuery={searchQuery}
        onToggle={() => setIsOpen((o) => !o)}
        onClick={() =>
          onSelect({
            level: "marco",
            id: marco.id,
            id_producto: productoId,
            id_marco: marco.id,
            id_hoja: 0,
          })
        }
        onAdd={() => onAddHoja(marco.id)}
        onDelete={async () => {
          if (confirm("¿Eliminar este marco?")) {
            await deleteMarco.mutateAsync(marco.id);
            if (isSelected) onSelect(null);
          }
        }}
      />
      {isOpen && (
        <div className="pl-3 border-l border-zinc-100 dark:border-zinc-800 ml-3 mt-0.5 space-y-0.5">
          {isLoading ? (
            <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-zinc-400">
              <Spinner size="sm" color="warning" /> Cargando hojas...
            </div>
          ) : hojas.length === 0 ? (
            <p className="text-[10px] text-zinc-400 italic px-2 py-1.5">
              Sin hojas
            </p>
          ) : (
            hojas.map((hoja) => (
              <HojaNode
                key={hoja.id}
                hoja={hoja}
                productoId={productoId}
                marcoId={marco.id}
                selection={selection}
                onSelect={onSelect}
                searchQuery={searchQuery}
                onAddInterior={onAddInterior}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── HojaNode ──────────────────────────────────────────────────────────────────
function HojaNode({
  hoja,
  productoId,
  marcoId,
  selection,
  onSelect,
  searchQuery,
  onAddInterior,
}: {
  hoja: Hoja;
  productoId: number;
  marcoId: number;
  selection: TreeSelection | null;
  onSelect: (s: TreeSelection | null) => void;
  searchQuery: string;
  onAddInterior: (hojaId: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: interiores = [], isLoading } = useInterioresByHoja(hoja.id);
  const deleteHoja = useDeleteHoja();
  const deleteInterior = useDeleteInterior();
  const isSelected = selection?.level === "hoja" && selection.id === hoja.id;

  useEffect(() => {
    if (selection?.id_hoja === hoja.id) setIsOpen(true);
  }, [selection, hoja.id]);

  return (
    <div>
      <TreeItem
        label={hoja.descripcion}
        icon={Grid2x2}
        depth={2}
        accentColor="emerald"
        isSelected={isSelected}
        isOpen={isOpen}
        hasChildren={interiores.length > 0 || isLoading}
        badge={`×${hoja.cantidad ?? 1}`}
        addLabel="Interior"
        searchQuery={searchQuery}
        onToggle={() => setIsOpen((o) => !o)}
        onClick={() =>
          onSelect({
            level: "hoja",
            id: hoja.id,
            id_producto: productoId,
            id_marco: marcoId,
            id_hoja: hoja.id,
          })
        }
        onAdd={() => onAddInterior(hoja.id)}
        onDelete={async () => {
          if (confirm("¿Eliminar esta hoja?")) {
            await deleteHoja.mutateAsync(hoja.id);
            if (isSelected) onSelect(null);
          }
        }}
      />
      {isOpen && (
        <div className="pl-3 border-l border-zinc-100 dark:border-zinc-800 ml-3 mt-0.5 space-y-0.5">
          {isLoading ? (
            <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-zinc-400">
              <Spinner size="sm" color="warning" /> Cargando interiores...
            </div>
          ) : interiores.length === 0 ? (
            <p className="text-[10px] text-zinc-400 italic px-2 py-1.5">
              Sin interiores
            </p>
          ) : (
            interiores.map((interior) => (
              <TreeItem
                key={interior.id}
                label={interior.descripcion || "Vidrio/Panel"}
                icon={Square}
                depth={3}
                accentColor="purple"
                isSelected={
                  selection?.level === "interior" &&
                  selection.id === interior.id
                }
                badge="I"
                searchQuery={searchQuery}
                onClick={() =>
                  onSelect({
                    level: "interior",
                    id: interior.id,
                    id_producto: productoId,
                    id_marco: marcoId,
                    id_hoja: hoja.id,
                  })
                }
                onDelete={async () => {
                  if (confirm("¿Eliminar este interior?")) {
                    await deleteInterior.mutateAsync(interior.id);
                    if (
                      selection?.level === "interior" &&
                      selection.id === interior.id
                    )
                      onSelect(null);
                  }
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── TreeItem (átomo) ──────────────────────────────────────────────────────────
const ACCENT_SELECTED_BG: Record<string, string> = {
  amber:
    "bg-amber-50   dark:bg-amber-950/30  border-amber-200/60  dark:border-amber-400/20",
  blue: "bg-blue-50    dark:bg-blue-950/30   border-blue-200/60   dark:border-blue-400/20",
  emerald:
    "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-400/20",
  purple:
    "bg-purple-50  dark:bg-purple-950/30  border-purple-200/60  dark:border-purple-400/20",
};

const ACCENT_ICON: Record<string, string> = {
  amber: "text-amber-500",
  blue: "text-blue-500",
  emerald: "text-emerald-500",
  purple: "text-purple-500",
};

const ACCENT_BAR: Record<string, string> = {
  amber: "bg-amber-400",
  blue: "bg-blue-400",
  emerald: "bg-emerald-400",
  purple: "bg-purple-400",
};

function TreeItem({
  label,
  icon: Icon,
  depth,
  accentColor,
  isSelected = false,
  isOpen,
  hasChildren,
  badge,
  addLabel,
  searchQuery,
  onToggle,
  onClick,
  onAdd,
  onDelete,
}: {
  label: string;
  icon: React.ElementType;
  depth: number;
  accentColor: string;
  isSelected?: boolean;
  isOpen?: boolean;
  hasChildren?: boolean;
  badge?: string;
  addLabel?: string;
  searchQuery: string;
  onToggle?: () => void;
  onClick: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "group relative flex items-center gap-1.5 pr-1.5 py-[5px] rounded-lg cursor-pointer select-none transition-all text-xs font-medium border",
        depth === 0 ? "pl-2" : "pl-2",
        isSelected
          ? clsx(ACCENT_SELECTED_BG[accentColor], "shadow-sm")
          : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400",
      )}
    >
      {/* Barra izquierda de selección */}
      {isSelected && (
        <div
          className={clsx(
            "absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full",
            ACCENT_BAR[accentColor],
          )}
        />
      )}

      {/* Botón chevron */}
      <div className="w-4 h-4 flex items-center justify-center shrink-0">
        {hasChildren && onToggle ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-0.5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {isOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        ) : (
          <span className="w-3" />
        )}
      </div>

      {/* Icono */}
      <Icon
        className={clsx(
          "w-3.5 h-3.5 shrink-0 transition-colors",
          isSelected
            ? ACCENT_ICON[accentColor]
            : "text-zinc-400 group-hover:text-zinc-500",
        )}
      />

      {/* Label con highlight */}
      <span
        className={clsx(
          "flex-1 truncate leading-none py-0.5 transition-colors",
          isSelected
            ? clsx("font-semibold", ACCENT_ICON[accentColor])
            : "text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200",
        )}
      >
        <HighlightText text={label} query={searchQuery} />
      </span>

      {/* Badge */}
      {badge && (
        <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded shrink-0">
          {badge}
        </span>
      )}

      {/* Acciones visibles en selección o desktop-hover (Solución táctil/móvil) */}
      <div
        className={clsx(
          "flex items-center gap-0.5 transition-opacity shrink-0",
          isSelected
            ? "opacity-100"
            : "opacity-40 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100",
        )}
      >
        {addLabel && onAdd && (
          <Tooltip content={`+ ${addLabel}`} size="sm">
            <button
              className="w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              <Plus className="w-3 h-3" />
            </button>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip content="Eliminar" size="sm">
            <button
              className="w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
