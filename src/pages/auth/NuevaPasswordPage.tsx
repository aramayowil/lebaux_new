import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@heroui/react";
import { supabase } from "@/lib/supabaseClient";
import NavBar from "@/components/login/NavBar";
import { ToastContainer, toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import validatePassword from "@/utils/regex/passwordRegex";

const Req = ({ ok, label }: { ok: boolean; label: string }) => (
  <span
    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${ok ? "text-emerald-400" : "text-zinc-600"}`}
  >
    {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
    {label}
  </span>
);

type Estado = "verificando" | "listo" | "expirado" | "guardado";

export default function NuevaPasswordPage() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>("verificando");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const passValidation = validatePassword(password);
  const passMatch = password !== "" && password === password2;
  const isFormValid = passValidation.isValid && passMatch;

  useEffect(() => {
    // Esta página recibe al usuario DESPUÉS de que AuthConfirmarPage consumió el token.
    // En ese momento Supabase ya estableció una sesión temporal de PASSWORD_RECOVERY.
    // Solo necesitamos verificar que esa sesión exista.
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setEstado("listo");
        return;
      }

      // Escuchar el evento PASSWORD_RECOVERY por si llegamos directamente desde
      // el link del email (flujo sin página intermedia / compatibilidad)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") setEstado("listo");
      });

      // Si en 4 segundos no hay sesión, el enlace expiró
      const timeout = setTimeout(() => {
        setEstado((prev) => (prev === "verificando" ? "expirado" : prev));
        subscription.unsubscribe();
      }, 4000);

      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    };

    checkSession();
  }, []);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setEstado("guardado");
      toast.success("¡Contraseña actualizada!", { theme: "dark" });

      // Cerrar sesión temporal y redirigir al login
      await supabase.auth.signOut();
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } catch (err: any) {
      const msg = err.message?.includes("same password")
        ? "La nueva contraseña no puede ser igual a la anterior."
        : err.message?.includes("weak")
          ? "La contraseña es demasiado débil."
          : err.message || "Error al guardar la contraseña.";
      setErrorMsg(msg);
      toast.error(msg, { theme: "dark" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-yellow-500/30">
      <NavBar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          {/* ── Verificando sesión ── */}
          {estado === "verificando" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 size={32} className="text-yellow-500 animate-spin" />
              <p className="text-zinc-400 text-sm">Verificando sesión...</p>
            </div>
          )}

          {/* ── Token/sesión expirada ── */}
          {estado === "expirado" && (
            <div className="flex flex-col items-center text-center gap-6 animate-appearance-in">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle
                  size={30}
                  className="text-red-400"
                  strokeWidth={1.5}
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  Sesión inválida
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                  El enlace expiró o ya fue utilizado. Solicitá uno nuevo.
                </p>
              </div>
              <Button
                onPress={() => navigate("/password/reset", { replace: true })}
                className="w-full h-11 font-bold text-sm rounded-xl bg-yellow-500 text-black hover:bg-yellow-400"
              >
                Solicitar nuevo enlace
              </Button>
            </div>
          )}

          {/* ── Formulario ── */}
          {estado === "listo" && (
            <div className="space-y-7 animate-appearance-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-1 bg-yellow-500 rounded-full" />
                  <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">
                    Lebaux · Nueva contraseña
                  </p>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Crear nueva contraseña
                </h2>
                <p className="text-zinc-500 text-sm">
                  Elegí una contraseña segura para tu cuenta.
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/60 rounded-xl px-4 py-3">
                  <AlertCircle
                    size={16}
                    className="text-red-400 mt-0.5 shrink-0"
                  />
                  <p className="text-sm text-red-300 font-medium">{errorMsg}</p>
                </div>
              )}

              <form className="flex flex-col gap-4" onSubmit={handleGuardar}>
                <div className="space-y-2">
                  <Input
                    label="Nueva contraseña"
                    labelPlacement="outside"
                    placeholder="Mínimo 8 caracteres"
                    variant="bordered"
                    type={showPass ? "text" : "password"}
                    size="lg"
                    autoComplete="new-password"
                    autoFocus
                    isDisabled={isLoading}
                    isInvalid={password !== "" && !passValidation.isValid}
                    value={password}
                    onValueChange={(v: string) => {
                      setErrorMsg(null);
                      setPassword(v);
                    }}
                    endContent={
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPass((v) => !v)}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                      >
                        {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    }
                    classNames={{
                      label: "text-zinc-400 font-medium text-sm",
                      inputWrapper: [
                        "bg-zinc-900/50 border-zinc-800 rounded-xl h-12",
                        "hover:border-zinc-600 focus-within:!border-yellow-500 transition-colors",
                      ].join(" "),
                      input: "text-white placeholder:text-zinc-600 text-sm",
                    }}
                  />
                  {password.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-1 animate-appearance-in">
                      <Req ok={password.length >= 8} label="8 caracteres" />
                      <Req ok={/[A-Z]/.test(password)} label="Mayúscula" />
                      <Req ok={/[0-9]/.test(password)} label="Número" />
                      <Req ok={/[^A-Za-z0-9]/.test(password)} label="Símbolo" />
                    </div>
                  )}
                </div>

                <Input
                  label="Confirmar contraseña"
                  labelPlacement="outside"
                  placeholder="Repetí la contraseña"
                  variant="bordered"
                  type={showPass2 ? "text" : "password"}
                  size="lg"
                  autoComplete="new-password"
                  isDisabled={isLoading}
                  isInvalid={password2 !== "" && !passMatch}
                  errorMessage="Las contraseñas no coinciden"
                  value={password2}
                  onValueChange={(v: string) => {
                    setErrorMsg(null);
                    setPassword2(v);
                  }}
                  endContent={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPass2((v) => !v)}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                    >
                      {showPass2 ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                  classNames={{
                    label: "text-zinc-400 font-medium text-sm",
                    inputWrapper: [
                      "bg-zinc-900/50 border-zinc-800 rounded-xl h-12",
                      "hover:border-zinc-600 focus-within:!border-yellow-500 transition-colors",
                    ].join(" "),
                    input: "text-white placeholder:text-zinc-600 text-sm",
                  }}
                />

                <Button
                  type="submit"
                  isLoading={isLoading}
                  isDisabled={!isFormValid || isLoading}
                  className={[
                    "w-full h-12 text-sm font-bold rounded-xl mt-2 transition-all duration-200",
                    isFormValid && !isLoading
                      ? "bg-yellow-500 text-black shadow-lg shadow-yellow-900/30 hover:bg-yellow-400"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
                  ].join(" ")}
                >
                  {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
                </Button>
              </form>
            </div>
          )}

          {/* ── Guardado exitosamente ── */}
          {estado === "guardado" && (
            <div className="flex flex-col items-center text-center gap-6 animate-appearance-in">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck
                  size={36}
                  className="text-emerald-400"
                  strokeWidth={1.5}
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  ¡Contraseña actualizada!
                </h2>
                <p className="text-zinc-500 text-sm">
                  Redirigiendo al inicio de sesión...
                </p>
              </div>
              <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: "100%", transition: "width 2.5s linear" }}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}
