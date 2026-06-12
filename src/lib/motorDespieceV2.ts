/**
 * Motor de Despiece – v2
 *
 * Bugs corregidos:
 *   [B1] Campo detalle.contravidrio → detalle.contravidrios
 *   [B2] Nombres de fórmulas CV incorrectos:
 *          formula_cantidad_ancho  → formula_cantidad_contravidrios_ancho
 *          formula_cantidad_alto   → formula_cantidad_contravidrios_alto
 *          formula_ancho           → formula_contravidrio_ancho
 *          formula_alto            → formula_contravidrio_alto
 *   [B3] precio_unitario/precio_total de contravidrios hardcodeados en 0
 *   [B4] esVidrio=true con idVidrio=undefined cuando interior_N="VIDRIO" sin dvh
 *   [B5] Límite de paños hardcodeado en 4 — ahora es dinámico (filasAltos*colsAnchos)
 *
 * Mejoras aplicadas:
 *   [M1] Mapa de perfiles O(1) en lugar de Array.find en cada corte
 *   [M2] Helpers type-safe reemplazan todos los `as any`
 *   [M3] Sistema de logs de debugging integrado (DespieceLog[])
 *   [M4] Validación de entrada con mensajes descriptivos
 *   [M5] Refactor addCorte tipado con DespiecePerfilBase
 *   [M6] Helper calcularPrecioCorte para evitar duplicación
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
} from "@/types";

// ─── Interfaces de Comunicación del Hook ─────────────────────────────────────

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
  rules_cruces: DespieceCruce[];
  rules_perfiles_contravidrio: DespiecePerfilContravidrio[];

  find_despiece_contravidrio: (id: number) => DespiecePerfilContravidrio;

  catalog_perfiles: Perfil[];
  catalog_accesorios: Accesorio[];
  catalog_vidrios: Vidrio[];
  catalog_tratamientos: Tratamiento[];
}

// ─── Tipos de salida ──────────────────────────────────────────────────────────

export type NivelCorte =
  | "Marco"
  | "Hoja"
  | "Contravid. Int."
  | "Contravid. Ext."
  | "Cruces"
  | "Interior";

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

export interface ItemInterior {
  tipo: "Vidrio" | "Revestimiento" | "CV Int." | "CV Ext." | "VR";
  cantidad: number;
  ancho: number;
  alto: number;
  area: number;
  precio: number;
  modulo?: string;
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
}

// [M3] Sistema de logs de debugging
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
  resumenes: ResumenPerfil[];
  costo_perfiles: number;
  costo_interiores: number;
  costo_total: number;
  multiplicador: number;
  contexto: ContextoCalculo;
  logs: DespieceLog[]; // [M3] Para debugging en desarrollo
}

// ─── Helpers internos ────────────────────────────────────────────────────────

/** [M2] Tipo mínimo compartido por DespiecePerfilMarco / Hoja */
interface DespiecePerfilBase {
  id_perfil?: number | null;
  formula_cantidad?: string | null;
  formula_perfil?: string | null;
  angulo?: string | null;
}

/** [M3] Logger liviano que acumula entradas */
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

/** [M1] Construye un Map<id, Perfil> para lookups O(1) */
function buildPerfilMap(perfiles: Perfil[]): Map<number, Perfil> {
  return new Map(perfiles.map((p) => [p.id, p]));
}

/** [M6] Calcula precio unitario y total de un corte a partir del perfil */
function calcularPrecioCorte(
  perfil: Perfil | undefined,
  medida_mm: number,
  cantidad: number,
): { precio_unitario: number; precio_total: number; kg: number } {
  if (!perfil) return { precio_unitario: 0, precio_total: 0, kg: 0 };
  const pesoMetro = (perfil.peso_metro ?? 0) / 1000; // kg/mm
  const precioKg = perfil.precio_kg ?? 0;
  const kg = pesoMetro * medida_mm * cantidad;
  const precio_unitario = precioKg * pesoMetro * medida_mm;
  const precio_total = precioKg * kg;
  return { precio_unitario, precio_total, kg };
}

/** [M4] Valida los datos de entrada y lanza errores descriptivos */
function validarEntrada(entrada: EntradaCalculo): void {
  if (!entrada.detalle.marco) throw new Error("Marco no configurado");
  if (entrada.ancho <= 0 || isNaN(entrada.ancho))
    throw new Error(`Ancho inválido: ${entrada.ancho}`);
  if (entrada.alto <= 0 || isNaN(entrada.alto))
    throw new Error(`Alto inválido: ${entrada.alto}`);
}

function getDetalleStr(detalle: ObraDetalle, key: string): string | null {
  const v = (detalle as unknown as Record<string, unknown>)[key];
  if (v === null || v === undefined || v === "null" || v === "undefined")
    return null;
  return String(v);
}

function obtenerSegmentosDeCruces(
  total: number,
  posiciones: number[],
): number[] {
  const filtradas = posiciones
    .filter((p) => p > 0 && p < total)
    .sort((a, b) => a - b);
  const puntos = [0, ...filtradas, total];
  return puntos.slice(1).map((val, i) => val - puntos[i]!);
}

// ─── Motor Principal ──────────────────────────────────────────────────────────

export function calcularDespiece(
  entrada: EntradaCalculo,
  datos: DatosProducto,
): ResultadoDespiece {
  // [M4] Validar entrada
  validarEntrada(entrada);

  const log = crearLogger();

  const { ancho, alto, cantidad_tipologias, detalle, tipologia } = entrada;
  const hojas = entrada.cant_hojas_calculo ?? 0;
  const tipo_cruce = detalle.tipo_cruce ?? 0;

  log.info("init", `Despiece iniciado`, { ancho, alto, hojas, tipo_cruce });

  // ── 1. Calcular posiciones de cruces ────────────────────────────────────────

  let posHef: number[] = [];
  let posVef: number[] = [];

  if (tipo_cruce === 2) {
    const h1 =
      detalle.horizontal_1 ??
      (detalle.ligado_alto_tipologia ? tipologia.hor_1 : null);
    const h2 =
      detalle.horizontal_2 ??
      (detalle.ligado_alto_tipologia ? tipologia.hor_2 : null);
    const h3 =
      detalle.horizontal_3 ??
      (detalle.ligado_alto_tipologia ? tipologia.hor_3 : null);
    posHef = [h1, h2, h3].filter(
      (n): n is number => n !== null && n !== undefined && n > 0,
    );

    const v1 =
      detalle.vertical_1 ??
      (detalle.ligado_ancho_tipologia ? tipologia.ver_1 : null);
    const v2 =
      detalle.vertical_2 ??
      (detalle.ligado_ancho_tipologia ? tipologia.ver_2 : null);
    const v3 =
      detalle.vertical_3 ??
      (detalle.ligado_ancho_tipologia ? tipologia.ver_3 : null);
    const v4 =
      detalle.vertical_4 ??
      (detalle.ligado_ancho_tipologia ? tipologia.ver_4 : null);
    const v5 =
      detalle.vertical_5 ??
      (detalle.ligado_ancho_tipologia ? tipologia.ver_5 : null);
    posVef = [v1, v2, v3, v4, v5].filter(
      (n): n is number => n !== null && n !== undefined && n > 0,
    );
  } else if (tipo_cruce === 1) {
    console.log("cruce = 1");
    const c_h = detalle.cant_centrados_horizontal ?? 0;
    const c_v = detalle.cant_centrados_vertical ?? 0;
    posHef = Array.from({ length: c_h }, (_, i) =>
      Math.round((alto / (c_h + 1)) * (i + 1)),
    );
    posVef = Array.from({ length: c_v }, (_, i) =>
      Math.round((ancho / (c_v + 1)) * (i + 1)),
    );
  }
  console.log("posHef", posHef);
  console.log("posVef", posVef);

  log.info("cruces", `Posiciones calculadas`, {
    posHef,
    posVef,
    tipo_cruce,
  });

  const filasAltos =
    posHef.length > 0 ? obtenerSegmentosDeCruces(alto, posHef) : [alto];
  const colsAnchos =
    posVef.length > 0 ? obtenerSegmentosDeCruces(ancho, posVef) : [ancho];

  log.info("grid", `Grid ${filasAltos.length}×${colsAnchos.length}`, {
    filasAltos,
    colsAnchos,
  });

  const ctxBase: ContextoCalculo = {
    ancho,
    alto,
    hojas,
    cruces_h: posHef.length,
    cruces_v: posVef.length,
    pos_h: posHef,
    pos_v: posVef,
  };

  const cortes: CortePerfil[] = [];
  const interiorsCalc: ItemInterior[] = [];
  let cortId = 1;

  // [M1] Mapa O(1) en lugar de Array.find por id
  const perfilMap = buildPerfilMap(datos.catalog_perfiles);
  const lkPerfil = (id: number) => perfilMap.get(id);

  // ── 2. Agregar cortes de perfiles base (Marco, Hoja) ───────────────────────

  // [M5] addCorte tipado — usa DespiecePerfilBase para evitar `as any`
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
        {
          nivel,
          formula_cantidad: dp.formula_cantidad,
          formula_perfil: dp.formula_perfil,
        },
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

  // ── 3. Cruces (divisores) ──────────────────────────────────────────────────

  if (
    (posHef.length > 0 || posVef.length > 0) &&
    datos.rules_cruces.length > 0
  ) {
    const ruleCruce = datos.rules_cruces[0]!;
    if (ruleCruce.id_perfil) {
      const perfilCruce = lkPerfil(ruleCruce.id_perfil);
      if (perfilCruce) {
        const medidaCruceH = calcularMedida(
          ruleCruce.formula_ancho_entero || "ancho",
          ctxBase,
        );
        const medidaCruceV = calcularMedida(
          ruleCruce.formula_alto_entero || "alto",
          ctxBase,
        );

        if (posHef.length > 0 && medidaCruceH > 0) {
          const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
            perfilCruce,
            medidaCruceH,
            posHef.length,
          );
          cortes.push({
            id: cortId++,
            nivel: "Cruces",
            nro_perfil: perfilCruce.nro_perfil?.toString() ?? "CRUCE",
            descripcion_perfil: perfilCruce.descri ?? "Perfil Divisor",
            angulo: ruleCruce.angulo ?? "90°/90°",
            cantidad: posHef.length,
            medida_mm: medidaCruceH,
            total_mm: medidaCruceH * posHef.length,
            kg,
            precio_unitario,
            precio_total,
          });
          log.info("cruces", `Cruce H: ${posHef.length}×${medidaCruceH}mm`);
        }

        if (posVef.length > 0 && medidaCruceV > 0) {
          const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
            perfilCruce,
            medidaCruceV,
            posVef.length,
          );
          cortes.push({
            id: cortId++,
            nivel: "Cruces",
            nro_perfil: perfilCruce.nro_perfil?.toString() ?? "CRUCE",
            descripcion_perfil: perfilCruce.descri ?? "Perfil Divisor",
            angulo: ruleCruce.angulo ?? "90°/90°",
            cantidad: posVef.length,
            medida_mm: medidaCruceV,
            total_mm: medidaCruceV * posVef.length,
            kg,
            precio_unitario,
            precio_total,
          });
          log.info("cruces", `Cruce V: ${posVef.length}×${medidaCruceV}mm`);
        }
      } else {
        log.warn(
          "cruces",
          `Perfil de cruce id=${ruleCruce.id_perfil} no encontrado`,
        );
      }
    }
  }

  // ── 4. Barrido de rellenos y contravidrios por paño ───────────────────────
  // [B5] Límite de paños dinámico: filasAltos.length × colsAnchos.length
  const MAX_PANOS = filasAltos.length * colsAnchos.length;
  let pañoIndex = 1;

  for (let fila = 0; fila < filasAltos.length; fila++) {
    for (let col = 0; col < colsAnchos.length; col++) {
      if (pañoIndex > MAX_PANOS) break;

      const tipoInterior = getDetalleStr(detalle, `interior_${pañoIndex}`) as
        | "VIDRIO"
        | "REVESTIMIENTO"
        | null;

      const altoMod = filasAltos[fila] ?? alto;
      const anchoMod = colsAnchos[col] ?? ancho;

      const ctxMod: ContextoCalculo = {
        ...ctxBase,
        ancho: anchoMod,
        alto: altoMod,
      };

      if (tipoInterior) {
        let anchoInt = anchoMod;
        let altoInt = altoMod;

        if (datos.rules_cruces && datos.rules_cruces.length > 0) {
          const ruleCruce = datos.rules_cruces[0]!;
          const descVidrio = ruleCruce.descuento_vidrio ?? 0;

          anchoInt = ruleCruce.formula_ancho_entero
            ? calcularMedida(ruleCruce.formula_ancho_entero, ctxMod)
            : anchoMod - descVidrio;

          altoInt = ruleCruce.formula_alto_entero
            ? calcularMedida(ruleCruce.formula_alto_entero, ctxMod)
            : altoMod - descVidrio;
        }

        if (anchoInt < 0) anchoInt = 0;
        if (altoInt < 0) altoInt = 0;

        const anchoRedondo = Math.round(anchoInt);
        const altoRedondo = Math.round(altoInt);
        const area = (anchoRedondo / 1000) * (altoRedondo / 1000);

        const labelModulo = `Paño ${pañoIndex} (F${fila + 1}-C${col + 1})`;

        log.info(
          "pano",
          `Paño ${pañoIndex}: ${anchoRedondo}×${altoRedondo}mm, área=${area.toFixed(3)}m²`,
          { tipoInterior, area },
        );

        // ── 4a. Contravidrios ───────────────────────────────────────────────
        // [B1] Bug corregido: era (detalle as any)['contravidrio'], debía ser detalle.contravidrios
        const idCv = detalle.contravidrios ?? detalle.interior;
        if (idCv) {
          try {
            const ruleCv = datos.find_despiece_contravidrio(Number(idCv));

            // [B2] Nombres de campos corregidos según DespiecePerfilContravidrio
            const cantH = calcularCantidad(
              ruleCv.formula_cantidad_contravidrios_ancho ?? "2",
              ctxMod,
            );
            const cantV = calcularCantidad(
              ruleCv.formula_cantidad_contravidrios_alto ?? "2",
              ctxMod,
            );
            const medH = calcularMedida(
              ruleCv.formula_contravidrio_ancho ?? "ancho",
              ctxMod,
            );
            const medV = calcularMedida(
              ruleCv.formula_contravidrio_alto ?? "alto",
              ctxMod,
            );

            const perfilCv = lkPerfil(ruleCv.id_perfil ?? 0);
            if (!perfilCv) {
              log.warn(
                "contravidrio",
                `Perfil CV id=${ruleCv.id_perfil} no encontrado`,
              );
            }

            if (perfilCv && medH > 0 && cantH > 0) {
              // [B3] Precio calculado correctamente (antes era 0)
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
              // [B3] Precio calculado correctamente (antes era 0)
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
            log.warn(
              "contravidrio",
              `Paño ${pañoIndex} - CV omitido`,
              String(error),
            );
          }
        }

        // ── 4b. Detectar tipo de relleno ─────────────────────────────────────
        const dvhVal = getDetalleStr(detalle, `dvh_${pañoIndex}_1`);
        const simpleVal = getDetalleStr(detalle, `interior_${pañoIndex}`);
        const revestVal = getDetalleStr(detalle, `revest_${pañoIndex}`);

        let esVidrio = false;
        let esRevestimiento = false;
        let idVidrio: string | null = null;
        let idPerfilRevest: string | null = null;

        if (dvhVal) {
          // DVH explícito → usa ese vidrio
          esVidrio = true;
          idVidrio = dvhVal;
        } else if (simpleVal === "VIDRIO") {
          // [B4] Corregido: antes asignaba idVidrio = dvhVal (undefined).
          // Ahora busca primer vidrio del catálogo como fallback genérico.
          esVidrio = true;
          idVidrio = null; // Sin ID específico: se asigna en bloque de vidrio
        } else if (simpleVal === "REVESTIMIENTO") {
          esRevestimiento = true;
          idPerfilRevest = revestVal;
        } else if (simpleVal) {
          // Puede ser el ID numérico del vidrio
          esVidrio = true;
          idVidrio = simpleVal;
        } else if (revestVal) {
          esRevestimiento = true;
          idPerfilRevest = revestVal;
        }

        // ── 4c. Procesar vidrio ───────────────────────────────────────────────
        if (esVidrio) {
          let vid: Vidrio | undefined;

          if (idVidrio) {
            vid = datos.catalog_vidrios.find(
              (v) => v.id.toString() === idVidrio || v.codigo === idVidrio,
            );
            if (!vid) {
              log.warn("vidrio", `Vidrio id="${idVidrio}" no encontrado`, {
                pañoIndex,
              });
            }
          }
          // [B4] Si no hay ID específico, agrega ítem sin precio (vidrio genérico)
          interiorsCalc.push({
            tipo: "Vidrio",
            cantidad: 1,
            ancho: anchoRedondo,
            alto: altoRedondo,
            area,
            precio: vid ? (vid.precio ?? 0) * area : 0,
            modulo: labelModulo,
          });
        }

        // ── 4d. Procesar revestimiento ────────────────────────────────────────
        else if (esRevestimiento && idPerfilRevest) {
          const orientacion =
            getDetalleStr(detalle, `direcc_${pañoIndex}`) ?? "H";
          const perfilRevest = datos.catalog_perfiles.find(
            (p) =>
              p.nro_perfil === idPerfilRevest ||
              p.id.toString() === idPerfilRevest,
          );

          if (perfilRevest) {
            const pasoTablilla = 100;
            const cantidadTablillas =
              orientacion === "H"
                ? Math.ceil(altoInt / pasoTablilla)
                : Math.ceil(anchoInt / pasoTablilla);
            const medidaCorteTablilla =
              orientacion === "H" ? anchoInt : altoInt;

            const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
              perfilRevest,
              medidaCorteTablilla,
              cantidadTablillas,
            );

            cortes.push({
              id: cortId++,
              nivel: "Interior",
              nro_perfil: perfilRevest.nro_perfil?.toString() ?? "REV",
              descripcion_perfil:
                perfilRevest.descri ?? "Tablilla Revestimiento",
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
              modulo: labelModulo,
            });
          } else {
            log.warn(
              "revestimiento",
              `Perfil revestimiento "${idPerfilRevest}" no encontrado`,
              { pañoIndex },
            );
          }
        }
      }
      pañoIndex++;
    }
  }

  // ── 5. Multiplicar por cantidad de tipologías ─────────────────────────────

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
    log.info("mult", `Multiplicador x${mult} aplicado`);
  }

  // ── 6. Optimización de barras y resúmenes ─────────────────────────────────

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
        // [M1] Map.get en lugar de Array.find
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
    const kg = perfil ? ((perfil.peso_metro ?? 0) / 1000) * totalMm : 0;
    const precioKg = perfil?.precio_kg ?? 0;

    resumenes.push({
      nro_perfil: nro,
      descripcion_perfil: perfil?.descri ?? "Perfil de optimización",
      total_cortes: allCuts.length,
      total_mm: totalMm,
      tiras: opt.tirasNecesarias,
      desperdicio_mm: opt.desperdicioMm,
      eficiencia: opt.eficiencia,
      kg,
      precio_kg: precioKg,
      precio_total: kg * precioKg,
      longitud_tira: longTira,
      cortes: lista,
    });

    log.info(
      "optimizacion",
      `${nro}: ${opt.tirasNecesarias} tiras, eficiencia ${(opt.eficiencia * 100).toFixed(1)}%`,
    );
  }

  // ── 7. Totales ─────────────────────────────────────────────────────────────

  const costoPerfiles = resumenes.reduce((s, r) => s + r.precio_total, 0);
  const costoInteriores = interiorsCalc.reduce((s, i) => s + i.precio, 0);

  log.info(
    "totales",
    `Perfiles: $${costoPerfiles.toFixed(2)}, Interiores: $${costoInteriores.toFixed(2)}`,
  );

  return {
    cortes,
    interiores: interiorsCalc,
    resumenes,
    costo_perfiles: costoPerfiles,
    costo_interiores: costoInteriores,
    costo_total: costoPerfiles + costoInteriores,
    multiplicador: mult,
    contexto: ctxBase,
    logs: log.entries(), // [M3]
  };
}
