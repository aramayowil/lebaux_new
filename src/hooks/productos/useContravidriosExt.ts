import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { ContravidrioExterior } from "@/types";

const TABLE = "contravidrio_exterior";
const SQUEMA = "opendata";

export function useContravidriosExt() {
  return useQuery({
    queryKey: [TABLE, "contravidrio_ext"],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");

      if (error) throw error;
      return data as ContravidrioExterior[];
    },
  });
}

export function useContravidriosExtByInterior(id_interior: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "contravidrio_ext", id_interior],
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
      return data as ContravidrioExterior[];
    },
    enabled: !!id_interior && id_interior > 0,
  });
}

export function useAddContravidrioExt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCV: Omit<ContravidrioExterior, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(newCV)
        .select()
        .single();

      if (error) throw error;
      return data as ContravidrioExterior;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "contravidrio_ext", newItem.id_interior],
      });
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
        queryKey: [TABLE, "contravidrio_ext", updatedItem.id_interior],
      });
    },
  });
}

export function useDeleteContravidrioExt() {
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
        queryKey: [TABLE, "contravidrio_ext", result.id_interior],
      });
    },
  });
}
