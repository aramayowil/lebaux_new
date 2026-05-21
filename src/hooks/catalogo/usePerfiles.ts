import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Perfil } from "@/types/index";
import { SQUEMA } from "./squemaCatalogo";

const TABLE = "perfiles";

// --- 1. LEER (read) ---
export function usePerfiles() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");
      if (error) throw error;
      return data as Perfil[];
    },
  });
}

// --- 2. CREAR (insert) ---
export function useCreatePerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (perfil: Omit<Perfil, "id">) => {
      const payload = perfil;
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 3. EDITAR (update) ---
export function useUpdatePerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (perfil: Perfil) => {
      const { id, ...payload } = perfil; // ← separamos id del resto

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(payload)
        .eq("id", id) // ← usamos id en vez de nro_perfil
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
    onError: (error) => {
      console.error("Error al actualizar perfil:", error);
    },
  });
}

// --- 4. BORRAR (delete) ---
export function useDeletePerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // ← recibe number en vez de string
      const { error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .delete()
        .eq("id", id); // ← usamos id en vez de nro_perfil
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}
