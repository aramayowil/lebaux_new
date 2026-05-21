import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Contravidrio } from "@/types";

const TABLE = "contravidrio";
const SQUEMA = "opendata";

export function useContravidriosByInterior(id_interior: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "contravidrios", id_interior],
    queryFn: async () => {
      if (typeof id_interior !== "number" || id_interior <= 0) return [];

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_interior", id_interior)
        .order("id", { ascending: true });

      if (error) {
        console.error(`[Error ${TABLE}]:`, error.message);
        throw error;
      }
      return data as Contravidrio[];
    },
    enabled: !!id_interior && id_interior > 0,
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
      queryClient.invalidateQueries({
        queryKey: [TABLE, "contravidrios", newItem.id_interior],
      });
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
    },
  });
}

export function useDeleteContravidrio() {
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
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "contravidrios", result.id_interior],
      });
    },
  });
}
