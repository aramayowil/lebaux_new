/**
 * Motor de Despiece – v3.2
 *
 * Cambios vs v3.1:
 *   [NEW]  PASO 4.5: Vidrio Repartido (VR) — Contorno + Crucetas
 *          Lógica de crucetas idéntica a la de cruces principales.
 *          Las fórmulas se evalúan con ctxVR (ancho/alto del sub-paño
 *          real, después de aplicar descuentos de cruces principales).
 *   [NEW]  PASO 5.5: Accesorios de VR
 *   [NEW]  NivelCorte: "VR Contorno" | "VR Cruceta"
 *   [NEW]  NivelAccesorio: "VR"
 *   [FIX]  PASO 4: DVH ahora genera 2 ItemInterior por hoja (cara int. + cara ext.)
 *   [FIX]  PASO 4: Detección DVH por hoja usando dvh_N_1 / dvh_N_2 / camara_N
 *   [NEW]  ItemInterior: campos descripcion_vidrio, numero_hoja, cara, es_dvh, descripcion_camara
 */

import {
  calcularCantidad,
  calcularMedida,
  optimizarCortes,
  type ContextoCalculo,
} from "./calculoDespiece";

import type {
  ObraTipologia,
  ObraDetalle,
  Perfil,
  Accesorio,
  Vidrio,
  Tratamiento,
  DespiecePerfil,
  DespiecePerfilContravidrio,
  DespieceCruce,
  DespieceInterior,
  DespiecePerfilVidrioRepartido,
  DespieceAccesorioMarco,
  DespieceAccesorioHoja,
  DespieceAccesorioInterior,
  DespieceAccesorioCruce,
  DespieceAccesorioVidrioRepartido,
} from "@/types";

// ─── Interfaces de Comunicación ──────────────────────────────────────────────

export interface EntradaCalculo {
  ancho: number;
  alto: number;
  cantidad_tipologias: number;
  detalle: ObraDetalle;
  tipologia: ObraTipologia;
  cant_hojas_calculo: number;
}

export interface DatosProducto {
  marco?: Perfil;
  hoja?: Perfil;
  interior?: Perfil;

  rules_perfiles_marco: DespiecePerfil[];
  rules_perfiles_hoja: DespiecePerfil[];
  rules_interior: DespieceInterior | null;
  rules_cruces: DespieceCruce | null;
  rules_perfiles_contravidrio: DespiecePerfilContravidrio[];

  // ── Vidrio Repartido ─────────────────────────────────────────────────────
  /**
   * Regla única de VR ligada al producto interior (id_vr = idInterior).
   * null cuando el interior no tiene VR configurado.
   */
  rules_perfiles_vr: DespiecePerfilVidrioRepartido | null;
  /** Accesorios de VR (todos comparten la misma regla del interior). */
  rules_accesorios_vr: DespieceAccesorioVidrioRepartido[];
  /**
   * Paños con VR activo: [{ idx: 1, id: vrId }, ...].
   * idx es 1-based (coincide con hor_vr_N, ver_vr_N, camara_N, dvh_N_1, etc.).
   * id es el ID del VR asignado (= idInterior cuando la regla viene de allí).
   */
  vr_activos: { idx: number; id: number }[];

  /** Accesorios por nivel — paralelo a rules_perfiles_* */
  rules_accesorios_marco: DespieceAccesorioMarco[];
  rules_accesorios_hoja: DespieceAccesorioHoja[];
  rules_accesorios_interior: DespieceAccesorioInterior[];
  rules_accesorios_cruces: DespieceAccesorioCruce[];

  find_despiece_contravidrio: (id: number) => DespiecePerfilContravidrio;

  catalog_perfiles: Perfil[];
  catalog_accesorios: Accesorio[];
  catalog_vidrios: Vidrio[];
  catalog_tratamientos: Tratamiento[];
}

export type NivelCorte =
  | "Marco"
  | "Hoja"
  | "Contravid. Int."
  | "Contravid. Ext."
  | "Cruces"
  | "Interior"
  | "Cámara"
  | "VR Contorno"
  | "VR Cruceta";

export interface CortePerfil {
  id: number;
  nivel: NivelCorte;
  nro_perfil: string;
  descripcion_perfil: string;
  angulo: string;
  cantidad: number;
  medida_mm: number;
  total_mm: number;
  kg: number;
  precio_unitario: number;
  precio_total: number;
}

/**
 * ItemInterior — representa un paño de vidrio, DVH, revestimiento u otro relleno.
 *
 * Campos DVH (v3.1):
 *   - es_dvh: true cuando el paño es doble vidrio aislante
 *   - cara: "interior" | "exterior" para los dos vidrios del DVH; "simple" para vidrio monolítico
 *   - descripcion_vidrio: descripción del vidrio (ej. "Float 4mm", "Laminado 3+3")
 *   - descripcion_camara: separador de cámara resuelto desde catalog_perfiles
 *     (camara_N), con fallback al id crudo si no se encuentra en catálogo
 *   - numero_hoja: 1-based — a qué hoja de la tipología pertenece este paño
 */
export interface ItemInterior {
  tipo: "Vidrio" | "Revestimiento" | "CV Int." | "CV Ext." | "VR";
  cantidad: number;
  ancho: number;
  alto: number;
  area: number;
  precio: number;
  modulo?: string;
  // ── Nuevos campos DVH / descripción ─────────────────────────────────────
  descripcion_vidrio?: string;
  numero_hoja?: number;
  cara?: "interior" | "exterior" | "simple";
  es_dvh?: boolean;
  descripcion_camara?: string;
}

export interface ResumenPerfil {
  nro_perfil: string;
  descripcion_perfil: string;
  total_cortes: number;
  total_mm: number;
  tiras: number;
  desperdicio_mm: number;
  eficiencia: number;
  kg: number;
  precio_kg: number;
  precio_total: number;
  longitud_tira: number;
  cortes: { medida_mm: number; cantidad: number; angulo: string }[];
  /** true cuando este perfil es cámara/separador europeo: precio_total se
   *  calculó como metros × $/m directo (peso_metro), no kg × $/kg. */
  es_camara_europea?: boolean;
  /** $/m usado cuando es_camara_europea = true (proviene de peso_metro). */
  precio_metro?: number;
}

export type NivelAccesorio = "Marco" | "Hoja" | "Interior" | "Cruces" | "VR";

export interface ItemAccesorio {
  id_accesorio: number;
  cod_parte: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  nivel: NivelAccesorio;
  /** Solo en Hoja: controla si el ítem aparece en el presupuesto al cliente */
  aparece_presupuesto: boolean;
  /** Agrupador de conjunto (ej. "Kit cierre") */
  id_conjunto?: number | null;
  nombre_conjunto?: string | null;
}

export type DespieceLogNivel = "info" | "warn" | "error";

export interface DespieceLog {
  nivel: DespieceLogNivel;
  fase: string;
  mensaje: string;
  valor?: unknown;
}

export interface ResultadoDespiece {
  cortes: CortePerfil[];
  interiores: ItemInterior[];
  accesorios: ItemAccesorio[];
  resumenes: ResumenPerfil[];
  // Costos por rubro — idénticos al sistema Access original
  costo_perfiles: number; // PF — perfiles naturales
  costo_interiores: number; // VD — vidrios / interiores (área m²)
  costo_accesorios: number; // AC — accesorios
  costo_tratamiento: number; // TR — tratamiento / color de perfiles (kg × $/kg)
  costo_mo_taller: number; // MO taller (calculado desde Opciones en la vista)
  costo_mo_colocacion: number; // MO colocación (pendiente v4)
  costo_telas: number; // Telas / mosquiteros (pendiente v4)
  costo_total: number; // Suma de todos los rubros
  multiplicador: number;
  contexto: ContextoCalculo;
  logs: DespieceLog[];
}

// ─── Helpers Internos ────────────────────────────────────────────────────────

function crearLogger() {
  const entries: DespieceLog[] = [];
  return {
    info: (fase: string, mensaje: string, valor?: unknown) =>
      entries.push({ nivel: "info", fase, mensaje, valor }),
    warn: (fase: string, mensaje: string, valor?: unknown) => {
      console.warn(`[Despiece/${fase}]`, mensaje, valor ?? "");
      entries.push({ nivel: "warn", fase, mensaje, valor });
    },
    error: (fase: string, mensaje: string, valor?: unknown) => {
      console.error(`[Despiece/${fase}]`, mensaje, valor ?? "");
      entries.push({ nivel: "error", fase, mensaje, valor });
    },
    entries: () => entries,
  };
}

function buildPerfilMap(perfiles: Perfil[]): Map<number, Perfil> {
  return new Map(perfiles.map((p) => [p.id, p]));
}

function calcularPrecioCorte(
  perfil: Perfil | undefined,
  medida_mm: number,
  cantidad: number,
): { precio_unitario: number; precio_total: number; kg: number } {
  if (!perfil) return { precio_unitario: 0, precio_total: 0, kg: 0 };

  // Cámara europea: peso_metro guarda el PRECIO POR METRO LINEAL directo
  // (no kg/m). No se pondera por precio_kg ni aporta kg → no entra en
  // costo_tratamiento (el separador no se pinta/anodiza).
  if (perfil.es_camara_europea) {
    const precioMetro = perfil.peso_metro ?? 0;
    const metros = medida_mm / 1000;
    const precio_unitario = precioMetro * metros;
    const precio_total = precio_unitario * cantidad;
    return { precio_unitario, precio_total, kg: 0 };
  }

  const pesoMetro = (perfil.peso_metro ?? 0) / 1000;
  const precioKg = perfil.precio_kg ?? 0;
  const kg = pesoMetro * medida_mm * cantidad;
  const precio_unitario = precioKg * pesoMetro * medida_mm;
  const precio_total = precioKg * kg;
  return { precio_unitario, precio_total, kg };
}

function validarEntrada(entrada: EntradaCalculo): void {
  if (!entrada.detalle.marco) throw new Error("Marco no configurado");
  if (entrada.ancho <= 0 || isNaN(entrada.ancho))
    throw new Error(`Ancho inválido: ${entrada.ancho}`);
  if (entrada.alto <= 0 || isNaN(entrada.alto))
    throw new Error(`Alto inválido: ${entrada.alto}`);
}

function getDetalleNum(detalle: ObraDetalle, key: string): number | null {
  return (detalle as unknown as Record<string, unknown>)[key] as number | null;
}

function getDetalleStr(detalle: ObraDetalle, key: string): string | null {
  const v = (detalle as unknown as Record<string, unknown>)[key];
  if (v === null || v === undefined || v === "null" || v === "undefined")
    return null;
  return String(v);
}

interface DespiecePerfilBase {
  id_perfil?: number | null;
  formula_cantidad?: string | null;
  formula_perfil?: string | null;
  angulo?: string | null;
}

// ─── Motor Principal ─────────────────────────────────────────────────────────

export function calcularDespiece(
  entrada: EntradaCalculo,
  datos: DatosProducto,
): ResultadoDespiece {
  validarEntrada(entrada);

  const log = crearLogger();
  const { ancho, alto, cantidad_tipologias, detalle } = entrada;
  const hojas = entrada.cant_hojas_calculo ?? 0;

  log.info("init", `Despiece iniciado`, { ancho, alto, hojas });

  // ── PASO 1: Calcular posiciones de cruces ─────────────────────────────────

  let posHef: number[] = [];
  let posVef: number[] = [];

  if (datos.rules_cruces) {
    const tipo_cruce = detalle.tipo_cruce ?? 0;

    if (tipo_cruce === 2) {
      // VARIABLES
      const h1 = getDetalleNum(detalle, "horizontal_1");
      const h2 = getDetalleNum(detalle, "horizontal_2");
      const h3 = getDetalleNum(detalle, "horizontal_3");
      posHef = [h1, h2, h3].filter(
        (n): n is number => n !== null && n !== undefined && n > 0,
      );

      const v1 = getDetalleNum(detalle, "vertical_1");
      const v2 = getDetalleNum(detalle, "vertical_2");
      const v3 = getDetalleNum(detalle, "vertical_3");
      const v4 = getDetalleNum(detalle, "vertical_4");
      const v5 = getDetalleNum(detalle, "vertical_5");
      posVef = [v1, v2, v3, v4, v5].filter(
        (n): n is number => n !== null && n !== undefined && n > 0,
      );
    } else if (tipo_cruce === 1) {
      // CENTRADOS
      const c_h = detalle.cant_centrados_horizontal ?? 0;
      const c_v = detalle.cant_centrados_vertical ?? 0;
      posHef = Array.from({ length: c_h }, (_, i) =>
        Math.round((alto / (c_h + 1)) * (i + 1)),
      );
      posVef = Array.from({ length: c_v }, (_, i) =>
        Math.round((ancho / (c_v + 1)) * (i + 1)),
      );
    }

    log.info("cruces", `Posiciones: H=${posHef.length}, V=${posVef.length}`, {
      posHef,
      posVef,
    });
  }

  const cant_cruces_h = posHef.length;
  const cant_cruces_v = posVef.length;

  const ctxBase: ContextoCalculo = {
    ancho,
    alto,
    hojas,
    cruces_h: cant_cruces_h,
    cruces_v: cant_cruces_v,
    pos_h: posHef,
    pos_v: posVef,
  };

  const cortes: CortePerfil[] = [];
  const interiorsCalc: ItemInterior[] = [];
  const accesariosCalc: ItemAccesorio[] = [];
  let cortId = 1;

  const perfilMap = buildPerfilMap(datos.catalog_perfiles);
  const lkPerfil = (id: number) => perfilMap.get(id);

  // ── PASO 2: Procesar Marco y Hoja ────────────────────────────────────────

  function addCorte(
    nivel: NivelCorte,
    dp: DespiecePerfilBase,
    ctx: ContextoCalculo,
  ) {
    const cant = calcularCantidad(dp.formula_cantidad ?? "0", ctx);
    const medida = calcularMedida(dp.formula_perfil ?? "0", ctx);
    if (cant <= 0 || medida <= 0) {
      log.warn(
        "addCorte",
        `Corte descartado (cant=${cant}, medida=${medida})`,
        { nivel },
      );
      return;
    }

    const perfil = lkPerfil(dp.id_perfil ?? 0);
    if (!perfil) {
      log.warn("addCorte", `Perfil id=${dp.id_perfil} no encontrado`, {
        nivel,
      });
    }

    const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
      perfil,
      medida,
      cant,
    );

    cortes.push({
      id: cortId++,
      nivel,
      nro_perfil: perfil?.nro_perfil?.toString() ?? "S/N",
      descripcion_perfil: perfil?.descri ?? "Perfil Desconocido",
      angulo: dp.angulo ?? "90°/90°",
      cantidad: cant,
      medida_mm: medida,
      total_mm: medida * cant,
      kg,
      precio_unitario,
      precio_total,
    });
  }

  if (detalle.marco) {
    log.info("marco", `Procesando ${datos.rules_perfiles_marco.length} reglas`);
    datos.rules_perfiles_marco.forEach((dp) =>
      addCorte("Marco", dp as DespiecePerfilBase, ctxBase),
    );
  }

  if (detalle.hoja) {
    log.info("hoja", `Procesando ${datos.rules_perfiles_hoja.length} reglas`);
    datos.rules_perfiles_hoja.forEach((dp) =>
      addCorte("Hoja", dp as DespiecePerfilBase, ctxBase),
    );
  }

  // ── PASO 3: Procesar Cruces (divisores) ──────────────────────────────────

  if (datos.rules_cruces && (cant_cruces_h > 0 || cant_cruces_v > 0)) {
    const ruleCruce = datos.rules_cruces;
    if (ruleCruce.id_perfil) {
      const perfilCruce = lkPerfil(ruleCruce.id_perfil);

      if (perfilCruce) {
        // Cruce horizontal
        if (cant_cruces_h > 0) {
          const medidaCruceH = calcularMedida(
            ruleCruce.formula_ancho_entero || "ancho",
            ctxBase,
          );

          const medidaCruceFinal = medidaCruceH;

          if (medidaCruceFinal > 0) {
            const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
              perfilCruce,
              medidaCruceFinal,
              cant_cruces_h,
            );
            cortes.push({
              id: cortId++,
              nivel: "Cruces",
              nro_perfil: perfilCruce.nro_perfil?.toString() ?? "CRUCE",
              descripcion_perfil: perfilCruce.descri ?? "Perfil Divisor H",
              angulo: ruleCruce.angulo ?? "90°/90°",
              cantidad: cant_cruces_h,
              medida_mm: medidaCruceFinal,
              total_mm: medidaCruceFinal * cant_cruces_h,
              kg,
              precio_unitario,
              precio_total,
            });
            log.info(
              "cruces",
              `Cruce H: ${cant_cruces_h}×${medidaCruceFinal}mm`,
            );
          }
        }

        // Cruce vertical
        if (cant_cruces_v > 0) {
          const medidaCruceV = calcularMedida(
            ruleCruce.formula_alto_entero || "alto",
            ctxBase,
          );

          let medidaCruceFinal = medidaCruceV;
          if (cant_cruces_h > 0 && ruleCruce.descuento_de_si_mismo) {
            medidaCruceFinal =
              (medidaCruceV - ruleCruce.descuento_de_si_mismo * cant_cruces_h) /
              (cant_cruces_h + 1);
          }

          if (medidaCruceFinal > 0) {
            const cantTrozosV =
              cant_cruces_v * (cant_cruces_h > 0 ? cant_cruces_h + 1 : 1);
            const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
              perfilCruce,
              medidaCruceFinal,
              cantTrozosV,
            );
            cortes.push({
              id: cortId++,
              nivel: "Cruces",
              nro_perfil: perfilCruce.nro_perfil?.toString() ?? "CRUCE",
              descripcion_perfil: perfilCruce.descri ?? "Perfil Divisor V",
              angulo: ruleCruce.angulo ?? "90°/90°",
              cantidad: cantTrozosV,
              medida_mm: medidaCruceFinal,
              total_mm: medidaCruceFinal * cantTrozosV,
              kg,
              precio_unitario,
              precio_total,
            });
            log.info(
              "cruces",
              `Cruce V: ${cantTrozosV} trozos × ${medidaCruceFinal}mm`,
            );
          }
        }
      }
    }
  }

  // ── PASO 4: Procesar Interior (vidrios/revestimiento) ────────────────────
  //
  // v3.1 — Cambios:
  //   - DVH detectado por hoja: dvh_N_1 (interior) + dvh_N_2 (exterior) + camara_N
  //   - Cada hoja DVH genera 2 ItemInterior (una por lámina)
  //   - ItemInterior lleva numero_hoja, cara, es_dvh, descripcion_vidrio, descripcion_camara

  if (datos.rules_interior) {
    const ruleInterior = datos.rules_interior;

    const cantPanos = calcularCantidad(
      ruleInterior.formula_cantidad_interiores ?? "1",
      ctxBase,
    );
    const anchoPanoBase = calcularMedida(
      ruleInterior.formula_ancho_interior ?? "ancho",
      ctxBase,
    );
    const altoPanoBase = calcularMedida(
      ruleInterior.formula_alto_interior ?? "alto",
      ctxBase,
    );

    log.info(
      "interior",
      `${cantPanos} paños, base: ${anchoPanoBase}×${altoPanoBase}mm`,
    );

    // Aplicar descuentos de cruces
    let anchoVidrio = anchoPanoBase;
    let altoVidrio = altoPanoBase;

    if (datos.rules_cruces && datos.rules_cruces.descuento_vidrio) {
      const desc = datos.rules_cruces.descuento_vidrio;

      if (cant_cruces_h > 0) {
        altoVidrio =
          (altoPanoBase - desc * cant_cruces_h) / (cant_cruces_h + 1);
      }
      if (cant_cruces_v > 0) {
        anchoVidrio =
          (anchoPanoBase - desc * cant_cruces_v) / (cant_cruces_v + 1);
      }

      log.info(
        "interior",
        `Descuentos aplicados: ${anchoVidrio.toFixed(2)}×${altoVidrio.toFixed(2)}mm`,
      );
    }

    const anchoRedondo = Math.round(anchoVidrio);
    const altoRedondo = Math.round(altoVidrio);
    const area = (anchoRedondo / 1000) * (altoRedondo / 1000);

    // ── Detectar tipo base (para saber si es revestimiento) ────────────────
    const tipoBase1 = getDetalleStr(detalle, "interior_1");
    const esRevestimientoBase = tipoBase1 === "REVESTIMIENTO";

    if (esRevestimientoBase) {
      // ── REVESTIMIENTO ────────────────────────────────────────────────────
      const revestVal = getDetalleStr(detalle, "revest_1");

      if (revestVal) {
        const perfilRevest = datos.catalog_perfiles.find(
          (p) => p.nro_perfil === revestVal || p.id.toString() === revestVal,
        );

        if (perfilRevest) {
          const pasoTablilla = 100;
          const orientacion = getDetalleStr(detalle, "direcc_1") ?? "H";
          const cantidadTablillas =
            orientacion === "H"
              ? Math.ceil(altoVidrio / pasoTablilla)
              : Math.ceil(anchoVidrio / pasoTablilla);
          const medidaCorteTablilla =
            orientacion === "H" ? anchoVidrio : altoVidrio;

          const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
            perfilRevest,
            medidaCorteTablilla,
            cantidadTablillas,
          );

          cortes.push({
            id: cortId++,
            nivel: "Interior",
            nro_perfil: perfilRevest.nro_perfil?.toString() ?? "REV",
            descripcion_perfil: perfilRevest.descri ?? "Tablilla",
            angulo: "90°/90°",
            cantidad: cantidadTablillas,
            medida_mm: medidaCorteTablilla,
            total_mm: medidaCorteTablilla * cantidadTablillas,
            kg,
            precio_unitario,
            precio_total,
          });

          interiorsCalc.push({
            tipo: "Revestimiento",
            cantidad: cantidadTablillas,
            ancho: medidaCorteTablilla,
            alto: pasoTablilla,
            area,
            precio: precio_total,
            modulo: `Hoja 1`,
            numero_hoja: 1,
            cara: "simple",
          });

          log.info(
            "interior",
            `${cantidadTablillas} tablillas de ${medidaCorteTablilla}mm`,
          );
        } else {
          log.warn(
            "interior",
            `Perfil revestimiento id="${revestVal}" no encontrado`,
          );
        }
      }
    } else {
      // ── VIDRIOS (simple o DVH) — procesado por paño/hoja ─────────────────

      /**
       * Busca un vidrio en el catálogo por ID numérico o código string.
       * Devuelve undefined si no se encuentra o si el id es vacío/nulo.
       */
      const resolveVid = (
        idStr: string | null | undefined,
      ): Vidrio | undefined => {
        if (!idStr || idStr === "null" || idStr === "undefined")
          return undefined;
        return datos.catalog_vidrios.find(
          (v) => v.id.toString() === idStr || v.codigo === idStr,
        );
      };

      /**
       * Busca el perfil separador de cámara (camara_N) en el catálogo de
       * perfiles por ID numérico o nro_perfil. Mismo criterio que se usa
       * para resolver perfiles de revestimiento (revestVal).
       */
      const resolveCamaraPerfil = (
        idStr: string | null | undefined,
      ): Perfil | undefined => {
        if (!idStr || idStr === "null" || idStr === "undefined")
          return undefined;
        return datos.catalog_perfiles.find(
          (p) => p.id.toString() === idStr || p.nro_perfil === idStr,
        );
      };

      /**
       * Calcula precio por m² dado un vidrio del catálogo.
       * Usa base × altura del catálogo para calcular el m² de referencia.
       */
      const precioM2Vid = (vid: Vidrio | undefined): number => {
        if (!vid) return 0;
        const baseM = (vid.base ?? 1) / 1000;
        const altM = (vid.altura ?? 1) / 1000;
        const m2Ref = baseM * altM;
        return m2Ref > 0 ? (vid.precio ?? 0) / m2Ref : 0;
      };

      for (let i = 0; i < cantPanos; i++) {
        const paneNum = i + 1; // 1-based (= número de hoja)

        // Campos DVH de este paño
        const dvhIntId = getDetalleStr(detalle, `dvh_${paneNum}_1`); // lámina interior
        const dvhExtId = getDetalleStr(detalle, `dvh_${paneNum}_2`); // lámina exterior
        const camaraStr = getDetalleStr(detalle, `camara_${paneNum}`); // separador

        // Fallback: usar interior_N como ID de vidrio simple si no hay dvh
        const interiorNId = getDetalleStr(detalle, `interior_${paneNum}`);
        const vidSimpleId =
          dvhIntId ??
          (interiorNId !== "VIDRIO" && interiorNId !== "REVESTIMIENTO"
            ? interiorNId
            : null);

        // Es DVH si ambas láminas están definidas
        const esDvh = !!(dvhIntId && dvhExtId);

        // Perfil separador (cámara) asignado a este paño, si corresponde
        const perfilCamara = esDvh ? resolveCamaraPerfil(camaraStr) : undefined;
        const descCamara = perfilCamara?.descri ?? camaraStr ?? undefined;

        if (esDvh) {
          // ── DVH: 2 láminas (interior + exterior) ─────────────────────────
          const vidInt = resolveVid(dvhIntId);
          const vidExt = resolveVid(dvhExtId);

          if (!vidInt)
            log.warn(
              "vidrio",
              `DVH cara interior id="${dvhIntId}" no encontrado (hoja ${paneNum})`,
            );
          if (!vidExt)
            log.warn(
              "vidrio",
              `DVH cara exterior id="${dvhExtId}" no encontrado (hoja ${paneNum})`,
            );

          // Lámina interior
          const pmInt = precioM2Vid(vidInt);
          interiorsCalc.push({
            tipo: "Vidrio",
            cantidad: 1,
            ancho: anchoRedondo,
            alto: altoRedondo,
            area,
            precio: pmInt * area,
            modulo: `Hoja ${paneNum}`,
            descripcion_vidrio:
              vidInt?.descri ?? vidInt?.codigo ?? `DVH Int. (id:${dvhIntId})`,
            numero_hoja: paneNum,
            cara: "interior",
            es_dvh: true,
            descripcion_camara: descCamara,
          });

          // Lámina exterior
          const pmExt = precioM2Vid(vidExt);
          interiorsCalc.push({
            tipo: "Vidrio",
            cantidad: 1,
            ancho: anchoRedondo,
            alto: altoRedondo,
            area,
            precio: pmExt * area,
            modulo: `Hoja ${paneNum}`,
            descripcion_vidrio:
              vidExt?.descri ?? vidExt?.codigo ?? `DVH Ext. (id:${dvhExtId})`,
            numero_hoja: paneNum,
            cara: "exterior",
            es_dvh: true,
            descripcion_camara: descCamara,
          });

          log.info(
            "interior",
            `Hoja ${paneNum} DVH: int="${dvhIntId}"/${vidInt?.descri ?? "?"} | ext="${dvhExtId}"/${vidExt?.descri ?? "?"} | cámara: ${descCamara ?? "—"}`,
          );

          // ── Separador de cámara: 1 perímetro por paño DVH ─────────────────
          // Se calcula sobre la MISMA medida del recorte de vidrio
          // (anchoRedondo × altoRedondo) y se integra como un corte de
          // perfil más (PF), igual que marco/hoja/cruces. El precio sale
          // de calcularPrecioCorte(), que internamente decide si
          // peso_metro es kg/m (perfil común) o $/m directo (cámara
          // europea) según el flag es_camara_europea del perfil.
          if (camaraStr && !perfilCamara) {
            log.warn(
              "camara",
              `Perfil de cámara id="${camaraStr}" no encontrado en catálogo (hoja ${paneNum})`,
            );
          } else if (perfilCamara) {
            const perimetroMm = 2 * (anchoRedondo + altoRedondo);

            if (perimetroMm > 0) {
              const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
                perfilCamara,
                perimetroMm,
                1,
              );

              cortes.push({
                id: cortId++,
                nivel: "Cámara",
                nro_perfil: perfilCamara.nro_perfil?.toString() ?? "CAM",
                descripcion_perfil: perfilCamara.descri ?? "Separador DVH",
                angulo: "—",
                cantidad: 1,
                medida_mm: perimetroMm,
                total_mm: perimetroMm,
                kg,
                precio_unitario,
                precio_total,
              });

              log.info(
                "camara",
                `Hoja ${paneNum} cámara "${perfilCamara.descri ?? perfilCamara.nro_perfil}": perímetro ${perimetroMm}mm (${(perimetroMm / 1000).toFixed(2)}m) — ${perfilCamara.es_camara_europea ? "$/m directo" : "kg/m × $/kg"}`,
              );
            }
          }
        } else {
          // ── Vidrio simple ─────────────────────────────────────────────────
          const vid = resolveVid(vidSimpleId);
          if (vidSimpleId && !vid)
            log.warn(
              "vidrio",
              `Vidrio simple id="${vidSimpleId}" no encontrado (hoja ${paneNum})`,
            );

          const pm = precioM2Vid(vid);
          interiorsCalc.push({
            tipo: "Vidrio",
            cantidad: 1,
            ancho: anchoRedondo,
            alto: altoRedondo,
            area,
            precio: pm * area,
            modulo: `Hoja ${paneNum}`,
            descripcion_vidrio: vid?.descri ?? vid?.codigo ?? undefined,
            numero_hoja: paneNum,
            cara: "simple",
            es_dvh: false,
          });

          log.info(
            "interior",
            `Hoja ${paneNum} vidrio simple: "${vidSimpleId ?? "sin id"}" / ${vid?.descri ?? "sin catálogo"}`,
          );
        }
      }
    }
  }

  // ── PASO 4.5: Vidrio Repartido (VR) ─────────────────────────────────────
  //
  // Estructura de descuentos (dos capas independientes):
  //
  //   Capa 1 — Cruces DE VENTANA (datos.rules_cruces.descuento_de_si_mismo):
  //     Los cruces de ventana que cruzan el paño cortan los perfiles del VR.
  //     • Cruces H de ventana → cortan los perfiles VERTICALES (alto) del VR:
  //         contorno V y cruceta V
  //     • Cruces V de ventana → cortan los perfiles HORIZONTALES (ancho) del VR:
  //         contorno H y cruceta H
  //     Fórmula: (base - descentoCruce × cant_cruces) / (cant_cruces + 1)
  //     Cantidad se multiplica por (cant_cruces + 1) para cubrir todas las secciones.
  //
  //   Capa 2 — Crucetas PROPIAS del VR (ruleVR.descuento_de_si_mismo):
  //     Aplicada SÓLO a las crucetas V, igual que PASO 3 (cruces de ventana):
  //     cada cruceta H del VR subdivide las V en (cantH + 1) trozos.
  //     Fórmula: (altoTrasCruce - ruleVR.descuento_de_si_mismo × cantH_VR) / (cantH_VR + 1)
  //     Trozos totales = cantV_VR × (cantH_VR + 1) × seccionesDeVentana
  //
  //   Interior VR (vidrio):
  //     Se calcula como un panel entero usando las fórmulas del VR rule
  //     (formula_ancho_interior, formula_alto_interior, formula_cantidad_interiores).
  //     NO se subdivide por las crucetas internas del VR (se agrega como total).

  if (datos.vr_activos?.length > 0 && datos.rules_perfiles_vr) {
    const ruleVR = datos.rules_perfiles_vr;

    // descuento_de_si_mismo de los CRUCES DE VENTANA:
    // es el grosor del cruce que recorta los perfiles VR al cruzarlos
    const descentoCruceVentana = datos.rules_cruces?.descuento_de_si_mismo ?? 0;

    // ── Dimensiones del sub-paño donde vive el VR ────────────────────────
    // Igual que PASO 4: partimos de las fórmulas del interior y restamos
    // el descuento_vidrio de los cruces principales.
    const anchoPanoBaseVR = datos.rules_perfiles_vr
      ? calcularMedida(
          datos.rules_perfiles_vr.formula_contorno_ancho ?? "ancho",
          ctxBase,
        )
      : ancho;
    const altoPanoBaseVR = datos.rules_perfiles_vr
      ? calcularMedida(
          datos.rules_perfiles_vr.formula_contorno_alto ?? "alto",
          ctxBase,
        )
      : alto;

    let anchoSubPano = anchoPanoBaseVR;
    let altoSubPano = altoPanoBaseVR;

    if (datos.rules_cruces?.descuento_vidrio) {
      const dv = datos.rules_cruces.descuento_vidrio;

      if (cant_cruces_h > 0)
        altoSubPano =
          (altoPanoBaseVR - dv * cant_cruces_h) / (cant_cruces_h + 1);
      if (cant_cruces_v > 0)
        anchoSubPano =
          (anchoPanoBaseVR - dv * cant_cruces_v) / (cant_cruces_v + 1);
    }

    const anchoVR = Math.round(anchoSubPano);
    const altoVR = Math.round(altoSubPano);

    log.info(
      "vr",
      `Sub-paño VR: ${anchoVR}×${altoVR}mm (base ${anchoPanoBaseVR.toFixed(1)}×${altoPanoBaseVR.toFixed(1)}mm)`,
    );

    // ── Iterar sobre cada paño con VR activo ─────────────────────────────
    for (const { idx: pañoIdx } of datos.vr_activos) {
      const pañoNum = pañoIdx; // 1-based, directo de useDespiece

      // Crucetas propias del VR para este paño
      const cantCrucesH_VR = Math.max(
        0,
        Math.round(getDetalleNum(detalle, `hor_vr_${pañoNum}`) ?? 0),
      );
      const cantCrucesV_VR = Math.max(
        0,
        Math.round(getDetalleNum(detalle, `ver_vr_${pañoNum}`) ?? 0),
      );

      // ctxVR: las fórmulas del VR resuelven contra el sub-paño (anchoVR/altoVR)
      // y contra las crucetas PROPIAS del VR (no los cruces de ventana).
      // Los cruces de ventana se aplican como descuentos explícitos más abajo.
      const ctxVR: ContextoCalculo = {
        ...ctxBase,
        ancho: ancho,
        alto: alto,
        cruces_h: cantCrucesH_VR,
        cruces_v: cantCrucesV_VR,
      };

      log.info(
        "vr",
        `Paño ${pañoNum}: ${cantCrucesH_VR}H × ${cantCrucesV_VR}V crucetas VR | cruces ventana: ${cant_cruces_h}H × ${cant_cruces_v}V`,
      );

      // ── CONTORNO (perfiles perimetrales del VR) ───────────────────────
      if (ruleVR.id_perfil_contorno) {
        const perfilContorno = lkPerfil(ruleVR.id_perfil_contorno);
        if (!perfilContorno) {
          log.warn(
            "vr",
            `Perfil contorno id=${ruleVR.id_perfil_contorno} no encontrado (paño ${pañoNum})`,
          );
        } else {
          // ── H (horizontales: top + bottom) ───────────────────────────
          // Los horizontales quedan cortados por los cruces VERTICALES de ventana.
          const cantContHBase = calcularCantidad(
            ruleVR.formula_cantidad_contorno_ancho ?? "2",
            ctxVR,
          );
          const medContHBase = calcularMedida(
            ruleVR.formula_contorno_ancho ?? "ancho",
            ctxVR,
          );
          let medContH = medContHBase;
          let cantContH = cantContHBase;

          if (cant_cruces_v > 0 && descentoCruceVentana > 0) {
            medContH =
              (medContHBase - descentoCruceVentana * cant_cruces_v) /
              (cant_cruces_v + 1);
            cantContH = cantContHBase * (cant_cruces_v + 1);
          }

          if (cantContH > 0 && medContH > 0) {
            const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
              perfilContorno,
              medContH,
              cantContH,
            );

            cortes.push({
              id: cortId++,
              nivel: "VR Contorno",
              nro_perfil: perfilContorno.nro_perfil?.toString() ?? "VR-C",
              descripcion_perfil: `${perfilContorno.descri ?? "Contorno VR"} — H P${pañoNum}`,
              angulo: ruleVR.angulo ?? "90°/90°",
              cantidad: cantContH,
              medida_mm: medContH,
              total_mm: medContH * cantContH,
              kg,
              precio_unitario,
              precio_total,
            });
            log.info(
              "vr",
              `Paño ${pañoNum} Contorno H: ${cantContH}×${medContH.toFixed(1)}mm`,
            );
          }

          // ── V (verticales: left + right) ──────────────────────────────
          // Los verticales quedan cortados por los cruces HORIZONTALES de ventana.
          const cantContVBase = calcularCantidad(
            ruleVR.formula_cantidad_contorno_alto ?? "2",
            ctxVR,
          );
          const medContVBase = calcularMedida(
            ruleVR.formula_contorno_alto ?? "alto",
            ctxVR,
          );
          let medContV = medContVBase;
          let cantContV = cantContVBase;

          if (cant_cruces_h > 0 && descentoCruceVentana > 0) {
            medContV =
              (medContVBase - descentoCruceVentana * cant_cruces_h) /
              (cant_cruces_h + 1);
          }

          if (cantContV > 0 && medContV > 0) {
            const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
              perfilContorno,
              medContV,
              cantContV,
            );

            cortes.push({
              id: cortId++,
              nivel: "VR Contorno",
              nro_perfil: perfilContorno.nro_perfil?.toString() ?? "VR-C",
              descripcion_perfil: `${perfilContorno.descri ?? "Contorno VR"} — V P${pañoNum}`,
              angulo: ruleVR.angulo ?? "90°/90°",
              cantidad: cantContV,
              medida_mm: medContV,
              total_mm: medContV * cantContV,
              kg,
              precio_unitario,
              precio_total,
            });
            log.info(
              "vr",
              `Paño ${pañoNum} Contorno V: ${cantContV}×${medContV.toFixed(1)}mm`,
            );
          }
        }
      }

      // ── CRUCETAS (divisiones internas del VR) ─────────────────────────
      //
      // Crucetas H (horizontales) → longitud afectada por cruces V de ventana.
      // Crucetas V (verticales)   → longitud afectada en DOS pasos:
      //   Paso 1: cruces H de ventana (descentoCruceVentana)
      //   Paso 2: crucetas H del propio VR (ruleVR.descuento_de_si_mismo)
      //           → igual que PASO 3 de cruces de ventana
      if (
        ruleVR.id_perfil_cruce &&
        (cantCrucesH_VR > 0 || cantCrucesV_VR > 0)
      ) {
        const perfilCruceta = lkPerfil(ruleVR.id_perfil_cruce);
        if (!perfilCruceta) {
          log.warn(
            "vr",
            `Perfil cruceta id=${ruleVR.id_perfil_cruce} no encontrado (paño ${pañoNum})`,
          );
        } else {
          // ── Crucetas H ────────────────────────────────────────────────
          if (cantCrucesH_VR > 0) {
            const medCrucHBase = calcularMedida(
              ruleVR.formula_cruce_ancho ?? "ancho",
              ctxVR,
            );
            let medCrucH = medCrucHBase;
            let cantCrucH = cantCrucesH_VR * hojas;

            //canti_cruces_v > 0 significa que la abertura tiene cruces de tipologia V
            if (cant_cruces_v > 0 && descentoCruceVentana > 0) {
              medCrucH =
                (medCrucHBase - descentoCruceVentana * cant_cruces_v) /
                (cant_cruces_v + 1);
              cantCrucH = cantCrucesH_VR * (cant_cruces_v + 1);
            }
            if (medCrucH > 0 && cantCrucH > 0) {
              const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
                perfilCruceta,
                medCrucH,
                cantCrucH,
              );
              cortes.push({
                id: cortId++,
                nivel: "VR Cruceta",
                nro_perfil: perfilCruceta.nro_perfil?.toString() ?? "VR-X",
                descripcion_perfil: `${perfilCruceta.descri ?? "Cruceta VR"} — H P${pañoNum}`,
                angulo: ruleVR.angulo_cruce ?? "90°/90°",
                cantidad: cantCrucH,
                medida_mm: medCrucH,
                total_mm: medCrucH * cantCrucH,
                kg,
                precio_unitario,
                precio_total,
              });
              log.info(
                "vr",
                `Paño ${pañoNum} Cruceta H: ${cantCrucH}×${medCrucH.toFixed(1)}mm`,
              );
            }
          }

          // ── Crucetas V ────────────────────────────────────────────────
          if (cantCrucesV_VR > 0) {
            const medCrucVBase = calcularMedida(
              ruleVR.formula_cruce_alto ?? "alto",
              ctxVR,
            );

            // Paso 1: descuento por cruces HORIZONTALES de ventana
            // Cada cruce H de ventana divide el alto del VR en secciones
            let medCrucVTrasCruce = medCrucVBase;
            let seccionesDeVentana = 1;

            //cant_cruces_h > 0 significa que la abertura tiene cruces de tipologia H
            if (cant_cruces_h > 0 && descentoCruceVentana > 0) {
              medCrucVTrasCruce =
                (medCrucVBase - descentoCruceVentana * cant_cruces_h) /
                (cant_cruces_h + 1);
              seccionesDeVentana = cant_cruces_h + 1;
            }

            // Paso 2: descuento por crucetas H PROPIAS del VR (= lógica PASO 3)
            // Cada cruceta H del VR subdivide las V en trozos más cortos
            let medCrucVFinal = medCrucVTrasCruce;
            let trozosVPorSeccion = cantCrucesV_VR;

            if (cantCrucesH_VR > 0 && ruleVR.descuento_de_si_mismo) {
              medCrucVFinal =
                (medCrucVTrasCruce -
                  ruleVR.descuento_de_si_mismo * cantCrucesH_VR) /
                (cantCrucesH_VR + 1);
              trozosVPorSeccion = cantCrucesV_VR * (cantCrucesH_VR + 1);
            }

            const cantCrucVTotal = (cantCrucesH_VR + 1) * hojas;

            if (medCrucVFinal > 0 && cantCrucVTotal > 0) {
              const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
                perfilCruceta,
                medCrucVFinal,
                cantCrucVTotal,
              );
              cortes.push({
                id: cortId++,
                nivel: "VR Cruceta",
                nro_perfil: perfilCruceta.nro_perfil?.toString() ?? "VR-X",
                descripcion_perfil: `${perfilCruceta.descri ?? "Cruceta VR"} — V P${pañoNum}`,
                angulo: ruleVR.angulo_cruce ?? "90°/90°",
                cantidad: cantCrucVTotal,
                medida_mm: medCrucVFinal,
                total_mm: medCrucVFinal * cantCrucVTotal,
                kg,
                precio_unitario,
                precio_total,
              });
              log.info(
                "vr",
                `Paño ${pañoNum} Cruceta V: ${cantCrucVTotal} trozos × ${medCrucVFinal.toFixed(1)}mm` +
                  (seccionesDeVentana > 1
                    ? ` (${seccionesDeVentana} secciones ventana × ${trozosVPorSeccion / seccionesDeVentana} trozos VR)`
                    : ""),
              );
            } else if (medCrucVFinal <= 0) {
              log.warn(
                "vr",
                `Paño ${pañoNum} Cruceta V: medida resultante ${medCrucVFinal.toFixed(1)}mm ≤ 0, descartada`,
              );
            }
          }
        }
      }
    }
  }

  // ── PASO 5: Procesar Contravidrios ──────────────────────────────────────

  if (datos.rules_interior && datos.rules_perfiles_contravidrio.length > 0) {
    const idCv = detalle.contravidrios ?? detalle.interior;
    if (idCv) {
      try {
        const ruleCv = datos.find_despiece_contravidrio(Number(idCv));

        const cantHBase = calcularCantidad(
          ruleCv.formula_cantidad_contravidrios_ancho ?? "2",
          ctxBase,
        );
        const cantVBase = calcularCantidad(
          ruleCv.formula_cantidad_contravidrios_alto ?? "2",
          ctxBase,
        );
        const cantH = cantHBase + cant_cruces_h * 2;
        const cantV = cantVBase + cant_cruces_v * 2;
        const medH = calcularMedida(
          ruleCv.formula_contravidrio_ancho ?? "ancho",
          ctxBase,
        );
        const medV = calcularMedida(
          ruleCv.formula_contravidrio_alto ?? "alto",
          ctxBase,
        );

        const perfilCv = lkPerfil(ruleCv.id_perfil ?? 0);
        if (!perfilCv) {
          log.warn(
            "contravidrio",
            `Perfil CV id=${ruleCv.id_perfil} no encontrado`,
          );
        }

        if (perfilCv && medH > 0 && cantH > 0) {
          const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
            perfilCv,
            medH,
            cantH,
          );
          cortes.push({
            id: cortId++,
            nivel: "Contravid. Int.",
            nro_perfil: perfilCv.nro_perfil?.toString() ?? "CV",
            descripcion_perfil: perfilCv.descri ?? "Contravidrio",
            angulo: ruleCv.angulo ?? "90°/90°",
            cantidad: cantH,
            medida_mm: medH,
            total_mm: medH * cantH,
            kg,
            precio_unitario,
            precio_total,
          });
          log.info("contravidrio", `CV H: ${cantH}×${medH}mm`);
        }

        if (perfilCv && medV > 0 && cantV > 0) {
          const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
            perfilCv,
            medV,
            cantV,
          );
          cortes.push({
            id: cortId++,
            nivel: "Contravid. Int.",
            nro_perfil: perfilCv.nro_perfil?.toString() ?? "CV",
            descripcion_perfil: perfilCv.descri ?? "Contravidrio",
            angulo: ruleCv.angulo ?? "90°/90°",
            cantidad: cantV,
            medida_mm: medV,
            total_mm: medV * cantV,
            kg,
            precio_unitario,
            precio_total,
          });
          log.info("contravidrio", `CV V: ${cantV}×${medV}mm`);
        }
      } catch (error) {
        log.warn("contravidrio", `Omitido`, String(error));
      }
    }
  }

  // ── PASO 5.5: Procesar Accesorios ───────────────────────────────────────

  const accesorioMap = new Map(datos.catalog_accesorios.map((a) => [a.id, a]));

  function addAccesorio(
    nivel: NivelAccesorio,
    idAccesorio: number | null | undefined,
    formulaCantidad: string | null | undefined,
    opciones?: {
      aparece_presupuesto?: boolean;
      id_conjunto?: number | null;
      nombre_conjunto?: string | null;
    },
  ) {
    if (!idAccesorio) {
      log.warn(
        "accesorios",
        `Regla sin id_accesorio en nivel ${nivel}, omitida`,
      );
      return;
    }

    const cantidad = calcularCantidad(formulaCantidad ?? "0", ctxBase);
    if (cantidad <= 0) {
      log.warn(
        "accesorios",
        `Accesorio id=${idAccesorio} cantidad=0, omitido`,
        { nivel },
      );
      return;
    }

    const acc = accesorioMap.get(idAccesorio);
    if (!acc) {
      log.warn(
        "accesorios",
        `Accesorio id=${idAccesorio} no encontrado en catálogo`,
        { nivel },
      );
      return;
    }

    const precioUnitario = acc.precio ?? 0;
    accesariosCalc.push({
      id_accesorio: idAccesorio,
      cod_parte: acc.cod_parte ?? String(acc.id),
      descripcion: acc.descri ?? "Accesorio",
      cantidad,
      precio_unitario: precioUnitario,
      precio_total: precioUnitario * cantidad,
      nivel,
      aparece_presupuesto: opciones?.aparece_presupuesto ?? true,
      id_conjunto: opciones?.id_conjunto ?? null,
      nombre_conjunto: opciones?.nombre_conjunto ?? null,
    });

    log.info(
      "accesorios",
      `[${nivel}] ${acc.cod_parte} "${acc.descri}": ${cantidad} u × $${precioUnitario}`,
    );
  }

  // Marco
  if (detalle.marco && datos.rules_accesorios_marco.length > 0) {
    log.info(
      "accesorios",
      `Marco: ${datos.rules_accesorios_marco.length} reglas`,
    );
    for (const rule of datos.rules_accesorios_marco) {
      addAccesorio("Marco", rule.id_accesorio, rule.formula_cantidad);
    }
  }

  // Hoja
  if (detalle.hoja && datos.rules_accesorios_hoja.length > 0) {
    log.info(
      "accesorios",
      `Hoja: ${datos.rules_accesorios_hoja.length} reglas`,
    );
    for (const rule of datos.rules_accesorios_hoja) {
      addAccesorio("Hoja", rule.id_accesorio, rule.formula_cantidad, {
        aparece_presupuesto: rule.aparece_presupuesto,
        id_conjunto: rule.id_conjunto,
        nombre_conjunto: rule.nombre_conjunto,
      });
    }
  }

  // Interior
  if (detalle.interior && datos.rules_accesorios_interior.length > 0) {
    log.info(
      "accesorios",
      `Interior: ${datos.rules_accesorios_interior.length} reglas`,
    );
    for (const rule of datos.rules_accesorios_interior) {
      addAccesorio("Interior", rule.id_accesorio, rule.formula_cantidad, {
        id_conjunto: rule.id_conjunto,
        nombre_conjunto: rule.nombre_conjunto,
      });
    }
  }

  // Cruces
  if (
    detalle.cruce &&
    (cant_cruces_h > 0 || cant_cruces_v > 0) &&
    datos.rules_accesorios_cruces.length > 0
  ) {
    log.info(
      "accesorios",
      `Cruces: ${datos.rules_accesorios_cruces.length} reglas`,
    );
    for (const rule of datos.rules_accesorios_cruces) {
      addAccesorio("Cruces", rule.id_accesorio, rule.formula_cantidad);
    }
  }

  // VR
  if (
    datos.vr_activos &&
    datos.vr_activos.length > 0 &&
    datos.rules_accesorios_vr.length > 0
  ) {
    log.info("accesorios", `VR: ${datos.rules_accesorios_vr.length} reglas`);
    for (const rule of datos.rules_accesorios_vr) {
      addAccesorio("VR", rule.id_accesorio, rule.formula_cantidad);
    }
  }

  // ── PASO 6: Multiplicar por cantidad de tipologías ────────────────────────

  const mult = cantidad_tipologias ?? 1;
  if (mult !== 1) {
    cortes.forEach((c) => {
      c.cantidad *= mult;
      c.total_mm *= mult;
      c.kg *= mult;
      c.precio_total *= mult;
    });
    interiorsCalc.forEach((i) => {
      i.cantidad *= mult;
      i.area *= mult;
      i.precio *= mult;
    });
    accesariosCalc.forEach((a) => {
      a.cantidad *= mult;
      a.precio_total *= mult;
    });
    log.info("mult", `Multiplicador x${mult} aplicado`);
  }

  // ── PASO 7: Optimización de barras y resúmenes ───────────────────────────

  const mapPerfiles = new Map<
    string,
    {
      perfil: Perfil | undefined;
      lista: { medida_mm: number; cantidad: number; angulo: string }[];
    }
  >();

  for (const c of cortes) {
    if (!mapPerfiles.has(c.nro_perfil)) {
      mapPerfiles.set(c.nro_perfil, {
        perfil: datos.catalog_perfiles.find(
          (p) => p.nro_perfil?.toString() === c.nro_perfil,
        ),
        lista: [],
      });
    }
    mapPerfiles.get(c.nro_perfil)!.lista.push({
      medida_mm: c.medida_mm,
      cantidad: c.cantidad,
      angulo: c.angulo,
    });
  }

  const resumenes: ResumenPerfil[] = [];
  for (const [nro, { perfil, lista }] of mapPerfiles) {
    const longTira = perfil?.long_tira ?? 6000;
    const allCuts = lista.flatMap((c) =>
      Array<number>(c.cantidad).fill(c.medida_mm),
    );
    const opt = optimizarCortes(allCuts, longTira);
    const totalMm = allCuts.reduce((s, m) => s + m, 0);

    // Cámara europea: peso_metro es $/m directo. No pondera por precio_kg
    // ni aporta kg (no entra en costo_tratamiento). Mismo criterio que
    // calcularPrecioCorte(), reaplicado aquí porque el agrupado por barra
    // recalcula desde cero a partir de totalMm.
    const esCamaraEuropea = !!perfil?.es_camara_europea;
    const precioMetro = perfil?.peso_metro ?? 0;
    const precioKg = perfil?.precio_kg ?? 0;

    const kg = esCamaraEuropea
      ? 0
      : perfil
        ? (precioMetro / 1000) * totalMm
        : 0;
    const precioTotal = esCamaraEuropea
      ? (totalMm / 1000) * precioMetro
      : kg * precioKg;

    resumenes.push({
      nro_perfil: nro,
      descripcion_perfil: perfil?.descri ?? "Perfil de optimización",
      total_cortes: allCuts.length,
      total_mm: totalMm,
      tiras: opt.tirasNecesarias,
      desperdicio_mm: opt.desperdicioMm,
      eficiencia: opt.eficiencia,
      kg,
      precio_kg: esCamaraEuropea ? 0 : precioKg,
      precio_total: precioTotal,
      longitud_tira: longTira,
      cortes: lista,
      es_camara_europea: esCamaraEuropea,
      precio_metro: esCamaraEuropea ? precioMetro : undefined,
    });

    log.info(
      "optimizacion",
      `${nro}: ${opt.tirasNecesarias} tiras, eficiencia ${(opt.eficiencia * 100).toFixed(1)}%`,
    );
  }

  // ── PASO 8: Totales ──────────────────────────────────────────────────────

  const costoPerfiles = resumenes.reduce((s, r) => s + r.precio_total, 0);
  const costoInteriores = interiorsCalc.reduce((s, i) => s + i.precio, 0);
  const costoAccesorios = accesariosCalc.reduce(
    (s, a) => s + a.precio_total,
    0,
  );

  // Tratamiento / color: kg totales de perfiles × precio_por_kilo del tratamiento
  // El ID del tratamiento viene de tipologia.color (número)
  const totalKgPerfiles = cortes.reduce((s, c) => s + c.kg, 0);
  const idTratamiento = entrada.detalle.color ?? null;
  const tratamiento = idTratamiento
    ? datos.catalog_tratamientos.find((t) => t.id === idTratamiento)
    : undefined;
  const costoTratamiento = tratamiento
    ? totalKgPerfiles * (tratamiento.precio_por_kilo ?? 0)
    : 0;

  if (tratamiento) {
    log.info(
      "tratamiento",
      `${totalKgPerfiles.toFixed(3)} kg × $${tratamiento.precio_por_kilo}/kg` +
        ` (${tratamiento.descripcion ?? `id:${idTratamiento}`})` +
        ` = $${costoTratamiento.toFixed(2)}`,
    );
  } else if (idTratamiento) {
    log.warn(
      "tratamiento",
      `Tratamiento id=${idTratamiento} no encontrado en catálogo`,
    );
  }

  log.info(
    "totales",
    `PF: $${costoPerfiles.toFixed(2)} | VD: $${costoInteriores.toFixed(2)} | AC: $${costoAccesorios.toFixed(2)} | TR: $${costoTratamiento.toFixed(2)}`,
  );

  return {
    cortes,
    interiores: interiorsCalc,
    accesorios: accesariosCalc,
    resumenes,
    costo_perfiles: costoPerfiles,
    costo_interiores: costoInteriores,
    costo_accesorios: costoAccesorios,
    costo_tratamiento: costoTratamiento,
    costo_mo_taller: 0,
    costo_mo_colocacion: 0,
    costo_telas: 0,
    costo_total:
      costoPerfiles + costoInteriores + costoAccesorios + costoTratamiento,
    multiplicador: mult,
    contexto: ctxBase,
    logs: log.entries(),
  };
}
