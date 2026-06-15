import { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  User,
  Chip,
  Select,
  SelectItem,
  Switch,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Skeleton,
  Spinner,
} from "@heroui/react";
import {
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useUsuarios,
  useUpdateUsuario,
  useEliminarUsuario,
} from "@/hooks/usuarios/useUsuarios";
import { useRoles } from "@/hooks/usuarios/useRoles";
import { usePuede } from "@/hooks/usuarios/useMiPerfil";
import type { Usuario } from "@/types/index";

// ─── Helpers de Validación ──────────────────────────────────────────────────
function contarAdminsActivos(usuarios: Usuario[]) {
  return usuarios.filter((u) => u.roles?.nombre === "Administrador" && u.activo)
    .length;
}

function dejaríaSinAdmin(
  usuarios: Usuario[],
  target: Usuario,
  cambio: "desactivar" | "cambiarRol" | "eliminar",
): boolean {
  if (target.roles?.nombre !== "Administrador") return false;
  if (!target.activo && cambio !== "eliminar") return false;
  const adminsActivos = contarAdminsActivos(usuarios);
  return adminsActivos <= 1;
}

function RolChip({ nombre }: { nombre?: string }) {
  const map: Record<
    string,
    "warning" | "primary" | "success" | "default" | "danger"
  > = {
    Administrador: "warning",
    Vendedor: "primary",
    Producción: "success",
    "Solo lectura": "default",
    Pendiente: "danger",
  };
  return (
    <Chip
      size="sm"
      variant="flat"
      color={map[nombre ?? ""] ?? "default"}
      className="text-[10px] font-bold uppercase tracking-wider"
    >
      {nombre ?? "—"}
    </Chip>
  );
}

export default function UsuariosTab() {
  const { data: usuarios = [], isLoading } = useUsuarios();
  const { data: roles = [] } = useRoles();
  const { mutateAsync: updateUsuario, isPending: actualizando } =
    useUpdateUsuario();
  const { mutateAsync: eliminarUsuario } = useEliminarUsuario();

  const puedeEditar = usePuede("usuarios", "editar");
  const puedeEliminar = usePuede("usuarios", "eliminar");

  const idUsuarioActual = "ID_DEL_USUARIO_ACTUALMENTE_LOGUEADO";

  const [busqueda, setBusqueda] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [filtroStats, setFiltroStats] = useState<
    "todos" | "activos" | "admins" | "pendientes"
  >("todos");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [accionPendiente, setAccionPendiente] = useState<{
    tipo: "desactivar" | "eliminar" | "cambiarRol";
    usuario: Usuario;
    nuevoRolId?: number;
  } | null>(null);

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchesBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());

    if (!matchesBusqueda) return false;
    if (filtroStats === "activos") return u.activo;
    if (filtroStats === "admins") return u.roles?.nombre === "Administrador";
    if (filtroStats === "pendientes") return u.roles?.nombre === "Pendiente";
    return true;
  });

  const confirmarOAdvertir = (
    tipo: "desactivar" | "eliminar" | "cambiarRol",
    usuario: Usuario,
    nuevoRolId?: number,
  ) => {
    if (dejaríaSinAdmin(usuarios, usuario, tipo)) {
      setAccionPendiente({ tipo, usuario, nuevoRolId });
      onOpen();
      return false;
    }
    return true;
  };

  const handleCambiarRol = async (usuario: Usuario, id_rol: number) => {
    if (!confirmarOAdvertir("cambiarRol", usuario, id_rol)) return;
    await ejecutarCambioRol(usuario.id, id_rol);
  };

  const ejecutarCambioRol = async (id: string, id_rol: number) => {
    setPendingId(id);
    try {
      await updateUsuario({ id, id_rol });
      toast.success("Rol actualizado.", { theme: "dark" });
    } catch {
      toast.error("Error al cambiar el rol.", { theme: "dark" });
    } finally {
      setPendingId(null);
    }
  };

  const handleToggleActivo = async (usuario: Usuario, activo: boolean) => {
    if (usuario.id === idUsuarioActual) {
      toast.error("Operación inválida: No podés desactivar tu propia cuenta.", {
        theme: "dark",
      });
      return;
    }
    if (!activo && !confirmarOAdvertir("desactivar", usuario)) return;
    setPendingId(usuario.id);
    try {
      await updateUsuario({ id: usuario.id, activo });
      toast.success(activo ? "Usuario activado." : "Usuario desactivado.", {
        theme: "dark",
      });
    } catch {
      toast.error("Error al cambiar el estado.", { theme: "dark" });
    } finally {
      setPendingId(null);
    }
  };

  const handleEliminar = async (usuario: Usuario) => {
    if (usuario.id === idUsuarioActual) {
      toast.error("Operación inválida: No podés eliminar tu propio perfil.", {
        theme: "dark",
      });
      return;
    }
    if (!confirmarOAdvertir("eliminar", usuario)) return;
    await ejecutarEliminar(usuario.id);
  };

  const ejecutarEliminar = async (id: string) => {
    setPendingId(id);
    try {
      await eliminarUsuario(id);
      toast.success("Acceso revocado.", { theme: "dark" });
    } catch {
      toast.error("Error al revocar el acceso.", { theme: "dark" });
    } finally {
      setPendingId(null);
    }
  };

  const confirmarAccion = async (close: () => void) => {
    if (!accionPendiente) return;
    close();
    const { tipo, usuario, nuevoRolId } = accionPendiente;
    if (tipo === "cambiarRol" && nuevoRolId) {
      await ejecutarCambioRol(usuario.id, nuevoRolId);
    } else if (tipo === "desactivar") {
      await updateUsuario({ id: usuario.id, activo: false });
    } else if (tipo === "eliminar") {
      await ejecutarEliminar(usuario.id);
    }
    setAccionPendiente(null);
  };

  const conteos = {
    todos: usuarios.length,
    activos: usuarios.filter((u) => u.activo).length,
    admins: usuarios.filter((u) => u.roles?.nombre === "Administrador").length,
    pendientes: usuarios.filter((u) => u.roles?.nombre === "Pendiente").length,
  };

  return (
    <>
      <div className="space-y-5 w-full">
        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              id: "todos" as const,
              label: "Total",
              value: conteos.todos,
              color: "text-zinc-800 dark:text-zinc-200",
              activeStyles:
                "border-amber-500 bg-amber-500/[0.03] ring-1 ring-amber-500",
            },
            {
              id: "activos" as const,
              label: "Activos",
              value: conteos.activos,
              color: "text-emerald-600 dark:text-emerald-400",
              activeStyles:
                "border-emerald-500 bg-emerald-500/[0.03] ring-1 ring-emerald-500",
            },
            {
              id: "admins" as const,
              label: "Admins",
              value: conteos.admins,
              color: "text-amber-600 dark:text-amber-500",
              activeStyles:
                "border-amber-500 bg-amber-500/[0.03] ring-1 ring-amber-500",
            },
            {
              id: "pendientes" as const,
              label: "Pendientes",
              value: conteos.pendientes,
              color: "text-red-500 dark:text-red-400",
              activeStyles:
                "border-red-500 bg-red-500/[0.03] ring-1 ring-red-500",
            },
          ].map((card) => {
            const isActive = filtroStats === card.id;
            return (
              <Card
                key={card.id}
                isPressable
                onPress={() => setFiltroStats(card.id)}
                className={`border rounded-xl shadow-none transition-all duration-200 ${
                  isActive
                    ? card.activeStyles
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <CardBody className="p-3 text-center sm:text-left flex flex-col justify-center">
                  <p
                    className={`text-2xl sm:text-3xl font-black tracking-tight ${card.color}`}
                  >
                    {card.value}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">
                    {card.label}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Buscador y Controles */}
        <Card className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-none">
          <CardBody className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <Input
                isClearable
                placeholder={`Buscar en ${filtroStats === "todos" ? "todos" : filtroStats}...`}
                size="sm"
                startContent={<Search size={14} className="text-zinc-400" />}
                value={busqueda}
                onValueChange={setBusqueda}
                classNames={{
                  inputWrapper: [
                    "bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800",
                    "rounded-xl h-10 shadow-none hover:border-lebaux-amber/60 dark:hover:border-lebaux-amber/40 focus-within:!border-lebaux-amber transition-colors",
                  ].join(" "),
                  input:
                    "text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400",
                }}
              />
            </div>
            {filtroStats !== "todos" && (
              <Button
                size="sm"
                variant="light"
                className="text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg h-9"
                onPress={() => setFiltroStats("todos")}
              >
                Quitar filtro ({filtroStats})
              </Button>
            )}
          </CardBody>
        </Card>

        {/* Listado */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-none p-4 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 w-full">
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="space-y-2 w-3/5">
                      <Skeleton className="h-3 w-full rounded-lg" />
                      <Skeleton className="h-2 w-4/5 rounded-lg" />
                    </div>
                  </div>
                  <Skeleton className="w-7 h-7 rounded-lg" />
                </div>
                <div className="pt-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60">
                  <Skeleton className="h-8 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <Card className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-none py-14">
            <CardBody className="flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Search size={22} className="opacity-30" />
              <span className="text-xs font-semibold uppercase tracking-wider text-center">
                No se encontraron operadores con los criterios actuales
              </span>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuariosFiltrados.map((usuario) => {
              const esPendiente = usuario.roles?.nombre === "Pendiente";
              const isPending = pendingId === usuario.id;
              const esUltimoAdmin = dejaríaSinAdmin(
                usuarios,
                usuario,
                "desactivar",
              );
              const esUsuarioActual = usuario.id === idUsuarioActual;

              return (
                <Card
                  key={usuario.id}
                  className={`border rounded-xl shadow-none transition-all duration-200 ${
                    esPendiente
                      ? "bg-amber-50/40 dark:bg-amber-500/5 border-amber-200/80 dark:border-amber-500/20"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  } ${esUsuarioActual ? "ring-1 ring-zinc-300 dark:ring-zinc-700" : ""} ${
                    isPending ? "opacity-75" : ""
                  }`}
                >
                  <CardBody className="p-4 flex flex-col justify-between h-full gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <User
                        name={
                          <span className="font-bold text-zinc-800 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                            {usuario.nombre}
                            {esUsuarioActual && (
                              <span className="text-[9px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                Vos
                              </span>
                            )}
                            {esPendiente && (
                              <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                                Pendiente
                              </span>
                            )}
                          </span>
                        }
                        description={
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block max-w-[150px] truncate sm:max-w-none">
                            {usuario.email}
                          </span>
                        }
                        avatarProps={{
                          name: usuario.nombre,
                          size: "sm",
                          className: `rounded-lg w-8 h-8 text-[11px] font-bold shrink-0 ${
                            esPendiente
                              ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                          }`,
                        }}
                      />

                      <Tooltip
                        content={
                          esUsuarioActual
                            ? "No podés eliminar tu propio perfil"
                            : esUltimoAdmin && usuario.activo
                              ? "No se puede eliminar al único administrador activo"
                              : "Revocar acceso"
                        }
                      >
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          isDisabled={
                            !puedeEliminar ||
                            isPending ||
                            esUsuarioActual ||
                            (esUltimoAdmin && usuario.activo)
                          }
                          className="w-7 h-7 min-w-7 rounded-lg bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-300 dark:text-zinc-600 hover:text-red-500 transition-colors shrink-0 disabled:opacity-30"
                          onPress={() => handleEliminar(usuario)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </Tooltip>
                    </div>

                    <div className="pt-3 flex items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800/60 w-full">
                      <div className="flex-1 max-w-[140px]">
                        {puedeEditar ? (
                          <Select
                            aria-label="Rol"
                            size="sm"
                            isDisabled={isPending || actualizando}
                            selectedKeys={[String(usuario.id_rol)]}
                            onSelectionChange={(k: Set<string>) => {
                              const val = Number(
                                Array.from(k as Set<string>)[0],
                              );
                              if (!isNaN(val) && val !== usuario.id_rol)
                                handleCambiarRol(usuario, val);
                            }}
                            classNames={{
                              trigger:
                                "h-8 min-h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 shadow-none text-xs hover:border-lebaux-amber/60 focus-within:!border-lebaux-amber transition-colors",
                              value:
                                "text-xs font-semibold text-zinc-700 dark:text-zinc-300",
                            }}
                          >
                            {roles.map((rol) => (
                              <SelectItem key={String(rol.id)}>
                                {rol.nombre}
                              </SelectItem>
                            ))}
                          </Select>
                        ) : (
                          <RolChip nombre={usuario.roles?.nombre} />
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 min-h-[32px]">
                        {isPending ? (
                          <div className="flex items-center px-3">
                            <Spinner size="sm" color="warning" />
                          </div>
                        ) : (
                          <>
                            <Tooltip
                              content={
                                esUsuarioActual
                                  ? "No podés desactivar tu propia cuenta"
                                  : esUltimoAdmin && usuario.activo
                                    ? "Es el único administrador activo"
                                    : usuario.activo
                                      ? "Desactivar acceso"
                                      : "Activar acceso"
                              }
                            >
                              <div>
                                <Switch
                                  isSelected={usuario.activo}
                                  isDisabled={!puedeEditar || esUsuarioActual}
                                  size="sm"
                                  color="success"
                                  onValueChange={(v: boolean) =>
                                    handleToggleActivo(usuario, v)
                                  }
                                  aria-label="Activar/desactivar"
                                />
                              </div>
                            </Tooltip>
                            {usuario.activo ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                                <CheckCircle2 size={11} />
                                Activo
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 tracking-tight">
                                <XCircle size={11} />
                                Inactivo
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="sm"
        classNames={{ base: "border border-red-200 dark:border-red-500/20" }}
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-xl">
                  <AlertTriangle
                    size={18}
                    className="text-red-500"
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <p className="text-sm font-black text-zinc-800 dark:text-zinc-100">
                    Acción crítica
                  </p>
                  <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                    El sistema quedaría sin administrador
                  </p>
                </div>
              </ModalHeader>
              <ModalBody className="py-2">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    {accionPendiente?.usuario.nombre}
                  </strong>{" "}
                  es actualmente el único administrador activo. Si{" "}
                  {accionPendiente?.tipo === "eliminar"
                    ? "eliminás su perfil"
                    : accionPendiente?.tipo === "desactivar"
                      ? "desactivás su cuenta"
                      : "cambiás su rol"}
                  , ningún usuario podrá gestionar el sistema.
                </p>
                <p className="text-[11px] text-red-500 font-semibold mt-2">
                  ¿Estás seguro de que querés continuar?
                </p>
              </ModalBody>
              <ModalFooter className="gap-2">
                <Button
                  variant="flat"
                  size="sm"
                  onPress={onClose}
                  className="font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="bg-red-500 text-white font-bold hover:bg-red-600"
                  onPress={() => confirmarAccion(onClose)}
                >
                  Confirmar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
