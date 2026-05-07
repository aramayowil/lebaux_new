import { supabase } from "@/lib/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DespiecePerfil } from "@/types";

const TABLE = "despiece_perfiles_";
const SQUEMA = "productos";

//DESPICE PERFILES CONCONSISTE DE CONSISTE EN 6 TABLAS
// 1. CONTRAVIDRIO EXTERIOR
// 2. CONTRAVIDRIO INTERIOR
// 3. HOJAS
// 4. MARCO
// 5. MOSQUITERO
// 6. VID REPARTIDO
//EJ -> despiece_perfiles_[nivel]

type nivel =
  | "marcos"
  | "hojas"
  | "mosquitero"
  | "vidrio_repartido"
  | "contravidrios_ex"
  | "contravidrios";

export function useDespiecePerfiles(
  nivel: nivel,
  idParent: number | undefined,
) {
  return useQuery({
    queryKey: [TABLE + nivel, "perfiles", idParent],
    queryFn: async () => {
      if (!idParent) return [];
      const tableName = `${TABLE}${nivel}`;
      const foreignKey = `id_${nivel}`;
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(tableName)
        .select("*")
        .eq(foreignKey, idParent);

      if (error) throw error;
      return data as DespiecePerfil[];
    },
    enabled: !!idParent && !!nivel,
  });
}

export function useAddDespiecePerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nivel,
      idParent, // Lo recibimos aparte para construir la FK
      data,
    }: {
      nivel: nivel;
      idParent: number;
      data: Omit<DespiecePerfil, "id" | "id_parent">;
    }) => {
      const tableName = `${TABLE}${nivel}`;
      const foreignKey = `id_${nivel}`;

      const { data: inserted, error } = await supabase
        .schema(SQUEMA)
        .from(tableName)
        .insert({
          ...data,
          [foreignKey]: idParent, // Inserta en id_marco, id_hoja, etc.
        })
        .select()
        .single();

      if (error) throw error;
      return { inserted, nivel, idParent };
    },
    onSuccess: ({ nivel, idParent }) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, nivel, "perfiles", idParent],
      });
    },
  });
}

export function useUpdateDespiecePerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      nivel,
      data,
    }: {
      id: number;
      nivel: nivel;
      data: Partial<DespiecePerfil>;
    }) => {
      const tableName = `${TABLE}${nivel}`;
      const foreignKey = `id_${nivel}`;

      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(tableName)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Extraemos el idParent dinámicamente del objeto actualizado
      return { updated, nivel, idParent: updated[foreignKey] };
    },
    onSuccess: ({ nivel, idParent }) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, nivel, "perfiles", idParent],
      });
    },
  });
}

export function useDeleteDespiecePerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      nivel,
      idParent,
    }: {
      id: number;
      nivel: nivel;
      idParent: number;
    }) => {
      const tableName = `${TABLE}${nivel}`;

      const { error } = await supabase
        .schema(SQUEMA)
        .from(tableName)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { nivel, idParent };
    },
    onSuccess: ({ nivel, idParent }) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, nivel, "perfiles", idParent],
      });
    },
  });
}
