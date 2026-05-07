import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { DespieceAccesorio } from "@/types";

const TABLE = "despiece_accesorios";
const SQUEMA = "productos";

export function useDespieceAccesorios(
  nivel:
    | "marco"
    | "hoja"
    | "interior"
    | "contravidrio"
    | "cruces"
    | "mosquitero",
  idParent: number | undefined,
) {
  return useQuery({
    queryKey: [TABLE, "accesorios", nivel, idParent],
    queryFn: async () => {
      if (!idParent) return [];

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("nivel", nivel)
        .eq("id_parent", idParent); // Asegúrate de que el nombre de columna coincida en tu DB

      if (error) throw error;
      return data as DespieceAccesorio[];
    },
    enabled: !!idParent,
  });
}

export function useAddDespieceAccesorio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nivel,
      data,
    }: {
      nivel: string;
      data: Omit<DespieceAccesorio, "id">;
    }) => {
      const { data: inserted, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert({ ...data, nivel })
        .select()
        .single();

      if (error) throw error;
      return inserted;
    },
    onSuccess: (newItem) => {
      // Invalidamos la caché usando el nivel e id_parent del nuevo item
      queryClient.invalidateQueries({
        queryKey: [TABLE, "accesorios", newItem.nivel, newItem.id_parent],
      });
    },
  });
}

export function useUpdateDespieceAccesorio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<DespieceAccesorio>;
    }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({
        queryKey: [
          TABLE,
          "accesorios",
          updatedItem.nivel,
          updatedItem.id_parent,
        ],
      });
    },
  });
}

export function useDeleteDespieceAccesorio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      nivel,
      idParent,
    }: {
      id: number;
      nivel: string;
      idParent: number;
    }) => {
      const { error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { nivel, idParent };
    },
    onSuccess: (vars) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "accesorios", vars.nivel, vars.idParent],
      });
    },
  });
}
