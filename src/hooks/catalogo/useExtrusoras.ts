import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Extrusora } from "@/types";
import { SQUEMA } from "./squemaCatalogo";

const TABLE = "extrusoras";

// --- 1. LEER (read) ---
export function useExtrusoras() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");
      if (error) throw error;
      return data as Extrusora[];
    },
  });
}

// --- 2. CREAR (insert) ---
export function useCreateExtrusora() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (extrusora: Omit<Extrusora, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(extrusora)
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
export function useUpdateExtrusora() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (extrusora: Extrusora) => {
      const { id, ...payload } = extrusora;

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
    onError: (error) => {
      console.error("Error al actualizar extrusora:", error);
    },
  });
}

// --- 4. BORRAR (delete) ---
export function useDeleteExtrusora() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .schema(SQUEMA)
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
