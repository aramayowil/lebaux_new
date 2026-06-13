/**
 * Motor de cálculo de fórmulas de despiece
 * Reemplaza la función reemplazoN() del módulo VBA original.
 *
 * Substitución de variables:
 *   ancho    → medida horizontal de apertura (mm)
 *   alto     → medida vertical de apertura (mm)
 *   hojas    → cantidad de hojas
 *   crucesH  → cantidad de cruces horizontales
 *   crucesV  → cantidad de cruces verticales
 *   Entero() → floor()
 *
 * La evaluación usa mathjs para evitar el uso de eval().
 */

import { evaluate } from "mathjs";

export interface ContextoCalculo {
  ancho: number;
  alto: number;
  hojas: number;
  cruces_h: number;
  cruces_v: number;
  // Declaración explícita para evitar que caigan en la regla de 'number' del indexador
  pos_h?: number[];
  pos_v?: number[];
  [extra: string]: any;
}

/** Convierte una fórmula Access al scope de mathjs y la evalúa */
export function calcularFormula(formula: string, ctx: ContextoCalculo): number {
  if (!formula || formula.trim() === "") return 0;

  // Normalizar texto
  let expr = formula.trim();

  // Reemplazar Entero(x) → floor(x)
  expr = expr.replace(/\bEntero\s*\(/gi, "floor(");

  // Reemplazar IIf(cond, t, f) → (cond ? t : f)  — por si quedara algo
  // mathjs no soporta IIf, así que hacemos best-effort
  expr = expr.replace(/\bIIf\s*\(/gi, "iff(");

  try {
    const scope = {
      ...ctx,
      floor: Math.floor,
      ceil: Math.ceil,
      round: Math.round,
      abs: Math.abs,
      max: Math.max,
      min: Math.min,
      // iff simulado como función
      iff: (cond: boolean, t: number, f: number) => (cond ? t : f),
    };

    const result = evaluate(expr, scope);
    return typeof result === "number"
      ? result
      : parseFloat(String(result)) || 0;
  } catch {
    console.warn(`[calcularFormula] Error evaluando: "${formula}" →`, expr);
    return 0;
  }
}

/** Evalúa una fórmula y devuelve un entero (ej. cantidades) */
export function calcularCantidad(
  formula: string,
  ctx: ContextoCalculo,
): number {
  return Math.round(calcularFormula(formula, ctx));
}

/** Evalúa una fórmula y devuelve mm redondeado a 1 decimal */
export function calcularMedida(formula: string, ctx: ContextoCalculo): number {
  return Math.round(calcularFormula(formula, ctx) * 10) / 10;
}

// ─── Calculador de costo de perfil ──────────────────────────────────────────

export interface ResultadoPerfil {
  nroPerfil: string;
  cantidad: number;
  medidaMm: number;
  angulo: string;
  kg: number;
  precioUnitario: number; // $/tira
  precioTotal: number;
}

export function calcularCostoPerfil(
  pesoMetro: number,
  longTiraMm: number,
  precioKg: number,
  // cantidadCortes: number,
  medidaMm: number,
): { kg: number; precioTira: number; precioCorte: number } {
  const metrosTira = longTiraMm / 1000;
  const kg = pesoMetro * metrosTira;
  const precioTira = kg * precioKg;

  const metrosCorte = medidaMm / 1000;
  const kgCorte = pesoMetro * metrosCorte;
  const precioCorte = kgCorte * precioKg;

  return { kg, precioTira, precioCorte };
}

// ─── Optimización de barras (Cutting Stock básico) ───────────────────────────

export interface CorteOptimizado {
  tirasNecesarias: number;
  desperdicioMm: number;
  eficiencia: number; // 0-1
  layout: number[][]; // tiras con sus cortes
}

/**
 * Algoritmo greedy First Fit Decreasing para optimizar barras de aluminio.
 * Similar al módulo Optimización del Access.
 */
/**
 * Algoritmo greedy First Fit Decreasing para optimizar barras de aluminio.
 * Protegido contra arreglos vacíos e inconsistencias de cortes.
 */
export function optimizarCortes(
  medidas: number[], // mm de cada corte requerido
  largoBarra: number, // mm de la barra/tira
  descCorte = 5, // mm de disco de sierra
): CorteOptimizado {
  // 1. Validación temprana si no hay cortes que procesar
  if (!medidas || medidas.length === 0) {
    return {
      tirasNecesarias: 0,
      desperdicioMm: 0,
      eficiencia: 0,
      layout: [],
    };
  }

  const sorted = [...medidas].sort((a, b) => b - a);
  const tiras: number[][] = [];
  const espacios: number[] = [];

  for (const medida of sorted) {
    // Si una sola medida supera el largo de la barra, la salteamos para evitar bucles infinitos
    if (medida > largoBarra) {
      console.warn(
        `[optimizarCortes] Corte de ${medida}mm supera el largo de barra de ${largoBarra}mm.`,
      );
      continue;
    }

    let colocado = false;
    for (let i = 0; i < tiras.length; i++) {
      // Verificamos si cabe sumando el disco de corte necesario para separar
      if (espacios[i]! >= medida + descCorte) {
        tiras[i]!.push(medida);
        espacios[i]! -= medida + descCorte;
        colocado = true;
        break;
      }
    }

    if (!colocado) {
      tiras.push([medida]);
      // Al iniciar la barra, el espacio restante es el largo total menos el corte.
      // Solo restará descCorte si se añade un SEGUNDO elemento en las iteraciones siguientes.
      espacios.push(largoBarra - medida);
    }
  }

  // Si después de filtrar no se generaron tiras útiles
  if (tiras.length === 0) {
    return { tirasNecesarias: 0, desperdicioMm: 0, eficiencia: 0, layout: [] };
  }

  // 2. Cálculo exacto basado en lo que realmente quedó libre en cada barra
  const totalDisponible = tiras.length * largoBarra;
  const desperdicio = espacios.reduce((sum, esp) => sum + esp, 0);
  const totalUsado = totalDisponible - desperdicio;
  const eficiencia = totalUsado / totalDisponible;

  return {
    tirasNecesarias: tiras.length,
    desperdicioMm: desperdicio,
    eficiencia: isNaN(eficiencia) || !isFinite(eficiencia) ? 0 : eficiencia,
    layout: tiras,
  };
}

// ─── Formateo ─────────────────────────────────────────────────────────────────

export function formatMm(mm: number): string {
  return mm.toLocaleString("es-AR", { maximumFractionDigits: 1 }) + " mm";
}

export function formatPesos(n: number): string {
  return n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

export function formatKg(n: number): string {
  return (
    n.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }) + " kg"
  );
}
