import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { DespieceCruces } from "@/types";

const TABLE = "cruces";
const SQUEMA = "productos";

export function useDespieceCrucesByCruces(idCruces: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "despiece_cruces", idCruces],
    queryFn: async () => {
      if (!idCruces) return undefined;

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_Cruces", idCruces) // Ajusta el nombre de la FK según tu DB
        .maybeSingle();

      if (error) throw error;
      return data as DespieceCruces | undefined;
    },
    enabled: !!idCruces,
  });
}

export function useAddDespieceCruces() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDespiece: Omit<DespieceCruces, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(newDespiece)
        .select()
        .single();

      if (error) throw error;
      return data as DespieceCruces;
    },
    onSuccess: (newItem) => {
      // Invalidamos la caché del despiece específico para este ID de cruce
      queryClient.invalidateQueries({
        queryKey: [TABLE, "despiece_cruces", newItem.id_cruces],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useUpdateDespieceCruces() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<DespieceCruces>;
    }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated as DespieceCruces;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "despiece_cruces", updatedItem.id_cruces],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useDeleteDespieceCruces() {
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
