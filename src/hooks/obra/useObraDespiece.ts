import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { ObraDespiece } from "@/types";

const SCHEMA = "obras";
const TABLE = "obra_despiece";

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Obtiene todo el despiece de una obra en específico */
export function useObraDespieceByObra(idObra: number | undefined) {
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
      return (data ?? []) as ObraDespiece[];
    },
    enabled: !!idObra,
  });
}

/** Obtiene el despiece filtrado por obra y tipología activa */

export function useObraDespieceByTipologia(
  idObra: number | undefined,
  idTipologia: number | undefined,
  options?: Omit<
    UseQueryOptions<ObraDespiece[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [TABLE, "by_tipologia", idObra, idTipologia],
    queryFn: async () => {
      if (!idObra || !idTipologia) return [];
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("*")
        .eq("id_obra", idObra)
        .eq("id_tipologia", idTipologia)
        .order("id", { ascending: true });

      if (error) throw error;
      return (data ?? []) as ObraDespiece[];
    },
    // 🌟 Combinamos las condiciones: debe haber IDs válidos Y además cumplir lo que pida el componente externo
    ...options,
    enabled: !!idObra && !!idTipologia && (options?.enabled ?? true),
  });
}

/** Guarda el despiece recalculado, protegiendo los cambios manuales del usuario */
export function useSaveObraDespiece() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      idObra,
      idTipologia,
      items,
    }: {
      idObra: number;
      idTipologia: number;
      items: Omit<ObraDespiece, "id">[];
    }) => {
      // 1. Eliminar despieces automáticos previos de esta tipología
      const { error: deleteError } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .delete()
        .eq("id_obra", idObra)
        .eq("id_tipologia", idTipologia)
        .eq("manual", false);

      if (deleteError) throw deleteError;

      // 2. Si no hay nuevos elementos que insertar, finaliza la operación
      if (items.length === 0) return [];

      // 3. Preparación del payload (Conversión de tipos para la Base de Datos)
      const payload = items.map((item) => ({
        id_obra: item.id_obra,
        id_tipologia: item.id_tipologia,
        id_producto_en_tipo: item.id_producto_en_tipo ?? null,
        id_producto: item.id_producto ?? null,
        tipo_elemento: item.tipo_elemento,
        elemento: item.elemento,
        cantidad:
          item.cantidad !== undefined && item.cantidad !== null
            ? String(item.cantidad)
            : null,
        ancho:
          item.ancho !== undefined && item.ancho !== null
            ? String(item.ancho)
            : null,
        alto:
          item.alto !== undefined && item.alto !== null
            ? String(item.alto)
            : null,
        color: item.color ?? null,
        ubicacion: item.ubicacion ?? null,
        corte: item.corte ?? null,
        manual: false,
        error: item.error ?? false,
        anulado: item.anulado ?? false,
        agregado_tipo: item.agregado_tipo ?? false,
        modificado: new Date().toISOString(),
      }));

      const { data, error: insertError } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .insert(payload)
        .select();

      if (insertError) throw insertError;
      return (data ?? []) as ObraDespiece[];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_obra", variables.idObra],
      });
      queryClient.invalidateQueries({
        queryKey: [
          TABLE,
          "by_tipologia",
          variables.idObra,
          variables.idTipologia,
        ],
      });
    },
  });
}

/** Marca un elemento específico del despiece como anulado */
export function useAnularDespiece() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      idObra,
      idTipologia,
    }: {
      id: number;
      idObra: number;
      idTipologia: number;
    }) => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .update({ anulado: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, idObra, idTipologia };
    },
    onSuccess: ({ idObra, idTipologia }) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_obra", idObra],
      });
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_tipologia", idObra, idTipologia],
      });
    },
  });
}

/** Elimina por completo todo el despiece asociado a una tipología */
export function useDeleteDespieceByTipologia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      idObra,
      idTipologia,
    }: {
      idObra: number;
      idTipologia: number;
    }) => {
      const { error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .delete()
        .eq("id_obra", idObra)
        .eq("id_tipologia", idTipologia);

      if (error) throw error;
      return { idObra, idTipologia };
    },
    onSuccess: ({ idObra, idTipologia }) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_obra", idObra],
      });
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_tipologia", idObra, idTipologia],
      });
    },
  });
}
