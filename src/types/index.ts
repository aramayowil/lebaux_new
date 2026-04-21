// ─── Catálogos ────────────────────────────────────────────────────────────────

export interface Extrusora {
  id: number;
  extrusora: string;
  bloqueado: boolean;
}

export interface Linea {
  id: number;
  idExtrusora: number;
  linea: string;
  bloqueado: boolean;
}

export interface Tipo {
  id: number;
  formaTipo: string;
  orden: number;
}

export interface Perfil {
  nroPerfil: string;
  idLinea: number;
  codColor?: number; // COD_COLOR (id de tratamiento/color)
  descri: string;
  pesoMetro: number;
  longTira: number;
  precioKg: number;
  longAlt?: number; // LONG_ALT (longitud alternativa)
  corte45?: boolean; // CORTE45
  interior?: number; // INTERIOR (tipo de interior que cubre)
  tipo?: number; // TIPO
  material?: number; // MATERIAL
  moneda: number;
  cubre: number; // cubre (espesor en mm)
  bloqueado?: boolean;
  minimoReutilizable?: number; // minimo_reutilizable
}

export interface Accesorio {
  codParte: string;
  idColor?: number; // Id color
  descri: string;
  precio: number;
  contenido?: number; // CONTENIDO (cantidad por bolsa/caja)
  unidad: 0 | 1; // 0 = bolsa/caja, 1 = metros
  moneda: number;
  bloqueado?: boolean;
  tipo?: number; // Tipo de accesorio
}

export interface Vidrio {
  codigo: string;
  descri: string;
  precio: number;
  base: number; // ancho plancha mm
  altura: number; // alto plancha mm
  espesor: number;
  moneda: number;
  tipoRev: number; // TIPO_REV → id de TipoInterior
  color: number; // color como número RGB (igual que DB, ej: 16777150)
  bloqueado: boolean;
  maximo?: number; // Maximo
  corte1?: string; // Corte1
}

export interface Tratamiento {
  id: number;
  descripcion: string;
  precioPorKilo: number;
  color: string; // color hex para UI
  moneda: number;
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

export interface Producto {
  id: number;
  descripcion: string;
  idExtrusora: number;
  idLinea: number;
  idTipo: number;
}

export interface Marco {
  id: number;
  idProducto: number;
  descripcion: string;
  predeterminado: boolean;
  noVerificado?: boolean;
  formaDibujo?: string;
}

export interface Hoja {
  id: number;
  idMarco: number;
  descripcion: string;
  cantidad: number;
  predeterminado: boolean;
  noVerificado?: boolean;
}

// Interior: solo datos base. Las fórmulas/descuentos están en DespieceInterior (tabla separada en DB)
export interface Interior {
  id: number;
  idHoja: number;
  descripcion: string;
  predeterminado: boolean;
  noVerificado?: boolean;
}

// Contravidrio: solo datos base. Las fórmulas/perfil están en DespiecePerfilContravidrio
export interface Contravidrio {
  id: number;
  idInterior: number;
  descripcion: string;
  predeterminado: boolean;
  noVerificado?: boolean;
}

export interface ContravidrioExterior extends Contravidrio {
  // same shape, different table
}

// Cruces: solo datos base. Las fórmulas/perfil están en DespieceCruces
export interface Cruces {
  id: number;
  idInterior: number;
  descripcion: string;
  predeterminado: boolean;
  noVerificado?: boolean;
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
  idInterior: number;
  descripcion: string;
  predeterminado: boolean;
  noVerificado?: boolean;
}

// ─── Despiece (fórmulas) ──────────────────────────────────────────────────────

// Despiece perfiles para Marco y Hoja (tabla: Despiece perfiles marcos / hojas)
// Id, Id marco/hoja, Formula de cantidad, Perfil, Formula de perfil, Angulo
export interface DespiecePerfil {
  id: number;
  idParent: number; // id del marco / hoja / mosquitero
  perfil: string; // NRO_PERFIL
  formulaCantidad: string;
  formulaMedida: string; // "Formula de perfil" en DB
  angulo: string; // "45" | "90" | ""
}

// Despiece perfiles de Contravidrio (Int. y Ext.) — estructura diferente en DB:
// contiene las fórmulas del propio contravidrio + el perfil
export interface DespiecePerfilContravidrio {
  id: number;
  idContravidrio: number;
  perfil: string;
  formulaCantidadAncho: string; // "Formula cantidad contravidrios ancho"
  formulaCantidadAlto: string; // "Formula cantidad contravidrios alto"
  formulaContravidrioAncho: string;
  formulaContravidrioAlto: string;
  angulo: string;
  alturaContravidrio?: number;
}

export interface DespieceAccesorio {
  id: number;
  idParent: number;
  accesorio: string; // COD_PARTE
  formulaCantidad: string;
}

// Despiece interior (tabla "Despiece interior"): fórmulas y descuentos del interior
export interface DespieceInterior {
  id: number;
  idInterior: number;
  formulaCantidadInteriores: string;
  formulaAnchoInterior: string;
  formulaAltoInterior: string;
  descuentoIzquierda: number;
  descuentoDerecha: number;
  descuentoAbajo: number;
  descuentoArriba: number;
}

// Despiece cruces (tabla "Despiece cruces"): perfil + fórmulas del cruce
export interface DespieceCruces {
  id: number;
  idCruces: number;
  perfil: string;
  formulaCantidad: string;
  formulaAnchoEntero: string; // "Formula de ancho entero"
  formulaAltoEntero: string; // "Formula de alto entero"
  descuentoDeVidrio: number;
  descuentoDeSiMismo: number;
  angulo: string;
}

// Despiece VR (tabla "Despiece perfiles vidrio repartido"): contorno + cruce + interiores
export interface DespieceVR {
  id: number;
  idVR: number;
  // contorno
  perfilDeContorno: string;
  formulaCantidadContornoAncho: string;
  formulaCantidadContornoAlto: string;
  formulaContornoAncho: string;
  formulaContornoAlto: string;
  angulo: string;
  // cruceta
  perfilDeCruce: string;
  formulaCruceAncho: string;
  formulaCruceAlto: string;
  descuentoDeVidrio: number;
  descuentoDeSi: number;
  anguloCruce: string;
  // interiores del VR
  formulaCantidadInteriores: string;
  formulaAnchoInterior: string;
  formulaAltoInterior: string;
  descuentoIzquierda: number;
  descuentoDerecha: number;
  descuentoAbajo: number;
  descuentoArriba: number;
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
  porcentajeSobrePerfiles: number;
  porcentajeSobreVidrios: number;
  porcentajeSobreAccesorios: number;
  porcentajeSobrePinturas: number;
  porcentajeSobreTelas: number;
  porcentajeSobreMano: number;
  porcentajeSobreManoColocacion: number;
  porcentajeSobreItemsManuales: number;
  costoHoraTaller: number;
  tiempoMarcoHoras: number;
  tiempoMarcoMinutos: number;
  tiempoHojaHoras: number;
  tiempoHojaMinutos: number;
  tiempoInteriorHoras: number;
  tiempoInteriorMinutos: number;
  tiempoCruceHoras: number;
  tiempoCruceMinutos: number;
  tiempoContravidrioHoras: number;
  tiempoContravidrioMinutos: number;
  tiempoMosquiteroHoras: number;
  tiempoMosquiteroMinutos: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  encabezadoDePto: string;
  pieDePto: string;
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
