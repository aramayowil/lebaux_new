import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { ObraDetalle } from "@/types";

const SCHEMA = "obras";
const TABLE = "obra_detalles";

// ── Helpers de conversión ─────────────────────────────────────────────────────

/** Convierte una fila cruda de la DB al tipo ObraDetalle de la app. */
function fromDb(row: Record<string, any>): ObraDetalle {
  return {
    id: row.id,
    id_tipologia: row.id_tipologia,
    ubicacion_en_tipo: row.ubicacion_en_tipo ?? "",
    id_obra: row.id_obra,
    id_extrusora: row.id_extrusora,
    id_linea: row.id_linea,
    id_tipo: row.id_tipo,
    id_producto: row.id_producto,
    ancho: row.ancho,
    alto: row.alto,
    color: row.color,
    marco: row.marco,
    hoja: row.hoja,
    interior: row.interior,
    contravidrios: row.contravidrios,
    contravidrios_ext: row.contravidrios_ext,
    cruce: row.cruce,
    mosquitero: row.mosquitero,
    tela: row.tela ?? "",
    tipo_cruce: row.tipo_cruce ?? 0,
    cant_centrados_horizontal: row.cant_centrados_horizontal ?? 0,
    cant_centrados_vertical: row.cant_centrados_vertical ?? 0,
    horizontal_1: row.horizontal_1,
    horizontal_2: row.horizontal_2,
    horizontal_3: row.horizontal_3,
    vertical_1: row.vertical_1,
    vertical_2: row.vertical_2,
    vertical_3: row.vertical_3,
    vertical_4: row.vertical_4,
    vertical_5: row.vertical_5,
    interior_1: row.interior_1,
    interior_2: row.interior_2,
    interior_3: row.interior_3,
    interior_4: row.interior_4,

    // DVH Bloque 1 y 2
    dvh_1_1: row.dvh_1_1,
    dvh_1_2: row.dvh_1_2,
    camara_1: row.camara_1,
    dvh_2_1: row.dvh_2_1,
    dvh_2_2: row.dvh_2_2,
    camara_2: row.camara_2,
    dvh_3_1: row.dvh_3_1,
    dvh_3_2: row.dvh_3_2,
    camara_3: row.camara_3,
    dvh_4_1: row.dvh_4_1,
    dvh_4_2: row.dvh_4_2,
    camara_4: row.camara_4,

    revest_1: row.revest_1,
    direcc_1: row.direcc_1,
    revest_2: row.revest_2,
    direcc_2: row.direcc_2,
    revest_3: row.revest_3,
    direcc_3: row.direcc_3,
    revest_4: row.revest_4,
    direcc_4: row.direcc_4,

    // Vidrios Repartidos (VR) con normalización booleana segura
    vr_1: row.vr_1,
    hor_vr_1: row.hor_vr_1,
    ver_vr_1: row.ver_vr_1,
    activo_vr_1: row.activo_vr_1 ?? false,
    vr_2: row.vr_2,
    hor_vr_2: row.hor_vr_2,
    ver_vr_2: row.ver_vr_2,
    activo_vr_2: row.activo_vr_2 ?? false,
    vr_3: row.vr_3,
    hor_vr_3: row.hor_vr_3,
    ver_vr_3: row.ver_vr_3,
    activo_vr_3: row.activo_vr_3 ?? false,
    vr_4: row.vr_4,
    hor_vr_4: row.hor_vr_4,
    ver_vr_4: row.ver_vr_4,
    activo_vr_4: row.activo_vr_4 ?? false,

    // Acoples perimetrales
    perfil_acople: row.perfil_acople,
    // CORRECCIÓN: Campos de acoples agregados
    acople_desde: row.acople_desde,
    acople_hasta: row.acople_hasta,

    colocacion: row.colocacion ?? false,
    descri_item_manual: row.descri_item_manual,
    costo_item_manual: row.costo_item_manual,
    moneda_item_manual: row.moneda_item_manual,
    mano: row.mano,
    difiere_en_ancho: row.difiere_en_ancho ?? false,
    difiere_en_alto: row.difiere_en_alto ?? false,
    ligado_ancho_tipologia: row.ligado_ancho_tipologia ?? false,
    ligado_alto_tipologia: row.ligado_alto_tipologia ?? false,
    llega_al_final_ancho: row.llega_al_final_ancho ?? false,
    llega_al_final_alto: row.llega_al_final_alto ?? false,
  };
}

/** Convierte ObraDetalle (app) a payload de DB snake_case. */
function toDb(det: Omit<ObraDetalle, "id">): Record<string, any> {
  return {
    id_tipologia: det.id_tipologia,
    ubicacion_en_tipo: det.ubicacion_en_tipo ?? null,
    id_obra: det.id_obra,
    id_extrusora: det.id_extrusora ?? null,
    id_linea: det.id_linea ?? null,
    id_tipo: det.id_tipo ?? null,
    id_producto: det.id_producto ?? null,
    ancho: det.ancho ?? null,
    alto: det.alto ?? null,
    color: det.color ?? null,
    marco: det.marco ?? null,
    hoja: det.hoja ?? null,
    interior: det.interior ?? null,
    contravidrios: det.contravidrios ?? null,
    contravidrios_ext: det.contravidrios_ext ?? null,
    cruce: det.cruce ?? null,
    mosquitero: det.mosquitero ?? null,
    tela: det.tela ?? null,
    tipo_cruce: det.tipo_cruce ?? null,
    cant_centrados_horizontal: det.cant_centrados_horizontal ?? null,
    cant_centrados_vertical: det.cant_centrados_vertical ?? null,
    horizontal_1: det.horizontal_1 ?? null,
    horizontal_2: det.horizontal_2 ?? null,
    horizontal_3: det.horizontal_3 ?? null,
    vertical_1: det.vertical_1 ?? null,
    vertical_2: det.vertical_2 ?? null,
    vertical_3: det.vertical_3 ?? null,
    vertical_4: det.vertical_4 ?? null,
    vertical_5: det.vertical_5 ?? null,
    interior_1: det.interior_1 ?? null,
    interior_2: det.interior_2 ?? null,
    interior_3: det.interior_3 ?? null,
    interior_4: det.interior_4 ?? null,

    // DVH Bloque 1 y 2
    dvh_1_1: det.dvh_1_1 ?? null,
    dvh_1_2: det.dvh_1_2 ?? null,
    camara_1: det.camara_1 ?? null,
    dvh_2_1: det.dvh_2_1 ?? null,
    dvh_2_2: det.dvh_2_2 ?? null,
    camara_2: det.camara_2 ?? null,
    dvh_3_1: det.dvh_3_1 ?? null,
    dvh_3_2: det.dvh_3_2 ?? null,
    camara_3: det.camara_3 ?? null,
    dvh_4_1: det.dvh_4_1 ?? null,
    dvh_4_2: det.dvh_4_2 ?? null,
    camara_4: det.camara_4 ?? null,

    revest_1: det.revest_1 ?? null,
    direcc_1: det.direcc_1 ?? null,
    revest_2: det.revest_2 ?? null,
    direcc_2: det.direcc_2 ?? null,
    revest_3: det.revest_3 ?? null,
    direcc_3: det.direcc_3 ?? null,
    revest_4: det.revest_4 ?? null,
    direcc_4: det.direcc_4 ?? null,

    // Vidrios Repartidos (VR)
    vr_1: det.vr_1 ?? null,
    hor_vr_1: det.hor_vr_1 ?? null,
    ver_vr_1: det.ver_vr_1 ?? null,
    activo_vr_1: det.activo_vr_1 ?? false,
    vr_2: det.vr_2 ?? null,
    hor_vr_2: det.hor_vr_2 ?? null,
    ver_vr_2: det.ver_vr_2 ?? null,
    activo_vr_2: det.activo_vr_2 ?? false,
    vr_3: det.vr_3 ?? null,
    hor_vr_3: det.hor_vr_3 ?? null,
    ver_vr_3: det.ver_vr_3 ?? null,
    activo_vr_3: det.activo_vr_3 ?? false,
    vr_4: det.vr_4 ?? null,
    hor_vr_4: det.hor_vr_4 ?? null,
    ver_vr_4: det.ver_vr_4 ?? null,
    activo_vr_4: det.activo_vr_4 ?? false,

    // Acoples perimetrales
    perfil_acople: det.perfil_acople ?? null,
    // CORRECCIÓN: Mapeos de acoples agregados
    acople_desde: det.acople_desde ?? null,
    acople_hasta: det.acople_hasta ?? null,

    colocacion: det.colocacion ?? false,
    descri_item_manual: det.descri_item_manual ?? null,
    costo_item_manual: det.costo_item_manual ?? null,
    moneda_item_manual: det.moneda_item_manual ?? null,
    mano: det.mano ?? null,
    difiere_en_ancho: det.difiere_en_ancho ?? false,
    difiere_en_alto: det.difiere_en_alto ?? false,
    ligado_ancho_tipologia: det.ligado_ancho_tipologia ?? false,
    ligado_alto_tipologia: det.ligado_alto_tipologia ?? false,
    llega_al_final_ancho: det.llega_al_final_ancho ?? false,
    llega_al_final_alto: det.llega_al_final_alto ?? false,
  };
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Obtiene todos los detalles de la tipología activa. */
export function useObraDetallesByTipologia(idTipologia: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "by_tipologia", idTipologia],
    queryFn: async () => {
      if (!idTipologia) return [];
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("*")
        .eq("id_tipologia", idTipologia)
        .order("id", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(fromDb) as ObraDetalle[];
    },
    enabled: !!idTipologia,
  });
}

/** Obtiene todos los detalles de todos los elementos de la obra. */
export function useObraDetallesByObra(idObra: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "by_obra", idObra],
    queryFn: async () => {
      if (!idObra) return [];
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("*")
        .eq("id_obra", idObra);

      if (error) throw error;
      return (data ?? []).map(fromDb) as ObraDetalle[];
    },
    enabled: !!idObra,
  });
}

/** Obtiene el detalle principal de la tipología. */
export function useObraDetallePrincipal(idTipologia: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "principal", idTipologia],
    queryFn: async () => {
      if (!idTipologia) return null;
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("*")
        .eq("id_tipologia", idTipologia)
        .or("ubicacion_en_tipo.is.null,ubicacion_en_tipo.eq.")
        .maybeSingle();

      if (error) throw error;
      return data ? fromDb(data) : null;
    },
    enabled: !!idTipologia,
  });
}

/** Crea un nuevo registro de obra_detalles. */
export function useCreateObraDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (detalle: Omit<ObraDetalle, "id">) => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .insert(toDb(detalle))
        .select()
        .single();

      if (error) throw error;
      return fromDb(data);
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_tipologia", item.id_tipologia],
      });
      queryClient.invalidateQueries({
        queryKey: [TABLE, "principal", item.id_tipologia],
      });
      // CORRECCIÓN: También invalida la vista general por obra si está cacheada
      if (item.id_obra) {
        queryClient.invalidateQueries({
          queryKey: [TABLE, "by_obra", item.id_obra],
        });
      }
    },
  });
}

/** Actualiza un registro existente de obra_detalles (Partial update). */
export function useUpdateObraDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Omit<ObraDetalle, "id">>;
    }) => {
      const dbPayload: Record<string, any> = {};
      const full = toDb(data as Omit<ObraDetalle, "id">);

      for (const key of Object.keys(data) as Array<keyof typeof data>) {
        if (key in full) {
          dbPayload[key] = full[key];
        }
      }

      const { data: updated, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .update(dbPayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return fromDb(updated);
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_tipologia", item.id_tipologia],
      });
      queryClient.invalidateQueries({
        queryKey: [TABLE, "principal", item.id_tipologia],
      });
      // CORRECCIÓN: También invalida la vista por obra
      if (item.id_obra) {
        queryClient.invalidateQueries({
          queryKey: [TABLE, "by_obra", item.id_obra],
        });
      }
    },
  });
}

/** Upsert: crea o actualiza el detalle principal de una tipología. */
export function useUpsertObraDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (detalle: Omit<ObraDetalle, "id"> & { id?: number }) => {
      const { id, ...rest } = detalle;

      if (id) {
        const { data, error } = await supabase
          .schema(SCHEMA)
          .from(TABLE)
          .update(toDb(rest))
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return fromDb(data);
      } else {
        const { data, error } = await supabase
          .schema(SCHEMA)
          .from(TABLE)
          .insert(toDb(rest))
          .select()
          .single();
        if (error) throw error;
        return fromDb(data);
      }
    },
    onSuccess: (item) => {
      // Invalidaciones actuales...
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_tipologia", item.id_tipologia],
      });
      queryClient.invalidateQueries({
        queryKey: [TABLE, "principal", item.id_tipologia],
      });

      if (item.id_obra) {
        queryClient.invalidateQueries({
          queryKey: [TABLE, "by_obra", item.id_obra],
        });
        // RECOMENDACIÓN: Si el despiece general de la obra depende del total de materiales:
        queryClient.invalidateQueries({
          queryKey: ["despiece_global", item.id_obra],
        });
      }

      // RECOMENDACIÓN: Invalidar el despiece específico de esta abertura para que se recalculen
      // los cortes de aluminio (fórmulas de Herrero/Modena) e interiores en caliente.
      queryClient.invalidateQueries({ queryKey: ["despiece", item.id] });
      queryClient.invalidateQueries({ queryKey: ["hojas", item.id] });
    },
  });
}

/** Elimina todos los detalles de una tipología. */
export function useDeleteObraDetallesByTipologia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idTipologia: number) => {
      const { error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .delete()
        .eq("id_tipologia", idTipologia);

      if (error) throw error;
      return idTipologia;
    },
    onSuccess: (idTipologia) => {
      queryClient.invalidateQueries({
        queryKey: [TABLE, "by_tipologia", idTipologia],
      });
      queryClient.invalidateQueries({
        queryKey: [TABLE, "principal", idTipologia],
      });
      // CORRECCIÓN: Al no tener el id_obra directamente aquí, invalidamos el prefijo general
      // para asegurar que las listas globales por obra se vuelvan a pedir al servidor.
      queryClient.invalidateQueries({ queryKey: [TABLE, "by_obra"] });
    },
  });
}
