import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Chip,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
} from "@heroui/react";
import { Plus, Trash2, ShieldCheck, Lock, Layers } from "lucide-react";
import {
  useRoles,
  useCreateRol,
  useDeleteRol,
} from "@/hooks/usuarios/useRoles";
import { usePermisosDeRol, useSetPermiso } from "@/hooks/usuarios/usePermisos";
import { usePuede } from "@/hooks/usuarios/useMiPerfil";
import type { AccionPermiso, SeccionPermiso, Rol } from "@/types/index";
import clsx from "clsx";

const SECCIONES: { key: SeccionPermiso; label: string }[] = [
  { key: "inicio", label: "Inicio" },
  { key: "obras", label: "Obras" },
  { key: "productos", label: "Productos" },
  { key: "catalogos", label: "Catálogos" },
  { key: "opciones", label: "Opciones" },
  { key: "usuarios", label: "Usuarios" },
];

const ACCIONES: { key: AccionPermiso; label: string }[] = [
  { key: "ver", label: "Ver" },
  { key: "crear", label: "Crear" },
  { key: "editar", label: "Editar" },
  { key: "eliminar", label: "Eliminar" },
];

export default function RolesPermisosTab() {
  const { data: roles = [], isLoading: cargandoRoles } = useRoles();
  const { mutateAsync: createRol } = useCreateRol();
  const { mutateAsync: deleteRol } = useDeleteRol();

  const puedeEditar = usePuede("usuarios", "editar");
  const puedeCrear = usePuede("usuarios", "crear");
  const puedeEliminar = usePuede("usuarios", "eliminar");

  const [selectedRolId, setSelectedRolId] = useState<number | null>(null);

  // Selecciona automáticamente el primer rol disponible
  useEffect(() => {
    if (!selectedRolId && roles.length > 0) {
      setSelectedRolId(roles[0].id);
    }
  }, [roles, selectedRolId]);

  const selectedRol = roles.find((r) => r.id === selectedRolId) ?? null;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [newRol, setNewRol] = useState({ nombre: "", descripcion: "" });

  const handleCrearRol = async (close: () => void) => {
    if (!newRol.nombre.trim()) return;
    try {
      const creado = await createRol({
        nombre: newRol.nombre.trim(),
        descripcion: newRol.descripcion.trim() || null,
        bloqueado: false,
      });
      setSelectedRolId(creado.id);
      setNewRol({ nombre: "", descripcion: "" });
      close();
    } catch (error) {
      console.error("Error al crear el rol:", error);
    }
  };

  const handleEliminarRol = async (rol: Rol) => {
    try {
      await deleteRol(rol.id);
      if (selectedRolId === rol.id) setSelectedRolId(null);
    } catch (error) {
      console.error("Error al eliminar el rol:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Columna Izquierda: Lista de roles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Roles del sistema
          </h3>
          <Button
            size="sm"
            variant="flat"
            isDisabled={!puedeCrear}
            startContent={<Plus size={14} />}
            className="font-bold text-[11px] uppercase tracking-wider"
            onPress={onOpen}
          >
            Nuevo rol
          </Button>
        </div>

        <div className="space-y-2">
          {cargandoRoles && (
            <p className="text-xs text-zinc-400 py-4 text-center">
              Cargando roles...
            </p>
          )}
          {roles.map((rol) => (
            <Card
              key={rol.id}
              isPressable
              onPress={() => setSelectedRolId(rol.id)}
              className={clsx(
                "border rounded-xl shadow-none transition-colors",
                selectedRolId === rol.id
                  ? "border-lebaux-amber bg-amber-50/60 dark:bg-amber-500/5"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
              )}
            >
              <CardBody className="p-3.5 flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck
                    size={15}
                    className={clsx(
                      "shrink-0",
                      selectedRolId === rol.id
                        ? "text-lebaux-amber"
                        : "text-zinc-400",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                      {rol.nombre}
                    </p>
                    {rol.descripcion && (
                      <p className="text-[10px] text-zinc-400 truncate">
                        {rol.descripcion}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {rol.bloqueado && (
                    <Tooltip content="Rol protegido del sistema">
                      <Lock size={13} className="text-zinc-400" />
                    </Tooltip>
                  )}
                  <Tooltip
                    content={
                      rol.bloqueado
                        ? "No se puede eliminar un rol protegido"
                        : "Eliminar rol"
                    }
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      isDisabled={!puedeEliminar || rol.bloqueado}
                      className="w-7 h-7 min-w-7 rounded-lg text-zinc-400 hover:text-red-500"
                      onPress={() => handleEliminarRol(rol)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </Tooltip>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Columna Derecha: Matriz de permisos del rol seleccionado */}
      <div className="lg:col-span-2 space-y-4">
        {selectedRol ? (
          <PermisosMatrix rol={selectedRol} puedeEditar={puedeEditar} />
        ) : (
          <Card className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-none">
            <CardBody className="p-10 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Layers className="w-8 h-8 opacity-40" />
              <p className="text-xs font-semibold uppercase tracking-wider">
                Seleccioná un rol para ver sus permisos
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Modal: nuevo rol */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="font-display">Nuevo rol</ModalHeader>
              <ModalBody className="gap-3">
                <Input
                  label="Nombre del rol"
                  placeholder="ej: Supervisor de taller"
                  value={newRol.nombre}
                  onValueChange={(v: string) =>
                    setNewRol((f) => ({ ...f, nombre: v }))
                  }
                  size="sm"
                />
                <Textarea
                  label="Descripción"
                  placeholder="Para qué se usa este rol"
                  value={newRol.descripcion}
                  onValueChange={(v: string) =>
                    setNewRol((f) => ({ ...f, descripcion: v }))
                  }
                  size="sm"
                />
                <p className="text-[11px] text-zinc-400">
                  Después de crearlo, configurá sus permisos en la matriz de la
                  derecha.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  isDisabled={!newRol.nombre.trim()}
                  onPress={() => handleCrearRol(onClose)}
                >
                  Crear rol
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

// ─── Matriz de permisos para un rol ────────────────────────────────────────

function PermisosMatrix({
  rol,
  puedeEditar,
}: {
  rol: Rol;
  puedeEditar: boolean;
}) {
  const { data: permisos = [], isLoading } = usePermisosDeRol(rol.id);
  const { mutate: setPermiso } = useSetPermiso();

  const valorDe = (seccion: SeccionPermiso, accion: AccionPermiso) =>
    !!permisos.find((p) => p.seccion === seccion)?.[accion];

  const toggle = (
    seccion: SeccionPermiso,
    accion: AccionPermiso,
    actual: boolean,
  ) => {
    setPermiso({ id_rol: rol.id, seccion, accion, valor: !actual });
  };

  const editable = puedeEditar && !rol.bloqueado;

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-none">
      <CardBody className="p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              {rol.nombre}
              {rol.bloqueado && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="default"
                  startContent={<Lock size={11} />}
                  className="font-bold text-[10px] uppercase tracking-wider"
                >
                  Protegido
                </Chip>
              )}
            </h3>
            {rol.descripcion && (
              <p className="text-xs text-zinc-400 mt-0.5">{rol.descripcion}</p>
            )}
          </div>
        </div>

        {!editable && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            {rol.bloqueado
              ? "Este rol es protegido por el sistema y sus permisos no pueden modificarse."
              : "Tu rol actual no tiene permiso para editar permisos."}
          </p>
        )}

        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Sección
                </th>
                {ACCIONES.map((a) => (
                  <th
                    key={a.key}
                    className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400"
                  >
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {SECCIONES.map((s) => (
                <tr
                  key={s.key}
                  className="hover:bg-zinc-50/70 dark:hover:bg-zinc-950/30 transition-colors"
                >
                  <td className="px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {s.label}
                  </td>
                  {ACCIONES.map((a) => {
                    const activo = valorDe(s.key, a.key);
                    return (
                      <td key={a.key} className="px-4 py-2 text-center">
                        <Checkbox
                          isSelected={activo}
                          isDisabled={!editable || isLoading}
                          onValueChange={() => toggle(s.key, a.key, activo)}
                          aria-label={`${a.label} ${s.label}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
