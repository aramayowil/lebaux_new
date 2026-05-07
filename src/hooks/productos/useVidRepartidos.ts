import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { VidRepartido } from "@/types";

const TABLE = "vid_repartidos";
const SQUEMA = "productos";

export function useVidRepartidosByInterior(idInterior: number | undefined) {
  return useQuery({
    // Usamos una key única: la tabla, el identificador de tipo y el ID del interior
    queryKey: [TABLE, "vid_repartidos", idInterior],

    queryFn: async () => {
      // Si no hay ID, retornamos un array vacío de inmediato
      if (idInterior === undefined) return [];

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_interior", idInterior);

      if (error) {
        console.error("Error al obtener vidrios repartidos:", error.message);
        throw error;
      }

      // Retornamos los datos como el array de la interfaz VidRepartido
      return data as VidRepartido[];
    },

    // Solo se dispara la petición si idInterior tiene un valor válido
    enabled: !!idInterior,

    // Opcional: mantiene los datos cargados mientras se busca un nuevo ID
    placeholderData: (previousData) => previousData,
  });
}

export function useAddVidRepartido() {
  const queryClient = useQueryClient();

  return useMutation({
    // Definimos explícitamente la función de mutación
    mutationFn: async (newVid: Omit<VidRepartido, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(newVid)
        .select()
        .single();

      if (error) throw error;
      return data as VidRepartido;
    },

    onSuccess: (newItem) => {
      // 1. Invalidamos la lista específica usando la misma estructura de QueryKey que el GET
      queryClient.invalidateQueries({
        queryKey: [TABLE, "vid_repartidos", newItem.id_interior],
      });

      // 2. Refrescamos la caché global de la tabla
      queryClient.invalidateQueries({
        queryKey: [TABLE],
      });
    },
  });
}

export function useUpdateVidRepartido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<VidRepartido>;
    }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated as VidRepartido;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "vid_repartidos", updatedItem.id_interior],
      });
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useDeleteVidRepartido() {
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
      // Invalida todas las consultas de Vidrios Repartidos al borrar
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}
