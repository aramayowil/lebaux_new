import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Obra } from "@/types";

const TABLE = "obras";
const SQUEMA = "obras";

/**
 * Obtener todas las obras ordenadas por las más recientes
 */
export function useObras() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      return data as Obra[];
    },
  });
}

/**
 * Obtener una obra específica por ID
 */
export function useObra(id: number | undefined) {
  return useQuery({
    queryKey: [TABLE, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Obra;
    },
    enabled: !!id,
  });
}

/**
 * Crear nueva obra (addObra)
 */
export function useAddObra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newObra: Omit<Obra, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(newObra)
        .select()
        .single();

      if (error) throw error;
      return data as Obra;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

/**
 * Actualizar obra existente (updateObra)
 */
export function useUpdateObra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Obra> }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return updated as Obra;
    },
    onSuccess: (updatedItem) => {
      if (updatedItem) {
        queryClient.invalidateQueries({ queryKey: [TABLE] });
        queryClient.invalidateQueries({ queryKey: [TABLE, updatedItem.id] });
      }
    },
  });
}

/**
 * Eliminar obra (deleteObra)
 */
export function useDeleteObra() {
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
      // Al borrar la obra, invalidamos todo lo relacionado por el efecto cascada
      queryClient.invalidateQueries({ queryKey: [TABLE] });
      // Si tienes claves para tipologías o vidrios, añadirlas aquí:
      queryClient.invalidateQueries({ queryKey: ["tipologia"] });
    },
  });
}
