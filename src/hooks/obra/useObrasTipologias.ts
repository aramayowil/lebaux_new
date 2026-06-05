import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { ObraTipologia } from "@/types";

const TABLE = "obra_tipologias"; // Ajusta al nombre real de tu tabla en Supabase
const SCHEMA = "obras";

/**
 * 1. Obtener tipologías por Obra (getTipologiasByObra)
 */
export function useTipologiasByObra(
  idObra: number | undefined,
  options?: Omit<
    UseQueryOptions<ObraTipologia[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [TABLE, "by_obra", idObra],
    queryFn: async () => {
      if (!idObra) return [];
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("*")
        .eq("id_obra", idObra)
        .order("id", { ascending: true });

      if (error) throw error;
      return data as ObraTipologia[];
    },

    ...options,
    enabled: !!idObra && (options?.enabled ?? true),
  });
}

/**
 * 2. Agregar Tipología (addTipologia)
 */
export function useAddTipologia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTipo: Omit<ObraTipologia, "id">) => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .insert(newTipo)
        .select()
        .single();

      if (error) throw error;
      return data as ObraTipologia;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_obra", newItem.id_obra],
      });
    },
  });
}

/**
 * 3. Actualizar Tipología (updateTipologia)
 */
export function useUpdateTipologia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ObraTipologia>;
    }) => {
      const { data: updated, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated as ObraTipologia;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_obra", updatedItem.id_obra],
      });
    },
  });
}

/**
 * 4. Eliminar Tipología (deleteTipologia)
 */
export function useDeleteTipologia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, id_obra }: { id: number; id_obra: number }) => {
      const { error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, id_obra };
    },
    onSuccess: (deletedData) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_obra", deletedData.id_obra],
      });
    },
  });
}

/**
 * 5. Duplicar Tipología (duplicateTipologia)
 * Esta función es nueva: lee la tipología original y crea una copia.
 */
export function useDuplicateTipologia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // 1. Buscamos la tipología original
      const { data: original, error: fetchError } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Preparamos la copia eliminando el ID y ajustando el nombre
      const { id: _, ...cloneData } = original;
      const newTipo = {
        ...cloneData,
        nombre: `${original.nombre} (Copia)`,
      };

      // 3. Insertamos la copia
      const { data: created, error: insertError } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .insert(newTipo)
        .select()
        .single();

      if (insertError) throw insertError;
      return created as ObraTipologia;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_obra", newItem.id_obra],
      });
    },
  });
}
