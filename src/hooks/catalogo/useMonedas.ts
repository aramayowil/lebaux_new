import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Moneda } from "@/types/index";
import { SQUEMA } from "./squemaCatalogo";

const TABLE = "moneda";

// --- 1. OBTENER MONEDAS (READ) ---
export function useMonedas() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");
      if (error) throw error;
      return data as Moneda[];
    },
  });
}

// --- 2. CREAR MONEDA (UPSERT) ---
export function useCreateMoneda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moneda: Moneda) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .upsert(moneda) // Create o Update automático por ID
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    // Sincronización automática de la UI:
    onSuccess: () => {
      // Le dice a React Query que la lista de monedas ya no es válida
      // Esto hace que se vuelva a disparar el useMonedas() automáticamente
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 3. Actualizar moneda (UPDATE) ---
export function useUpdateMoneda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moneda: Moneda) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(moneda)
        .eq("id", moneda.id)
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

// --- 4. BORRAR (DELETE) ---
export function useDeleteMoneda() {
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
