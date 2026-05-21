import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { DespieceVR } from "@/types";

const TABLE = "despiece_perfiles_vidrio_repartido";
const SQUEMA = "opendata";

export function useDespieceVRByVR(idVR: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "despiece_vr", idVR],
    queryFn: async () => {
      if (!idVR || idVR <= 0) return null;

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_vr", idVR)
        .maybeSingle();

      if (error) throw error;

      return (data as DespieceVR) ?? null;
    },
    enabled: !!idVR && idVR > 0,
  });
}

export function useAddDespieceVR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDespiece: Omit<DespieceVR, "id">) => {
      const { id, ...dataToInsert } = newDespiece as any;

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(dataToInsert)
        .select()
        .single();

      if (error) throw error;
      return data as DespieceVR;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "despiece_vr", newItem.id_vr],
      });
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
      // Limpiamos el objeto para no intentar actualizar la PK o FK accidentalmente
      const { id: _, id_vr: __, ...updateData } = data as any;

      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(updateData)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return updated as DespieceVR | null;
    },
    onSuccess: (updatedItem) => {
      if (updatedItem) {
        queryClient.invalidateQueries({
          queryKey: [TABLE, "despiece_vr", updatedItem.id_vr],
        });
      }
    },
  });
}

// 4. DELETE: Borrar y limpiar interfaz
export function useDeleteDespieceVR() {
  const queryClient = useQueryClient();

  // Cambiamos el argumento para recibir ambos IDs
  return useMutation({
    mutationFn: async ({ id, id_vr }: { id: number; id_vr: number }) => {
      const { error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, id_vr };
    },
    onSuccess: (deletedData) => {
      // Esto es lo que hace que la alerta de "Sin despiece" vuelva a aparecer
      queryClient.invalidateQueries({
        queryKey: [TABLE, "despiece_vr", deletedData.id_vr],
      });
    },
  });
}
