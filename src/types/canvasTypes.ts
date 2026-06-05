/**
 * canvasTypes.ts
 *
 * Tipos canónicos para la configuración de tipologías en el canvas y en el
 * motor de despiece. Se mueven aquí desde obrasStore para romper la dependencia
 * circular entre el motor de cálculo y el store de UI.
 *
 * Todos los componentes que antes importaban desde "@/store/obrasStore"
 * deben actualizar su import a "@/types/canvasTypes".
 */

// ── Módulo (paño individual en grilla de cruces variables) ────────────────────

export type TipoModulo = "vidrio" | "panel" | "persiana" | "vacio";

export interface ModuloConfig {
  fila: number;
  col: number;
  tipo: TipoModulo;
  /** Código del vidrio (campo `codigo` de la tabla vidrios) */
  id_vidrio: string | null;
  /** Código del revestimiento/vidrio secundario por paño */
  id_revestimiento: string | null;
  id_contravidrio: number | null;
  id_contravidrio_ext: number | null;
  id_producto: number | null;
  id_marco: number | null;
  id_interior: number | null;
  notas: string;
}

export function emptyModulo(fila: number, col: number): ModuloConfig {
  return {
    fila,
    col,
    tipo: "vidrio",
    id_vidrio: null,
    id_revestimiento: null,
    id_contravidrio: null,
    id_contravidrio_ext: null,
    id_producto: null,
    id_marco: null,
    id_interior: null,
    notas: "",
  };
}

// ── Configuración completa de una tipología ───────────────────────────────────

/**
 * TipologiaConfig representa la configuración completa de un producto dentro
 * de una tipología: producto elegido, marco, hoja, interior, cruces y vidrios.
 *
 * En la base de datos, esta información está distribuida entre:
 *  - obras.obra_detalles  (producto, marco, hoja, interior, color, cruces)
 *  - interior_1..4        (vidrios/revestimientos por módulo, guardados como
 *                          código de vidrio en las columnas dvh_X/revest_X)
 *
 * Se construye con `obraDetalleToConfig()` de @/lib/obraDetalleAdapter.
 */
export interface TipologiaConfig {
  /** ID del registro en obra_detalles (undefined si es nuevo / sin guardar) */
  id?: number;
  id_tipologia: number;

  // ── Producto ──────────────────────────────────────────────────────────────
  id_producto: number | null;
  id_marco: number | null;
  id_hoja: number | null;
  id_interior: number | null;
  id_contravidrio: number | null;
  id_contravidrio_ext: number | null;
  id_mosquitero: number | null;
  id_vid_repartido: number | null;

  // ── Acabado (ID de tratamiento = columna `color` en obra_detalles) ────────
  id_tratamiento: number;

  // ── Cruces ────────────────────────────────────────────────────────────────
  /** 0 = sin cruces, 1 = centrados, 2 = variables */
  tipo_cruce: 0 | 1 | 2;
  cruces_h: number;
  cruces_v: number;
  /** Posiciones en mm desde abajo (solo para tipo_cruce === 2) */
  pos_h: number[];
  /** Posiciones en mm desde la izquierda (solo para tipo_cruce === 2) */
  pos_v: number[];

  // ── Configuración por módulo (piso × columna para cruces variables) ───────
  modulosConfig: ModuloConfig[];

  // ── Vidrio y relleno principal ────────────────────────────────────────────
  /** Código del vidrio/relleno principal (campo `codigo` en tabla vidrios) */
  id_vidrio: string | null;
  /** Código del revestimiento interior global */
  id_revestimiento: string | null;

  // ── Opciones ──────────────────────────────────────────────────────────────
  con_premarco: boolean;
  con_tapajuntas: boolean;
  notas: string;
}

export function emptyConfig(idTipologia: number): TipologiaConfig {
  return {
    id_tipologia: idTipologia,
    id_producto: null,
    id_marco: null,
    id_hoja: null,
    id_interior: null,
    id_contravidrio: null,
    id_contravidrio_ext: null,
    id_mosquitero: null,
    id_vid_repartido: null,
    id_tratamiento: 1,
    tipo_cruce: 0,
    cruces_h: 0,
    cruces_v: 0,
    pos_h: [],
    pos_v: [],
    modulosConfig: [],
    id_vidrio: null,
    id_revestimiento: null,
    con_premarco: false,
    con_tapajuntas: false,
    notas: "",
  };
}
