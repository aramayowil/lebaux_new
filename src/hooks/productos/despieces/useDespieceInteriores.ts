import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { DespieceInterior } from "@/types";

const TABLE = "despiece_interior";
const SQUEMA = "opendata";

export function useDespieceInteriorByInterior(id_interior: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "detail_by_interior", id_interior],

    queryFn: async () => {
      if (typeof id_interior !== "number" || id_interior <= 0) return null;

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_interior", id_interior)
        .maybeSingle();

      if (error) {
        console.error(`[Error ${TABLE}]:`, error.message);
        throw error;
      }

      return data;
    },

    select: (data) => {
      return (data as DespieceInterior) ?? undefined;
    },

    enabled: !!id_interior && id_interior > 0,
    placeholderData: (previousData) => previousData,
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
      queryClient.invalidateQueries({
        queryKey: [TABLE, "detail_by_interior", newItem.id_interior],
      });
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
        queryKey: [TABLE, "detail_by_interior", updatedItem.id_interior],
      });
    },
  });
}

export function useDeleteDespieceInterior() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      id_interior,
    }: {
      id: number;
      id_interior: number;
    }) => {
      const { error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id_interior };
    },
    onSuccess: (vars) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "detail_by_interior", vars.id_interior],
      });
    },
  });
}
