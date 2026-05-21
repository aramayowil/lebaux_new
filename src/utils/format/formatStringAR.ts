/**
 * Formatea un string numérico en tiempo real al formato es-AR (Puntos en miles, coma en decimales)
 * Soporta tipeo dinámico.
 */
export function formatStringAR(value: string): string {
  // Limpiamos todo lo que no sea número o coma
  let cleanValue = value.replace(/[^\d,]/g, "");

  // Aseguramos que solo haya una coma decimal
  const parts = cleanValue.split(",");
  if (parts.length > 2) {
    cleanValue = parts[0] + "," + parts.slice(1).join("");
  }

  // Separamos la parte entera de la decimal
  let [entera, decimal] = cleanValue.split(",");

  // Agregamos los puntos de miles a la parte entera
  if (entera) {
    entera = entera.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Retornamos el string combinado (si hay una coma, mantenemos el sufijo decimal)
  return decimal !== undefined ? `${entera},${decimal.slice(0, 2)}` : entera;
}

/**
 * Convierte el string con formato argentino ("1.230,30") a un número real (1230.3)
 */
export function parseStringARToNumber(value: string): number {
  if (!value) return 0;
  // Eliminamos los puntos de miles y reemplazamos la coma por un punto decimal
  const clean = value.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}