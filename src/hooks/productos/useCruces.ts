import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Cruce } from "@/types";

const TABLE = "cruces";
const SQUEMA = "opendata";

export function useCruces() {
  return useQuery({
    queryKey: [TABLE, "cruces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");

      if (error) throw error;
      return data as Cruce[];
    },
  });
}

export function useCrucesByInterior(idInterior: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "cruces", idInterior],
    queryFn: async () => {
      if (!idInterior) return [];
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_interior", idInterior);

      if (error) throw error;
      return data as Cruce[];
    },
    enabled: !!idInterior,
  });
}

export function useAddCruce() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCruce: Omit<Cruce, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(newCruce)
        .select()
        .single();

      if (error) throw error;
      return data as Cruce;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "cruces", newItem.id_interior],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useUpdateCruce() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Cruce> }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated as Cruce;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "cruces", updatedItem.id_interior],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useDeleteCruce() {
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
