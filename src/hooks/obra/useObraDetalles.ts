import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { ObraDetalle } from "@/types";

const SCHEMA = "obras";
const TABLE = "obra_detalles";

type UpsertObraDetalleInput = Omit<ObraDetalle, "id"> & { id?: number };

/** Obtiene todos los detalles de la tipología activa de forma directa. */
export function useObraDetallesByTipologia(idTipologia: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "by_tipologia", idTipologia] as const,
    queryFn: async () => {
      // Usamos una aserción de control. Si llega aquí sin ID, algo falló en las flags.
      if (!idTipologia) throw new Error("idTipologia es requerido");

      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("*")
        .eq("id_tipologia", idTipologia)
        .order("id", { ascending: true });

      if (error) throw error;
      return data as ObraDetalle[]; // Si supabaseClient está tipado, esto infiere ObraDetalle[] automáticamente
    },
    enabled: typeof idTipologia === "number",
  });
}

/** Obtiene los detalles de una obra específica. */
export function useObraDetallesByObra(idObra: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "by_obra", idObra] as const,
    queryFn: async () => {
      if (!idObra) throw new Error("idObra es requerido");

      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("*")
        .eq("id_obra", idObra);

      if (error) throw error;
      return data as ObraDetalle[];
    },
    enabled: typeof idObra === "number",
  });
}

/** Obtiene el detalle principal de la tipología (donde la ubicación no está definida). */
export function useObraDetallePrincipal(idTipologia: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "principal", idTipologia] as const,
    queryFn: async () => {
      if (!idTipologia) throw new Error("idTipologia es requerido");

      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("*")
        .eq("id_tipologia", idTipologia)
        .or("ubicacion_en_tipo.is.null,ubicacion_en_tipo.eq.''")
        .maybeSingle();

      if (error) throw error;
      return data as ObraDetalle | null;
    },
    enabled: typeof idTipologia === "number",
  });
}

/** Hook unificado para insertar o actualizar detalles de obra con actualización de caché optimista/directa. */
export function useUpsertObraDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (detalle: UpsertObraDetalleInput) => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .upsert(detalle)
        .select()
        .single();

      if (error) throw error;
      return data as ObraDetalle;
    },
    onSuccess: async (newItem) => {
      // 1. Actualización táctica de la caché: Actualizamos la lista de tipologías directamente para evitar un refetch
      queryClient.setQueryData<ObraDetalle[]>(
        [TABLE, "by_tipologia", newItem.id_tipologia],
        (oldData) => {
          if (!oldData) return [newItem];
          // Si ya existía, lo reemplazamos; si no, lo agregamos al final
          const exists = oldData.some((item) => item.id === newItem.id);
          return exists
            ? oldData.map((item) => (item.id === newItem.id ? newItem : item))
            : [...oldData, newItem];
        },
      );

      // 2. Definimos el pool de invalidaciones necesarias para el resto de queries complejas
      const invalidations = [
        queryClient.invalidateQueries({
          queryKey: [TABLE, "principal", newItem.id_tipologia],
        }),
      ];

      if (newItem.id_obra) {
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: [TABLE, "by_obra", newItem.id_obra],
          }),
          queryClient.invalidateQueries({
            queryKey: ["despiece_global", newItem.id_obra],
          }),
        );
      }

      // Al usar IDs autoincrementales, newItem.id siempre vendrá del .select().single()
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: ["despiece", newItem.id] }),
        queryClient.invalidateQueries({ queryKey: ["hojas", newItem.id] }),
      );

      await Promise.all(invalidations);
    },
  });
}
