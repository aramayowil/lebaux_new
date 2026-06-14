import { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
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
} from "@heroui/react";
import {
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  ShieldOff,
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

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Devuelve cuántos admins activos hay en la lista */
function contarAdminsActivos(usuarios: Usuario[]) {
  return usuarios.filter((u) => u.roles?.nombre === "Administrador" && u.activo)
    .length;
}

/** ¿La operación dejaría al sistema sin ningún admin activo? */
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

// ─── Chip de rol coloreado ───────────────────────────────────────────────────
function RolChip({ nombre }: { nombre?: string }) {
  const map: Record<
    string,
    "warning" | "success" | "primary" | "default" | "danger"
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

// ─── Componente principal ────────────────────────────────────────────────────
export default function UsuariosTab() {
  const { data: usuarios = [], isLoading } = useUsuarios();
  const { data: roles = [] } = useRoles();
  const { mutateAsync: updateUsuario, isPending: actualizando } =
    useUpdateUsuario();
  const { mutateAsync: eliminarUsuario } = useEliminarUsuario();

  const puedeEditar = usePuede("usuarios", "editar");
  const puedeEliminar = usePuede("usuarios", "eliminar");

  const [busqueda, setBusqueda] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Modal de confirmación para acciones peligrosas
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [accionPendiente, setAccionPendiente] = useState<{
    tipo: "desactivar" | "eliminar" | "cambiarRol";
    usuario: Usuario;
    nuevoRolId?: number;
  } | null>(null);

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()),
  );

  // ── Guardia último admin ─────────────────────────────────────────────────
  const confirmarOAdvertir = (
    tipo: "desactivar" | "eliminar" | "cambiarRol",
    usuario: Usuario,
    nuevoRolId?: number,
  ) => {
    if (dejaríaSinAdmin(usuarios, usuario, tipo)) {
      setAccionPendiente({ tipo, usuario, nuevoRolId });
      onOpen();
      return false; // bloqueado, abrir modal
    }
    return true; // ok, proceder
  };

  // ── Handlers ────────────────────────────────────────────────────────────
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

  // ── Confirmar desde modal ────────────────────────────────────────────────
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

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        {/* ── Tabla ── */}
        <div className="xl:col-span-2">
          <Card className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-none">
            <CardBody className="p-5 space-y-4">
              {/* Buscador */}
              <Input
                isClearable
                placeholder="Buscar por nombre o email..."
                size="sm"
                startContent={<Search size={14} className="text-zinc-400" />}
                value={busqueda}
                onValueChange={setBusqueda}
                classNames={{
                  inputWrapper: [
                    "bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800",
                    "rounded-xl h-10 shadow-none",
                    "hover:border-amber-400/50 focus-within:!border-amber-400",
                    "transition-colors",
                  ].join(" "),
                  input:
                    "text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400",
                }}
              />

              {/* Tabla */}
              <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                <Table
                  aria-label="Gestión de usuarios"
                  removeWrapper
                  classNames={{
                    th: [
                      "bg-zinc-50 dark:bg-zinc-950/80 h-10 px-4",
                      "text-[10px] font-bold uppercase tracking-wider text-zinc-400",
                      "border-b border-zinc-100 dark:border-zinc-800",
                    ].join(" "),
                    td: [
                      "py-3 px-4 text-xs",
                      "border-b border-zinc-50 dark:border-zinc-800/40",
                      "last:border-b-0",
                    ].join(" "),
                  }}
                >
                  <TableHeader>
                    <TableColumn>Operador</TableColumn>
                    <TableColumn>Rol</TableColumn>
                    <TableColumn>Estado</TableColumn>
                    <TableColumn align="center" className="w-10">
                      {" "}
                    </TableColumn>
                  </TableHeader>
                  <TableBody
                    isLoading={isLoading}
                    emptyContent={
                      <div className="py-10 flex flex-col items-center gap-2 text-zinc-400">
                        <Search size={20} className="opacity-30" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Sin operadores
                        </span>
                      </div>
                    }
                  >
                    {usuariosFiltrados.map((usuario) => {
                      const esPendiente = usuario.roles?.nombre === "Pendiente";
                      const isPending = pendingId === usuario.id;
                      const esUltimoAdmin = dejaríaSinAdmin(
                        usuarios,
                        usuario,
                        "desactivar",
                      );

                      return (
                        <TableRow
                          key={usuario.id}
                          className={`group transition-colors ${
                            esPendiente
                              ? "bg-amber-50/50 dark:bg-amber-500/5"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-950/40"
                          }`}
                        >
                          {/* Operador */}
                          <TableCell>
                            <User
                              name={
                                <span className="font-bold text-zinc-800 dark:text-zinc-100 text-xs">
                                  {usuario.nombre}
                                  {esPendiente && (
                                    <span className="ml-2 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                                      · Pendiente
                                    </span>
                                  )}
                                </span>
                              }
                              description={
                                <span className="text-[10px] font-mono text-zinc-400">
                                  {usuario.email}
                                </span>
                              }
                              avatarProps={{
                                name: usuario.nombre,
                                size: "sm",
                                className: `rounded-lg w-8 h-8 text-[11px] font-bold ${
                                  esPendiente
                                    ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                                }`,
                              }}
                            />
                          </TableCell>

                          {/* Rol */}
                          <TableCell>
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
                                className="w-40"
                                classNames={{
                                  trigger:
                                    "h-8 min-h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-700 shadow-none text-xs",
                                  value: "text-xs font-semibold",
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
                          </TableCell>

                          {/* Estado */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Tooltip
                                content={
                                  esUltimoAdmin && usuario.activo
                                    ? "Es el único administrador activo"
                                    : usuario.activo
                                      ? "Desactivar acceso"
                                      : "Activar acceso"
                                }
                              >
                                <div>
                                  <Switch
                                    isSelected={usuario.activo}
                                    isDisabled={!puedeEditar || isPending}
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
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 size={11} />
                                  Activo
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
                                  <XCircle size={11} />
                                  Inactivo
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Eliminar */}
                          <TableCell>
                            <Tooltip
                              content={
                                esUltimoAdmin && usuario.activo
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
                                  (esUltimoAdmin && usuario.activo)
                                }
                                className="w-7 h-7 min-w-7 rounded-lg bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-300 dark:text-zinc-600 hover:text-red-500 transition-colors"
                                onPress={() => handleEliminar(usuario)}
                              >
                                <Trash2 size={13} />
                              </Button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* ── Panel Info ── */}
        <div className="space-y-4">
          {/* Info de operadores pendientes */}
          {usuarios.some((u) => u.roles?.nombre === "Pendiente") && (
            <Card className="border border-amber-200 dark:border-amber-500/20 rounded-2xl bg-amber-50/60 dark:bg-amber-500/5 shadow-none animate-in fade-in duration-300">
              <CardBody className="p-4 flex flex-row items-start gap-3">
                <AlertTriangle
                  size={16}
                  className="text-amber-500 shrink-0 mt-0.5"
                />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    {
                      usuarios.filter((u) => u.roles?.nombre === "Pendiente")
                        .length
                    }{" "}
                    pendiente
                    {usuarios.filter((u) => u.roles?.nombre === "Pendiente")
                      .length > 1
                      ? "s"
                      : ""}{" "}
                    de aprobación
                  </p>
                  <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70 leading-relaxed">
                    Asignales un rol y activá su cuenta para que puedan ingresar
                    al sistema.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          <Card className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-none">
            <CardBody className="p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <Info size={14} className="text-amber-500" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Cómo funciona
                </h3>
              </div>
              <div className="space-y-3 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                <p>
                  Los usuarios se registran en{" "}
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    /register
                  </span>{" "}
                  y quedan con rol{" "}
                  <Chip
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="text-[9px] font-bold"
                  >
                    Pendiente
                  </Chip>{" "}
                  e inactivos.
                </p>
                <p>
                  Un{" "}
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Administrador
                  </span>{" "}
                  asigna el rol y activa la cuenta desde esta pantalla.
                </p>
                <div className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-500/5 rounded-lg border border-red-100 dark:border-red-500/15 mt-2">
                  <ShieldOff
                    size={12}
                    className="text-red-400 shrink-0 mt-0.5"
                  />
                  <p className="text-[10px] text-red-500 dark:text-red-400">
                    El sistema siempre requiere al menos un administrador
                    activo.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Total",
                value: usuarios.length,
                color: "text-zinc-700 dark:text-zinc-300",
              },
              {
                label: "Activos",
                value: usuarios.filter((u) => u.activo).length,
                color: "text-emerald-600 dark:text-emerald-400",
              },
              {
                label: "Admins",
                value: contarAdminsActivos(usuarios),
                color: "text-amber-600 dark:text-amber-400",
              },
              {
                label: "Pendientes",
                value: usuarios.filter((u) => u.roles?.nombre === "Pendiente")
                  .length,
                color: "text-red-500 dark:text-red-400",
              },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="border border-zinc-100 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-none"
              >
                <CardBody className="p-3 text-center">
                  <p className={`text-2xl font-black ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
                    {stat.label}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal: Advertencia último administrador ── */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="sm"
        classNames={{
          base: "border border-red-200 dark:border-red-500/20",
        }}
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
                    El sistema quedaría sin administrador activo
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
                  Confirmar de todas formas
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
