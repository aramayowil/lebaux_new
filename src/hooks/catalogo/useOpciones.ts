import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Opciones } from "@/types/index";
import { SQUEMA } from "./squemaCatalogo";

const TABLE = "opciones";

// --- 1. LEER ---
export function useOpciones() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");

      if (error) throw error;
      return data as Opciones[];
    },
  });
}

// --- 2. EDITAR / ACTUALIZAR ---
export function useUpdateOpciones() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Opciones) => {
      // Usamos cod_parte para identificar la fila y actualizar el resto
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(updates)
        .eq("id", updates.id)
        .select()
        .single();

      if (error) throw error;
      return data as Opciones;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 3. BORRAR ---
export function useDeleteOpciones() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 4. CREAR ---
export function useCreateOpciones() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAccesorio: Omit<Opciones, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert([newAccesorio])
        .select()
        .single();

      if (error) throw error;
      return data as Opciones;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}
