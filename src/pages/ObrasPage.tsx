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
import ObrasSkeleton from "@/components/obras/skeletons/obrasSkeleton";
import { toastSuccess } from "@/utils/toasts/ToastSuccess";
import { toastError } from "@/utils/toasts/ToastError";
import { toastWarning } from "@/utils/toasts/ToastWarning";

// ── Clases base de inputs reutilizables ───────────────────────────────────────
const inputBase = {
  label:
    "font-sans font-bold text-[11px] text-steel-500 dark:text-steel-400 uppercase tracking-wider",
  inputWrapper:
    "border-steel-200 dark:border-steel-700 focus-within:!border-lebaux-amber rounded-xl bg-white dark:bg-steel-900",
  input: "font-sans text-sm text-steel-700 dark:text-steel-200",
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

  // --- Render ---
  if (isLoading) return <ObrasSkeleton />;
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
    <div className="max-w-5xl mx-auto p-4 space-y-6 animate-in fade-in duration-500">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-steel-100 dark:border-steel-800">
        <div>
          <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-steel-400 dark:text-steel-500 mb-1">
            Gestión de proyectos
          </p>
          <h1 className="font-display text-3xl font-bold text-steel-800 dark:text-steel-100 tracking-tight">
            Obras
          </h1>
          <p className="text-steel-500 dark:text-steel-400 text-sm mt-1 font-sans">
            {obras?.length ?? 0}{" "}
            {(obras?.length ?? 0) === 1
              ? "proyecto registrado"
              : "proyectos registrados"}
          </p>
        </div>
        <Button
          onPress={openNew}
          startContent={<Plus className="w-4 h-4" strokeWidth={2.5} />}
          className="font-sans font-bold bg-lebaux-amber hover:bg-lebaux-amber-hover text-white px-6 rounded-full shadow-md shadow-lebaux-amber/20 transition-colors"
        >
          Nueva obra
        </Button>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input
          isClearable
          placeholder="Buscar cliente o ciudad..."
          startContent={<Search className="w-4 h-4 text-steel-400" />}
          value={search}
          onValueChange={setSearch}
          className="max-w-sm"
          variant="bordered"
          classNames={{
            input:
              "font-sans text-sm text-steel-700 dark:text-steel-200 placeholder:text-steel-400",
            inputWrapper: [
              "border-steel-200 dark:border-steel-700",
              "bg-white dark:bg-steel-900",
              "hover:border-lebaux-amber",
              "focus-within:!border-lebaux-amber",
              "rounded-xl h-10 transition-colors",
            ].join(" "),
          }}
        />
        {search && (
          <Chip
            variant="flat"
            classNames={{
              base: "bg-lebaux-amber/10 border-0",
              content: "text-[11px] font-sans font-bold text-lebaux-amber",
            }}
          >
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </Chip>
        )}
      </div>

      {/* ── Tabla ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-steel-100 dark:border-steel-800 overflow-hidden bg-white dark:bg-steel-900">
        <Table
          aria-label="Tabla de obras"
          removeWrapper
          classNames={{
            th: [
              "bg-steel-50 dark:bg-steel-950/60",
              "text-[10px] font-sans font-bold uppercase tracking-widest",
              "text-steel-400 dark:text-steel-500",
              "border-b border-steel-100 dark:border-steel-800",
              "py-3 px-5",
            ].join(" "),
            td: "py-0 px-5 border-b border-steel-50 dark:border-steel-900",
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
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-steel-100 dark:bg-steel-800 flex items-center justify-center mx-auto mb-4">
                  <Folder
                    className="w-7 h-7 text-steel-400 dark:text-steel-500"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="font-display font-bold text-lg text-steel-700 dark:text-steel-300">
                  Sin proyectos todavía
                </p>
                <p className="text-sm text-steel-400 dark:text-steel-500 font-sans mt-1">
                  Creá tu primera obra para comenzar
                </p>
              </div>
            }
          >
            {filtered.map((obra) => (
              <TableRow
                key={obra.id}
                className="group hover:bg-steel-50 dark:hover:bg-steel-800/40 transition-colors cursor-pointer"
              >
                {/* Cliente */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-lebaux-amber/10 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-mono font-bold text-lebaux-amber">
                        {obra.apellido.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-sans font-bold text-steel-800 dark:text-steel-100 uppercase tracking-tight text-sm">
                        {obra.apellido}
                      </p>
                      <p className="text-xs text-steel-400 dark:text-steel-500 font-sans">
                        {obra.nombre}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Ubicación */}
                <TableCell className="py-4">
                  <div className="flex items-start gap-2">
                    <MapPin
                      className="w-3.5 h-3.5 text-lebaux-amber mt-0.5 shrink-0"
                      strokeWidth={1.5}
                    />
                    <div>
                      <p className="text-sm font-sans font-medium text-steel-700 dark:text-steel-300">
                        {obra.ciudad || "—"}
                      </p>
                      <p className="text-[10px] text-steel-400 dark:text-steel-500 font-sans truncate max-w-44">
                        {obra.direccion || "—"}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Contacto */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-steel-500 dark:text-steel-400">
                    <Phone className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                    <span className="text-sm font-sans">
                      {obra.telefono || "Sin teléfono"}
                    </span>
                  </div>
                </TableCell>

                {/* Acciones */}
                <TableCell className="py-4">
                  <div
                    className="flex items-center justify-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip content="Ver expediente" size="sm">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        radius="lg"
                        className="w-8 h-8 min-w-8 text-steel-400 hover:text-lebaux-amber hover:bg-lebaux-amber/10 transition-all"
                        onPress={() => navigate(`/obras/${obra.id}`)}
                      >
                        <Folder className="w-3.5 h-3.5" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Editar" size="sm">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        radius="lg"
                        className="w-8 h-8 min-w-8 text-steel-400 hover:text-steel-700 dark:hover:text-steel-100 hover:bg-steel-100 dark:hover:bg-steel-800 transition-all"
                        onPress={() => openEdit(obra)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Eliminar" size="sm" color="danger">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        radius="lg"
                        className="w-8 h-8 min-w-8 text-steel-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
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

        {/* Footer conteo */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-steel-100 dark:border-steel-800 bg-steel-50/60 dark:bg-steel-950/40">
            <p className="text-[11px] font-sans text-steel-400 dark:text-steel-500">
              Mostrando {filtered.length} de {obras?.length ?? 0} obra
              {(obras?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* ── Modal crear / editar ────────────────────────────────────────────── */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="xl"
        classNames={{
          base: "bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-800 rounded-2xl",
          header: "border-b border-steel-100 dark:border-steel-800",
          closeButton:
            "text-steel-400 hover:text-steel-700 dark:hover:text-steel-200",
        }}
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-0.5 pb-4">
                <h2 className="font-display text-xl font-bold text-steel-800 dark:text-steel-100">
                  {editing ? "Editar obra" : "Registrar obra"}
                </h2>
                <p className="text-xs text-steel-400 dark:text-steel-500 font-sans font-normal">
                  Completá los campos para el expediente técnico.
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

              <ModalFooter className="border-t border-steel-100 dark:border-steel-800 pt-4">
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={isAdding || isUpdating}
                  className="font-sans text-steel-500 hover:text-steel-700 dark:hover:text-steel-200"
                >
                  Cancelar
                </Button>
                <Button
                  isLoading={isAdding || isUpdating}
                  onPress={handleSave}
                  className="font-sans font-bold px-8 bg-lebaux-amber hover:bg-lebaux-amber-hover text-white rounded-full transition-colors"
                >
                  {editing ? "Guardar cambios" : "Crear obra"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Modal confirmar eliminación ─────────────────────────────────────── */}
      <Modal
        isOpen={confirmDelete.isOpen}
        onOpenChange={confirmDelete.onOpenChange}
        size="sm"
        classNames={{
          base: "bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-800 rounded-2xl",
          closeButton:
            "text-steel-400 hover:text-steel-700 dark:hover:text-steel-200",
        }}
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalBody className="pt-8 pb-4 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                  <AlertTriangle
                    className="w-6 h-6 text-red-500"
                    strokeWidth={1.8}
                  />
                </div>
                <h3 className="font-display text-lg font-bold text-steel-800 dark:text-steel-100">
                  ¿Eliminar esta obra?
                </h3>
                <p className="text-sm text-steel-500 dark:text-steel-400 font-sans mt-1 leading-relaxed">
                  Esta acción no se puede deshacer y borrará todo el historial
                  relacionado.
                </p>
                {deleteError && (
                  <p className="text-xs text-red-500 mt-3 font-sans font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                    No se pudo procesar la eliminación.
                  </p>
                )}
              </ModalBody>

              <ModalFooter className="flex-col sm:flex-row gap-2 pb-6 pt-2 border-t border-steel-100 dark:border-steel-800">
                <Button
                  fullWidth
                  variant="light"
                  onPress={onClose}
                  className="font-sans text-steel-500 hover:text-steel-700 dark:hover:text-steel-200 rounded-full"
                >
                  Cancelar
                </Button>
                <Button
                  fullWidth
                  isLoading={isDeleting}
                  onPress={confirmDeletion}
                  className="font-sans font-bold bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                >
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
