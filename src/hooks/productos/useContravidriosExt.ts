import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { ContravidrioExterior } from "@/types";

const TABLE = "contravidriosExt";
const SQUEMA = "productos";

export function useContravidriosExtByInterior(idInterior: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "ext", idInterior],
    queryFn: async () => {
      if (!idInterior) return [];
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_Interior", idInterior);

      if (error) throw error;
      return data as ContravidrioExterior[];
    },
    enabled: !!idInterior,
  });
}

export function useAddContravidrioExt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newExt: Omit<ContravidrioExterior, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(newExt)
        .select()
        .single();

      if (error) throw error;
      return data as ContravidrioExterior;
    },
    onSuccess: (newItem) => {
      // Refrescamos específicamente la lista de este interior
      queryClient.invalidateQueries({
        queryKey: [TABLE, "ext", newItem.id_interior],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useUpdateContravidrioExt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ContravidrioExterior>;
    }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated as ContravidrioExterior;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "ext", updatedItem.id_interior],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useDeleteContravidrioExt() {
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
      // Invalidamos todas las consultas del exterior para asegurar limpieza
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}
