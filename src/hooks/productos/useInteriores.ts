import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Interior } from "@/types";
import { SQUEMA } from "./squemaProductos";

const TABLE = "interior";

export function useInteriores() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");

      if (error) throw error;
      return data as Interior[];
    },
  });
}

export function useInterioresByHoja(id_hoja: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "interiores", id_hoja],
    queryFn: async () => {
      if (!id_hoja) return [];
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_hoja", id_hoja);

      if (error) throw error;
      return data as Interior[];
    },
    enabled: !!id_hoja,
  });
}

export function useAddInterior() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newInterior: Omit<Interior, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(newInterior)
        .select()
        .single();

      if (error) throw error;
      return data as Interior;
    },
    onSuccess: (newItem) => {
      // Refrescamos la lista de la hoja específica
      queryClient.invalidateQueries({
        queryKey: [TABLE, "interiores", newItem.id_hoja],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useUpdateInterior() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Interior>;
    }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated as Interior;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "interiores", updatedItem.id_hoja],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useDeleteInterior() {
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
      // Invalidamos la tabla completa para asegurar que la lista de la hoja se limpie
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}
