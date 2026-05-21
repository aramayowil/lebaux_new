/**
 * Motor de Despiece — Open2D2
 *
 * Soporta interiores por módulo: cuando hay cruces (centrados o variables),
 * cada paño (fila × col) puede tener su propio interior, contravidrio y vidrio.
 * Si un paño no tiene interior explícito, usa el interior global del config.
 */

import {
  calcularCantidad,
  calcularMedida,
  optimizarCortes,
  type ContextoCalculo,
} from './calculoDespiece'
import type {
  Marco, Hoja, Interior, Contravidrio, ContravidrioExterior,
  Cruces, VidRepartido, DespiecePerfil, DespieceAccesorio,
  Perfil, Accesorio, Vidrio, Tratamiento,
  DespieceInterior,
  DespiecePerfilContravidrio,
} from '@/types'
import type { ModuloConfig } from '@/store/obrasStore'

// ─── Entrada ──────────────────────────────────────────────────────────────────

export interface EntradaCalculo {
  ancho:              number
  alto:               number
  cantidad_tipologias: number
  // Config global
  id_marco?:           number | null
  id_hoja?:            number | null
  id_interior?:        number | null        // interior por defecto (todos los paños)
  id_contravidrio?:    number | null
  id_contravidrio_ext?: number | null
  id_tratamiento?:     number
  id_vidrio?:          string | null
  // Cruces
  tipo_cruce:          0 | 1 | 2
  cruces_h:            number
  cruces_v:            number
  pos_h:               number[]
  pos_v:               number[]
  // Interiores por módulo (piso si hay cruces)
  modulosConfig:      ModuloConfig[]
}

export interface DatosProducto {
  marco?:            Marco
  hoja?:             Hoja
  // Catálogos completos (para buscar por id)
  all_interiores:     Interior[]
  all_contravidrios:  Contravidrio[]
  all_contravidrios_ext: ContravidrioExterior[]
  all_cruces:         Cruces[]
  all_vid_repartidos:  VidRepartido[]

  despiece_perfiles_marco:           DespiecePerfil[]
  despiece_perfiles_hoja:            DespiecePerfil[]
  get_despiece_perfil:  (nivel: string, idParent: number) => DespiecePerfil[]
  get_despiece_accesorio: (nivel: string, idParent: number) => DespieceAccesorio[]
  get_despiece_interior:  (idParent: number) => DespieceInterior
  get_despiece_contravidrio:  (idParent: number) => DespiecePerfilContravidrio
  

  catalog_perfiles:     Perfil[]
  catalog_accesorios:   Accesorio[]
  catalog_vidrios:      Vidrio[]
  catalog_tratamientos: Tratamiento[]
}

// ─── Salida ───────────────────────────────────────────────────────────────────

export type NivelCorte = 'Marco' | 'Hoja' | 'Contravid. Int.' | 'Contravid. Ext.' | 'Cruces' | 'Interior'

export interface CortePerfil {
  id:                number
  nivel:             NivelCorte
  nro_perfil:        string
  descripcion_perfil: string
  angulo:            string
  cantidad:          number
  medida_mm:         number
  total_mm:          number
  kg:                number
  precio_unitario:    number
  precio_total:       number
}

export interface ItemAccesorio {
  id:          number
  nivel:       NivelCorte
  cod_parte:    number
  descripcion: string
  cantidad:    number
  unidad:      0 | 1 
  precio_unit:  number
  precio_total: number
}

export interface ItemInterior {
  tipo:     'Vidrio' | 'CV Int.' | 'CV Ext.' | 'VR'
  cantidad: number
  ancho:    number
  alto:     number
  area:     number
  precio:   number
  modulo?:  string   // descripción del paño (ej: "F1-C2")
}

export interface ResumenPerfil {
  nro_perfil:        string
  descripcion_perfil: string
  total_cortes:      number
  total_mm:          number
  tiras:             number
  desperdicio_mm:    number
  eficiencia:        number
  kg:                number
  precio_kg:         number
  precio_total:      number
  longitud_tira:     number
  cortes: { medida_mm: number; cantidad: number; angulo: string }[]
}

export interface ResultadoDespiece {
  cortes:      CortePerfil[]
  accesorios:  ItemAccesorio[]
  interiores:  ItemInterior[]
  resumenes:   ResumenPerfil[]
  costo_perfiles:   number
  costo_accesorios: number
  costo_interiores: number
  costo_total:      number
  multiplicador:   number
  contexto:        ContextoCalculo
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function segmentos(total: number, pos: number[]): number[] {
  const sorted = [...pos].sort((a, b) => a - b)
  const pts = [0, ...sorted, total]
  return pts.slice(1).map((v, i) => v - pts[i]!)
}

// ─── Función principal ────────────────────────────────────────────────────────

export function calcularDespiece(
  entrada: EntradaCalculo,
  datos:   DatosProducto,
): ResultadoDespiece {
  const { ancho, alto, cantidad_tipologias, tipo_cruce, cruces_h, cruces_v, pos_h, pos_v } = entrada
  const hojas = datos.hoja?.cantidad ?? 1

  // Posiciones efectivas
  const posHef = tipo_cruce === 2 ? [...pos_h].sort((a, b) => a - b)
    : tipo_cruce === 1 ? Array.from({ length: cruces_h }, (_, i) => Math.round((alto  / (cruces_h + 1)) * (i + 1)))
    : []
  const posVef = tipo_cruce === 2 ? [...pos_v].sort((a, b) => a - b)
    : tipo_cruce === 1 ? Array.from({ length: cruces_v }, (_, i) => Math.round((ancho / (cruces_v + 1)) * (i + 1)))
    : []

  const filasAltos = posHef.length > 0 ? segmentos(alto, posHef) : [alto]
  const colsAnchos = posVef.length > 0 ? segmentos(ancho, posVef) : [ancho]
  const nFilas = filasAltos.length
  const nCols  = colsAnchos.length

  const ctxBase: ContextoCalculo = {
    ancho, alto, hojas,
    cruces_h: posHef.length,
    cruces_v: posVef.length,
    pos_h: posHef,
    pos_v: posVef,
  }

  const cortes:     CortePerfil[]   = []
  const accesorios: ItemAccesorio[] = []
  const interiores: ItemInterior[]  = []
  let cortId = 1, accId = 1

  const lkPerfil = (id: number) => datos.catalog_perfiles.find(p => p.id === id)
  const lkAcc    = (id: number) => datos.catalog_accesorios.find(a => a.id === id)

  function addCorte(nivel: NivelCorte, dp: DespiecePerfil, ctx: ContextoCalculo, mult = 1) {
    const cant   = calcularCantidad(dp.formula_cantidad, ctx) * mult
    const medida = calcularMedida(dp.formula_perfil, ctx)
    if (cant <= 0 || medida <= 0) return
    const perfil = lkPerfil(dp.id_perfil)
    const kg     = perfil ? (perfil.peso_metro / 1000) * medida * cant : 0
    const precio = perfil ? perfil.precio_kg * kg : 0
    cortes.push({ id: cortId++, nivel, nro_perfil: perfil?.nro_perfil.toString() ?? 'desconocido', descripcion_perfil: perfil?.descri ?? 'desconocido',
      angulo: dp.angulo, cantidad: cant, medida_mm: medida, total_mm: medida * cant, kg,
      precio_unitario: perfil ? perfil.precio_kg * (perfil.peso_metro / 1000) * medida : 0, precio_total: precio })
  }

  function addAcc(nivel: NivelCorte, da: DespieceAccesorio, ctx: ContextoCalculo, mult = 1) {
    const cant = calcularCantidad(da.formula_cantidad, ctx) * mult
    if (cant <= 0) return
    const acc = lkAcc(da.id_accesorio) 
    const pu  = acc?.precio ?? 0
    accesorios.push({ id: accId++, nivel, cod_parte: da.id_accesorio, descripcion: acc?.descri ?? 'desconocido',
      cantidad: cant, unidad: acc?.unidad ?? 0, precio_unit: pu, precio_total: pu * cant })
  }

  // ── Marco ──────────────────────────────────────────────────────────────────
  if (datos.marco) {
    datos.despiece_perfiles_marco.forEach(dp => addCorte('Marco', dp, ctxBase))
    datos.get_despiece_accesorio('marco', datos.marco.id).forEach(da => addAcc('Marco', da, ctxBase))
  }

  // ── Hoja ───────────────────────────────────────────────────────────────────
  if (datos.hoja) {
    datos.despiece_perfiles_hoja.forEach(dp => addCorte('Hoja', dp, ctxBase))
    datos.get_despiece_accesorio('hoja', datos.hoja.id).forEach(da => addAcc('Hoja', da, ctxBase))
  }

  // ── Interiores por módulo ─────────────────────────────────────────────────
  for (let fila = 0; fila < nFilas; fila++) {
    for (let col = 0; col < nCols; col++) {
      const moduloCfg = entrada.modulosConfig.find(m => m.fila === fila && m.col === col)
      const interiorId = moduloCfg?.id_interior ?? entrada.id_interior ?? null
      const interior = interiorId ? datos.get_despiece_interior(interiorId) : null
      if (!interior) continue

      const altoMod  = filasAltos[fila] ?? alto
      const anchoMod = colsAnchos[col]  ?? ancho
      const ctxMod: ContextoCalculo = { ...ctxBase, ancho: anchoMod, alto: altoMod }

      const cantInt  = calcularCantidad(interior.formula_cantidad_interiores, ctxMod)
      const anchoInt = calcularMedida(interior.formula_ancho_interior, ctxMod)
      const altoInt  = calcularMedida(interior.formula_alto_interior, ctxMod)
      const ctxInt: ContextoCalculo = { ...ctxMod, ancho: anchoInt, alto: altoInt }

      const moduloLabel = (nFilas > 1 || nCols > 1) ? `F${fila + 1}-C${col + 1}` : undefined

      // Accesorios del interior
      datos.get_despiece_accesorio('interior', interior.id)
        .forEach(da => addAcc('Interior', da, ctxInt, cantInt))

      // Vidrio o Revestimiento (prioriza celda, cae a global)
      const idVidrio = moduloCfg?.id_vidrio ?? entrada.id_vidrio
      if (idVidrio) {
        const vid = datos.catalog_vidrios.find(v => v.codigo === idVidrio)
        if (vid) {
          const area = (anchoInt / 1000) * (altoInt / 1000)
          interiores.push({ tipo: 'Vidrio', cantidad: cantInt, ancho: anchoInt, alto: altoInt,
            area, precio: vid.precio * area * cantInt, modulo: moduloLabel })
        }
      }

      // Contravidrio Int (CORREGIDO: Prioriza celda) 
      const cvId = moduloCfg?.id_contravidrio?? entrada.id_contravidrio
      const cv   = cvId ? datos.get_despiece_contravidrio(cvId) : null
      if (cv) {
        const cantCV = calcularCantidad(cv.formula_cantidad_contravidrios_ancho, ctxInt)
        const anchCV = calcularMedida(cv.formula_contravidrio_ancho, ctxInt)
        const altoCV = calcularMedida(cv.formula_contravidrio_alto, ctxInt)
        const ctxCV: ContextoCalculo = { ...ctxInt, ancho: anchCV, alto: altoCV }
        datos.get_despiece_perfil('contravidrio', cv.id).forEach(dp => addCorte('Contravid. Int.', dp, ctxCV, cantCV))
        interiores.push({ tipo: 'CV Int.', cantidad: cantCV, ancho: anchCV, alto: altoCV,
          area: (anchCV / 1000) * (altoCV / 1000), precio: 0, modulo: moduloLabel })
      }

      // Contravidrio Ext (CORREGIDO: Prioriza celda)
      const cveId = moduloCfg?.id_contravidrio_ext ?? entrada.id_contravidrio_ext
      const cve   = cveId ? datos.get_despiece_contravidrio(cveId) : null
      if (cve) {
        const cantCVE = calcularCantidad(cve.formula_cantidad_contravidrios_ancho, ctxInt)
        const anchCVE = calcularMedida(cve.formula_contravidrio_ancho, ctxInt)
        const altoCVE = calcularMedida(cve.formula_contravidrio_alto, ctxInt)
        const ctxCVE: ContextoCalculo = { ...ctxInt, ancho: anchCVE, alto: altoCVE }
        datos.get_despiece_perfil('contravidrioExt', cve.id).forEach(dp => addCorte('Contravid. Ext.', dp, ctxCVE, cantCVE))
        interiores.push({ tipo: 'CV Ext.', cantidad: cantCVE, ancho: anchCVE, alto: altoCVE,
          area: (anchCVE / 1000) * (altoCVE / 1000), precio: 0, modulo: moduloLabel })
      }
    }
  }

  // ── Cruces (CORREGIDO: Independizado de la existencia estricta del idInterior global) ───────────────────
  if (tipo_cruce > 0) {
    const idInteriorEfectivo = entrada.id_interior ?? entrada.modulosConfig[0]?.id_interior ?? null
    const interior = idInteriorEfectivo ? datos.get_despiece_interior(idInteriorEfectivo) : null
    
    if (interior) {
      const anchoInt = calcularMedida(interior.formula_ancho_interior, ctxBase)
      const altoInt  = calcularMedida(interior.formula_alto_interior, ctxBase)
      const ctxInt: ContextoCalculo = { ...ctxBase, ancho: anchoInt, alto: altoInt }

      const crucesIds = datos.all_cruces.filter(c => c.id_interior === interior.id)
      crucesIds.forEach(cr => {
        const ctxCruces: ContextoCalculo = { ...ctxInt }
        datos.get_despiece_perfil('cruces', cr.id).forEach(dp => addCorte('Cruces', dp, ctxCruces))
        datos.get_despiece_accesorio('cruces', cr.id).forEach(da => addAcc('Cruces', da, ctxCruces))
      })
    }
  }

  // ── Multiplicador ──────────────────────────────────────────────────────────
  const mult = cantidad_tipologias
  cortes.forEach(c     => { c.cantidad *= mult; c.total_mm *= mult; c.kg *= mult; c.precio_total *= mult })
  accesorios.forEach(a => { a.cantidad *= mult; a.precio_total *= mult })
  interiores.forEach(i => { i.cantidad *= mult; i.area *= mult; i.precio *= mult })

  // ── Resúmenes FFD ──────────────────────────────────────────────────────────
  const map = new Map<string, { perfil: Perfil | undefined; lista: { medida_mm: number; cantidad: number; angulo: string }[] }>()
  for (const c of cortes) {
    if (!map.has(c.nro_perfil)) map.set(c.nro_perfil, { perfil: lkPerfil(c.id), lista: [] })
    map.get(c.nro_perfil)!.lista.push({ medida_mm: c.medida_mm, cantidad: c.cantidad, angulo: c.angulo })
  }

  const resumenes: ResumenPerfil[] = []
  for (const [nro, { perfil, lista }] of map) {
    const longTira = perfil?.long_tira?? 6000
    const allCuts  = lista.flatMap(c => Array<number>(c.cantidad).fill(c.medida_mm))
    const opt      = optimizarCortes(allCuts, longTira)
    const totalMm  = allCuts.reduce((s, m) => s + m, 0)
    const kg       = perfil ? (perfil.peso_metro/ 1000) * totalMm : 0
    const precioKg = perfil?.precio_kg ?? 0
    resumenes.push({
      nro_perfil: nro, descripcion_perfil: perfil?.descri ?? nro,
      total_cortes: allCuts.length, total_mm: totalMm,
      tiras: opt.tirasNecesarias, desperdicio_mm: opt.desperdicioMm, eficiencia: opt.eficiencia,
      kg, precio_kg: precioKg, precio_total: kg * precioKg, longitud_tira: longTira, cortes: lista,
    })
  }

  const costoPerfiles   = resumenes.reduce((s, r) => s + r.precio_total, 0)
  const costoAccesorios = accesorios.reduce((s, a) => s + a.precio_total, 0)
  const costoInteriores = interiores.reduce((s, i) => s + i.precio, 0)

  return {
    cortes, accesorios, interiores, resumenes,
    costo_perfiles: costoPerfiles, costo_accesorios: costoAccesorios, costo_interiores: costoInteriores,
    costo_total: costoPerfiles + costoAccesorios + costoInteriores,
    multiplicador: mult, contexto: ctxBase,
  }
}