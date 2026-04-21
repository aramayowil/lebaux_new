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
} from '@/types'
import type { ModuloConfig } from '@/store/obrasStore'

// ─── Entrada ──────────────────────────────────────────────────────────────────

export interface EntradaCalculo {
  ancho:              number
  alto:               number
  cantidadTipologias: number
  // Config global
  idMarco?:           number | null
  idHoja?:            number | null
  idInterior?:        number | null        // interior por defecto (todos los paños)
  idContravidrio?:    number | null
  idContravidrioExt?: number | null
  idTratamiento?:     number
  idVidrio?:          string | null
  // Cruces
  tipoCruce:          0 | 1 | 2
  crucesH:            number
  crucesV:            number
  posH:               number[]
  posV:               number[]
  // Interiores por módulo (piso si hay cruces)
  modulosConfig:      ModuloConfig[]
}

export interface DatosProducto {
  marco?:            Marco
  hoja?:             Hoja
  // Catálogos completos (para buscar por id)
  allInteriores:     Interior[]
  allContravidrios:  Contravidrio[]
  allContravidriosExt: ContravidrioExterior[]
  allCruces:         Cruces[]
  allVidRepartidos:  VidRepartido[]

  despiecePerfilesMarco:           DespiecePerfil[]
  despiecePerfilesHoja:            DespiecePerfil[]
  // despiece por interior/CV se busca dinámicamente
  getDespiecePerfil:  (nivel: string, idParent: number) => DespiecePerfil[]
  getDespieceAccesorio: (nivel: string, idParent: number) => DespieceAccesorio[]

  catalogPerfiles:     Perfil[]
  catalogAccesorios:   Accesorio[]
  catalogVidrios:      Vidrio[]
  catalogTratamientos: Tratamiento[]
}

// ─── Salida ───────────────────────────────────────────────────────────────────

export type NivelCorte = 'Marco' | 'Hoja' | 'Contravid. Int.' | 'Contravid. Ext.' | 'Cruces' | 'Interior'

export interface CortePerfil {
  id:                number
  nivel:             NivelCorte
  nroPerfil:         string
  descripcionPerfil: string
  angulo:            string
  cantidad:          number
  medidaMm:          number
  totalMm:           number
  kg:                number
  precioUnitario:    number
  precioTotal:       number
}

export interface ItemAccesorio {
  id:          number
  nivel:       NivelCorte
  codParte:    string
  descripcion: string
  cantidad:    number
  unidad:      0 | 1
  precioUnit:  number
  precioTotal: number
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
  nroPerfil:     string
  descripcion:   string
  totalCortes:   number
  totalMm:       number
  tiras:         number
  desperdicioMm: number
  eficiencia:    number
  kg:            number
  precioKg:      number
  precioTotal:   number
  longTira:      number
  cortes: { medidaMm: number; cantidad: number; angulo: string }[]
}

export interface ResultadoDespiece {
  cortes:      CortePerfil[]
  accesorios:  ItemAccesorio[]
  interiores:  ItemInterior[]
  resumenes:   ResumenPerfil[]
  costoPerfiles:   number
  costoAccesorios: number
  costoInteriores: number
  costoTotal:      number
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
  const { ancho, alto, cantidadTipologias, tipoCruce, crucesH, crucesV, posH, posV } = entrada
  const hojas = datos.hoja?.cantidad ?? 1

  // Posiciones efectivas
  const posHef = tipoCruce === 2 ? [...posH].sort((a, b) => a - b)
    : tipoCruce === 1 ? Array.from({ length: crucesH }, (_, i) => Math.round((alto  / (crucesH + 1)) * (i + 1)))
    : []
  const posVef = tipoCruce === 2 ? [...posV].sort((a, b) => a - b)
    : tipoCruce === 1 ? Array.from({ length: crucesV }, (_, i) => Math.round((ancho / (crucesV + 1)) * (i + 1)))
    : []

  const filasAltos = posHef.length > 0 ? segmentos(alto, posHef) : [alto]
  const colsAnchos = posVef.length > 0 ? segmentos(ancho, posVef) : [ancho]
  const nFilas = filasAltos.length
  const nCols  = colsAnchos.length

  const ctxBase: ContextoCalculo = {
    ancho, alto, hojas,
    crucesH: posHef.length,
    crucesV: posVef.length,
    posH: posHef,
    posV: posVef,
  }

  const cortes:     CortePerfil[]   = []
  const accesorios: ItemAccesorio[] = []
  const interiores: ItemInterior[]  = []
  let cortId = 1, accId = 1

  const lkPerfil = (nro: string) => datos.catalogPerfiles.find(p => p.nroPerfil === nro)
  const lkAcc    = (cod: string) => datos.catalogAccesorios.find(a => a.codParte === cod)

  function addCorte(nivel: NivelCorte, dp: DespiecePerfil, ctx: ContextoCalculo, mult = 1) {
    const cant   = calcularCantidad(dp.formulaCantidad, ctx) * mult
    const medida = calcularMedida(dp.formulaMedida, ctx)
    if (cant <= 0 || medida <= 0) return
    const perfil = lkPerfil(dp.perfil)
    const kg     = perfil ? (perfil.pesoMetro / 1000) * medida * cant : 0
    const precio = perfil ? perfil.precioKg * kg : 0
    cortes.push({ id: cortId++, nivel, nroPerfil: dp.perfil, descripcionPerfil: perfil?.descri ?? dp.perfil,
      angulo: dp.angulo, cantidad: cant, medidaMm: medida, totalMm: medida * cant, kg,
      precioUnitario: perfil ? perfil.precioKg * (perfil.pesoMetro / 1000) * medida : 0, precioTotal: precio })
  }

  function addAcc(nivel: NivelCorte, da: DespieceAccesorio, ctx: ContextoCalculo, mult = 1) {
    const cant = calcularCantidad(da.formulaCantidad, ctx) * mult
    if (cant <= 0) return
    const acc = lkAcc(da.accesorio)
    const pu  = acc?.precio ?? 0
    accesorios.push({ id: accId++, nivel, codParte: da.accesorio, descripcion: acc?.descri ?? da.accesorio,
      cantidad: cant, unidad: acc?.unidad ?? 0, precioUnit: pu, precioTotal: pu * cant })
  }

  // ── Marco ──────────────────────────────────────────────────────────────────
  if (datos.marco) {
    datos.despiecePerfilesMarco.forEach(dp => addCorte('Marco', dp, ctxBase))
    datos.getDespieceAccesorio('marco', datos.marco.id).forEach(da => addAcc('Marco', da, ctxBase))
  }

  // ── Hoja ───────────────────────────────────────────────────────────────────
  if (datos.hoja) {
    datos.despiecePerfilesHoja.forEach(dp => addCorte('Hoja', dp, ctxBase))
    datos.getDespieceAccesorio('hoja', datos.hoja.id).forEach(da => addAcc('Hoja', da, ctxBase))
  }

  // ── Interiores por módulo ─────────────────────────────────────────────────
  for (let fila = 0; fila < nFilas; fila++) {
    for (let col = 0; col < nCols; col++) {
      // Encontrar qué interior corresponde a este paño
      const moduloCfg = entrada.modulosConfig.find(m => m.fila === fila && m.col === col)
      const interiorId = moduloCfg?.idInterior ?? entrada.idInterior ?? null
      const interior = interiorId ? datos.allInteriores.find(i => i.id === interiorId) : null
      if (!interior) continue

      const altoMod  = filasAltos[fila] ?? alto
      const anchoMod = colsAnchos[col]  ?? ancho
      const ctxMod: ContextoCalculo = { ...ctxBase, ancho: anchoMod, alto: altoMod }

      const cantInt  = calcularCantidad(interior.formulaCantidadInteriores, ctxMod)
      const anchoInt = calcularMedida(interior.formulaAnchoInterior, ctxMod)
      const altoInt  = calcularMedida(interior.formulaAltoInterior, ctxMod)
      const ctxInt: ContextoCalculo = { ...ctxMod, ancho: anchoInt, alto: altoInt }

      const moduloLabel = (nFilas > 1 || nCols > 1) ? `F${fila + 1}-C${col + 1}` : undefined

      // Accesorios del interior
      datos.getDespieceAccesorio('interior', interior.id)
        .forEach(da => addAcc('Interior', da, ctxInt, cantInt))

      // Vidrio principal
      const idVidrio = moduloCfg?.idVidrio ?? entrada.idVidrio
      if (idVidrio) {
        const vid = datos.catalogVidrios.find(v => v.codigo === idVidrio)
        if (vid) {
          const area = (anchoInt / 1000) * (altoInt / 1000)
          interiores.push({ tipo: 'Vidrio', cantidad: cantInt, ancho: anchoInt, alto: altoInt,
            area, precio: vid.precio * area * cantInt, modulo: moduloLabel })
        }
      }

      // Contravidrio Int
      const cvId = entrada.idContravidrio
      const cv   = cvId ? datos.allContravidrios.find(c => c.id === cvId) : null
      if (cv) {
        const cantCV = calcularCantidad(cv.formulaCantidadContravidriosAncho, ctxInt)
        const anchCV = calcularMedida(cv.formulaContravidrioAncho, ctxInt)
        const altoCV = calcularMedida(cv.formulaContravidrioAlto, ctxInt)
        const ctxCV: ContextoCalculo = { ...ctxInt, ancho: anchCV, alto: altoCV }
        datos.getDespiecePerfil('contravidrio', cv.id).forEach(dp => addCorte('Contravid. Int.', dp, ctxCV, cantCV))
        interiores.push({ tipo: 'CV Int.', cantidad: cantCV, ancho: anchCV, alto: altoCV,
          area: (anchCV / 1000) * (altoCV / 1000), precio: 0, modulo: moduloLabel })
      }

      // Contravidrio Ext
      const cveId = entrada.idContravidrioExt
      const cve   = cveId ? datos.allContravidriosExt.find(c => c.id === cveId) : null
      if (cve) {
        const cantCVE = calcularCantidad(cve.formulaCantidadContravidriosAncho, ctxInt)
        const anchCVE = calcularMedida(cve.formulaContravidrioAncho, ctxInt)
        const altoCVE = calcularMedida(cve.formulaContravidrioAlto, ctxInt)
        const ctxCVE: ContextoCalculo = { ...ctxInt, ancho: anchCVE, alto: altoCVE }
        datos.getDespiecePerfil('contravidrioExt', cve.id).forEach(dp => addCorte('Contravid. Ext.', dp, ctxCVE, cantCVE))
        interiores.push({ tipo: 'CV Ext.', cantidad: cantCVE, ancho: anchCVE, alto: altoCVE,
          area: (anchCVE / 1000) * (altoCVE / 1000), precio: 0, modulo: moduloLabel })
      }

      // Cruces (solo 1 vez por la tipología, no por módulo)
      // Los cruces se calculan con el contexto base del interior global
    }
  }

  // ── Cruces (global, 1 sola vez) ────────────────────────────────────────────
  if (tipoCruce > 0 && entrada.idInterior) {
    const interior = datos.allInteriores.find(i => i.id === entrada.idInterior)
    if (interior) {
      const anchoInt = calcularMedida(interior.formulaAnchoInterior, ctxBase)
      const altoInt  = calcularMedida(interior.formulaAltoInterior, ctxBase)
      const ctxInt: ContextoCalculo = { ...ctxBase, ancho: anchoInt, alto: altoInt }

      const crucesIds = datos.allCruces.filter(c => c.idInterior === interior.id)
      crucesIds.forEach(cr => {
        const ctxCruces: ContextoCalculo = { ...ctxInt }
        datos.getDespiecePerfil('cruces', cr.id).forEach(dp => addCorte('Cruces', dp, ctxCruces))
        datos.getDespieceAccesorio('cruces', cr.id).forEach(da => addAcc('Cruces', da, ctxCruces))
      })
    }
  }

  // ── Multiplicador ──────────────────────────────────────────────────────────
  const mult = cantidadTipologias
  cortes.forEach(c     => { c.cantidad *= mult; c.totalMm *= mult; c.kg *= mult; c.precioTotal *= mult })
  accesorios.forEach(a => { a.cantidad *= mult; a.precioTotal *= mult })
  interiores.forEach(i => { i.cantidad *= mult; i.area *= mult; i.precio *= mult })

  // ── Resúmenes FFD ──────────────────────────────────────────────────────────
  const map = new Map<string, { perfil: Perfil | undefined; lista: { medidaMm: number; cantidad: number; angulo: string }[] }>()
  for (const c of cortes) {
    if (!map.has(c.nroPerfil)) map.set(c.nroPerfil, { perfil: lkPerfil(c.nroPerfil), lista: [] })
    map.get(c.nroPerfil)!.lista.push({ medidaMm: c.medidaMm, cantidad: c.cantidad, angulo: c.angulo })
  }

  const resumenes: ResumenPerfil[] = []
  for (const [nro, { perfil, lista }] of map) {
    const longTira = perfil?.longTira ?? 6000
    const allCuts  = lista.flatMap(c => Array<number>(c.cantidad).fill(c.medidaMm))
    const opt      = optimizarCortes(allCuts, longTira)
    const totalMm  = allCuts.reduce((s, m) => s + m, 0)
    const kg       = perfil ? (perfil.pesoMetro / 1000) * totalMm : 0
    const precioKg = perfil?.precioKg ?? 0
    resumenes.push({
      nroPerfil: nro, descripcion: perfil?.descri ?? nro,
      totalCortes: allCuts.length, totalMm,
      tiras: opt.tirasNecesarias, desperdicioMm: opt.desperdicioMm, eficiencia: opt.eficiencia,
      kg, precioKg, precioTotal: kg * precioKg, longTira, cortes: lista,
    })
  }

  const costoPerfiles   = resumenes.reduce((s, r) => s + r.precioTotal, 0)
  const costoAccesorios = accesorios.reduce((s, a) => s + a.precioTotal, 0)
  const costoInteriores = interiores.reduce((s, i) => s + i.precio, 0)

  return {
    cortes, accesorios, interiores, resumenes,
    costoPerfiles, costoAccesorios, costoInteriores,
    costoTotal: costoPerfiles + costoAccesorios + costoInteriores,
    multiplicador: mult, contexto: ctxBase,
  }
}
