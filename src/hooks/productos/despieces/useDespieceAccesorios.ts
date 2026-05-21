import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { DespieceAccesorio } from "@/types";

const TABLE = "despiece_accesorios_";
const SQUEMA = "opendata";

//DESPICE ACCESORIOS CONCONSISTE DE CONSISTE EN 6 TABLAS
// 1. CONTRAVIDRIO EXTERIOR
// 2. CONTRAVIDRIO INTERIOR
// 3. HOJAS
// 4. MARCO
// 5. MOSQUITERO
// 6. VID REPARTIDO
//EJ -> despiece_perfiles_[nivel]

type nivel =
  | "marco"
  | "hoja"
  | "interior"
  | "contravidrio"
  | "contravidrio_ext"
  | "cruces"
  | "vidrio_repartido"
  | "mosquitero";

// Diccionario de llaves foráneas para accesorios
const FK_MAP_ACCESORIOS: Record<nivel, string> = {
  marco: "id_marco",
  hoja: "id_hoja",
  mosquitero: "id_mosquitero",
  vidrio_repartido: "id_vr",
  contravidrio_ext: "id_contravidrio",
  contravidrio: "id_contravidrio",
  interior: "id_interior",
  cruces: "id_cruces",
};

export function useDespieceAccesorios(
  nivel: nivel,
  idParent: number | undefined,
) {
  return useQuery({
    queryKey: [TABLE + nivel, "accesorios", idParent],
    queryFn: async () => {
      if (!idParent) return [];

      const tableName = `${TABLE}${nivel}`;
      const foreignKey = FK_MAP_ACCESORIOS[nivel];

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(tableName)
        .select(`*,accesorios (*)`)
        .eq(foreignKey, idParent);

      if (error) {
        console.error(`Error en useDespieceAccesorios (${nivel}):`, error);
        throw error;
      }

      return data as DespieceAccesorio[];
    },
    enabled: !!idParent && !!nivel,
  });
}

export function useAddDespieceAccesorio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nivel,
      idParent,
      data,
    }: {
      nivel: nivel;
      idParent: number;
      data: Omit<DespieceAccesorio, "id" | "id_parent">;
    }) => {
      const tableName = `${TABLE}${nivel}`;
      const foreignKey = FK_MAP_ACCESORIOS[nivel];

      const { data: inserted, error } = await supabase
        .schema(SQUEMA)
        .from(tableName)
        .insert({
          ...data,
          [foreignKey]: idParent,
        })
        .select()
        .single();

      if (error) throw error;

      return { inserted, nivel, idParent };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE + result.nivel, "accesorios", result.idParent],
      });
    },
  });
}

export function useUpdateDespieceAccesorio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      nivel,
      data,
    }: {
      id: number;
      nivel: nivel;
      data: Partial<DespieceAccesorio>;
    }) => {
      const tableName = `${TABLE}${nivel}`;
      const foreignKey = FK_MAP_ACCESORIOS[nivel];

      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(tableName)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        nivel,
        idParent: updated[foreignKey],
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE + result.nivel, "accesorios", result.idParent],
      });
    },
  });
}

export function useDeleteDespieceAccesorio() {
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
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE + result.nivel, "accesorios", result.idParent],
      });
    },
  });
}
