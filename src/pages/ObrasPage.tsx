import { useState } from "react";
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
} from "@heroui/react";
import {
  Plus,
  Search,
  Folder,
  Trash2,
  Pencil,
  Phone,
  MapPin,
} from "lucide-react";
import { useObrasStore } from "@/store/obrasStore";
import type { Obra } from "@/types";

export default function ObrasPage() {
  const navigate = useNavigate();
  const { obras, addObra, updateObra, deleteObra } = useObrasStore();
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editing, setEditing] = useState<Obra | null>(null);
  const [form, setForm] = useState<Omit<Obra, "id">>({
    apellido: "",
    nombre: "",
    direccion: "",
    telefono: "",
    ciudad: "",
  });

  const filtered = obras.filter((o) =>
    `${o.apellido} ${o.nombre} ${o.ciudad}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function openNew() {
    setEditing(null);
    setForm({
      apellido: "",
      nombre: "",
      direccion: "",
      telefono: "",
      ciudad: "",
    });
    onOpen();
  }

  function openEdit(o: Obra) {
    setEditing(o);
    setForm({ ...o });
    onOpen();
  }

  function handleSave(close: () => void) {
    if (!form.apellido.trim()) return;
    if (editing) updateObra(editing.id, form);
    else addObra(form);
    close();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex items-end justify-between pb-6 border-b border-steel-100 dark:border-steel-800">
        <div>
          <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-steel-400 dark:text-steel-500 mb-1">
            Gestión de proyectos
          </p>
          <h2 className="font-display text-3xl font-bold text-steel-800 dark:text-steel-100 tracking-tight">
            Obras
          </h2>
          <p className="text-steel-500 dark:text-steel-400 text-sm mt-1 font-sans">
            {obras.length}{" "}
            {obras.length === 1
              ? "registro registrado"
              : "registros registrados"}
          </p>
        </div>
        <Button
          startContent={<Plus className="w-4 h-4" strokeWidth={2.5} />}
          onPress={openNew}
          className="font-sans font-bold bg-lebaux-amber hover:bg-lebaux-amber-hover text-white px-6 rounded-full"
        >
          Nueva obra
        </Button>
      </div>

      {/* ── Buscador ── */}
      <div className="max-w-sm">
        <Input
          placeholder="Buscar cliente o ciudad..."
          value={search}
          onValueChange={setSearch}
          startContent={<Search className="w-4 h-4 text-steel-400" />}
          variant="bordered"
          classNames={{
            input:
              "font-sans text-sm text-steel-700 dark:text-steel-200 placeholder:text-steel-400",
            inputWrapper: [
              "border-steel-200 dark:border-steel-700",
              "bg-white dark:bg-steel-900",
              "hover:border-lebaux-amber",
              "focus-within:!border-lebaux-amber",
              "rounded-xl h-10",
              "transition-colors",
            ].join(" "),
          }}
        />
      </div>

      {/* ── Tabla ── */}
      <div>
        <Table
          aria-label="Lista de obras"
          removeWrapper
          classNames={{
            th: [
              "bg-transparent",
              "text-steel-400 dark:text-steel-500",
              "font-sans font-bold text-[10px] uppercase tracking-widest",
              "border-b border-steel-100 dark:border-steel-800",
              "py-3 px-4",
            ].join(" "),
            td: "py-0 px-4 border-b border-steel-50 dark:border-steel-900",
          }}
        >
          <TableHeader>
            <TableColumn>Cliente</TableColumn>
            <TableColumn>Ubicación</TableColumn>
            <TableColumn>Contacto</TableColumn>
            <TableColumn className="w-28">Acciones</TableColumn>
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
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-lebaux-amber/10 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-mono font-bold text-lebaux-amber">
                        {obra.apellido.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-sans font-bold text-steel-700 dark:text-steel-200 uppercase tracking-tight text-sm">
                      {obra.apellido}, {obra.nombre}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-start gap-1.5">
                    <MapPin
                      className="w-3.5 h-3.5 text-steel-400 mt-0.5 shrink-0"
                      strokeWidth={1.5}
                    />
                    <div>
                      <span className="text-sm font-sans font-medium text-steel-700 dark:text-steel-300 block">
                        {obra.ciudad || "—"}
                      </span>
                      <span className="text-xs text-steel-400 dark:text-steel-500 truncate max-w-44 block font-sans">
                        {obra.direccion || "—"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-steel-500 dark:text-steel-400">
                    <Phone className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                    <span className="text-sm font-sans">
                      {obra.telefono || "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div
                    className="flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      radius="lg"
                      className="text-steel-400 hover:text-lebaux-amber hover:bg-lebaux-amber/10 transition-all w-8 h-8 min-w-8"
                      onPress={() => navigate(`/obras/${obra.id}`)}
                      title="Ver detalles"
                    >
                      <Folder className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      radius="lg"
                      className="text-steel-400 hover:text-steel-700 dark:hover:text-steel-200 hover:bg-steel-100 dark:hover:bg-steel-800 transition-all w-8 h-8 min-w-8"
                      onPress={() => openEdit(obra)}
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      radius="lg"
                      className="text-steel-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-8 h-8 min-w-8"
                      onPress={() => deleteObra(obra.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Modal ── */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="md"
        backdrop="blur"
        classNames={{
          base: "bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-800 rounded-2xl",
          header:
            "font-display text-xl font-bold text-steel-800 dark:text-steel-100 border-b border-steel-100 dark:border-steel-800 pb-4",
          closeButton:
            "text-steel-400 hover:text-steel-700 dark:hover:text-steel-200",
        }}
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader>
                {editing ? "Editar Obra" : "Registrar Obra"}
              </ModalHeader>
              <ModalBody className="gap-4 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Apellido"
                    labelPlacement="outside"
                    placeholder="Ej: García"
                    value={form.apellido}
                    onValueChange={(v: string) =>
                      setForm((f) => ({ ...f, apellido: v }))
                    }
                    isRequired
                    variant="bordered"
                    classNames={{
                      label:
                        "font-sans font-bold text-[11px] text-steel-500 uppercase tracking-wider",
                      inputWrapper:
                        "border-steel-200 dark:border-steel-700 focus-within:!border-lebaux-amber rounded-xl",
                      input: "font-sans text-sm",
                    }}
                  />
                  <Input
                    label="Nombre"
                    labelPlacement="outside"
                    placeholder="Ej: Carlos"
                    value={form.nombre}
                    onValueChange={(v: string) =>
                      setForm((f) => ({ ...f, nombre: v }))
                    }
                    variant="bordered"
                    classNames={{
                      label:
                        "font-sans font-bold text-[11px] text-steel-500 uppercase tracking-wider",
                      inputWrapper:
                        "border-steel-200 dark:border-steel-700 focus-within:!border-lebaux-amber rounded-xl",
                      input: "font-sans text-sm",
                    }}
                  />
                </div>
                <Input
                  label="Dirección"
                  labelPlacement="outside"
                  placeholder="Calle, número, barrio..."
                  value={form.direccion}
                  onValueChange={(v: string) =>
                    setForm((f) => ({ ...f, direccion: v }))
                  }
                  variant="bordered"
                  classNames={{
                    label:
                      "font-sans font-bold text-[11px] text-steel-500 uppercase tracking-wider",
                    inputWrapper:
                      "border-steel-200 dark:border-steel-700 focus-within:!border-lebaux-amber rounded-xl",
                    input: "font-sans text-sm",
                  }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ciudad"
                    labelPlacement="outside"
                    placeholder="Ej: Tucumán"
                    value={form.ciudad}
                    onValueChange={(v: string) =>
                      setForm((f) => ({ ...f, ciudad: v }))
                    }
                    variant="bordered"
                    classNames={{
                      label:
                        "font-sans font-bold text-[11px] text-steel-500 uppercase tracking-wider",
                      inputWrapper:
                        "border-steel-200 dark:border-steel-700 focus-within:!border-lebaux-amber rounded-xl",
                      input: "font-sans text-sm",
                    }}
                  />
                  <Input
                    label="Teléfono"
                    labelPlacement="outside"
                    placeholder="Ej: 381 555-0100"
                    value={form.telefono}
                    onValueChange={(v: string) =>
                      setForm((f) => ({ ...f, telefono: v }))
                    }
                    variant="bordered"
                    classNames={{
                      label:
                        "font-sans font-bold text-[11px] text-steel-500 uppercase tracking-wider",
                      inputWrapper:
                        "border-steel-200 dark:border-steel-700 focus-within:!border-lebaux-amber rounded-xl",
                      input: "font-sans text-sm",
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-steel-100 dark:border-steel-800 pt-4">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="font-sans text-steel-500 hover:text-steel-700 dark:hover:text-steel-200"
                >
                  Cancelar
                </Button>
                <Button
                  onPress={() => handleSave(onClose)}
                  className="font-sans font-bold px-8 bg-lebaux-amber hover:bg-lebaux-amber-hover text-white rounded-full transition-colors"
                >
                  {editing ? "Guardar cambios" : "Crear obra"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
