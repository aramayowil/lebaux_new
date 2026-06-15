import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input } from "@heroui/react";
import { supabase } from "@/lib/supabaseClient";
import NavBar from "@/components/login/NavBar";
import { ToastContainer, toast } from "react-toastify";
import {
  Mail,
  AlertCircle,
  ArrowLeft,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import validateEmail from "@/utils/regex/emailRegex";

const traducirError = (msg: string) => {
  if (msg.includes("rate limit") || msg.includes("over_email_send_rate_limit"))
    return "Demasiados intentos. Esperá unos minutos antes de reintentar.";
  if (msg.includes("Unable to validate")) return "Email inválido.";
  return msg;
};

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const emailOk = validateEmail(email);

  const startCooldown = () => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((v) => {
        if (v <= 1) {
          clearInterval(interval);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk || isLoading || cooldown > 0) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          // La página intermedia recibe el token y lo consume cuando el usuario
          // hace click, evitando el problema de prefetching de clientes de email.
          redirectTo: `${window.location.origin}/auth/confirmar?type=recovery`,
        },
      );
      if (error) throw error;

      setEnviado(true);
      startCooldown();
      toast.success("Email enviado. Revisá tu bandeja.", { theme: "dark" });
    } catch (err: any) {
      const msg = traducirError(err.message || "Error al enviar el email.");
      setErrorMsg(msg);
      toast.error(msg, { theme: "dark" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviar = async () => {
    if (cooldown > 0 || isLoading) return;
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-yellow-500/30">
      <NavBar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px] space-y-7 animate-appearance-in">
          {!enviado ? (
            <>
              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-1 bg-yellow-500 rounded-full" />
                  <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">
                    Lebaux · Recuperar acceso
                  </p>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  ¿Olvidaste tu contraseña?
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Ingresá tu email y te enviamos un enlace para que puedas crear
                  una nueva contraseña.
                </p>
              </div>

              {/* Banner de error */}
              {errorMsg && (
                <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/60 rounded-xl px-4 py-3">
                  <AlertCircle
                    size={16}
                    className="text-red-400 mt-0.5 shrink-0"
                  />
                  <p className="text-sm text-red-300 font-medium">{errorMsg}</p>
                </div>
              )}

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                  label="Email"
                  labelPlacement="outside"
                  placeholder="usuario@lebaux.com"
                  type="email"
                  variant="bordered"
                  size="lg"
                  autoComplete="email"
                  autoFocus
                  isDisabled={isLoading}
                  isInvalid={email !== "" && !emailOk}
                  errorMessage="Formato de email inválido"
                  value={email}
                  onValueChange={(v: string) => {
                    setErrorMsg(null);
                    setEmail(v);
                  }}
                  startContent={<Mail size={15} className="text-zinc-500" />}
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
                  isDisabled={!emailOk || isLoading}
                  className={[
                    "w-full h-12 text-sm font-bold rounded-xl transition-all duration-200",
                    emailOk && !isLoading
                      ? "bg-yellow-500 text-black shadow-lg shadow-yellow-900/30 hover:bg-yellow-400"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
                  ].join(" ")}
                >
                  {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>
              </form>

              <div className="pt-4 border-t border-zinc-900">
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-sm text-zinc-500 hover:text-yellow-500 transition-colors font-medium"
                >
                  <ArrowLeft size={14} />
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          ) : (
            /* ── PANTALLA DE ÉXITO ── */
            <div className="flex flex-col items-center text-center gap-7">
              <div className="bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800">
                <MailCheck size={48} className="text-yellow-500" />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Revisá tu email
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-[280px] mx-auto">
                  Enviamos el enlace de recuperación a:
                  <br />
                  <span className="text-zinc-100 font-mono text-xs bg-zinc-900 px-2 py-0.5 rounded mt-1 inline-block">
                    {email}
                  </span>
                </p>
                <p className="text-zinc-600 text-xs">
                  El enlace expira en 1 hora. Revisá también la carpeta de spam.
                </p>
              </div>

              <div className="w-full space-y-3">
                <Button
                  onPress={handleReenviar}
                  isLoading={isLoading}
                  isDisabled={cooldown > 0 || isLoading}
                  startContent={!isLoading && <RefreshCw size={14} />}
                  variant="flat"
                  className={[
                    "w-full h-11 font-bold text-sm rounded-xl transition-all",
                    cooldown > 0
                      ? "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                      : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {isLoading
                    ? "Reenviando..."
                    : cooldown > 0
                      ? `Reenviar en ${cooldown}s`
                      : "Reenviar enlace"}
                </Button>

                <Link
                  to="/login"
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors font-semibold text-sm"
                >
                  <ArrowLeft size={14} />
                  Volver al acceso
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}
