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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  UserPlus,
  Search,
  Filter,
  Lock,
  MoreVertical,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  avatar: string;
  rol: "Administrador" | "Editor" | "Vendedor" | "Consultor";
  estado: "Activo" | "Inactivo";
  ultimasesion: string;
}

const usuariosIniciales: Usuario[] = [
  {
    id: 1,
    nombre: "David Aramayo",
    email: "d.aramayo@lebaux.com",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    rol: "Administrador",
    estado: "Activo",
    ultimasesion: "Hoy, 15:32",
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    email: "c.mendoza@lebaux.com",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    rol: "Editor",
    estado: "Activo",
    ultimasesion: "Ayer, 09:15",
  },
  {
    id: 3,
    nombre: "Carolina Gómez",
    email: "c.gomez@lebaux.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    rol: "Vendedor",
    estado: "Activo",
    ultimasesion: "24 May 2026",
  },
  {
    id: 4,
    nombre: "Lucas Juárez",
    email: "l.juarez@externo.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    rol: "Consultor",
    estado: "Inactivo",
    ultimasesion: "12 Abr 2026",
  },
];

const coloresRoles: Record<
  Usuario["rol"],
  "danger" | "warning" | "primary" | "default"
> = {
  Administrador: "danger",
  Editor: "warning",
  Vendedor: "primary",
  Consultor: "default",
};

export default function ControlAccesoPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales);
  const [busqueda, setBusqueda] = useState("");

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const handleEliminarUsuario = (id: number) => {
    setUsuarios(usuarios.filter((u) => u.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 px-4 md:px-0 animate-in fade-in duration-400">
      {/* ── Header Profesional SIN GRADIENTE ────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
            Control de Acceso
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 font-medium leading-relaxed">
            Administrá las credenciales de personal, asignación de roles de
            taller y auditoría de permisos.
          </p>
        </div>
        <Button
          size="md"
          startContent={<UserPlus size={16} strokeWidth={2.5} />}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-none h-11 self-start sm:self-center px-6"
        >
          Nuevo Usuario
        </Button>
      </header>

      {/* ── Layout Asimétrico 2:1 ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna Izquierda (Ancha): Buscador y Tabla de Operadores */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
            <CardBody className="p-6 space-y-6">
              {/* Paso 1: Filtros de Operadores */}
              <div className="space-y-2">
                <label className="font-bold text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  1. Filtrar y Buscar Operadores
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    isClearable
                    placeholder="Buscar por operador o correo electrónico..."
                    size="sm"
                    startContent={
                      <Search
                        size={15}
                        className="text-zinc-400 dark:text-zinc-500"
                      />
                    }
                    value={busqueda}
                    onValueChange={setBusqueda}
                    className="w-full"
                    classNames={{
                      trigger: "h-11",
                      inputWrapper:
                        "h-11 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 data-[focus=true]:border-amber-500 rounded-xl shadow-none transition-all",
                      input:
                        "text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
                    }}
                  />
                  <Button
                    variant="bordered"
                    className="h-11 text-xs font-bold text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/50 rounded-xl px-5 shrink-0"
                    startContent={<Filter size={14} />}
                  >
                    Filtros avanzados
                  </Button>
                </div>
              </div>

              {/* Paso 2: Grilla / Tabla de Personal */}
              <div className="space-y-2">
                <label className="font-bold text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  2. Personal Autorizado en el Sistema
                </label>

                <div className="border border-zinc-200 dark:border-zinc-800/60 rounded-2xl overflow-hidden bg-zinc-50/30 dark:bg-zinc-950/10">
                  <Table
                    aria-label="Tabla de gestión de usuarios"
                    removeWrapper
                    classNames={{
                      th: "bg-zinc-100/50 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-500 font-bold text-[10px] uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 h-12 px-4",
                      td: "py-3.5 px-4 border-b border-zinc-200/60 dark:border-zinc-800/40 text-xs font-medium text-zinc-800 dark:text-zinc-300 vertical-middle",
                    }}
                  >
                    <TableHeader>
                      <TableColumn>Operador</TableColumn>
                      <TableColumn>Rol</TableColumn>
                      <TableColumn>Estado</TableColumn>
                      <TableColumn align="center" className="w-12">
                        Acciones
                      </TableColumn>
                    </TableHeader>
                    <TableBody
                      emptyContent={
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block py-8 text-center">
                          No se encontraron operadores
                        </span>
                      }
                    >
                      {usuariosFiltrados.map((usuario) => (
                        <TableRow
                          key={usuario.id}
                          className="hover:bg-zinc-100/30 dark:hover:bg-zinc-900/20 transition-colors group"
                        >
                          <TableCell>
                            <User
                              name={
                                <span className="font-bold text-zinc-700 dark:text-zinc-200 text-xs group-hover:text-amber-500 dark:group-hover:text-amber-500 transition-colors">
                                  {usuario.nombre}
                                </span>
                              }
                              description={
                                <span className="text-[10px] font-mono font-medium text-zinc-400 dark:text-zinc-500">
                                  {usuario.email}
                                </span>
                              }
                              avatarProps={{
                                src: usuario.avatar,
                                size: "sm",
                                className:
                                  "border border-zinc-200 dark:border-zinc-800 shadow-none rounded-lg w-8 h-8",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              variant="flat"
                              color={coloresRoles[usuario.rol]}
                              className="font-bold text-[9px] uppercase tracking-wider px-1.5 h-5 bg-opacity-10"
                            >
                              {usuario.rol}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {usuario.estado === "Activo" ? (
                                <CheckCircle2
                                  size={14}
                                  className="text-emerald-500"
                                />
                              ) : (
                                <XCircle
                                  size={14}
                                  className="text-zinc-400 dark:text-zinc-600"
                                />
                              )}
                              <span
                                className={`text-xs font-semibold ${usuario.estado === "Activo" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}`}
                              >
                                {usuario.estado}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dropdown
                              placement="bottom-end"
                              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl min-w-[140px] shadow-sm"
                            >
                              <DropdownTrigger>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg h-8 w-8"
                                >
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                aria-label="Acciones de operador"
                                variant="flat"
                                className="p-1"
                              >
                                <DropdownItem
                                  key="editar"
                                  startContent={<Edit3 size={14} />}
                                  className="text-xs font-semibold px-2"
                                >
                                  Editar Perfil
                                </DropdownItem>
                                <DropdownItem
                                  key="permisos"
                                  startContent={<Lock size={14} />}
                                  className="text-xs font-semibold px-2"
                                >
                                  Permisos Privados
                                </DropdownItem>
                                <DropdownItem
                                  key="eliminar"
                                  color="danger"
                                  startContent={<Trash2 size={14} />}
                                  className="text-xs font-semibold px-2 text-red-500"
                                  onPress={() =>
                                    handleEliminarUsuario(usuario.id)
                                  }
                                >
                                  Dar de Baja
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Columna Derecha (Estrecha): Políticas de Seguridad */}
        <div className="space-y-6">
          <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
            <CardBody className="p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Políticas de Seguridad
                </h3>
              </div>

              <div className="space-y-4 text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <p>
                  El control de accesos define qué módulos y cómputos de la
                  fábrica están disponibles para cada operador:
                </p>

                <ul className="space-y-3 list-disc pl-4 text-zinc-500 dark:text-zinc-400">
                  <li>
                    <strong className="text-zinc-700 dark:text-zinc-300">
                      Administrador:
                    </strong>{" "}
                    Acceso total a presupuestos, bases maestros y actualización
                    global de listas de precios.
                  </li>
                  <li>
                    <strong className="text-zinc-700 dark:text-zinc-300">
                      Editor / Vendedor:
                    </strong>{" "}
                    Permisos enfocados en carga de pedidos de aberturas y
                    despieces de perfiles sin alteración de costos base.
                  </li>
                  <li>
                    <strong className="text-zinc-700 dark:text-zinc-300">
                      Auditoría:
                    </strong>{" "}
                    Las altas y modificaciones impactan directamente en las
                    claves de auditoría protegidas de Supabase.
                  </li>
                </ul>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<ShieldAlert size={14} />}
                    className="w-full font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 rounded-xl text-[11px] h-9"
                  >
                    Ver Logs de Conexión
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
