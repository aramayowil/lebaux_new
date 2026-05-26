import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  Chip,
  Alert,
} from "@heroui/react";
import {
  Plus,
  Search,
  Folder,
  Trash2,
  Pencil,
  Phone,
  MapPin,
  AlertTriangle,
} from "lucide-react";

import type { Obra } from "@/types";
import {
  useAddObra,
  useDeleteObra,
  useObras,
  useUpdateObra,
} from "@/hooks/obra/useObras";

// ── 1. IMPORTACIÓN DEL NUEVO ESQUELETO MÓDULAR ────────────────────────────────
import ObrasPageSkeleton from "@/components/obras/skeletons/obrasSkeleton";

import { toastSuccess } from "@/utils/toasts/ToastSuccess";
import { toastError } from "@/utils/toasts/ToastError";
import { toastWarning } from "@/utils/toasts/ToastWarning";

const inputBase = {
  label:
    "font-bold text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider",
  inputWrapper:
    "border-zinc-200 dark:border-zinc-800 focus-within:!border-amber-500 rounded-xl bg-white dark:bg-zinc-900/50",
  input: "text-sm text-zinc-800 dark:text-zinc-200",
};

export default function ObrasPage() {
  const navigate = useNavigate();

  // --- Queries ---
  const { data: obras, isLoading, isError: loadError } = useObras();

  // --- Mutations ---
  const { mutateAsync: addObra, isPending: isAdding } = useAddObra();
  const { mutateAsync: updateObra, isPending: isUpdating } = useUpdateObra();
  const {
    mutateAsync: deleteObra,
    isPending: isDeleting,
    isError: deleteError,
  } = useDeleteObra();

  // --- UI States ---
  const {
    isOpen,
    onOpen,
    onOpenChange,
    onClose: closeFormModal,
  } = useDisclosure();
  const confirmDelete = useDisclosure();

  const [search, setSearch] = useState("");
  const [selectedObraId, setSelectedObraId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Obra | null>(null);
  const [form, setForm] = useState<Omit<Obra, "id">>({
    apellido: "",
    nombre: "",
    direccion: "",
    telefono: "",
    ciudad: "",
  });

  // --- Filtering ---
  const filtered = useMemo(() => {
    if (!obras) return [];
    const s = search.toLowerCase();
    return obras.filter((o) =>
      `${o.apellido} ${o.nombre} ${o.ciudad}`.toLowerCase().includes(s),
    );
  }, [obras, search]);

  // --- Handlers ---
  const openNew = () => {
    setEditing(null);
    setForm({
      apellido: "",
      nombre: "",
      direccion: "",
      telefono: "",
      ciudad: "",
    });
    onOpen();
  };

  const openEdit = (o: Obra) => {
    setEditing(o);
    setForm({ ...o });
    onOpen();
  };

  const handleDeleteClick = (id: number) => {
    setSelectedObraId(id);
    confirmDelete.onOpen();
  };

  const handleSave = async () => {
    if (!form.apellido.trim()) {
      toastError({
        title: "Validación",
        description: "El apellido es obligatorio",
      });
      return;
    }
    try {
      if (editing) {
        await updateObra({ id: editing.id, data: form });
        toastSuccess({
          title: "Éxito",
          description: "Obra actualizada correctamente",
        });
      } else {
        await addObra(form);
        toastSuccess({ title: "Éxito", description: "Nueva obra registrada" });
      }
      setTimeout(() => closeFormModal(), 500);
    } catch (error) {
      console.error("Error al procesar:", error);
    }
  };

  const confirmDeletion = async () => {
    if (!selectedObraId) return;
    try {
      await deleteObra(selectedObraId);
      toastWarning({
        title: "Eliminado",
        description: "El registro ha sido borrado",
      });
      confirmDelete.onClose();
    } catch (e) {
      console.error("Error al eliminar");
    }
  };

  // ── 2. SE REMOVIÓ EL CONDICIONAL SUPERIOR DE `isLoading` ───────────────────
  if (loadError)
    return (
      <div className="max-w-5xl mx-auto p-8">
        <Alert
          color="danger"
          title="Error de conexión"
          description="No se pudieron cargar los datos. Intentá de nuevo más tarde."
        />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 px-4 md:px-0 animate-in fade-in duration-400">
      {/* ── Header Consistente (Siempre renderizado y visible) ────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">
            Módulo de Obras
          </h2>
          <p className="text-zinc-400 text-xs mt-1 flex items-center gap-1.5 font-medium">
            {isLoading ? (
              // Indicador mínimo y sutil para la métrica mientras resuelve la consulta de base de datos
              <span className="inline-block w-20 h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            ) : (
              <>
                {obras?.length ?? 0}{" "}
                {(obras?.length ?? 0) === 1
                  ? "proyecto registrado en total"
                  : "proyectos registrados en total"}
              </>
            )}
          </p>
        </div>
        <Button
          onPress={openNew}
          startContent={<Plus className="w-4 h-4" strokeWidth={2.5} />}
          className="font-bold bg-amber-500 hover:bg-amber-600 text-white px-5 rounded-xl shadow-none transition-colors"
        >
          Nueva obra
        </Button>
      </header>

      {/* ── 3. INYECCIÓN DEL NUEVO ESQUELETO ABAJO DEL HEADER ───────────────── */}
      {isLoading ? (
        <ObrasPageSkeleton />
      ) : (
        <>
          {/* Filtros Avanzados */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Input
              isClearable
              placeholder="Buscar cliente o ciudad..."
              startContent={<Search className="w-4 h-4 text-zinc-400" />}
              value={search}
              onValueChange={setSearch}
              className="max-w-sm"
              variant="bordered"
              classNames={{
                input:
                  "text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400",
                inputWrapper: [
                  "border-zinc-200 dark:border-zinc-800",
                  "bg-white dark:bg-zinc-900/50",
                  "hover:border-amber-500",
                  "focus-within:!border-amber-500",
                  "rounded-xl h-10 transition-colors",
                ].join(" "),
              }}
            />
            {search && (
              <Chip
                variant="flat"
                className="bg-amber-500/10 border-0 text-[11px] font-bold text-amber-600 dark:text-amber-400"
              >
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </Chip>
            )}
          </div>

          {/* Tabla Unificada con Estilo de Dashboard */}
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden bg-white dark:bg-zinc-900/50">
            <Table
              aria-label="Tabla de obras"
              removeWrapper
              classNames={{
                th: [
                  "bg-zinc-50 dark:bg-zinc-950/40",
                  "text-[10px] font-bold uppercase tracking-widest",
                  "text-zinc-400 dark:text-zinc-500",
                  "border-b border-zinc-100 dark:border-zinc-800/60",
                  "py-3 px-5",
                ].join(" "),
                td: "py-0 px-5 border-b border-zinc-100 dark:border-zinc-800/40",
              }}
            >
              <TableHeader>
                <TableColumn>Cliente</TableColumn>
                <TableColumn>Ubicación</TableColumn>
                <TableColumn>Contacto</TableColumn>
                <TableColumn className="w-32 text-center">Acciones</TableColumn>
              </TableHeader>

              <TableBody
                emptyContent={
                  <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-2">
                      <Folder
                        className="w-5 h-5 text-zinc-400 dark:text-zinc-500"
                        strokeWidth={1.5}
                      />
                    </div>
                    <p className="font-bold text-md text-zinc-700 dark:text-zinc-300">
                      Sin proyectos todavía
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      Creá tu primera obra para comenzar el monitoreo
                    </p>
                  </div>
                }
              >
                {filtered.map((obra) => (
                  <TableRow
                    key={obra.id}
                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-950/40 transition-colors"
                  >
                    {/* Cliente */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                            {obra.apellido.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight text-xs">
                            {obra.apellido}
                          </p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                            {obra.nombre}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Ubicación */}
                    <TableCell className="py-3.5">
                      <div className="flex items-start gap-1.5">
                        <MapPin
                          className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0"
                          strokeWidth={1.8}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {obra.ciudad || "—"}
                          </p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate max-w-xs mt-0.5">
                            {obra.direccion || "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contacto */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        <Phone
                          className="w-3.5 h-3.5 shrink-0 text-zinc-400"
                          strokeWidth={1.5}
                        />
                        <span className="text-xs font-mono font-medium">
                          {obra.telefono || "Sin teléfono"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="py-3.5">
                      <div
                        className="flex items-center justify-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip content="Ver expediente" size="sm">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            className="w-7 h-7 min-w-7 rounded-lg text-zinc-400 hover:text-amber-500 bg-zinc-50 dark:bg-zinc-950/80 transition-colors"
                            onPress={() => navigate(`/obras/${obra.id}`)}
                          >
                            <Folder className="w-3.5 h-3.5" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Editar" size="sm">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            className="w-7 h-7 min-w-7 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-950/80 transition-colors"
                            onPress={() => openEdit(obra)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Eliminar" size="sm" color="danger">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            className="w-7 h-7 min-w-7 rounded-lg text-zinc-400 hover:text-red-500 bg-zinc-50 dark:bg-zinc-950/80 hover:bg-red-500/10 transition-colors"
                            onPress={() => handleDeleteClick(obra.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-950/20">
                <p className="text-[11px] font-mono font-bold text-zinc-400 dark:text-zinc-500">
                  MÉTRICA: Mostrando {filtered.length} de {obras?.length ?? 0}{" "}
                  obra
                  {(obras?.length ?? 0) !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Modal Crear / Editar ────────────────────────────────────────────── */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="xl"
        classNames={{
          base: "bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl",
          header: "border-b border-zinc-100 dark:border-zinc-800/60",
          closeButton:
            "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
        }}
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-0.5 pb-4">
                <h2 className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">
                  {editing ? "Editar Obra" : "Registrar Nueva Obra"}
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-normal">
                  Completá los campos mandatorios para el expediente técnico.
                </p>
              </ModalHeader>

              <ModalBody className="py-6 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Apellido"
                    labelPlacement="outside"
                    placeholder="Ej: García"
                    variant="bordered"
                    isRequired
                    value={form.apellido}
                    onValueChange={(v: string) =>
                      setForm({ ...form, apellido: v })
                    }
                    classNames={inputBase}
                  />
                  <Input
                    label="Nombre"
                    labelPlacement="outside"
                    placeholder="Ej: Carlos"
                    variant="bordered"
                    value={form.nombre}
                    onValueChange={(v: string) =>
                      setForm({ ...form, nombre: v })
                    }
                    classNames={inputBase}
                  />
                  <Input
                    label="Ciudad"
                    labelPlacement="outside"
                    placeholder="Ej: Tucumán"
                    variant="bordered"
                    value={form.ciudad}
                    onValueChange={(v: string) =>
                      setForm({ ...form, ciudad: v })
                    }
                    classNames={inputBase}
                  />
                  <Input
                    label="Teléfono"
                    labelPlacement="outside"
                    placeholder="Ej: 381 555-0100"
                    variant="bordered"
                    value={form.telefono}
                    onValueChange={(v: string) =>
                      setForm({ ...form, telefono: v })
                    }
                    classNames={inputBase}
                  />
                </div>
                <Input
                  label="Dirección completa"
                  labelPlacement="outside"
                  placeholder="Calle, número, barrio..."
                  variant="bordered"
                  value={form.direccion}
                  onValueChange={(v: string) =>
                    setForm({ ...form, direccion: v })
                  }
                  classNames={inputBase}
                />
              </ModalBody>

              <ModalFooter className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={isAdding || isUpdating}
                  className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  Cancelar
                </Button>
                <Button
                  isLoading={isAdding || isUpdating}
                  onPress={handleSave}
                  className="font-bold px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors text-xs"
                >
                  {editing ? "Guardar cambios" : "Crear obra"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Modal Confirmar Eliminación ─────────────────────────────────────── */}
      <Modal
        isOpen={confirmDelete.isOpen}
        onOpenChange={confirmDelete.onOpenChange}
        size="sm"
        classNames={{
          base: "bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl",
          closeButton:
            "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
        }}
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalBody className="pt-8 pb-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                  <AlertTriangle
                    className="w-5 h-5 text-red-500"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="text-md font-bold text-zinc-800 dark:text-zinc-100">
                  ¿Eliminar esta obra?
                </h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 leading-relaxed">
                  Esta acción no se puede deshacer y borrará permanentemente
                  todo el historial relacionado.
                </p>
                {deleteError && (
                  <p className="text-[11px] text-red-500 mt-3 font-medium bg-red-500/10 px-3 py-2 rounded-lg">
                    No se pudo procesar la eliminación en el servidor.
                  </p>
                )}
              </ModalBody>

              <ModalFooter className="flex-col sm:flex-row gap-2 pb-6 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                <Button
                  fullWidth
                  variant="light"
                  onPress={onClose}
                  className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  Cancelar
                </Button>
                <Button
                  fullWidth
                  isLoading={isDeleting}
                  onPress={confirmDeletion}
                  className="font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors text-xs"
                >
                  Confirmar Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
