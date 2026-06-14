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
      // Invalida el perfil cacheado del usuario logueado por si cambió su propio rol
      queryClient.invalidateQueries({ queryKey: ["perfil"] });
    },
  });
}

// --- 3. ELIMINAR PERFIL (revoca acceso; no borra el usuario de Auth) ---
export function useEliminarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .schema(SQUEMA_SEGURIDAD)
        .from(TABLE)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}
