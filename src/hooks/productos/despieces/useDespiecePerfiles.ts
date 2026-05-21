import { supabase } from "@/lib/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DespiecePerfil } from "@/types";

const TABLE = "despiece_perfiles_";
const SQUEMA = "opendata";

//DESPICE PERFILES CONCONSISTE DE CONSISTE EN 6 TABLAS
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
  | "mosquitero"
  | "vidrio_repartido"
  | "contravidrio_ex"
  | "contravidrio";

export function useDespiecePerfiles(
  nivel: nivel,
  idParent: number | undefined,
) {
  return useQuery({
    queryKey: [TABLE + nivel, "perfiles", idParent],
    queryFn: async () => {
      if (!idParent) return [];
      const tableName = `${TABLE}${nivel}`;

      const foreignKeyMap: Record<nivel, string> = {
        marco: "id_marco",
        hoja: "id_hoja",
        mosquitero: "id_mosquitero",
        vidrio_repartido: "id_vr", // Verifica que así se llame en la DB
        contravidrio_ex: "id_contravidrio",
        contravidrio: "id_contravidrio",
      };

      const foreignKey = foreignKeyMap[nivel];

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
      idParent,
      data,
    }: {
      nivel: nivel;
      idParent: number;
      data: Omit<DespiecePerfil, "id" | "id_parent">;
    }) => {
      const tableName = `${TABLE}${nivel}`;

      const foreignKeyMap: Record<nivel, string> = {
        marco: "id_marco",
        hoja: "id_hoja",
        mosquitero: "id_mosquitero",
        vidrio_repartido: "id_vr",
        contravidrio_ex: "id_contravidrio",
        contravidrio: "id_contravidrio",
      };

      const foreignKey = foreignKeyMap[nivel];

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
    onSuccess: ({ nivel, idParent }) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE + nivel, "perfiles", idParent],
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

      const foreignKeyMap: Record<nivel, string> = {
        marco: "id_marco",
        hoja: "id_hoja",
        mosquitero: "id_mosquitero",
        vidrio_repartido: "id_vr",
        contravidrio_ex: "id_contravidrio",
        contravidrio: "id_contravidrio",
      };

      const foreignKey = foreignKeyMap[nivel];

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
        queryKey: [TABLE + result.nivel, "perfiles", result.idParent],
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
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE + result.nivel, "perfiles", result.idParent],
      });
    },
  });
}
