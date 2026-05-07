// ─── Catálogos ────────────────────────────────────────────────────────────────

export interface Extrusora {
  id: number;
  extrusora: string;
  bloqueado: boolean;
}

export interface Linea {
  id: number;
  id_extrusora: number;
  linea: string;
  bloqueado: boolean;
}

export interface Tipo {
  id: number;
  formaTipo: string;
  orden: number;
}

export interface Perfil {
  id: number;
  nro_perfil: string;
  id_linea: number;
  cod_color?: number; // COD_COLOR (id de tratamiento/color)
  descri: string;
  peso_metro: number;
  long_tira: number;
  precio_kg: number;
  long_alt?: number; // LONG_ALT (longitud alternativa)
  corte45?: boolean; // CORTE45
  interior?: number; // INTERIOR (tipo de interior que cubre)
  tipo?: number; // TIPO
  material?: number; // MATERIAL
  id_moneda: number;
  cubre: number; // cubre (espesor en mm)
  bloqueado?: boolean;
  minimo_reutilizable?: number; // minimo_reutilizable
}

export interface Accesorio {
  id: number;
  cod_parte: string;
  idColor?: number; // Id color
  descri: string;
  precio: number;
  contenido?: number; // CONTENIDO (cantidad por bolsa/caja)
  unidad: 0 | 1; // 0 = bolsa/caja, 1 = metros
  id_moneda: number;
  bloqueado?: boolean;
  tipo?: number; // Tipo de accesorio
}

export interface Vidrio {
  id: number;
  codigo: string;
  descri: string;
  precio: number;
  base: number; // ancho plancha mm
  altura: number; // alto plancha mm
  espesor: number;
  id_moneda: number;
  tipo_rev: number; // TIPO_REV → id de TipoInterior
  color: number; // color como número RGB (igual que DB, ej: 16777150)
  bloqueado: boolean;
  maximo?: number; // Maximo
  corte1?: string; // Corte1
}

export interface Tratamiento {
  id: number;
  descripcion: string;
  precio_por_kilo: number;
  color: string; // color hex para UI
  id_moneda: number;
  bloqueado: boolean;
}

export interface Moneda {
  id: number;
  descripcion: string;
  cotizacion: number;
  bloqueado: boolean;
  simbolo?: string; // simbolo (ej: "$", "U$S")
}

export interface TipoInterior {
  id: number;
  descripcion: string;
  bloqueado: boolean;
}

// ─── Definición de Producto ───────────────────────────────────────────────────

export interface Tipos {
  id: number;
  forma_tipo: string;
  orden: number;
}

export interface Producto {
  id: number;
  descripcion: string;
  id_extrusora: number;
  id_linea: number;
  id_tipo: number;
}

export interface Marco {
  id: number;
  id_producto: number;
  descripcion: string;
  predeterminado: boolean;
  no_verificado?: boolean;
  forma_dibujo?: string;
}

export interface Hoja {
  id: number;
  id_marco: number;
  descripcion: string;
  cantidad: number;
  predeterminado: boolean;
  no_verificado?: boolean;
}

// Interior: solo datos base. Las fórmulas/descuentos están en DespieceInterior (tabla separada en DB)
export interface Interior {
  id: number;
  id_hoja: number;
  descripcion: string;
  predeterminado: boolean;
  no_verificado?: boolean;
}

// Contravidrio: solo datos base. Las fórmulas/perfil están en DespiecePerfilContravidrio
export interface Contravidrio {
  id: number;
  id_interior: number;
  descripcion: string;
  predeterminado: boolean;
  no_verificado?: boolean;
}

export interface ContravidrioExterior extends Contravidrio {
  // same shape, different table
}

// Cruces: solo datos base. Las fórmulas/perfil están en DespieceCruces
export interface Cruces {
  id: number;
  id_interior: number;
  descripcion: string;
  predeterminado: boolean;
  no_verificado?: boolean;
}

export interface Mosquitero {
  id: number;
  idHoja: number;
  descripcion: string;
  predeterminado: boolean;
  noVerificado?: boolean;
}

// VidRepartido: solo datos base. Las fórmulas están en DespiecePerfilVR
export interface VidRepartido {
  id: number;
  id_interior: number;
  descripcion: string;
  predeterminado: boolean;
  no_verificado?: boolean;
}

// ─── Despiece (fórmulas) ──────────────────────────────────────────────────────

// Despiece perfiles para Marco y Hoja (tabla: Despiece perfiles marcos / hojas)
// Id, Id marco/hoja, Formula de cantidad, Perfil, Formula de perfil, Angulo
export interface DespiecePerfil {
  id: number;
  id_parent: number; // id del marco / hoja / mosquitero
  id_perfil: number; // NRO_PERFIL
  formula_cantidad: string;
  formula_perfil: string; // "Formula de perfil" en DB
  angulo: string; // "45" | "90" | ""
}

// Despiece perfiles de Contravidrio (Int. y Ext.) — estructura diferente en DB:
// contiene las fórmulas del propio contravidrio + el perfil
export interface DespiecePerfilContravidrio {
  id: number;
  id_contravidrio: number;
  id_perfil: string;
  formula_cantidad_ancho: string; // "Formula cantidad contravidrios ancho"
  formula_cantidad_alto: string; // "Formula cantidad contravidrios alto"
  formula_contravidrio_ancho: string;
  formula_contravidrio_alto: string;
  angulo: string;
  altura_contravidrio?: number;
}

export interface DespieceAccesorio {
  id: number; // agregado por el interprete
  id_parent: number;
  id_accesorio: string;
  formula_cantidad: string;
}

// Despiece interior (tabla "Despiece interior"): fórmulas y descuentos del interior
export interface DespieceInterior {
  id: number;
  id_interior: number;
  formula_cantidad_interiores: string;
  formula_ancho_interior: string;
  formula_alto_interior: string;
  descuento_izquierda: number;
  descuento_derecha: number;
  descuento_abajo: number;
  descuento_arriba: number;
}

// Despiece cruces (tabla "Despiece cruces"): perfil + fórmulas del cruce
export interface DespieceCruces {
  id: number;
  id_cruces: number;
  id_perfil: string;
  formula_cantidad: string;
  formula_ancho_entero: string; // "Formula de ancho entero"
  formula_alto_entero: string; // "Formula de alto entero"
  descuento_de_vidrio: number;
  descuento_de_si_mismo: number;
  angulo: string;
}

// Despiece VR (tabla "Despiece perfiles vidrio repartido"): contorno + cruce + interiores
export interface DespieceVR {
  id: number;
  id_vr: number;
  // contorno
  perfil_de_contorno: string;
  formula_cantidad_contorno_ancho: string;
  formula_cantidad_contorno_alto: string;
  formula_contorno_ancho: string;
  formula_contorno_alto: string;
  angulo: string;
  // cruceta
  perfil_de_cruce: string;
  formula_cruce_ancho: string;
  formula_cruce_alto: string;
  descuento_de_vidrio: number;
  descuento_de_si_mismo: number;
  angulo_cruce: string;
  // interiores del VR
  formula_cantidad_interiores: string;
  formula_ancho_interior: string;
  formula_alto_interior: string;
  descuento_izquierda: number;
  descuento_derecha: number;
  descuento_abajo: number;
  descuento_arriba: number;
}

// Despiece interior mosquitero (tabla "Despiece interior mosquitero")
export interface DespieceInteriorMosquitero {
  id: number;
  idMosquitero: number;
  formulaCantidadInteriores: string;
  formulaAnchoInterior: string;
  formulaAltoInterior: string;
  descuentoIzquierda: number;
  descuentoDerecha: number;
  descuentoAbajo: number;
  descuentoArriba: number;
}

// ─── Obras ────────────────────────────────────────────────────────────────────

export interface Obra {
  id: number;
  apellido: string;
  nombre: string;
  direccion: string;
  telefono: string;
  ciudad: string;
  numero?: string;
  archivo?: string;
}

export interface ObraTipologia {
  id: number;
  idObra: number;
  cantidad: number;
  descripcion: string;
  ancho: number;
  alto: number;
  hor1?: number;
  hor2?: number;
  hor3?: number;
  hor4?: number;
  hor5?: number;
  ver1?: number;
  ver2?: number;
  ver3?: number;
  ver4?: number;
  ver5?: number;
}

export interface ObraDetalle {
  id: number;
  idTipologia: number;
  ubicacionEnTipo: string; // "Ver 1", "Hor 2", "Diseño 1-1", etc.
  idObra: number;
  idExtrusora: number;
  idLinea: number;
  idTipo: number;
  idProducto: number;
  ancho: number;
  alto: number;
  color: number; // id de tratamiento
  marco: number;
  hoja: number;
  interior: number;
  contravidrios: number;
  contravidriosExt: number;
  cruce: number;
  mosquitero: number;
  tela: string;
  tipoCruce: number; // 1=centrados, 2=variables, 3=sin cruces
  cantCentradosHorizontal: number;
  cantCentradosVertical: number;
  horizontal1?: number;
  horizontal2?: number;
  horizontal3?: number;
  vertical1?: number;
  vertical2?: number;
  vertical3?: number;
  vertical4?: number;
  vertical5?: number;
  interior1?: string;
  interior2?: string;
  interior3?: string;
  interior4?: string;
  dvh11?: string;
  dvh12?: string;
  camara1?: string;
  dvh21?: string;
  dvh22?: string;
  camara2?: string;
  revest1?: string;
  direcc1?: string;
  revest2?: string;
  direcc2?: string;
  revest3?: string;
  direcc3?: string;
  revest4?: string;
  direcc4?: string;
  vr1?: number;
  horVr1?: number;
  verVr1?: number;
  activoVr1?: boolean;
  vr2?: number;
  horVr2?: number;
  verVr2?: number;
  activoVr2?: boolean;
  perfil_acople?: string;
  colocacion?: boolean;
  descriItemManual?: string;
  costoItemManual?: number;
  monedaItemManual?: number;
  mano?: boolean;
  difiere_en_ancho?: boolean;
  difiere_en_alto?: boolean;
}

// ─── Despiece Calculado ───────────────────────────────────────────────────────

export type TipoElemento = "PF" | "AC" | "VD" | "TL" | "MO" | "MN";

export interface ObraDespiece {
  id: number;
  idObra: number;
  idTipologia: number;
  idProductoEnTipo: number;
  idProducto: number;
  tipoElemento: TipoElemento;
  elemento: string;
  cantidad: number;
  ancho: number;
  alto: number;
  color: number;
  ubicacion: string;
  corte: string;
  manual: boolean;
  error: boolean;
  anulado: boolean;
  agregadoTipo: boolean;
  modificado?: Date;
}

// ─── Opciones del Sistema ─────────────────────────────────────────────────────

export interface Opciones {
  id: number;
  iva: number;
  porcentaje_sobre_perfiles: number;
  porcentaje_sobre_vidrios: number;
  porcentaje_sobre_accesorios: number;
  porcentaje_sobre_pinturas: number;
  porcentaje_sobre_telas: number;
  porcentaje_sobre_mano: number;
  porcentaje_sobre_mano_colocacion: number;
  porcentaje_sobre_items_manuales: number;
  costo_hora_taller: number;
  tiempo_marco_horas: number;
  tiempo_marco_minutos: number;
  tiempo_hoja_horas: number;
  tiempo_hoja_minutos: number;
  tiempo_interior_horas: number;
  tiempo_interior_minutos: number;
  tiempo_cruce_horas: number;
  tiempo_cruce_minutos: number;
  tiempo_contravidrio_horas: number;
  tiempo_contravidrio_minutos: number;
  tiempo_mosquitero_horas: number;
  tiempo_mosquitero_minutos: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  encabezado_pto: string;
  pie_pto: string;
  logo?: string;
}

// ─── UI / Estado ──────────────────────────────────────────────────────────────

export type NavSection =
  | "inicio"
  | "obras"
  | "productos"
  | "catalogos"
  | "opciones";

export type CatalogoTab =
  | "perfiles"
  | "accesorios"
  | "vidrios"
  | "tratamientos"
  | "extrusoras"
  | "lineas"
  | "monedas"
  | "tipos-interior";
