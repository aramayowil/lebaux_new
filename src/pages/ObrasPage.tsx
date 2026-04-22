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
import { Plus, Search, Folder, Trash2, Pencil } from "lucide-react";
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Minimalista */}
      <div className="flex items-end justify-between border-b border-zinc-100 dark:border-zinc-900 pb-6">
        <div>
          <h2 className="font-sans text-3xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
            Obras
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Gestión de proyectos y presupuestos de clientes.
          </p>
        </div>
        <Button
          variant="flat"
          startContent={<Plus className="w-4 h-4" strokeWidth={2.5} />}
          onPress={openNew}
          className="font-sans font-medium bg-lebaux-amber-dark text-white dark:text-black px-6 rounded-full"
        >
          Nueva obra
        </Button>
      </div>

      {/* Buscador liviano */}
      <div className="max-w-md">
        <Input
          placeholder="Buscar cliente o ciudad..."
          value={search}
          onValueChange={setSearch}
          startContent={<Search className="w-4 h-4 text-zinc-400" />}
          variant="underlined"
          classNames={{
            input: "font-sans",
          }}
        />
      </div>

      {/* Tabla Estilo Boutique */}
      <div className="mt-4">
        <Table
          aria-label="Lista de obras"
          removeWrapper
          classNames={{
            th: "bg-transparent text-zinc-400 font-bold font-sans text-xs uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 py-4",
            td: "py-5 border-b border-zinc-50 dark:border-zinc-900 font-sans text-sm",
          }}
        >
          <TableHeader>
            <TableColumn>CLIENTE</TableColumn>
            <TableColumn>UBICACIÓN</TableColumn>
            <TableColumn>CONTACTO</TableColumn>
            <TableColumn className="w-20 text-left">ACCIONES</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={
              <div className="py-20 text-center text-zinc-400 dark:text-zinc-300">
                <Folder
                  className="w-12 h-12 mx-auto mb-4 opacity-20 text-zinc-900 dark:text-zinc-300"
                  strokeWidth={1}
                />
                <p className="font-sans font-bold text-lg">
                  No hay proyectos todavía
                </p>
              </div>
            }
          >
            {filtered.map((obra) => (
              <TableRow
                key={obra.id}
                className="group cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
              >
                <TableCell>
                  <span className="font-sans font-bold text-zinc-600 dark:text-zinc-200 uppercase tracking-tight">
                    {obra.apellido}, {obra.nombre}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                      {obra.ciudad || "—"}
                    </span>
                    <span className="text-xs text-zinc-400 truncate max-w-48">
                      {obra.direccion || "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-500 font-mono text-xs">
                  {obra.telefono || "—"}
                </TableCell>
                <TableCell>
                  <div
                    className="flex items-center justify-start gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Ver detalles - Azul suave / Zinc */}
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      radius="full"
                      className="text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                      onPress={() => navigate(`/obras/${obra.id}`)}
                      title="Ver detalles"
                    >
                      <Folder className="w-4 h-4" />
                    </Button>

                    {/* Editar - Zinc / Ambar */}
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      radius="full"
                      className="text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all"
                      onPress={() => openEdit(obra)}
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    {/* Eliminar - Rojo sutil */}
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      radius="full"
                      className="text-zinc-400 hover:text-danger hover:bg-danger/10 transition-all"
                      onPress={() => deleteObra(obra.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal - Input placement "outside" para mayor claridad */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="md"
        backdrop="blur"
        classNames={{
          base: "dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800",
          header: "font-display text-xl font-bold",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editing ? "Editar Información" : "Registrar Obra"}
              </ModalHeader>
              <ModalBody className="gap-5 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Apellido"
                    labelPlacement="outside"
                    placeholder="Escribí el apellido"
                    value={form.apellido}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, apellido: v }))
                    }
                    isRequired
                    variant="bordered"
                  />
                  <Input
                    label="Nombre"
                    labelPlacement="outside"
                    placeholder="Escribí el nombre"
                    value={form.nombre}
                    onValueChange={(v) => setForm((f) => ({ ...f, nombre: v }))}
                    variant="bordered"
                  />
                </div>
                <Input
                  label="Dirección"
                  labelPlacement="outside"
                  placeholder="Calle, número, barrio..."
                  value={form.direccion}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, direccion: v }))
                  }
                  variant="bordered"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ciudad"
                    labelPlacement="outside"
                    value={form.ciudad}
                    onValueChange={(v) => setForm((f) => ({ ...f, ciudad: v }))}
                    variant="bordered"
                  />
                  <Input
                    label="Teléfono"
                    labelPlacement="outside"
                    value={form.telefono}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, telefono: v }))
                    }
                    variant="bordered"
                  />
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-zinc-100 dark:border-zinc-800">
                <Button variant="light" onPress={onClose} className="font-sans">
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSave(onClose)}
                  className="font-sans font-bold px-8"
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
