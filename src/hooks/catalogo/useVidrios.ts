import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Vidrio } from "@/types/index";
import { SQUEMA } from "./squemaCatalogo";

const TABLE = "vidrios";

// --- 1. LEER (read) ---
export function useVidrios() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");
      if (error) throw error;
      return data as Vidrio[];
    },
  });
}

// --- 2. CREAR (insert) ---
export function useCreateVidrio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vidrio: Omit<Vidrio, "id">) => {
      const payload = vidrio;
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
export function useUpdateVidrio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vidrio: Vidrio) => {
      const { id, ...payload } = vidrio; // ← separamos id del resto

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
      console.error("Error al actualizar vidrio:", error);
    },
  });
}

// --- 4. BORRAR (delete) ---
export function useDeleteVidrio() {
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
