// supabase/functions/eliminar-usuario/index.ts
//
// DEPLOY:
//   supabase functions deploy eliminar-usuario --no-verify-jwt
//
// VARIABLES DE ENTORNO necesarias en Supabase Dashboard → Edge Functions → Secrets:
//   SUPABASE_URL          (automática en Supabase)
//   SUPABASE_SERVICE_ROLE_KEY  (ir a Project Settings → API → service_role)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verificar que el llamante está autenticado y es Administrador
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Sin autorización" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cliente con el JWT del usuario que llama (para verificar su rol)
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar que el llamante es Administrador activo en seguridad.usuarios
    const { data: perfil, error: perfilError } = await supabaseUser
      .schema("seguridad")
      .from("usuarios")
      .select("activo, roles(nombre)")
      .eq("id", user.id)
      .single();

    if (
      perfilError ||
      !perfil?.activo ||
      (perfil.roles as any)?.nombre !== "Administrador"
    ) {
      return new Response(JSON.stringify({ error: "Permisos insuficientes" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Obtener el ID del usuario a eliminar del body
    const { userId } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No permitir que un admin se elimine a sí mismo
    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: "No podés eliminarte a vos mismo" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 3. Eliminar con service_role (borra en cascade: auth.users → seguridad.usuarios)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
