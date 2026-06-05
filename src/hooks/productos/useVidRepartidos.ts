import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { VidrioRepartido } from "@/types";

const TABLE = "vidrio_repartido";
const SQUEMA = "opendata";

export function useVidrioRepartidosByInterior(idInterior: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "by_interior", idInterior],
    queryFn: async () => {
      if (!idInterior) return [];

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_interior", idInterior)
        .order("id", { ascending: true });

      if (error) throw error;
      return data as VidrioRepartido[];
    },
    enabled: !!idInterior && idInterior > 0,
  });
}

export function useAddVidrioRepartido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newVid: Omit<VidrioRepartido, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(newVid)
        .select()
        .single();

      if (error) throw error;
      return data as VidrioRepartido;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_interior", newItem.id_interior],
      });
    },
  });
}

export function useUpdateVidrioRepartido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<VidrioRepartido>;
    }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .maybeSingle(); // <--- Cambiado de .single() a .maybeSingle()

      if (error) throw error;
      return updated as VidrioRepartido;
    },
    onSuccess: (updatedItem) => {
      if (updatedItem) {
        queryClient.invalidateQueries({
          queryKey: [TABLE, "by_interior", updatedItem.id_interior],
        });
      }
    },
  });
}

export function useDeleteVidrioRepartido() {
  const queryClient = useQueryClient();

  return useMutation({
    // Aseguramos que recibimos el objeto con ambos datos
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
      return { id, id_interior }; // Retornamos ambos para el onSuccess
    },
    onSuccess: (deletedVars) => {
      // Ahora sí, invalidamos la clave exacta
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_interior", deletedVars.id_interior],
      });
    },
  });
}
