import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import NavBar from "@/components/login/NavBar";
import { Button, Input } from "@heroui/react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Mail,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import validateEmail from "@/utils/regex/emailRegex";

/**
 * /auth/pendiente
 *
 * Pantalla para usuarios que intentaron iniciar sesión pero aún no confirmaron
 * su email. Permite:
 *   1. Ver el email con el que intentaron ingresar (viene de Login via state
 *      o persiste en sessionStorage para sobrevivir F5).
 *   2. Reenviar el email de confirmación con cooldown de 60 s.
 *   3. Detectar automáticamente si el usuario confirma en otra pestaña
 *      (onAuthStateChange → SIGNED_IN) y redirigir sin que haga nada.
 *   4. Cambiar el email si se equivocaron.
 */

const COOLDOWN_SEG = 60;
const SESSION_KEY_EMAIL = "pendiente_email";
const SESSION_KEY_TS = "pendiente_ts";

export default function AuthPendientePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Recuperar email: primero del state de navegación, luego de sessionStorage
  const emailInicial: string =
    (location.state as any)?.email ||
    sessionStorage.getItem(SESSION_KEY_EMAIL) ||
    "";

  const [email, setEmail] = useState(emailInicial);
  const [editando, setEditando] = useState(!emailInicial);
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [confirmado, setConfirmado] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const emailOk = validateEmail(email);

  // ── Persistir email en sessionStorage ──────────────────────────────────────
  useEffect(() => {
    if (email) {
      sessionStorage.setItem(SESSION_KEY_EMAIL, email);
      sessionStorage.setItem(SESSION_KEY_TS, Date.now().toString());
    }
  }, [email]);

  // ── Restaurar cooldown si la página se recarga durante el período ──────────
  useEffect(() => {
    const ts = sessionStorage.getItem(SESSION_KEY_TS);
    if (!ts) return;
    const elapsed = Math.floor((Date.now() - parseInt(ts, 10)) / 1000);
    const restante = COOLDOWN_SEG - elapsed;
    if (restante > 0 && enviado) iniciarCooldown(restante);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Detectar confirmación en otra pestaña ─────────────────────────────────
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setConfirmado(true);
        sessionStorage.removeItem(SESSION_KEY_EMAIL);
        sessionStorage.removeItem(SESSION_KEY_TS);
        setTimeout(() => navigate("/", { replace: true }), 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // ── Limpiar interval al desmontar ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const iniciarCooldown = (segundos = COOLDOWN_SEG) => {
    setCooldown(segundos);
    cooldownRef.current = setInterval(() => {
      setCooldown((v) => {
        if (v <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  };

  const handleReenviar = async () => {
    if (!emailOk || isLoading || cooldown > 0) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirmar?type=signup`,
        },
      });

      // Supabase devuelve éxito aunque el email no exista (seguridad anti-enum).
      // Mostramos éxito siempre para no revelar si el email está registrado.
      if (error && !error.message.includes("rate")) throw error;

      setEnviado(true);
      sessionStorage.setItem(SESSION_KEY_TS, Date.now().toString());
      iniciarCooldown();
    } catch (err: any) {
      // Solo mostramos error en rate limit real; el resto se trata como éxito.
      console.error("resend error:", err.message);
      setEnviado(true);
      iniciarCooldown();
    } finally {
      setIsLoading(false);
    }
  };

  // ── Estado: confirmado en otra pestaña ───────────────────────────────────
  if (confirmado) {
    return (
      <div className="min-h-screen bg-black flex flex-col selection:bg-yellow-500/30">
        <NavBar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-[400px] flex flex-col items-center text-center gap-8 animate-appearance-in">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2
                size={36}
                className="text-emerald-400"
                strokeWidth={1.5}
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                ¡Email confirmado!
              </h2>
              <p className="text-zinc-500 text-sm">
                Redirigiendo al sistema...
              </p>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: "100%", transition: "width 2s linear" }}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-yellow-500/30">
      <NavBar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px] flex flex-col items-center text-center gap-8 animate-appearance-in">
          {/* Ícono */}
          <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <MailCheck
              size={36}
              className="text-yellow-500"
              strokeWidth={1.5}
            />
          </div>

          {/* Encabezado */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-600">
              Lebaux · Verificación pendiente
            </p>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Confirmá tu email
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px] mx-auto">
              Tu cuenta aún no está verificada. Revisá tu bandeja de entrada y
              hacé click en el enlace de confirmación.
            </p>
          </div>

          {/* Indicador de escucha automática */}
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500/70" />
            </span>
            Esperando confirmación automáticamente…
          </div>

          <div className="w-full space-y-4">
            {/* Email actual o editor */}
            {!editando ? (
              <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail size={14} className="text-zinc-500 shrink-0" />
                  <span className="text-sm text-zinc-300 font-mono truncate">
                    {email}
                  </span>
                </div>
                <button
                  onClick={() => setEditando(true)}
                  className="text-xs text-zinc-500 hover:text-yellow-500 transition-colors ml-3 shrink-0 font-medium"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="tu@email.com"
                  type="email"
                  variant="bordered"
                  size="md"
                  autoFocus
                  value={email}
                  onValueChange={(v: string) => setEmail(v)}
                  isInvalid={email !== "" && !emailOk}
                  classNames={{
                    inputWrapper: [
                      "bg-zinc-900/50 border-zinc-800 rounded-xl h-11",
                      "hover:border-zinc-600 focus-within:!border-yellow-500 transition-colors",
                    ].join(" "),
                    input: "text-white placeholder:text-zinc-600 text-sm",
                  }}
                />
                <Button
                  isDisabled={!emailOk}
                  onPress={() => setEditando(false)}
                  className="h-11 px-4 font-bold text-sm rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 shrink-0"
                >
                  OK
                </Button>
              </div>
            )}

            {/* Botón de reenvío */}
            <Button
              onPress={handleReenviar}
              isLoading={isLoading}
              isDisabled={!emailOk || editando || cooldown > 0 || isLoading}
              startContent={
                !isLoading && cooldown > 0 ? (
                  <Clock size={14} />
                ) : !isLoading ? (
                  <RefreshCw size={14} />
                ) : undefined
              }
              className={[
                "w-full h-12 font-bold text-sm rounded-xl transition-all duration-200",
                !emailOk || editando || cooldown > 0 || isLoading
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-yellow-500 text-black shadow-lg shadow-yellow-900/30 hover:bg-yellow-400",
              ].join(" ")}
            >
              {isLoading
                ? "Enviando..."
                : cooldown > 0
                  ? `Reenviar en ${cooldown}s`
                  : enviado
                    ? "Reenviar email"
                    : "Enviar email de confirmación"}
            </Button>

            {/* Feedback de éxito post-envío */}
            {enviado && cooldown > 0 && (
              <p className="text-xs text-emerald-500 text-center animate-appearance-in">
                Email enviado. Revisá también la carpeta de spam.
              </p>
            )}
          </div>

          {/* Separador y volver */}
          <div className="w-full pt-2 border-t border-zinc-900">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
