import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { DespieceCruce } from "@/types";

const TABLE = "despiece_cruces";
const SQUEMA = "opendata";

export function useDespieceCruceByCruces(idCruces: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "detail_by_cruce", idCruces],

    queryFn: async () => {
      if (typeof idCruces !== "number" || idCruces <= 0) return null;

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_cruces", idCruces)
        .maybeSingle();

      if (error) {
        console.error(`[Error ${TABLE}]:`, error.message);
        throw error;
      }

      return data ?? null;
    },
    enabled: !!idCruces && idCruces > 0,
    placeholderData: (previousData) => previousData,
  });
}

export function useAddDespieceCruce() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDespiece: Omit<DespieceCruce, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(newDespiece)
        .select()
        .single();

      if (error) throw error;
      return data as DespieceCruce;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "detail_by_cruce", newItem.id_cruces],
      });
    },
  });
}

export function useUpdateDespieceCruce() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<DespieceCruce>;
    }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated as DespieceCruce;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "detail_by_cruce", updatedItem.id_cruces],
      });
    },
  });
}

export function useDeleteDespieceCruce() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      id_cruces,
    }: {
      id: number;
      id_cruces: number;
    }) => {
      const { error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id_cruces };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "detail_by_cruce", result.id_cruces],
      });
    },
  });
}
