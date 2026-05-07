import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { DespiecePerfilContravidrio } from "@/types";

const TABLE = "desp_perfiles_contravidrio";
const SQUEMA = "productos";

export function useDespiecePerfilesContravidrio(
  nivel: "contravidrio" | "contravidrioExt",
  idContravidrio: number | undefined,
) {
  return useQuery({
    // El nivel forma parte de la llave para no mezclar datos de Int vs Ext
    queryKey: [TABLE, nivel, "perfiles", idContravidrio],
    queryFn: async () => {
      if (!idContravidrio) return [];

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_Contravidrio", idContravidrio) // O el nombre de tu FK
        .eq("nivel", nivel); // Filtramos por nivel si están en la misma tabla

      if (error) throw error;
      return data as DespiecePerfilContravidrio[];
    },
    enabled: !!idContravidrio,
  });
}

export function useAddDespiecePerfilContravidrio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nivel,
      d,
    }: {
      nivel: "contravidrio" | "contravidrioExt";
      d: Omit<DespiecePerfilContravidrio, "id">;
    }) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert({ ...d, nivel }) // Insertamos el nivel junto con los datos
        .select()
        .single();

      if (error) throw error;
      return data as DespiecePerfilContravidrio;
    },
    onSuccess: (newItem, variables) => {
      // Invalidamos la caché usando el nivel que vino en las variables
      queryClient.invalidateQueries({
        queryKey: [TABLE, variables.nivel, "perfiles", newItem.id_contravidrio],
      });
    },
  });
}

export function useUpdateDespiecePerfilContravidrio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      nivel: "contravidrio" | "contravidrioExt";
      id: number;
      data: Partial<DespiecePerfilContravidrio>;
    }) => {
      const { data: updated, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated as DespiecePerfilContravidrio;
    },
    onSuccess: (updatedItem, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          TABLE,
          variables.nivel,
          "perfiles",
          updatedItem.id_contravidrio,
        ],
      });
    },
  });
}

export function useDeleteDespiecePerfilContravidrio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
    }: {
      nivel: "contravidrio" | "contravidrioExt";
      id: number;
    }) => {
      const { error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: (_, variables) => {
      // Al borrar, invalidamos todas las queries de ese nivel para asegurar limpieza
      queryClient.invalidateQueries({ queryKey: [TABLE, variables.nivel] });
    },
  });
}
