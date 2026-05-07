import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { DespieceVR } from "@/types";

const TABLE = "vid_repartido";
const SQUEMA = "productos";

export function useDespieceVRByVR(idVR: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "despiece_vr", idVR],
    queryFn: async () => {
      if (!idVR) return undefined;

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_VR", idVR) // Ajusta el nombre de la columna según tu tabla
        .maybeSingle();

      if (error) throw error;
      return data as DespieceVR | undefined;
    },
    enabled: !!idVR,
  });
}

export function useAddDespieceVR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDespiece: Omit<DespieceVR, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(newDespiece)
        .select()
        .single();

      if (error) throw error;
      return data as DespieceVR;
    },
    onSuccess: (newItem) => {
      // Invalidamos la caché del despiece específico para este ID de Vidrio Repartido
      queryClient.invalidateQueries({
        queryKey: [TABLE, "despiece_vr", newItem.id_vr],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useUpdateDespieceVR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<DespieceVR>;
    }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated as DespieceVR;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "despiece_vr", updatedItem.id_vr],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useDeleteDespieceVR() {
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
