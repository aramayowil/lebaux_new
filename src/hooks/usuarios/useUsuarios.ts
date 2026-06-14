import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Usuario } from "@/types/index";
import { SQUEMA_SEGURIDAD } from "./squemaSeguridad";

const TABLE = "usuarios";

// --- 1. LISTAR USUARIOS (con su rol embebido) ---
export function useUsuarios() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA_SEGURIDAD)
        .from(TABLE)
        .select("*, roles(*)")
        .order("creado_en", { ascending: true });
      if (error) throw error;
      return data as Usuario[];
    },
  });
}

// --- 2. ACTUALIZAR USUARIO (rol, nombre, activo) ---
export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (usuario: Partial<Usuario> & { id: string }) => {
      const { roles, ...rest } = usuario;
      const { data, error } = await supabase
        .schema(SQUEMA_SEGURIDAD)
        .from(TABLE)
        .update(rest)
        .eq("id", usuario.id)
        .select("*, roles(*)")
        .single();

      if (error) throw error;
      return data as Usuario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
      queryClient.invalidateQueries({ queryKey: [TABLE, "perfil"] });
    },
  });
}

// --- 3. ELIMINAR USUARIO COMPLETO (auth.users + seguridad.usuarios en cascade) ---
export function useEliminarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Edge Function con service_role: borra auth.users → cascade a seguridad.usuarios
      const { error } = await supabase.functions.invoke("eliminar-usuario", {
        body: { userId: id },
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
      queryClient.invalidateQueries({ queryKey: [TABLE, "perfil"] });
    },
  });
}
