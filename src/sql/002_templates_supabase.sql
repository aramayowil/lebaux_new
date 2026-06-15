-- ════════════════════════════════════════════════════════════════════════
--  002: Email Templates personalizados + Hook de verificación de contraseña
--
--  INSTRUCCIONES:
--  1. Ejecutar este SQL en Supabase Dashboard → SQL Editor
--  2. Para los templates de email: ir a
--     Authentication → Email Templates y pegar el HTML de cada sección
-- ════════════════════════════════════════════════════════════════════════

-- ─── HOOK: Rate limiting de intentos de contraseña fallidos ──────────────────
-- Evita ataques de fuerza bruta: máximo 1 intento fallido cada 10 segundos.

-- Tabla para registrar intentos fallidos
CREATE TABLE IF NOT EXISTS public.password_failed_attempts (
  user_id uuid NOT NULL PRIMARY KEY,
  last_failed_at timestamptz NOT NULL DEFAULT now(),
  fail_count integer NOT NULL DEFAULT 0
);

-- Solo supabase_auth_admin puede leer/escribir esta tabla
GRANT ALL ON TABLE public.password_failed_attempts TO supabase_auth_admin;
REVOKE ALL ON TABLE public.password_failed_attempts FROM authenticated, anon, public;

-- Función del hook
CREATE OR REPLACE FUNCTION public.hook_password_verification_attempt(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
  v_valid boolean;
  v_last_failed_at timestamptz;
  v_fail_count integer;
BEGIN
  v_user_id := (event->>'user_id')::uuid;
  v_valid := (event->>'valid')::boolean;

  -- Si la contraseña es correcta, resetear el contador y continuar
  IF v_valid THEN
    DELETE FROM public.password_failed_attempts WHERE user_id = v_user_id;
    RETURN jsonb_build_object('decision', 'continue');
  END IF;

  -- Contraseña incorrecta: revisar el último intento fallido
  SELECT last_failed_at, fail_count
    INTO v_last_failed_at, v_fail_count
    FROM public.password_failed_attempts
    WHERE user_id = v_user_id;

  -- Si falló muy recientemente (< 10 seg), bloquear
  IF v_last_failed_at IS NOT NULL AND now() - v_last_failed_at < interval '10 seconds' THEN
    RETURN jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 429,
        'message', 'Demasiados intentos. Esperá unos segundos antes de reintentar.'
      )
    );
  END IF;

  -- Registrar el intento fallido
  INSERT INTO public.password_failed_attempts (user_id, last_failed_at, fail_count)
    VALUES (v_user_id, now(), 1)
    ON CONFLICT (user_id) DO UPDATE
      SET last_failed_at = now(),
          fail_count = public.password_failed_attempts.fail_count + 1;

  RETURN jsonb_build_object('decision', 'continue');
END;
$$;

-- Permisos del hook
GRANT EXECUTE ON FUNCTION public.hook_password_verification_attempt TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.hook_password_verification_attempt FROM authenticated, anon, public;

-- ════════════════════════════════════════════════════════════════════════
--  IMPORTANTE: Activar el hook en Supabase Dashboard →
--  Authentication → Hooks → Password Verification Hook
--  Seleccionar: public.hook_password_verification_attempt
-- ════════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════════
--  TEMPLATES DE EMAIL — copiar en Authentication → Email Templates
-- ════════════════════════════════════════════════════════════════════════

/*
──────────────────────────────────────────────────────────────────────────
  1. CONFIRM SIGNUP (Confirmar registro)
  Subject: Activá tu cuenta en Lebaux
──────────────────────────────────────────────────────────────────────────

<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #09090b; color: #e4e4e7; max-width: 480px; margin: 0 auto; border-radius: 16px; overflow: hidden; border: 1px solid #27272a;">

  <!-- Header -->
  <div style="background: #18181b; padding: 28px 32px 24px; border-bottom: 1px solid #27272a;">
    <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #ca8a04;">Lebaux · Sistema de Gestión</p>
    <h1 style="margin: 8px 0 0; font-size: 22px; font-weight: 800; color: #fafafa; letter-spacing: -0.5px;">Activá tu cuenta</h1>
  </div>

  <!-- Body -->
  <div style="padding: 28px 32px;">
    <p style="margin: 0 0 16px; font-size: 14px; color: #a1a1aa; line-height: 1.6;">
      ¡Hola <strong style="color: #fafafa;">{{ .Data.first_name }}</strong>! Gracias por registrarte en el sistema de gestión de Lebaux.
    </p>
    <p style="margin: 0 0 24px; font-size: 14px; color: #a1a1aa; line-height: 1.6;">
      Hacé click en el botón para confirmar tu dirección de email. Una vez confirmada, aguardá a que un administrador active tu cuenta.
    </p>

    <!-- CTA -->
    <a href="{{ .SiteURL }}/auth/confirmar?confirmation_url={{ .ConfirmationURL }}&type=signup"
       style="display: inline-block; background: #eab308; color: #09090b; font-weight: 700; font-size: 14px; padding: 13px 28px; border-radius: 10px; text-decoration: none; letter-spacing: 0.2px;">
      Confirmar mi cuenta
    </a>

    <p style="margin: 24px 0 0; font-size: 12px; color: #52525b; line-height: 1.5;">
      Si no te registraste en Lebaux, podés ignorar este email. El enlace expira en 24 horas.
    </p>
  </div>

  <!-- Footer -->
  <div style="padding: 16px 32px; border-top: 1px solid #27272a; background: #18181b;">
    <p style="margin: 0; font-size: 11px; color: #3f3f46;">© Lebaux · Aberturas de Aluminio</p>
  </div>
</div>


──────────────────────────────────────────────────────────────────────────
  2. RESET PASSWORD (Recuperar contraseña)
  Subject: Restablecé tu contraseña en Lebaux
──────────────────────────────────────────────────────────────────────────

<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #09090b; color: #e4e4e7; max-width: 480px; margin: 0 auto; border-radius: 16px; overflow: hidden; border: 1px solid #27272a;">

  <div style="background: #18181b; padding: 28px 32px 24px; border-bottom: 1px solid #27272a;">
    <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #ca8a04;">Lebaux · Seguridad</p>
    <h1 style="margin: 8px 0 0; font-size: 22px; font-weight: 800; color: #fafafa; letter-spacing: -0.5px;">Restablecer contraseña</h1>
  </div>

  <div style="padding: 28px 32px;">
    <p style="margin: 0 0 16px; font-size: 14px; color: #a1a1aa; line-height: 1.6;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en Lebaux.
    </p>
    <p style="margin: 0 0 24px; font-size: 14px; color: #a1a1aa; line-height: 1.6;">
      Hacé click en el botón para crear una nueva contraseña. El enlace expira en <strong style="color: #fafafa;">1 hora</strong>.
    </p>

    <a href="{{ .SiteURL }}/auth/confirmar?confirmation_url={{ .ConfirmationURL }}&type=recovery"
       style="display: inline-block; background: #eab308; color: #09090b; font-weight: 700; font-size: 14px; padding: 13px 28px; border-radius: 10px; text-decoration: none;">
      Restablecer contraseña
    </a>

    <div style="margin-top: 24px; padding: 14px 16px; background: #27272a; border-radius: 8px; border-left: 3px solid #ef4444;">
      <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
        <strong style="color: #fafafa;">¿No solicitaste este cambio?</strong><br>
        Ignorá este email. Tu contraseña actual permanece sin cambios.
      </p>
    </div>
  </div>

  <div style="padding: 16px 32px; border-top: 1px solid #27272a; background: #18181b;">
    <p style="margin: 0; font-size: 11px; color: #3f3f46;">© Lebaux · Aberturas de Aluminio</p>
  </div>
</div>


──────────────────────────────────────────────────────────────────────────
  3. PASSWORD CHANGED (Notificación de cambio de contraseña)
  Subject: Tu contraseña fue modificada · Lebaux
──────────────────────────────────────────────────────────────────────────

<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #09090b; color: #e4e4e7; max-width: 480px; margin: 0 auto; border-radius: 16px; overflow: hidden; border: 1px solid #27272a;">

  <div style="background: #18181b; padding: 28px 32px 24px; border-bottom: 1px solid #27272a;">
    <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #ca8a04;">Lebaux · Seguridad</p>
    <h1 style="margin: 8px 0 0; font-size: 22px; font-weight: 800; color: #fafafa;">Tu contraseña fue cambiada</h1>
  </div>

  <div style="padding: 28px 32px;">
    <p style="margin: 0 0 16px; font-size: 14px; color: #a1a1aa; line-height: 1.6;">
      La contraseña de tu cuenta en Lebaux fue modificada recientemente.
    </p>

    <div style="margin: 0 0 24px; padding: 14px 16px; background: #27272a; border-radius: 8px; border-left: 3px solid #ef4444;">
      <p style="margin: 0; font-size: 13px; color: #fca5a5; line-height: 1.5;">
        <strong>¿No fuiste vos?</strong><br>
        Restablecé tu contraseña inmediatamente y contactá al administrador del sistema.
      </p>
    </div>

    <a href="{{ .SiteURL }}/password/reset"
       style="display: inline-block; background: #ef4444; color: #fff; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
      Restablecer contraseña ahora
    </a>
  </div>

  <div style="padding: 16px 32px; border-top: 1px solid #27272a; background: #18181b;">
    <p style="margin: 0; font-size: 11px; color: #3f3f46;">© Lebaux · Aberturas de Aluminio</p>
  </div>
</div>

*/