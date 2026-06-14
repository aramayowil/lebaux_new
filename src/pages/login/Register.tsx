import { Button, Input } from "@heroui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import NavBar from "@/components/login/NavBar";
import {
  Eye,
  EyeOff,
  BadgeCheck,
  MailCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import validateName from "@/utils/regex/name_lastname";
import validatePassword from "@/utils/regex/passwordRegex";
import validateEmail from "@/utils/regex/emailRegex";

// Traducciones de errores de Supabase
const traducirError = (msg: string): string => {
  if (
    msg.includes("already registered") ||
    msg.includes("already been registered")
  )
    return "Ya existe una cuenta con ese email.";
  if (msg.includes("Password should be"))
    return "La contraseña es demasiado corta.";
  if (msg.includes("Unable to validate")) return "Email inválido.";
  if (msg.includes("rate limit"))
    return "Demasiados intentos. Esperá unos minutos.";
  return msg;
};

const inputClass = {
  label: "text-zinc-400 font-medium text-sm",
  inputWrapper: [
    "bg-zinc-900/50 border-zinc-800 rounded-xl h-12",
    "hover:border-zinc-600 focus-within:!border-yellow-500",
    "transition-colors",
  ].join(" "),
  input: "text-white placeholder:text-zinc-600 text-sm",
  errorMessage: "text-xs text-red-400 mt-1",
};

// Indicador de requisito de contraseña
const Req = ({ ok, label }: { ok: boolean; label: string }) => (
  <span
    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${ok ? "text-emerald-400" : "text-zinc-600"}`}
  >
    {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
    {label}
  </span>
);

const Register = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    name: "",
    lastName: "",
    password: "",
    password2: "",
  });

  const set = (field: keyof typeof form) => (val: string) => {
    setErrorMsg(null);
    setForm((f) => ({ ...f, [field]: val }));
  };

  // Validaciones
  const nameOk = validateName(form.name);
  const lastNameOk = validateName(form.lastName);
  const emailOk = validateEmail(form.email);
  const passValidation = validatePassword(form.password);
  const passMatch = form.password !== "" && form.password === form.password2;

  const isFormValid =
    nameOk && lastNameOk && emailOk && passValidation.isValid && passMatch;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            full_name: `${form.name.trim()} ${form.lastName.trim()}`,
            first_name: form.name.trim(),
            last_name: form.lastName.trim(),
          },
        },
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (err: any) {
      const msg = traducirError(err.message || "Error al registrarse.");
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-yellow-500/30">
      <NavBar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[440px]">
          {!isSuccess ? (
            <div className="space-y-7 animate-appearance-in">
              {/* Header */}
              <header className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-1 bg-yellow-500 rounded-full" />
                  <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">
                    Lebaux · Registro
                  </p>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Nueva cuenta
                </h2>
                <p className="text-zinc-500 text-sm">
                  Tu cuenta quedará pendiente hasta que un administrador la
                  active.
                </p>
              </header>

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

              <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    isRequired
                    label="Nombre"
                    labelPlacement="outside"
                    placeholder="Nombre"
                    variant="bordered"
                    size="lg"
                    autoComplete="given-name"
                    isDisabled={isLoading}
                    isInvalid={form.name !== "" && !nameOk}
                    errorMessage="Nombre inválido"
                    value={form.name}
                    onValueChange={set("name")}
                    classNames={inputClass}
                  />
                  <Input
                    isRequired
                    label="Apellido"
                    labelPlacement="outside"
                    placeholder="Apellido"
                    variant="bordered"
                    size="lg"
                    autoComplete="family-name"
                    isDisabled={isLoading}
                    isInvalid={form.lastName !== "" && !lastNameOk}
                    errorMessage="Apellido inválido"
                    value={form.lastName}
                    onValueChange={set("lastName")}
                    classNames={inputClass}
                  />
                </div>

                {/* Email */}
                <Input
                  isRequired
                  label="Correo electrónico"
                  labelPlacement="outside"
                  placeholder="usuario@lebaux.com"
                  variant="bordered"
                  type="email"
                  size="lg"
                  autoComplete="email"
                  isDisabled={isLoading}
                  isInvalid={form.email !== "" && !emailOk}
                  errorMessage="Formato de email inválido"
                  value={form.email}
                  onValueChange={set("email")}
                  classNames={inputClass}
                />

                {/* Contraseña */}
                <div className="space-y-2">
                  <Input
                    isRequired
                    label="Contraseña"
                    labelPlacement="outside"
                    placeholder="Mínimo 8 caracteres"
                    variant="bordered"
                    type={showPass ? "text" : "password"}
                    size="lg"
                    autoComplete="new-password"
                    isDisabled={isLoading}
                    isInvalid={form.password !== "" && !passValidation.isValid}
                    value={form.password}
                    onValueChange={set("password")}
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
                    classNames={inputClass}
                  />

                  {/* Indicadores de requisitos */}
                  {form.password.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-1 animate-appearance-in">
                      <Req
                        ok={form.password.length >= 8}
                        label="8 caracteres"
                      />
                      <Req ok={/[A-Z]/.test(form.password)} label="Mayúscula" />
                      <Req ok={/[0-9]/.test(form.password)} label="Número" />
                      <Req
                        ok={/[^A-Za-z0-9]/.test(form.password)}
                        label="Símbolo"
                      />
                    </div>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <Input
                  isRequired
                  label="Confirmar contraseña"
                  labelPlacement="outside"
                  placeholder="Repetí tu contraseña"
                  variant="bordered"
                  type={showPass2 ? "text" : "password"}
                  size="lg"
                  autoComplete="new-password"
                  isDisabled={isLoading}
                  isInvalid={form.password2 !== "" && !passMatch}
                  errorMessage="Las contraseñas no coinciden"
                  value={form.password2}
                  onValueChange={set("password2")}
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
                  classNames={inputClass}
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
                  {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </form>

              <div className="pt-5 border-t border-zinc-900 text-center">
                <p className="text-sm text-zinc-500">
                  ¿Ya sos parte del equipo?{" "}
                  <Link
                    to="/login"
                    className="text-yellow-500 font-semibold hover:underline decoration-2 underline-offset-4"
                  >
                    Iniciá sesión
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            /* ── PANTALLA DE ÉXITO ── */
            <div className="flex flex-col items-center text-center gap-8 py-10 animate-appearance-in">
              <div className="relative">
                <div className="bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800">
                  <MailCheck size={48} className="text-yellow-500" />
                </div>
                <BadgeCheck
                  size={28}
                  className="absolute -top-2 -right-2 text-emerald-500 bg-black rounded-full"
                />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white tracking-tighter uppercase italic">
                  ¡Casi listo!
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-[300px] mx-auto">
                  Enviamos un enlace de activación a:
                  <br />
                  <span className="text-zinc-100 font-mono text-xs bg-zinc-900 px-2 py-0.5 rounded mt-1 inline-block">
                    {form.email}
                  </span>
                </p>
                <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60 mt-2">
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    Confirmá tu email y luego aguardá a que un administrador
                    active tu cuenta.
                  </p>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full h-12 flex items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors font-semibold text-sm"
              >
                Volver al acceso
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Register;
