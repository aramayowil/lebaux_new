import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { DespiecePerfilContravidrio } from "@/types";

const TABLE = "despiece_perfiles_";
const SQUEMA = "opendata";

type nivel = "contravidrio" | "contravidrio_ext";

const FK_MAP_PERFILES: Record<nivel, string> = {
  contravidrio_ext: "id_contravidrio",
  contravidrio: "id_contravidrio",
};

// ... (mismas constantes TABLE y SQUEMA)

export function useDespiecePerfilesContravidrio(
  nivel: nivel,
  idParent: number | undefined,
) {
  return useQuery({
    queryKey: [TABLE + nivel, "perfiles", idParent],
    queryFn: async () => {
      if (!idParent) return [];

      const tableName = `${TABLE}${nivel}`;
      const foreignKey = FK_MAP_PERFILES[nivel]; // "id_contravidrio"

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(tableName)
        .select(
          `
          *,
          perfiles (*)
        `,
        )
        .eq(foreignKey, idParent)
        .order("id", { ascending: true });

      if (error) {
        console.error(`Error en ${tableName}:`, error.message);
        throw error;
      }

      return data as DespiecePerfilContravidrio[];
    },
    enabled: !!idParent,
  });
}

export function useAddDespiecePerfilContravidrio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nivel,
      idParent,
      data,
    }: {
      nivel: nivel;
      idParent: number;
      data: Omit<DespiecePerfilContravidrio, "id">;
    }) => {
      const tableName = `${TABLE}${nivel}`;
      const foreignKey = FK_MAP_PERFILES[nivel];

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
        queryKey: [TABLE + result.nivel, "perfiles", result.idParent],
      });
    },
  });
}
export function useUpdateDespiecePerfilContravidrio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nivel,
      id,
      idParent, // Lo agregamos aquí para asegurar la invalidación
      data,
    }: {
      nivel: nivel;
      id: number;
      idParent: number; // Requerido para el éxito de la caché
      data: Partial<DespiecePerfilContravidrio>;
    }) => {
      const tableName = `${TABLE}${nivel}`;

      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(tableName)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Devolvemos idParent explícitamente
      return { updated, nivel, idParent };
    },
    onSuccess: (result) => {
      // Ahora usamos el idParent que pasamos por variables, garantizando el match
      queryClient.invalidateQueries({
        queryKey: [TABLE + result.nivel, "perfiles", result.idParent],
      });
    },
  });
}

export function useDeleteDespiecePerfilContravidrio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nivel,
      id,
      idParent,
    }: {
      nivel: nivel;
      id: number;
      idParent: number;
    }) => {
      const tableName = `${TABLE}${nivel}`;

      const { error } = await supabase
        .schema(SQUEMA)
        .from(tableName)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { idParent, nivel };
    },
    onSuccess: (result) => {
      // Invalida exactamente la misma key que el useQuery
      queryClient.invalidateQueries({
        queryKey: [TABLE + result.nivel, "perfiles", result.idParent],
      });
    },
  });
}
