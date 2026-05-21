import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Linea } from "@/types/index";
import { SQUEMA } from "./squemaCatalogo";

const TABLE = "lineas";

// --- 1. LEER (read) ---
export function useLineas(idExtrusora?: number | null) {
  return useQuery({
    queryKey: [TABLE, idExtrusora],
    queryFn: async () => {
      let query = supabase.schema(SQUEMA).from(TABLE).select("*");

      if (idExtrusora) {
        query = query.eq("idExtrusora", idExtrusora);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Linea[];
    },
  });
}

// --- 2. CREAR (insert) ---
export function useCreateLinea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linea: Omit<Linea, "id">) => {
      const payload = {
        linea: linea.linea,
        bloqueado: linea.bloqueado,
        id_extrusora: linea.id_extrusora,
      };
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
export function useUpdateLinea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linea: Linea) => {
      const { id, ...payload } = linea;

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
      console.error("Error al actualizar linea:", error);
    },
  });
}

// --- 4. BORRAR (delete) ---
export function useDeleteLinea() {
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
