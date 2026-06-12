/**
 * Motor de Despiece – v3
 *
 * Cambios vs v2:
 *   [NEW] DespieceInterior procesado: define cantidad de paños + medidas base
 *   [NEW] Lógica de cruces completa: descuentos de vidrio + descuento_de_si_mismo
 *   [NEW] Cruces CENTRADOS: distribuyen equitativamente
 *   [NEW] Cruces VARIABLES: usan posiciones explícitas + descuentos perimetrales
 *   [NEW] dpMosquitero: en pausa (procesado en v4)
 *   [IMPROVED] DatosProducto incluye rules_interior
 *   [IMPROVED] Validación temprana de interior
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
  const { ancho, alto, cantidad_tipologias, detalle, tipologia } = entrada;
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

          // Aplicar descuento_de_si_mismo si hay cruces verticales
          let medidaCruceFinal = medidaCruceH;
          if (cant_cruces_v > 0 && ruleCruce.descuento_de_si_mismo) {
            medidaCruceFinal =
              medidaCruceH - ruleCruce.descuento_de_si_mismo * cant_cruces_v;
          }

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

          // Para cruces verticales: si hay horizontales, aplicar descuento_de_si_mismo
          let medidaCruceFinal = medidaCruceV;
          if (cant_cruces_h > 0 && ruleCruce.descuento_de_si_mismo) {
            medidaCruceFinal =
              medidaCruceV - ruleCruce.descuento_de_si_mismo * cant_cruces_h;
          }

          if (medidaCruceFinal > 0) {
            const { kg, precio_unitario, precio_total } = calcularPrecioCorte(
              perfilCruce,
              medidaCruceFinal,
              cant_cruces_v,
            );
            cortes.push({
              id: cortId++,
              nivel: "Cruces",
              nro_perfil: perfilCruce.nro_perfil?.toString() ?? "CRUCE",
              descripcion_perfil: perfilCruce.descri ?? "Perfil Divisor V",
              angulo: ruleCruce.angulo ?? "90°/90°",
              cantidad: cant_cruces_v,
              medida_mm: medidaCruceFinal,
              total_mm: medidaCruceFinal * cant_cruces_v,
              kg,
              precio_unitario,
              precio_total,
            });
            log.info(
              "cruces",
              `Cruce V: ${cant_cruces_v}×${medidaCruceFinal}mm`,
            );
          }
        }
      }
    }
  }

  // ── PASO 4: Procesar Interior (vidrios/revestimiento) ────────────────────

  if (datos.rules_interior) {
    const ruleInterior = datos.rules_interior;

    // Calcular cantidad de paños y sus medidas base
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

    // APLICAR DESCUENTOS DE CRUCES
    // descuento_vidrio se distribuye entre los paños creados
    let anchoVidrio = anchoPanoBase;
    let altoVidrio = altoPanoBase;

    if (datos.rules_cruces && datos.rules_cruces.descuento_vidrio) {
      const desc = datos.rules_cruces.descuento_vidrio;

      if (cant_cruces_h > 0) {
        altoVidrio =
          altoPanoBase - (desc * cant_cruces_h) / (cant_cruces_h + 1);
      }
      if (cant_cruces_v > 0) {
        anchoVidrio =
          anchoPanoBase - (desc * cant_cruces_v) / (cant_cruces_v + 1);
      }

      log.info(
        "interior",
        `Descuentos aplicados: ${anchoVidrio}×${altoVidrio}mm`,
      );
    }

    // Redondear para manufactura
    const anchoRedondo = Math.round(anchoVidrio);
    const altoRedondo = Math.round(altoVidrio);
    const area = (anchoRedondo / 1000) * (altoRedondo / 1000);

    // Obtener tipo de interior (vidrio o revestimiento)
    const tipoInterior = getDetalleStr(detalle, "interior_1");
    const dvhVal = getDetalleStr(detalle, "dvh_1_1");
    const revestVal = getDetalleStr(detalle, "revest_1");

    let esVidrio = false;
    let esRevestimiento = false;
    let idVidrio: string | null = null;
    let idPerfilRevest: string | null = null;

    if (dvhVal) {
      esVidrio = true;
      idVidrio = dvhVal;
    } else if (tipoInterior === "VIDRIO") {
      esVidrio = true;
      idVidrio = null;
    } else if (tipoInterior === "REVESTIMIENTO") {
      esRevestimiento = true;
      idPerfilRevest = revestVal;
    } else if (tipoInterior && tipoInterior !== "null") {
      esVidrio = true;
      idVidrio = tipoInterior;
    }

    // Procesar vidrio
    if (esVidrio) {
      let vid: Vidrio | undefined;
      if (idVidrio) {
        vid = datos.catalog_vidrios.find(
          (v) => v.id.toString() === idVidrio || v.codigo === idVidrio,
        );
        if (!vid) {
          log.warn("vidrio", `Vidrio id="${idVidrio}" no encontrado`);
        }
      }

      for (let i = 0; i < cantPanos; i++) {
        interiorsCalc.push({
          tipo: "Vidrio",
          cantidad: 1,
          ancho: anchoRedondo,
          alto: altoRedondo,
          area,
          precio: vid ? (vid.precio ?? 0) * area : 0,
          modulo: `Paño ${i + 1}`,
        });
      }
      log.info(
        "interior",
        `${cantPanos} vidrios de ${anchoRedondo}×${altoRedondo}mm`,
      );
    }

    // Procesar revestimiento
    else if (esRevestimiento && idPerfilRevest) {
      const perfilRevest = datos.catalog_perfiles.find(
        (p) =>
          p.nro_perfil === idPerfilRevest || p.id.toString() === idPerfilRevest,
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
          modulo: `Paño 1`,
        });

        log.info(
          "interior",
          `${cantidadTablillas} tablillas de ${medidaCorteTablilla}mm`,
        );
      }
    }
  }

  // ── PASO 5: Procesar Contravidrios ──────────────────────────────────────

  if (datos.rules_interior && datos.rules_perfiles_contravidrio.length > 0) {
    const idCv = detalle.contravidrios ?? detalle.interior;
    if (idCv) {
      try {
        const ruleCv = datos.find_despiece_contravidrio(Number(idCv));

        const cantH = calcularCantidad(
          ruleCv.formula_cantidad_contravidrios_ancho ?? "2",
          ctxBase,
        );
        const cantV = calcularCantidad(
          ruleCv.formula_cantidad_contravidrios_alto ?? "2",
          ctxBase,
        );
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

  // ── PASO 8: Totales ──────────────────────────────────────────────────────

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
    logs: log.entries(),
  };
}
