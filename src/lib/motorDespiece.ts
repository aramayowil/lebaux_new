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

// ─── Interfaces de Comunicación del Hook ──────────────────────────────────────

export interface EntradaCalculo {
  ancho: number;
  alto: number;
  cantidad_tipologias: number;
  detalle: ObraDetalle;
  tipologia: ObraTipologia;
  cant_hojas_calculo: number;
}

// 🌟 Interfaz Estricta implementada
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

export interface ResultadoDespiece {
  cortes: CortePerfil[];
  interiores: ItemInterior[];
  resumenes: ResumenPerfil[];
  costo_perfiles: number;
  costo_interiores: number;
  costo_total: number;
  multiplicador: number;
  contexto: ContextoCalculo;
}

// Helper para fraccionar el vano total en base a posiciones absolutas de cruces
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

// ─── Motor de Despiece Principal ──────────────────────────────────────────────

export function calcularDespiece(
  entrada: EntradaCalculo,
  datos: DatosProducto,
): ResultadoDespiece {
  const { ancho, alto, cantidad_tipologias, detalle, tipologia } = entrada;

  const hojas = entrada.cant_hojas_calculo ?? 0;
  const tipo_cruce = detalle.tipo_cruce ?? 0;

  // 1. Extraer posiciones de cruces según el tipo (Centrados o Variables)
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
    const c_h = detalle.cant_centrados_horizontal ?? 0;
    const c_v = detalle.cant_centrados_vertical ?? 0;
    posHef = Array.from({ length: c_h }, (_, i) =>
      Math.round((alto / (c_h + 1)) * (i + 1)),
    );
    posVef = Array.from({ length: c_v }, (_, i) =>
      Math.round((ancho / (c_v + 1)) * (i + 1)),
    );
  }

  const filasAltos =
    posHef.length > 0 ? obtenerSegmentosDeCruces(alto, posHef) : [alto];
  const colsAnchos =
    posVef.length > 0 ? obtenerSegmentosDeCruces(ancho, posVef) : [ancho];

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

  const lkPerfil = (id: number) =>
    datos.catalog_perfiles.find((p) => p.id === id);

  function addCorte(
    nivel: NivelCorte,
    dp: DespiecePerfil,
    ctx: ContextoCalculo,
  ) {
    const cant = calcularCantidad((dp as any).formula_cantidad ?? "0", ctx);
    const medida = calcularMedida((dp as any).formula_perfil ?? "0", ctx);
    if (cant <= 0 || medida <= 0) return;

    const perfil = lkPerfil((dp as any).id_perfil ?? 0);
    const kg = perfil ? ((perfil.peso_metro ?? 0) / 1000) * medida * cant : 0;
    const precio = perfil ? (perfil.precio_kg ?? 0) * kg : 0;

    cortes.push({
      id: cortId++,
      nivel,
      nro_perfil: perfil?.nro_perfil?.toString() ?? "S/N",
      descripcion_perfil: perfil?.descri ?? "Perfil Desconocido",
      angulo: (dp as any).angulo ?? "90°/90°",
      cantidad: cant,
      medida_mm: medida,
      total_mm: medida * cant,
      kg,
      precio_unitario: perfil
        ? (perfil.precio_kg ?? 0) * ((perfil.peso_metro ?? 0) / 1000) * medida
        : 0,
      precio_total: precio,
    });
  }

  // ── 2. Procesar Estructuras Perimetrales
  if (detalle.marco)
    datos.rules_perfiles_marco.forEach((dp) => addCorte("Marco", dp, ctxBase));
  if (detalle.hoja)
    datos.rules_perfiles_hoja.forEach((dp) => addCorte("Hoja", dp, ctxBase));

  // ── 3. Procesar Cruces Físicos
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

        if (posHef.length > 0) {
          cortes.push({
            id: cortId++,
            nivel: "Cruces",
            nro_perfil: perfilCruce.nro_perfil?.toString() ?? "CRUCE",
            descripcion_perfil: perfilCruce.descri ?? "Perfil Divisor",
            angulo: ruleCruce.angulo ?? "90°/90°",
            cantidad: posHef.length,
            medida_mm: medidaCruceH,
            total_mm: medidaCruceH * posHef.length,
            kg:
              ((perfilCruce.peso_metro ?? 0) / 1000) *
              medidaCruceH *
              posHef.length,
            precio_unitario:
              (perfilCruce.precio_kg ?? 0) *
              ((perfilCruce.peso_metro ?? 0) / 1000) *
              medidaCruceH,
            precio_total:
              (perfilCruce.precio_kg ?? 0) *
              (((perfilCruce.peso_metro ?? 0) / 1000) *
                medidaCruceH *
                posHef.length),
          });
        }
        if (posVef.length > 0) {
          cortes.push({
            id: cortId++,
            nivel: "Cruces",
            nro_perfil: perfilCruce.nro_perfil?.toString() ?? "CRUCE",
            descripcion_perfil: perfilCruce.descri ?? "Perfil Divisor",
            angulo: ruleCruce.angulo ?? "90°/90°",
            cantidad: posVef.length,
            medida_mm: medidaCruceV,
            total_mm: medidaCruceV * posVef.length,
            kg:
              ((perfilCruce.peso_metro ?? 0) / 1000) *
              medidaCruceV *
              posVef.length,
            precio_unitario:
              (perfilCruce.precio_kg ?? 0) *
              ((perfilCruce.peso_metro ?? 0) / 1000) *
              medidaCruceV,
            precio_total:
              (perfilCruce.precio_kg ?? 0) *
              (((perfilCruce.peso_metro ?? 0) / 1000) *
                medidaCruceV *
                posVef.length),
          });
        }
      }
    }
  }

  // ── 4. Barrido de Rellenos y Contravidrios
  let pañoIndex = 1;

  for (let fila = 0; fila < filasAltos.length; fila++) {
    for (let col = 0; col < colsAnchos.length; col++) {
      if (pañoIndex > 4) break;

      const tipoInterior = (detalle as any)[`interior_${pañoIndex}`] as
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

        // Descuentos de Vidrio según Cruces
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

        const area = (anchoInt / 1000) * (altoInt / 1000);
        const labelModulo = `Paño ${pañoIndex} (F${fila + 1}-C${col + 1})`;

        // Procesamiento Estricto de Contravidrios
        const idCv = (detalle as any)[`contravidrio`] ?? detalle.interior;
        if (idCv) {
          try {
            // 🌟 Al ser estricto, no validamos si es null, confiamos en la interfaz. Si falla, el catch lo atrapa.
            const ruleCv = datos.find_despiece_contravidrio(Number(idCv));

            const cantH = calcularCantidad(
              (ruleCv as any).formula_cantidad_ancho ?? "2",
              ctxMod,
            );
            const cantV = calcularCantidad(
              (ruleCv as any).formula_cantidad_alto ?? "2",
              ctxMod,
            );
            const medH = calcularMedida(
              (ruleCv as any).formula_ancho ?? "ancho",
              ctxMod,
            );
            const medV = calcularMedida(
              (ruleCv as any).formula_alto ?? "alto",
              ctxMod,
            );

            const perfilCv = lkPerfil(ruleCv.id_perfil ?? 0);
            if (perfilCv) {
              if (medH > 0 && cantH > 0) {
                cortes.push({
                  id: cortId++,
                  nivel: "Contravid. Int.",
                  nro_perfil: perfilCv.nro_perfil?.toString() ?? "CV",
                  descripcion_perfil: perfilCv.descri ?? "Contravidrio",
                  angulo: ruleCv.angulo ?? "90°/90°",
                  cantidad: cantH,
                  medida_mm: medH,
                  total_mm: medH * cantH,
                  kg: ((perfilCv.peso_metro ?? 0) / 1000) * medH * cantH,
                  precio_unitario: 0,
                  precio_total: 0,
                });
              }
              if (medV > 0 && cantV > 0) {
                cortes.push({
                  id: cortId++,
                  nivel: "Contravid. Int.",
                  nro_perfil: perfilCv.nro_perfil?.toString() ?? "CV",
                  descripcion_perfil: perfilCv.descri ?? "Contravidrio",
                  angulo: ruleCv.angulo ?? "90°/90°",
                  cantidad: cantV,
                  medida_mm: medV,
                  total_mm: medV * cantV,
                  kg: ((perfilCv.peso_metro ?? 0) / 1000) * medV * cantV,
                  precio_unitario: 0,
                  precio_total: 0,
                });
              }
            }
          } catch (error) {
            console.warn(
              `[Despiece] Paño ${pañoIndex} - Contravidrio omitido:`,
              error,
            );
          }
        }

        if (tipoInterior === "VIDRIO") {
          const idVidrio = (detalle as any)[`dvh_${pañoIndex}_1`]?.toString();
          if (idVidrio) {
            const vid = datos.catalog_vidrios.find(
              (v) => v.codigo === idVidrio,
            );
            if (vid) {
              interiorsCalc.push({
                tipo: "Vidrio",
                cantidad: 1,
                ancho: anchoInt,
                alto: altoInt,
                area,
                precio: (vid.precio ?? 0) * area,
                modulo: labelModulo,
              });
            }
          }
        } else if (tipoInterior === "REVESTIMIENTO") {
          const idPerfilRevest = (detalle as any)[`revest_${pañoIndex}`];
          const orientacion = (detalle as any)[`direcc_${pañoIndex}`] ?? "H";

          if (idPerfilRevest) {
            const perfilRevest = lkPerfil(Number(idPerfilRevest));
            if (perfilRevest) {
              const pasoTablilla = 100;
              const cantidadTablillas =
                orientacion === "H"
                  ? Math.ceil(altoInt / pasoTablilla)
                  : Math.ceil(anchoInt / pasoTablilla);
              const medidaCorteTablilla =
                orientacion === "H" ? anchoInt : altoInt;
              const kgCorte =
                ((perfilRevest.peso_metro ?? 0) / 1000) *
                medidaCorteTablilla *
                cantidadTablillas;

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
                kg: kgCorte,
                precio_unitario:
                  (perfilRevest.precio_kg ?? 0) *
                  ((perfilRevest.peso_metro ?? 0) / 1000) *
                  medidaCorteTablilla,
                precio_total: (perfilRevest.precio_kg ?? 0) * kgCorte,
              });

              interiorsCalc.push({
                tipo: "Revestimiento",
                cantidad: cantidadTablillas,
                ancho: medidaCorteTablilla,
                alto: pasoTablilla,
                area: area,
                precio: (perfilRevest.precio_kg ?? 0) * kgCorte,
                modulo: labelModulo,
              });
            }
          }
        }
      }
      pañoIndex++;
    }
  }

  // ── 5. Afectar cantidades y 6. Optimización ──────────────────────────────────
  const mult = cantidad_tipologias ?? 1;
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

  const mapPerfiles = new Map<
    string,
    { perfil: Perfil | undefined; lista: any[] }
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
    mapPerfiles
      .get(c.nro_perfil)!
      .lista.push({
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
  }

  const costoPerfiles = resumenes.reduce((s, r) => s + r.precio_total, 0);
  const costoInteriores = interiorsCalc.reduce((s, i) => s + i.precio, 0);

  return {
    cortes,
    interiores: interiorsCalc,
    resumenes,
    costo_perfiles: costoPerfiles,
    costo_interiores: costoInteriores,
    costo_total: costoPerfiles + costoInteriores,
    multiplicador: mult,
    contexto: ctxBase,
  };
}
