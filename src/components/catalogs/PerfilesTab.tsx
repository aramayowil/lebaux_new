import { useCallback, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
} from "@heroui/react";
import { EllipsisVertical, Search } from "lucide-react";
import { Select } from "@heroui/react";
import { SelectItem } from "@heroui/react";
import { formatPesos } from "@/lib/calculoDespiece";
import { Modal } from "@heroui/react";
import { ModalContent } from "@heroui/react";
import { ModalHeader } from "@heroui/react";
import { ModalBody } from "@heroui/react";
import { ModalFooter } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import { NumberInput } from "@heroui/react";
import { Perfil } from "@/types";
import { useMonedas } from "@/hooks/catalogo/useMonedas";
import { useExtrusoras } from "@/hooks/catalogo/useExtrusoras";
import { useLineas } from "@/hooks/catalogo/useLineas";
import {
  useCreatePerfil,
  useDeletePerfil,
  usePerfiles,
  useUpdatePerfil,
} from "@/hooks/catalogo/usePerfiles";

type ColumnKey = keyof Perfil | "precioTira" | "actions";

interface Column {
  uid: ColumnKey;
  name: string;
}

export const columns: Column[] = [
  { name: "N° PERFIL", uid: "nro_perfil" },
  { name: "DESCRIPCIÓN", uid: "descri" },
  { name: "EXTRUSORA / LÍNEA", uid: "id_linea" },
  { name: "KG/M", uid: "peso_metro" },
  { name: "TIRA MM", uid: "long_tira" },
  { name: "$/KG", uid: "precio_kg" },
  { name: "MIN. UTIL", uid: "minimo_reutilizable" },
  { name: "CUBRE", uid: "cubre" },
  { name: "", uid: "actions" },
];

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function PerfilesTab() {
  const { data: monedas = [], isLoading: isLoadingMonedas } = useMonedas();
  const { data: extrusoras = [], isLoading: isLoadingExtrusoras } =
    useExtrusoras();
  const { data: lineas = [], isLoading: isLoadingLineas } = useLineas();

  const selectDefaultExt = extrusoras.length > 0 ? extrusoras[0].id : 0;

  const FORM_INITIAL_STATE: Omit<Perfil, "id"> = useMemo(
    () => ({
      nro_perfil: "",
      descri: "",
      peso_metro: 0,
      long_tira: 6000,
      precio_kg: 0,
      id_moneda: monedas?.length > 0 ? monedas[0].id : 0,
      id_linea:
        lineas?.length > 0
          ? lineas.find((l) => l.id_extrusora === selectDefaultExt)?.id || 0
          : 0,
      cubre: 0,
      minimo_reutilizable: 500,
      interior: false,
      es_camara_europea: false,
    }),
    [monedas, lineas, selectDefaultExt],
  );
  const { data: perfiles = [], isLoading: isLoadingPerfiles } = usePerfiles();
  const { mutateAsync: createPerfil } = useCreatePerfil();
  const { mutateAsync: updatePerfil } = useUpdatePerfil();
  const { mutateAsync: deletePerfil } = useDeletePerfil();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [newForm, setNewForm] =
    useState<Omit<Perfil, "id">>(FORM_INITIAL_STATE);

  const [selectedKeysExt, setSelectedKeysExt] = useState<string>("");
  const [selectedKeysLinea, setSelectedKeysLinea] = useState<string>("");

  const [filterValue, setFilterValue] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const toPesos = (precio: number, monedaId: number) => {
    const m = monedas.find((x) => x.id === monedaId);
    return precio * (m?.cotizacion ?? 1);
  };

  const isLoading =
    isLoadingPerfiles ||
    isLoadingLineas ||
    isLoadingExtrusoras ||
    isLoadingMonedas;

  const handleSave = async (onClose: () => void) => {
    try {
      if (isEditMode && editingId !== null) {
        await updatePerfil({ ...newForm, id: editingId });
      } else {
        await createPerfil(newForm);
      }
      setEditingId(null);
      setNewForm(FORM_INITIAL_STATE);
      onClose();
    } catch (error) {
      console.error("Error al guardar perfil:", error);
    }
  };

  // --- Función para limpiar y abrir como Nuevo ---
  const handleOpenNew = () => {
    const defaultExtId = extrusoras.length > 0 ? String(extrusoras[0].id) : "";
    // Buscamos la primera línea de esa extrusora
    const firstLinea = lineas.find(
      (l) => l.id_extrusora === Number(defaultExtId),
    );

    setNewForm({
      ...FORM_INITIAL_STATE,
      id_linea: firstLinea?.id || 0,
      id_moneda: monedas[0]?.id || 0,
    });
    setSelectedKeysExt(defaultExtId);
    setSelectedKeysLinea(String(firstLinea?.id || ""));
    setIsEditMode(false); // Asegúrate de tener este estado para el handleSave
    onOpen();
  };

  const [editingId, setEditingId] = useState<number | null>(null);

  // --- Función para Editar ---
  const handleEditPerfil = (perfil: Perfil) => {
    const lineaDoc = lineas.find((l) => l.id === perfil.id_linea);

    const extrusoraId = String(lineaDoc?.id_extrusora || "");
    setSelectedKeysExt(extrusoraId);
    setSelectedKeysLinea(String(perfil.id_linea));

    const { id, ...perfilSinId } = perfil; // ← separamos id
    setEditingId(id); // ← guardamos id aparte
    setNewForm(perfilSinId);
    setIsEditMode(true);
    onOpen();
  };

  // --- Función para Borrar ---
  const handleDeletePerfil = async (id: number) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar este perfil?`,
    );

    if (!confirmar) return;

    try {
      await deletePerfil(id);

      if (editingId === id) {
        // ← comparamos por id
        setNewForm(FORM_INITIAL_STATE);
        setEditingId(null);
        setSelectedKeysExt("");
        setSelectedKeysLinea("");
      }
    } catch (error) {
      console.error("Error al eliminar perfil:", error);
      alert(
        "No se pudo eliminar el perfil. Es posible que esté siendo usado en un presupuesto.",
      );
    }
  };

  //aca metemos el buscar por columnas y filtrado
  const filteredItems = useMemo(() => {
    if (isLoading) return [];
    let filteredPerfiles = [...perfiles];

    // FILTRO POR BUSCADOR (Nro Perfil o Descripción)
    if (hasSearchFilter) {
      filteredPerfiles = filteredPerfiles.filter(
        (perfil) =>
          (perfil.nro_perfil ?? "")
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          (perfil.descri ?? "")
            .toLowerCase()
            .includes(filterValue.toLowerCase()),
      );
    }

    return filteredPerfiles;
  }, [perfiles, filterValue, isLoading]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const renderCell = useCallback(
    (item: Perfil, columnKey: React.Key) => {
      const key = columnKey as ColumnKey;

      switch (key) {
        case "nro_perfil":
          return (
            <div className="capitalize">
              <Chip variant="flat" color="default" size="sm" radius="sm">
                {item.nro_perfil}
              </Chip>
            </div>
          );
        case "descri":
          return <div className="capitalize text-sm">{item.descri}</div>;
        case "id_linea":
          const lineaDoc = lineas.find((l) => l.id === item.id_linea);
          const extrusoraDoc = extrusoras.find(
            (e) => e.id === lineaDoc?.id_extrusora,
          );
          return (
            <div className="flex flex-col">
              <span className="text-xs font-medium">
                {lineaDoc?.linea || "S/L"}
              </span>
              <span className="text-[10px] text-steel-400 uppercase tracking-wider">
                {extrusoraDoc?.extrusora || "Sin extrusora"}
              </span>
            </div>
          );
        case "peso_metro":
          return (
            <div className="capitalize font-mono text-sm">
              {item.peso_metro}
            </div>
          );
        case "long_tira":
          return (
            <div className="capitalize font-mono text-sm">{item.long_tira}</div>
          );
        case "precio_kg":
          return (
            <div className="capitalize font-mono text-sm">
              {formatPesos(item.precio_kg ?? 0)}
            </div>
          );
        case "precioTira":
          return (
            <Chip
              variant="flat"
              color="default"
              size="sm"
              radius="sm"
              className="font-mono text-xs"
            >
              {formatPesos(
                toPesos(
                  ((item.precio_kg ?? 0) *
                    (item.peso_metro ?? 0) *
                    (item.long_tira ?? 0)) /
                    1000,
                  item.id_moneda ?? 1,
                ),
              )}
            </Chip>
          );
        case "cubre":
          return (
            <div className=" font-mono text-sm">
              {item.cubre}{" "}
              <span className="text-[11px] text-steel-400 shrink-0">mm</span>
            </div>
          );
        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="edit" onPress={() => handleEditPerfil(item)}>
                  Editar
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  onPress={() => handleDeletePerfil(item.id)}
                >
                  Eliminar
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );
        default:
          return item[key as keyof Perfil];
      }
    },
    [lineas, extrusoras, handleEditPerfil, handleDeletePerfil, toPesos],
  );

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    [],
  );

  const onSearchChange = useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap sm:flex-nowrap justify-between gap-3 items-end">
          {/* Buscador: Ocupa el espacio disponible a la izquierda */}
          <Input
            isClearable
            className="w-full sm:max-w-[340px]"
            placeholder="Buscar n° perfil o descripción..."
            startContent={<Search className="text-default-300" size={18} />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
            variant="bordered"
          />

          {/* Grupo de Filtros y Acción */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              onPress={handleOpenNew}
              className="font-medium bg-lebaux-amber-hover text-zinc-900"
            >
              Nuevo Perfil
            </Button>
          </div>
        </div>
        <div className="flex justify-end items-center">
          <label className="flex items-center text-default-400 text-small">
            Perfiles por página:
            <select
              className="bg-transparent outline-solid outline-transparent text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    onRowsPerPageChange,
    perfiles.length,
    onSearchChange,
    hasSearchFilter,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-500">
          {filteredItems.length > 0
            ? "Total: " + filteredItems.length + " perfiles"
            : "No hay perfiles cargados"}
        </span>
        <Pagination
          isCompact
          showControls
          page={page}
          total={pages}
          onChange={setPage}
          classNames={{
            cursor: "bg-lebaux-amber-hover text-zinc-900 dark:text-zinc-200",
          }}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Anterior
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Siguiente
          </Button>
        </div>
      </div>
    );
  }, [items.length, page, pages, hasSearchFilter]);

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[382px]",
        }}
        selectionMode="single"
        topContent={topContent}
        topContentPlacement="outside"
      >
        <TableHeader columns={columns}>
          {(column: Column) => (
            <TableColumn key={column.uid} align="start">
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={!isLoading ? "No hay perfiles cargados" : null}
          items={items}
          isLoading={isLoading}
          loadingContent={
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-small text-default-400">
                Cargando catálogo...
              </p>
            </div>
          }
        >
          {(item: Perfil) => (
            <TableRow key={item.nro_perfil}>
              {(columnKey: string) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal nuevo */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="font-display">
                {isEditMode ? "Editar perfil" : "Nuevo perfil"}
              </ModalHeader>
              <ModalBody className="gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="N° Perfil *"
                    placeholder="ej: 001"
                    value={newForm.nro_perfil}
                    onValueChange={(v: string) =>
                      setNewForm((f) => ({ ...f, nro_perfil: v }))
                    }
                    size="sm"
                    description="Identificador único"
                  />
                  <Input
                    label="Descripción *"
                    placeholder="ej: Marco inferior"
                    value={newForm.descri}
                    onValueChange={(v: string) =>
                      setNewForm((f) => ({ ...f, descri: v }))
                    }
                    size="sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <NumberInput
                    label="Peso (kg/m)"
                    value={newForm.peso_metro}
                    onValueChange={(v: number) =>
                      setNewForm((f) => ({
                        ...f,
                        peso_metro: parseFloat(String(v)) || 0,
                      }))
                    }
                    size="sm"
                    endContent={
                      <span className="text-xs text-steel-400">kg/m</span>
                    }
                  />
                  <NumberInput
                    label="Long. tira"
                    value={newForm.long_tira}
                    onValueChange={(v: number) =>
                      setNewForm((f) => ({
                        ...f,
                        long_tira: parseInt(String(v)) || 6000,
                      }))
                    }
                    size="sm"
                    endContent={
                      <span className="text-xs text-steel-400">mm</span>
                    }
                  />
                  <NumberInput
                    label="Cubre"
                    value={newForm.cubre}
                    onValueChange={(v: number) =>
                      setNewForm((f) => ({
                        ...f,
                        cubre: parseInt(String(v)) || 0,
                      }))
                    }
                    size="sm"
                    endContent={
                      <span className="text-xs text-steel-400">mm</span>
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput
                    label="Precio / kg"
                    value={newForm.precio_kg}
                    onValueChange={(v: number) =>
                      setNewForm((f) => ({
                        ...f,
                        precio_kg: parseFloat(String(v)) || 0,
                      }))
                    }
                    size="sm"
                  />

                  <NumberInput
                    label="Min. Reutilizable"
                    value={newForm.minimo_reutilizable}
                    onValueChange={(v: number) =>
                      setNewForm((f) => ({
                        ...f,
                        minimo_reutilizable: parseInt(String(v)) || 0,
                      }))
                    }
                    size="sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Select
                    label="Extrusora"
                    selectedKeys={selectedKeysExt ? [selectedKeysExt] : []}
                    onSelectionChange={(keys: Set<string>) => {
                      const val = Array.from(keys)[0] as string;
                      setSelectedKeysExt(val);

                      // Al cambiar extrusora, reseteamos la línea a la primera disponible de esa extrusora
                      const primeraLinea = lineas.find(
                        (l) => l.id_extrusora === Number(val),
                      );
                      const newLineaId = primeraLinea?.id || 0;

                      setSelectedKeysLinea(String(newLineaId));
                      setNewForm((f) => ({ ...f, id_linea: newLineaId }));
                    }}
                    size="sm"
                  >
                    {extrusoras.map((e) => (
                      <SelectItem key={String(e.id)}>{e.extrusora}</SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Línea"
                    selectedKeys={selectedKeysLinea ? [selectedKeysLinea] : []}
                    onSelectionChange={(keys: Set<string>) => {
                      const val = Array.from(keys)[0] as string;
                      setSelectedKeysLinea(val);
                      setNewForm((f) => ({ ...f, id_linea: Number(val) }));
                    }}
                    size="sm"
                    isDisabled={!selectedKeysExt} // Deshabilitar si no hay extrusora
                  >
                    {lineas
                      .filter((l) => l.id_extrusora === Number(selectedKeysExt))
                      .map((l) => (
                        <SelectItem key={String(l.id)} textValue={l.linea}>
                          {l.linea}
                        </SelectItem>
                      ))}
                  </Select>
                  <Select
                    label="Moneda"
                    selectedKeys={
                      newForm.id_moneda !== 0 ? [String(newForm.id_moneda)] : []
                    }
                    onSelectionChange={(keys: Set<string>) => {
                      const selected = Array.from(keys)[0] as string;
                      setNewForm((f) => ({
                        ...f,
                        id_moneda: parseInt(selected),
                      }));
                    }}
                    size="sm"
                  >
                    {monedas.map((m) => (
                      <SelectItem key={String(m.id)} textValue={m.descripcion}>
                        {m.descripcion}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                {(newForm.peso_metro ?? 0) > 0 &&
                  (newForm.long_tira ?? 0) > 0 && (
                    <div className="bg-steel-50 dark:bg-steel-800/60 rounded-lg px-4 py-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-steel-400 mb-0.5">
                          Peso de tira completa
                        </p>
                        <p className="font-mono font-semibold text-steel-700 dark:text-steel-200">
                          {(
                            ((newForm.peso_metro ?? 0) *
                              (newForm.long_tira ?? 0)) /
                            1000
                          ).toFixed(3)}{" "}
                          kg
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-steel-400 mb-0.5">
                          Precio de tira completa
                        </p>
                        <p className="font-mono font-semibold text-steel-700 dark:text-steel-200">
                          {formatPesos(
                            toPesos(
                              ((newForm.precio_kg ?? 0) *
                                (newForm.peso_metro ?? 0) *
                                (newForm.long_tira ?? 0)) /
                                1000,
                              newForm.id_moneda ?? 1,
                            ),
                          )}
                        </p>
                      </div>
                    </div>
                  )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSave(onClose)}
                  isDisabled={
                    !(newForm.nro_perfil ?? "").trim() ||
                    !(newForm.descri ?? "").trim()
                  }
                >
                  {isEditMode ? "Guardar cambios" : "Crear perfil"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
