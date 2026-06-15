import { Button, Input } from "@heroui/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import NavBar from "@/components/login/NavBar";

// Traducciones de errores de Supabase
const traducirError = (msg: string): string => {
  if (msg.includes("Invalid login credentials"))
    return "Email o contraseña incorrectos.";
  if (msg.includes("Email not confirmed"))
    return "Confirmá tu email antes de ingresar.";
  if (msg.includes("Too many requests"))
    return "Demasiados intentos. Esperá unos minutos.";
  if (msg.includes("User not found"))
    return "No existe una cuenta con ese email.";
  return msg;
};

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuthStore();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isFormValid =
    formData.email.trim() !== "" && formData.password.length >= 6;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoggingIn) return;
    setErrorMsg(null);

    const resultado = await login({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    if (!resultado.success) {
      const errorRaw = resultado.error || "Error al iniciar sesión.";
      if (errorRaw.includes("Email not confirmed")) {
        // Redirigir a la pantalla de reenvío, pasando el email que intentó usar
        navigate("/auth/pendiente", { state: { email: formData.email } });
        return;
      }
      // Para el resto de errores, mostramos el banner rojo normal
      const msg = traducirError(errorRaw);
      setErrorMsg(msg);
    }
    // Si tuvo éxito: onAuthStateChange → setSession → PublicRoute detecta
    // isAuthenticated=true y redirige a "/" → ProtectedRoute elige el primer
    // destino al que el usuario tiene permiso de ver.
  };
  const photo_login = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets/auth/fabrica_1.webp`;

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-yellow-500/30">
      <NavBar />

      <div className="flex-1 flex overflow-hidden">
        {/* ── Imagen lateral ── */}
        <div className="hidden lg:block w-1/2 relative overflow-hidden">
          <img
            src={photo_login}
            alt="Fábrica Lebaux"
            className="absolute inset-0 w-full h-full object-cover grayscale-[0.2]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent" />
          <div className="absolute bottom-12 left-12 max-w-md z-10">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tighter leading-tight">
              Sistema de Gestión <br />
              <span className="text-yellow-500">Aberturas de Aluminio</span>
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed">
              Presupuestos, cálculos de corte y gestión de obras en una sola
              plataforma.
            </p>
          </div>
        </div>

        {/* ── Formulario ── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#050505]">
          <div className="w-full max-w-[400px] space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-5 w-1 bg-yellow-500 rounded-full" />
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">
                  Lebaux
                </p>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Bienvenido
              </h2>
              <p className="text-zinc-500 text-sm">
                Ingresá tus credenciales para acceder al panel.
              </p>
            </div>

            {/* Banner de error */}
            {errorMsg && (
              <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/60 rounded-xl px-4 py-3 animate-appearance-in">
                <AlertCircle
                  size={16}
                  className="text-red-400 mt-0.5 shrink-0"
                />
                <p className="text-sm text-red-300 font-medium">{errorMsg}</p>
              </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={onSubmit}>
              <Input
                label="Email"
                placeholder="usuario@lebaux.com"
                labelPlacement="outside"
                variant="bordered"
                type="email"
                size="lg"
                autoComplete="email"
                isDisabled={isLoggingIn}
                value={formData.email}
                onValueChange={(v: string) => {
                  setErrorMsg(null);
                  setFormData((f) => ({ ...f, email: v }));
                }}
                classNames={{
                  label: "text-zinc-400 font-medium text-sm",
                  inputWrapper: [
                    "bg-zinc-900/50 border-zinc-800 rounded-xl h-12",
                    "hover:border-zinc-600 focus-within:!border-yellow-500",
                    "transition-colors",
                  ].join(" "),
                  input: "text-white placeholder:text-zinc-600 text-sm",
                }}
              />

              <div className="space-y-1.5">
                <Input
                  label="Contraseña"
                  placeholder="Ingresá tu contraseña"
                  labelPlacement="outside"
                  variant="bordered"
                  type={showPassword ? "text" : "password"}
                  size="lg"
                  autoComplete="current-password"
                  isDisabled={isLoggingIn}
                  value={formData.password}
                  onValueChange={(v: string) => {
                    setErrorMsg(null);
                    setFormData((f) => ({ ...f, password: v }));
                  }}
                  endContent={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                  classNames={{
                    label: "text-zinc-400 font-medium text-sm",
                    inputWrapper: [
                      "bg-zinc-900/50 border-zinc-800 rounded-xl h-12",
                      "hover:border-zinc-600 focus-within:!border-yellow-500",
                      "transition-colors",
                    ].join(" "),
                    input: "text-white placeholder:text-zinc-600 text-sm",
                  }}
                />
                <div className="flex justify-end">
                  <Link
                    to="/password/reset"
                    tabIndex={-1}
                    className="text-xs text-zinc-500 hover:text-yellow-500 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isLoggingIn}
                isDisabled={!isFormValid || isLoggingIn}
                className={[
                  "w-full h-12 text-sm font-bold rounded-xl mt-1 transition-all duration-200",
                  isFormValid && !isLoggingIn
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-900/30 hover:bg-yellow-400"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
                ].join(" ")}
              >
                {isLoggingIn ? "Ingresando..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="pt-5 border-t border-zinc-900 text-center">
              <p className="text-sm text-zinc-500">
                ¿No tenés acceso?{" "}
                <Link
                  to="/register"
                  className="text-yellow-500 font-semibold hover:underline decoration-2 underline-offset-4"
                >
                  Registrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
