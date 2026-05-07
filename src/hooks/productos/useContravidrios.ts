import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Contravidrio } from "@/types";

const TABLE = "contravidrios";
const SQUEMA = "productos";

export function useContravidriosByInterior(id_interior: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "contravidrios", id_interior],
    queryFn: async () => {
      if (!id_interior) return [];
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_interior", id_interior);

      if (error) throw error;
      return data as Contravidrio[];
    },
    enabled: !!id_interior,
  });
}

export function useAddContravidrio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCV: Omit<Contravidrio, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(newCV)
        .select()
        .single();

      if (error) throw error;
      return data as Contravidrio;
    },
    onSuccess: (newItem) => {
      // Invalidamos la lista específica de este interior
      queryClient.invalidateQueries({
        queryKey: [TABLE, "contravidrios", newItem.id_interior],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useUpdateContravidrio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Contravidrio>;
    }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated as Contravidrio;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "contravidrios", updatedItem.id_interior],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useDeleteContravidrio() {
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
      // Al eliminar, invalidamos toda la tabla para asegurar que las listas se refresquen
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}
