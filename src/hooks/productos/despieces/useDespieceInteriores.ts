import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { DespieceInterior } from "@/types";

const TABLE = "despiece_interior";
const SQUEMA = "productos";

export function useDespieceInteriorByInterior(id_interior: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "despiece_interior", id_interior],
    queryFn: async () => {
      if (!id_interior) return undefined;

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_interior", id_interior)
        .maybeSingle(); // Devuelve 1 objeto o null si no hay nada

      if (error) throw error;
      return data as DespieceInterior | undefined;
    },
    enabled: !!id_interior,
  });
}

export function useAddDespieceInterior() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDespiece: Omit<DespieceInterior, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(newDespiece)
        .select()
        .single();

      if (error) throw error;
      return data as DespieceInterior;
    },
    onSuccess: (newItem) => {
      // Invalidamos la cache específica de este interior
      queryClient.invalidateQueries({
        queryKey: [TABLE, "despiece_interior", newItem.id_interior],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useUpdateDespieceInterior() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<DespieceInterior>;
    }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated as DespieceInterior;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "despiece_interior", updatedItem.id_interior],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useDeleteDespieceInterior() {
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
      // Invalidamos globalmente para que todas las vistas se sincronicen
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}
