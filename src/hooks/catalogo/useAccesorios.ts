import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Accesorio } from "@/types/index";
import { SQUEMA } from "./squemaCatalogo";

const TABLE = "accesorios";

// --- 1. LEER ---
export function useAccesorios() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      return data as Accesorio[];
    },
  });
}

// --- 2. EDITAR / ACTUALIZAR ---
export function useUpdateAccesorio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Accesorio) => {
      // Usamos cod_parte para identificar la fila y actualizar el resto
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(updates)
        .eq("id", updates.id)
        .select()
        .single();

      if (error) throw error;
      return data as Accesorio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 3. BORRAR ---
export function useDeleteAccesorio() {
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
export function useCreateAccesorio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAccesorio: Omit<Accesorio, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert([newAccesorio])
        .select()
        .single();

      if (error) throw error;
      return data as Accesorio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}
