/**
 * Formatea un número al estándar argentino (puntos para miles, comas para decimales)
 * Ejemplos: 1230.3 => "1.230,30" | 45700.9 => "45.700,90" | 1500 => "1.500,00"
 */
export function formatearNumeroPiquetero(valor: number | string | null | undefined): string {
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  if (numero === null || numero === undefined || isNaN(numero)) {
    return "0,00";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numero);
}