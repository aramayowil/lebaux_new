import { Perfil } from "@/types/index";

export interface PreviewRow {
  nro_perfil: string;
  action: "create" | "update";
  cambios: string[]; // Resumen de lo que cambia
  originalData?: Perfil;
  newData: Partial<Perfil> & { rawLinea: string; rawMoneda: string };
}

export function procesarYCompararDatos(
  rawData: any[],
  mapping: Record<string, string>,
  dbPerfiles: Perfil[],
  lineaMap: Record<string, number>,
  monedaMap: Record<string, number>
): PreviewRow[] {
  return rawData.map((row) => {
    // 1. Extraer valores basados en el mapeo dinámico de columnas del usuario
    const nro_perfil = String(row[mapping["nro_perfil"]] || "").trim();
    const rawLinea = String(row[mapping["linea"]] || "").trim();
    const rawMoneda = String(row[mapping["moneda"]] || "").trim();
    
    const peso_metro = parseFloat(row[mapping["peso_metro"]]) || 0;
    const precio_kg = parseFloat(row[mapping["precio_kg"]]) || 0;
    const descri = String(row[mapping["descri"]] || "").trim();
    const long_tira = parseFloat(row[mapping["long_tira"]]) || 0;
    const cubre = parseFloat(row[mapping["cubre"]]) || 0;

    // Buscar si ya existe en la base de datos por nro_perfil
    const original = dbPerfiles.find(
      (p) => p.nro_perfil?.toLowerCase() === nro_perfil.toLowerCase()
    );

    const id_linea = lineaMap[rawLinea.toLowerCase()] || 0;
    const id_moneda = monedaMap[rawMoneda.toLowerCase()] || 0;

    const newData: any = {
      nro_perfil,
      descri,
      peso_metro,
      long_tira,
      precio_kg,
      cubre,
      id_linea,
      id_moneda,
      rawLinea,
      rawMoneda
    };

    if (!original) {
      return { nro_perfil, action: "create", cambios: ["Nuevo Registro"], newData };
    }

    // Calcular diferencias si el registro ya existe
    const cambios: string[] = [];
    if (original.descri !== descri) cambios.push(`Descripción: "${original.descri}" → "${descri}"`);
    if (original.peso_metro !== peso_metro) cambios.push(`Peso: ${original.peso_metro} → ${peso_metro}`);
    if (original.precio_kg !== precio_kg) cambios.push(`Precio KG: ${original.precio_kg} → ${precio_kg}`);
    if (original.id_linea !== id_linea) cambios.push(`Línea reasociada`);
    if (original.id_moneda !== id_moneda) cambios.push(`Moneda cambiada`);

    return {
      nro_perfil,
      action: cambios.length > 0 ? "update" : "update", // se actualiza por upsert de igual modo
      cambios: cambios.length > 0 ? cambios : ["Sin cambios detectados (Sobrescribir)"],
      originalData: original,
      newData,
    };
  });
}