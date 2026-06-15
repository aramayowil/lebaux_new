import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import NavBar from "@/components/login/NavBar";
import { Button } from "@heroui/react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  MailCheck,
  ArrowLeft,
} from "lucide-react";

/**
 * /auth/confirmar
 *
 * Página INTERMEDIA que recibe el link del email de Supabase.
 * El template de email apunta aquí con ?confirmation_url={{ .ConfirmationURL }}
 * en lugar de usar el link directo. Esto previene que clientes de email
 * (Outlook Safe Links, Gmail, etc.) pre-consuman el token al escanear links.
 *
 * El usuario llega, ve un botón, hace click → ahí se consume el token.
 */

type Estado = "esperando" | "procesando" | "exitoso" | "error";

// Tipos de acción que puede traer el link
type TipoAccion =
  | "signup"
  | "recovery"
  | "invite"
  | "email_change"
  | "magiclink"
  | null;

const TEXTOS: Record<
  NonNullable<TipoAccion>,
  { titulo: string; descripcion: string; boton: string }
> = {
  signup: {
    titulo: "Confirmá tu cuenta",
    descripcion:
      "Hacé click en el botón para activar tu cuenta en el sistema Lebaux.",
    boton: "Confirmar mi cuenta",
  },
  recovery: {
    titulo: "Restablecer contraseña",
    descripcion: "Hacé click para continuar y establecer tu nueva contraseña.",
    boton: "Continuar",
  },
  invite: {
    titulo: "Aceptar invitación",
    descripcion: "Hacé click para aceptar la invitación y acceder al sistema.",
    boton: "Aceptar invitación",
  },
  email_change: {
    titulo: "Confirmar nuevo email",
    descripcion: "Hacé click para confirmar el cambio de dirección de email.",
    boton: "Confirmar nuevo email",
  },
  magiclink: {
    titulo: "Iniciar sesión",
    descripcion: "Hacé click para acceder al sistema de forma segura.",
    boton: "Acceder",
  },
};

export default function AuthConfirmarPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [estado, setEstado] = useState<Estado>("esperando");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extraemos los parámetros del URL
  const confirmationUrl = searchParams.get("confirmation_url");
  const tipoRaw = searchParams.get("type") as TipoAccion;
  const tipo = tipoRaw && tipoRaw in TEXTOS ? tipoRaw : null;

  // Si no hay URL de confirmación, token inválido
  useEffect(() => {
    if (!confirmationUrl) {
      setEstado("error");
      setErrorMsg("El enlace es inválido o ya fue utilizado.");
    }
  }, [confirmationUrl]);

  const handleConfirmar = async () => {
    if (!confirmationUrl) return;
    setEstado("procesando");

    try {
      // Extraemos token_hash y type de la URL de Supabase
      const url = new URL(confirmationUrl);
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type") as any;

      if (!tokenHash || !type) throw new Error("Token inválido");

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (error) throw error;

      setEstado("exitoso");

      // Redirigir según el tipo de acción
      setTimeout(() => {
        if (tipo === "recovery") {
          navigate("/password/nueva", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }, 2000);
    } catch (err: any) {
      setEstado("error");
      if (
        err.message?.includes("expired") ||
        err.message?.includes("invalid")
      ) {
        setErrorMsg("El enlace expiró o ya fue utilizado.");
      } else {
        setErrorMsg(err.message || "Error al verificar el enlace.");
      }
    }
  };

  const textos = tipo ? TEXTOS[tipo] : TEXTOS["signup"];

  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-yellow-500/30">
      <NavBar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px] flex flex-col items-center text-center gap-8 animate-appearance-in">
          {/* ── Esperando acción del usuario ── */}
          {estado === "esperando" && confirmationUrl && (
            <>
              <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <MailCheck
                  size={36}
                  className="text-yellow-500"
                  strokeWidth={1.5}
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-600">
                  Lebaux · Verificación
                </p>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {textos.titulo}
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                  {textos.descripcion}
                </p>
              </div>

              <Button
                onPress={handleConfirmar}
                className="w-full h-12 font-bold text-sm rounded-xl bg-yellow-500 text-black shadow-lg shadow-yellow-900/30 hover:bg-yellow-400 transition-all"
              >
                {textos.boton}
              </Button>

              <Link
                to="/login"
                className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <ArrowLeft size={13} />
                Volver al inicio de sesión
              </Link>
            </>
          )}

          {/* ── Procesando ── */}
          {estado === "procesando" && (
            <>
              <Loader2 size={36} className="text-yellow-500 animate-spin" />
              <p className="text-zinc-400 text-sm">Verificando...</p>
            </>
          )}

          {/* ── Éxito ── */}
          {estado === "exitoso" && (
            <>
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                {tipo === "signup" ? (
                  <ShieldCheck
                    size={36}
                    className="text-emerald-400"
                    strokeWidth={1.5}
                  />
                ) : (
                  <CheckCircle2
                    size={36}
                    className="text-emerald-400"
                    strokeWidth={1.5}
                  />
                )}
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  {tipo === "signup"
                    ? "¡Cuenta confirmada!"
                    : tipo === "recovery"
                      ? "Identidad verificada"
                      : "¡Listo!"}
                </h2>
                <p className="text-zinc-500 text-sm">
                  {tipo === "signup"
                    ? "Tu email fue verificado. Aguardá la activación por parte de un administrador."
                    : "Redirigiendo..."}
                </p>
              </div>
            </>
          )}

          {/* ── Error ── */}
          {estado === "error" && (
            <>
              <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <XCircle size={36} className="text-red-400" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  Enlace inválido
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                  {errorMsg}
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                {tipo === "recovery" && (
                  <Button
                    onPress={() =>
                      navigate("/password/reset", { replace: true })
                    }
                    className="w-full h-11 font-bold text-sm rounded-xl bg-yellow-500 text-black hover:bg-yellow-400"
                  >
                    Solicitar nuevo enlace
                  </Button>
                )}
                <Link
                  to="/login"
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors font-semibold text-sm"
                >
                  <ArrowLeft size={14} />
                  Volver al acceso
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
