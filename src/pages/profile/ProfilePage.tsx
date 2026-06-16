import { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Input,
  Chip,
  Divider,
} from "@heroui/react";
import {
  User,
  Lock,
  Mail,
  Camera,
  Save,
  KeyRound,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/useAuthStore";
import { useMisPermisos } from "@/hooks/usuarios/useMiPerfil";
import { supabase } from "@/lib/supabaseClient";
import { SQUEMA_SEGURIDAD } from "@/hooks/usuarios/squemaSeguridad";

const inputStyles = {
  label:
    "text-zinc-500 dark:text-zinc-400 font-bold text-[11px] uppercase tracking-wider mb-1.5",
  inputWrapper: [
    "bg-zinc-50 dark:bg-zinc-950/50",
    "border border-zinc-200 dark:border-zinc-800",
    "hover:border-lebaux-amber/60 dark:hover:border-lebaux-amber/40",
    "focus-within:!border-lebaux-amber",
    "transition-colors duration-200",
    "h-12",
    "rounded-xl",
    "shadow-none",
  ].join(" "),
  input: "text-sm font-medium text-zinc-900 dark:text-zinc-100",
};

const readonlyInputStyles = {
  ...inputStyles,
  inputWrapper:
    inputStyles.inputWrapper +
    " bg-zinc-100/50 dark:bg-zinc-900/30 opacity-70 cursor-not-allowed",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: supabaseUser } = useAuthStore();
  const { perfil } = useMisPermisos();

  // ── ESTADO ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"info" | "seguridad">("info");

  // Información Personal
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Seguridad
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // ── EFECTOS ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (perfil?.nombre) {
      const partes = perfil.nombre.trim().split(" ");
      setNombre(partes[0] || "");
      setApellido(partes.slice(1).join(" ") || "");
    }
  }, [perfil?.nombre]);

  const displayName =
    perfil?.nombre ||
    supabaseUser?.user_metadata?.full_name ||
    supabaseUser?.email?.split("@")[0] ||
    "Usuario";

  const capitalize = (str: string) =>
    str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  // ── HANDLERS ─────────────────────────────────────────────────────────────
  const handleSaveInfo = async () => {
    if (!nombre.trim() || !apellido.trim() || !perfil?.id) {
      toast.error("El nombre y apellido son obligatorios");
      return;
    }

    try {
      setIsSavingInfo(true);
      const nombreCompleto = `${nombre.trim()} ${apellido.trim()}`;

      const { error } = await supabase
        .schema(SQUEMA_SEGURIDAD)
        .from("usuarios")
        .update({ nombre: nombreCompleto })
        .eq("id", perfil.id);

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey: ["usuarios", "perfil", perfil.id],
      });
      toast.success("Información actualizada correctamente");
    } catch {
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    try {
      setIsSavingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success("Contraseña actualizada con éxito");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Error al cambiar la contraseña");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-steel-900 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">
            Configuración de Cuenta
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 font-medium">
            Gestioná tu información personal, credenciales y preferencias
          </p>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {/* Layout Principal con CSS Grid responsivo */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-in fade-in duration-400">
          {/* ── COLUMNA IZQUIERDA: SIDEBAR & MENU ───────────────────────── */}
          {/* En mobile ocupa todo (1 col), en pantallas grandes ocupa 4 de 12 o 3 de 12 */}
          <div className="lg:col-span-4 xl:col-span-5 flex flex-col gap-4 sm:gap-6">
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-2xl">
              <CardBody className="p-6 md:p-8 flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="p-1.5 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <Avatar
                      src={supabaseUser?.user_metadata?.avatar_url || ""}
                      name={displayName}
                      className="w-28 h-28 text-2xl"
                      isBordered
                      color="warning"
                    />
                  </div>
                  <Button
                    isIconOnly
                    radius="full"
                    size="sm"
                    className="absolute bottom-1 right-1 bg-lebaux-amber text-black w-9 h-9 min-w-9 border-3 border-white dark:border-zinc-900 hover:scale-110 transition-transform shadow-md z-10"
                    onPress={() => navigate("/perfil/avatar")}
                  >
                    <Camera size={15} strokeWidth={2.5} />
                  </Button>
                </div>

                <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">
                  {capitalize(displayName)}
                </h3>

                <div className="flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 mt-2 mb-5">
                  <Mail size={13} className="text-lebaux-amber shrink-0" />
                  <span className="text-[13px] font-medium truncate max-w-[200px]">
                    {supabaseUser?.email}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {perfil?.roles?.nombre && (
                    <Chip
                      variant="flat"
                      color="warning"
                      className="text-[10px] font-black uppercase px-2 h-7 rounded-md"
                    >
                      {perfil.roles.nombre}
                    </Chip>
                  )}
                  <Chip
                    variant="dot"
                    color={perfil?.activo ? "success" : "danger"}
                    className="text-[10px] font-bold uppercase h-7 border-none bg-zinc-50 dark:bg-zinc-800/50"
                  >
                    {perfil?.activo ? "Activo" : "Inactivo"}
                  </Chip>
                </div>
              </CardBody>
            </Card>

            {/* Menú Lateral */}
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-2xl">
              <CardBody className="p-3 flex flex-col gap-1.5">
                <Button
                  variant={activeTab === "info" ? "flat" : "light"}
                  className={`justify-start font-bold text-sm h-12 px-4 rounded-xl transition-all ${
                    activeTab === "info"
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                  startContent={
                    <User
                      size={18}
                      strokeWidth={2.5}
                      className={activeTab === "info" ? "text-amber-500" : ""}
                    />
                  }
                  onPress={() => setActiveTab("info")}
                >
                  Información Personal
                </Button>
                <Button
                  variant={activeTab === "seguridad" ? "flat" : "light"}
                  className={`justify-start font-bold text-sm h-12 px-4 rounded-xl transition-all ${
                    activeTab === "seguridad"
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                  startContent={
                    <ShieldCheck
                      size={18}
                      strokeWidth={2.5}
                      className={
                        activeTab === "seguridad" ? "text-amber-500" : ""
                      }
                    />
                  }
                  onPress={() => setActiveTab("seguridad")}
                >
                  Seguridad y Accesos
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* ── COLUMNA DERECHA: CONTENIDO ──────────────────────────────── */}
          {/* En mobile ocupa todo (1 col), en pantallas grandes ocupa 8 de 12 o 9 de 12 */}
          <div className="lg:col-span-8 xl:col-span-7 space-y-6 lg:space-y-8">
            {/* VISTA: INFORMACIÓN */}
            {activeTab === "info" && (
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-2xl animate-in slide-in-from-right-4 fade-in duration-300">
                <CardBody className="p-6 md:p-8 lg:p-10 space-y-8 lg:space-y-10">
                  <div>
                    <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-100 mb-1.5">
                      Información Personal
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
                      Actualizá tus datos básicos. Esta información es visible
                      para otros usuarios dentro de la plataforma y se utiliza
                      para auditorías de acciones.
                    </p>
                  </div>

                  {/* Grid interno responsivo para los inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl">
                    <Input
                      label="Nombre"
                      value={nombre}
                      onValueChange={setNombre}
                      variant="bordered"
                      labelPlacement="outside"
                      placeholder="Ej: Juan"
                      classNames={inputStyles}
                    />
                    <Input
                      label="Apellido"
                      value={apellido}
                      onValueChange={setApellido}
                      variant="bordered"
                      labelPlacement="outside"
                      placeholder="Ej: Pérez"
                      classNames={inputStyles}
                    />
                    {/* El input de email ocupa 2 columnas en pantallas medianas hacia arriba */}
                    <Input
                      label="Correo Electrónico (Solo Lectura)"
                      defaultValue={supabaseUser?.email || ""}
                      variant="bordered"
                      labelPlacement="outside"
                      isReadOnly
                      classNames={readonlyInputStyles}
                      endContent={
                        <Lock size={14} className="text-zinc-400 shrink-0" />
                      }
                      className="md:col-span-2"
                    />
                  </div>

                  <Divider className="bg-zinc-100 dark:bg-zinc-800/60" />

                  <div className="flex justify-end">
                    <Button
                      className="bg-lebaux-amber text-black font-bold px-8 h-12 rounded-xl text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-lebaux-amber/20 w-full sm:w-auto"
                      isLoading={isSavingInfo}
                      isDisabled={!nombre.trim() || !apellido.trim()}
                      onPress={handleSaveInfo}
                      startContent={
                        !isSavingInfo && <Save size={16} strokeWidth={2.5} />
                      }
                    >
                      Guardar Cambios
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* VISTA: SEGURIDAD */}
            {activeTab === "seguridad" && (
              <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                {/* Cambiar Contraseña */}
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-2xl">
                  <CardBody className="p-6 md:p-8 lg:p-10 space-y-8">
                    <div>
                      <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-100 mb-1.5 flex items-center gap-2">
                        <KeyRound size={22} className="text-lebaux-amber" />
                        Modificar Contraseña
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
                        Asegurate de usar una contraseña larga y que no utilices
                        en otros sitios para mantener tu cuenta protegida.
                      </p>
                    </div>

                    <div className="flex flex-col gap-6 lg:gap-8 max-w-md">
                      <Input
                        type="password"
                        label="Contraseña nueva"
                        value={newPassword}
                        onValueChange={setNewPassword}
                        variant="bordered"
                        labelPlacement="outside"
                        placeholder="Ingresá al menos 6 caracteres"
                        classNames={inputStyles}
                      />
                      <Input
                        type="password"
                        label="Confirmación de contraseña"
                        value={confirmPassword}
                        onValueChange={setConfirmPassword}
                        variant="bordered"
                        labelPlacement="outside"
                        placeholder="Volvé a escribir la contraseña"
                        classNames={inputStyles}
                      />
                    </div>

                    <div className="flex">
                      <Button
                        className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-black font-bold px-8 h-12 rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all shadow-none w-full sm:w-auto"
                        isLoading={isSavingPassword}
                        isDisabled={!newPassword || !confirmPassword}
                        onPress={handleSavePassword}
                        startContent={
                          !isSavingPassword && (
                            <LockKeyhole size={16} strokeWidth={2.5} />
                          )
                        }
                      >
                        Actualizar Credenciales
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
