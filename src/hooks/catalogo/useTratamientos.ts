import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Tratamiento } from "@/types/index";
import { SQUEMA } from "./squemaCatalogo";

const TABLE = "tratamientos";

// --- 1. LEER (read) ---
export function useTratamientos() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");
      if (error) throw error;
      return data as Tratamiento[];
    },
  });
}

export function useTratamientoById(id: number | undefined) {
  return useQuery({
    queryKey: [TABLE, id],

    queryFn: async () => {
      if (!id)
        throw new Error("ID requerido para consultar el tratamiento de obra");

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      return data as Tratamiento | null;
    },

    enabled: !!id,
  });
}

// --- 2. CREAR (insert) ---
export function useCreateTratamiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tratamiento: Omit<Tratamiento, "id">) => {
      const payload = tratamiento;
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
export function useUpdateTratamiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tratamiento: Tratamiento) => {
      const { id, ...payload } = tratamiento; // ← separamos id del resto

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
export function useDeleteTratamiento() {
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
