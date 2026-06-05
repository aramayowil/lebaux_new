/**
 * obraDetalleAdapter.ts
 *
 * Convierte un registro de `obras.obra_detalles` (tipo ObraDetalle)
 * al formato TipologiaConfig que consumen el canvas y el motor de despiece.
 *
 * Es la pieza que cierra la migración: elimina la necesidad de sincronizar
 * el obrasStore con los datos de la base de datos.
 *
 * Mapeo de campos:
 *
 * ObraDetalle (DB)          →  TipologiaConfig (canvas/motor)
 * ─────────────────────────────────────────────────────────────
 * idProducto                →  id_producto
 * marco                     →  id_marco
 * hoja                      →  id_hoja
 * interior                  →  id_interior
 * contravidrios             →  id_contravidrio
 * contravidriosExt          →  id_contravidrio_ext
 * mosquitero                →  id_mosquitero
 * cruce                     →  id_vid_repartido  (VR activo)
 * color                     →  id_tratamiento
 * tipoCruce                 →  tipo_cruce
 * cantCentradosHorizontal   →  cruces_h
 * cantCentradosVertical     →  cruces_v
 * horizontal1..3            →  pos_h[]
 * vertical1..5              →  pos_v[]
 * interior1                 →  id_vidrio          (vidrio/relleno principal)
 * interior2                 →  id_revestimiento   (revestimiento interior)
 * tela                      →  notas
 *
 * Nota sobre modulosConfig:
 * La tabla obra_detalles no tiene columnas dedicadas a la configuración de
 * módulos individuales (grilla de cruces variables). Los campos dvh_X/revest_X
 * guardan valores globales, no por paño. Para una implementación con módulos
 * por paño se necesitaría una tabla adicional (p.ej. obra_detalles_modulos).
 * Por ahora, modulosConfig se devuelve vacío y el motor usará los valores
 * globales (id_interior, id_vidrio) para todos los paños.
 */

import type { ObraDetalle } from "@/types";
import { type TipologiaConfig, emptyConfig } from "@/types/canvasTypes";

/**
 * Convierte un ObraDetalle de la DB a TipologiaConfig para el canvas y el motor.
 * Si `detalle` es null/undefined devuelve una config vacía.
 */
export function obraDetalleToConfig(
  detalle: ObraDetalle | null | undefined,
): TipologiaConfig {
  if (!detalle) {
    return emptyConfig(0);
  }

  // Posiciones de cruces variables desde los campos horizontal_*/vertical_*
  const pos_h: number[] = [
    detalle.horizontal_1,
    detalle.horizontal_2,
    detalle.horizontal_3,
  ].filter((v): v is number => typeof v === "number" && v > 0);

  const pos_v: number[] = [
    detalle.vertical_1,
    detalle.vertical_2,
    detalle.vertical_3,
    detalle.vertical_4,
    detalle.vertical_5,
  ].filter((v): v is number => typeof v === "number" && v > 0);

  // tipo_cruce: la DB almacena el valor numérico directamente
  // 0 = sin cruces, 1 = centrados, 2 = variables
  const tipo_cruce = (detalle.tipo_cruce ?? 0) as 0 | 1 | 2;

  return {
    id: detalle.id,
    id_tipologia: detalle.id_tipologia ?? 0,

    // Producto
    id_producto: detalle.id_producto ?? null,
    id_marco: detalle.marco ?? null,
    id_hoja: detalle.hoja ?? null,
    id_interior: detalle.interior ?? null,
    id_contravidrio: detalle.contravidrios ?? null,
    id_contravidrio_ext: detalle.contravidrios_ext ?? null,
    id_mosquitero: detalle.mosquitero ?? null,
    id_vid_repartido: detalle.cruce ?? null,

    // Acabado: columna `color` almacena el ID del tratamiento
    id_tratamiento: detalle.color ?? 1,

    // Cruces
    tipo_cruce,
    cruces_h: detalle.cant_centrados_horizontal ?? pos_h.length,
    cruces_v: detalle.cant_centrados_vertical ?? pos_v.length,
    pos_h,
    pos_v,

    // Sin grilla por módulo (ver nota en el encabezado del archivo)
    modulosConfig: [],

    // Vidrio y relleno: guardados en interior_1 / interior_2
    id_vidrio: detalle.interior_1 ?? null,
    id_revestimiento: detalle.interior_2 ?? null,

    // Opciones
    con_premarco: false, // No existe columna en DB aún — placeholder
    con_tapajuntas: false, // No existe columna en DB aún — placeholder
    notas: detalle.tela ?? "", // tela se reutiliza como campo de notas
  };
}

/**
 * Convierte TipologiaConfig de vuelta a un payload parcial de ObraDetalle.
 * Útil si en algún punto se necesita el camino inverso.
 */
export function configToObraDetallePatch(
  cfg: Partial<TipologiaConfig>,
): Partial<Omit<ObraDetalle, "id">> {
  const patch: Partial<Omit<ObraDetalle, "id">> = {};

  if (cfg.id_producto !== undefined)
    patch.id_producto = cfg.id_producto ?? undefined;
  if (cfg.id_marco !== undefined) patch.marco = cfg.id_marco ?? undefined;
  if (cfg.id_hoja !== undefined) patch.hoja = cfg.id_hoja ?? undefined;
  if (cfg.id_interior !== undefined)
    patch.interior = cfg.id_interior ?? undefined;
  if (cfg.id_contravidrio !== undefined)
    patch.contravidrios = cfg.id_contravidrio ?? undefined;
  if (cfg.id_contravidrio_ext !== undefined)
    patch.contravidrios_ext = cfg.id_contravidrio_ext ?? undefined;
  if (cfg.id_mosquitero !== undefined)
    patch.mosquitero = cfg.id_mosquitero ?? undefined;
  if (cfg.id_vid_repartido !== undefined)
    patch.cruce = cfg.id_vid_repartido ?? undefined;
  if (cfg.id_tratamiento !== undefined) patch.color = cfg.id_tratamiento;
  if (cfg.tipo_cruce !== undefined) patch.tipo_cruce = cfg.tipo_cruce;
  if (cfg.cruces_h !== undefined) patch.cant_centrados_horizontal = cfg.cruces_h;
  if (cfg.cruces_v !== undefined) patch.cant_centrados_vertical = cfg.cruces_v;
  if (cfg.id_vidrio !== undefined) patch.interior_1 = cfg.id_vidrio?.toString() ?? undefined;
  if (cfg.id_revestimiento !== undefined)
    patch.interior_2 = cfg.id_revestimiento?.toString() ?? undefined;
  if (cfg.notas !== undefined) patch.tela = cfg.notas;

  // Posiciones de cruces variables
  if (cfg.pos_h !== undefined) {
    patch.horizontal_1 = cfg.pos_h[0] ?? undefined;
    patch.horizontal_2 = cfg.pos_h[1] ?? undefined;
    patch.horizontal_3 = cfg.pos_h[2] ?? undefined;
  }
  if (cfg.pos_v !== undefined) {
    patch.vertical_1 = cfg.pos_v[0] ?? undefined;
    patch.vertical_2 = cfg.pos_v[1] ?? undefined;
    patch.vertical_3 = cfg.pos_v[2] ?? undefined;
    patch.vertical_4 = cfg.pos_v[3] ?? undefined;
    patch.vertical_5 = cfg.pos_v[4] ?? undefined;
  }

  return patch;
}
