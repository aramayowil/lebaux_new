// ─── Catálogos ────────────────────────────────────────────────────────────────

export interface Extrusora {
  id: number;
  extrusora?: string | null;
  bloqueado: boolean;
}

export interface Linea {
  id: number;
  id_extrusora: number;
  linea?: string | null;
  bloqueado: boolean;
}

export interface Perfil {
  id: number;
  nro_perfil?: string | null;
  id_linea?: number | null;
  cod_color?: number | null;
  descri?: string | null;

  // Datos físicos y de optimización (Mapeados a number para soportar decimales)
  peso_metro?: number | null;
  long_tira?: number | null;
  precio_kg?: number | null;
  long_alt?: number | null;
  corte45?: number | null;

  // Banderas de control y lógica de despiece
  interior: boolean;
  tipo?: number | null;
  material?: number | null;
  id_moneda?: number | null;
  cubre?: number | null;
  bloqueado: boolean;
  minimo_reutilizable?: number | null; // DB: double precision (Largo mínimo en mm para scrap/reutilizar)
}

// Cambiar en tu interface Vidrio:
export interface Vidrio {
  id: number;
  codigo: string;
  descri?: string | null;
  precio?: number | null;
  base?: number | null;
  altura?: number | null;
  espesor?: number | null;
  id_moneda?: number | null;
  tipo_rev?: number | null;
  color?: number | null;
  bloqueado: boolean;
  maximo?: number | null;
  corte1?: string | null;
}

export interface Tratamiento {
  id: number;
  descripcion?: string | null;
  precio_por_kilo?: number | null;
  color?: string | null;
  id_moneda?: number | null;
  bloqueado: boolean;
}

export interface Moneda {
  id: number;
  descripcion?: string | null;
  cotizacion?: number | null;
  simbolo?: string | null;
  bloqueado: boolean;
}

export interface TipoAccesorio {
  id: number;
  descripcion?: string | null;
}

export interface TipoInterior {
  id: number;
  descripcion?: string | null;
  bloqueado: boolean;
}

export interface TipoColocacion {
  id: number;
  id_tipo?: number | null;

  // Costos e índices de instalación (Al ser 'double precision' admiten decimales puros en JS/TS)
  colocacion_minimo?: number | null;
  colocacion_m2?: number | null;
  colocacion_ml?: number | null;
  colocacion_x_hoja?: number | null;
}

// ─── Definición de Producto ───────────────────────────────────────────────────

export interface ObraTipo {
  id: number;
  forma_tipo?: string | null;
  orden?: string | null;
}

export interface Producto {
  id: number;
  id_extrusora: number;
  id_linea: number;
  id_tipo: number;
  descripcion?: string | null;
  fecha_creacion?: string | Date | null;
}

export interface Marco {
  id: number;
  id_producto?: number | null;
  descripcion: string;
  predeterminado: boolean;
  no_verificado: boolean;
  forma_dibujo?: number | null;
}

export interface Hoja {
  id: number;
  id_marco?: number | null;
  descripcion: string;
  cantidad?: number | null;
  predeterminado: boolean;
  no_verificado: boolean;
}

// Interior: solo datos base. Las fórmulas/descuentos están en DespieceInterior (tabla separada en DB)
export interface Interior {
  id: number;
  id_hoja?: number | null;
  descripcion: string;
  predeterminado: boolean;
  no_verificado?: boolean;
}

// Contravidrio: solo datos base. Las fórmulas/perfil están en DespiecePerfilContravidrio
export interface Contravidrio {
  id: number;
  id_interior?: number | null;
  descripcion: string;
  predeterminado: boolean;
  no_verificado: boolean;
}

export interface ContravidrioExterior extends Contravidrio {
  // same shape, different table
}

export interface Accesorio {
  id: number;
  cod_parte: string;
  id_color?: number | null;
  descri?: string | null;
  precio?: number | null;
  contenido?: number | null;
  unidad?: number | null;
  id_moneda?: number | null;
  bloqueado: boolean;
  tipo?: number | null;
}

// Cruces: solo datos base. Las fórmulas/perfil están en DespieceCruces
export interface Cruce {
  id: number;
  id_interior?: number | null;
  descripcion: string;
  predeterminado: boolean;
  no_verificado: boolean;
}

export interface Mosquitero {
  id: number;
  id_hoja?: number | null;
  descripcion: string;
  predeterminado: boolean;
  no_verificado: boolean;
}

// VidRepartido: solo datos base. Las fórmulas están en DespiecePerfilVR
export interface VidrioRepartido {
  id: number;
  id_interior?: number | null;
  descripcion: string;
  predeterminado: boolean;
  no_verificado: boolean;
}

// ─── Despiece (fórmulas) ──────────────────────────────────────────────────────

// Despiece perfiles para Marco y Hoja (tabla: Despiece perfiles marcos / hojas)

export interface DespiecePerfilMarco {
  id: number;
  id_marco: number;
  formula_cantidad?: string | null;
  id_perfil?: number | null;
  formula_perfil?: string | null;
  angulo?: string | null;
  mo_especifica?: number | null;
}

export interface DespiecePerfilHoja {
  id: number;
  id_hoja: number;
  formula_cantidad?: string | null;
  id_perfil?: number | null;
  formula_perfil?: string | null;
  angulo?: string | null;
  mo_especifica?: number | null;
}

// Despiece perfiles de Contravidrio (Int. y Ext.) — estructura diferente en DB:
export interface DespiecePerfilContravidrio {
  id: number;
  id_contravidrio: number;
  id_perfil?: number | null;
  formula_cantidad_contravidrios_ancho?: string | null;
  formula_cantidad_contravidrios_alto?: string | null;
  formula_contravidrio_ancho?: string | null;
  formula_contravidrio_alto?: string | null;
  angulo?: string | null; // DB: character varying(255) (Ej: "90°/90°", "45°/45°")
  mo_especifica?: number | null;
  altura_contravidrio?: number | null; // DB: integer (Para cálculos de pisada o descuento de vidrio)
}

// Despiece perfiles de Mosquitero
export interface DespiecePerfilMosquitero {
  id: number;
  id_mosquitero: number;
  formula_cantidad?: string | null;
  perfil?: string | null;
  formula_perfil?: string | null;
  angulo?: string | null;
  mo_especifica?: number | null;
}

//-------------DESPIECE DE ACCESORIOS-----------------------
export interface DespieceAccesorioMarco {
  id: number;
  id_marco: number;
  formula_cantidad?: string | null;
  id_accesorio?: number | null;
  mo_especifica?: number | null;
}

export interface DespieceAccesorioHoja {
  id: number;
  id_hoja: number;
  formula_cantidad?: string | null;
  id_accesorio?: number | null;
  id_conjunto?: number | null;
  nombre_conjunto?: string | null;
  aparece_presupuesto: boolean;
  mo_especifica?: number | null;
}

export interface DespieceAccesorioInterior {
  id: number;
  id_interior: number;
  formula_cantidad?: string | null;
  id_accesorio?: number | null;
  mo_especifica?: number | null;
  id_conjunto?: number | null;
  nombre_conjunto?: string | null;
  bur_int?: string | null;
}

export interface DespieceAccesorioCruce {
  id: number;
  id_cruces: number;
  formula_cantidad?: string | null;
  id_accesorio?: number | null;
  mo_especifica?: number | null;
}

export interface DespieceAccesorioContravidrio {
  id: number;
  id_contravidrio: number;
  formula_cantidad?: string | null;
  id_accesorio?: number | null;
  mo_especifica?: number | null;
}

export interface DespieceAccesorioContravidrioExt {
  id: number;
  id_contravidrio: number;
  formula_cantidad?: string | null;
  id_accesorio?: number | null;
  mo_especifica?: number | null;
}

export interface DespieceAccesorioMosquitero {
  id: number;
  id_mosquitero: number;
  formula_cantidad?: string | null;
  id_accesorio?: number | null;
  mo_especifica?: number | null;
}

export interface DespieceAccesorioVidrioRepartido {
  id: number;
  id_vr: number;
  formula_cantidad?: string | null;
  id_accesorio?: number | null;
  mo_especifica?: number | null;
}

// Despiece interior (tabla "Despiece interior"): fórmulas y descuentos del interior
export interface DespieceInterior {
  id: number;
  id_interior: number; // DB: integer (NOT NULL, FK a opendata.interior)

  // Fórmulas para el cálculo de la distribución interna (Páños de vidrio o paneles)
  formula_cantidad_interiores?: string | null;
  formula_ancho_interior?: string | null;
  formula_alto_interior?: string | null;

  // Holguras y descuentos perimetrales en milímetros (mm)
  descuento_izquierda?: number | null;
  descuento_derecha?: number | null;
  descuento_abajo?: number | null;
  descuento_arriba?: number | null;

  mo_especifica?: number | null;
}

export interface DespieceInteriorMosquitero {
  id: number;
  id_mosquitero: number;
  formula_cantidad_interiores?: string | null;
  formula_ancho_interior?: string | null;
  formula_alto_interior?: string | null;
  descuento_izquierda?: number | null;
  descuento_derecha?: number | null;
  descuento_abajo?: number | null;
  descuento_arriba?: number | null;
  mo_especifica?: number | null;
}

// Despiece cruces (tabla "Despiece cruces"): perfil + fórmulas del cruce
export interface DespieceCruce {
  id: number;
  id_cruces: number;
  id_perfil?: number | null;
  formula_cantidad?: string | null;
  formula_ancho_entero?: string | null;
  formula_alto_entero?: string | null;
  descuento_vidrio?: number | null;
  descuento_de_si_mismo?: number | null;
  angulo?: string | null;
  diferencia_con_marco_marco?: number | null;

  mo_especifica?: number | null;
  esp_cruce?: number | null;
}

// Despiece VR (tabla "Despiece perfiles vidrio repartido"): contorno + cruce + interiores
export interface DespiecePerfilVidrioRepartido {
  id: number;
  id_vr: number; // DB: integer (NOT NULL, FK a opendata.vidrio_repartido)

  // Perfiles de Contorno / Perimetrales
  id_perfil_contorno?: number | null; // DB: integer (FK a opendata.perfiles)
  formula_cantidad_contorno_ancho?: string | null; // DB: character varying(255)
  formula_cantidad_contorno_alto?: string | null; // DB: character varying(255)
  formula_contorno_ancho?: string | null; // DB: character varying(255)
  formula_contorno_alto?: string | null; // DB: character varying(255)
  angulo?: string | null; // DB: character varying(255)

  // Perfiles de Cruce / Divisiones internas
  id_perfil_cruce?: number | null; // DB: integer (FK a opendata.perfiles)
  formula_cruce_ancho?: string | null; // DB: character varying(255)
  formula_cruce_alto?: string | null; // DB: character varying(255)
  angulo_cruce?: string | null; // DB: character varying(255)

  // Descuentos y holguras físicas
  descuento_de_vidrio?: number | null; // DB: double precision (Mapeado a number)
  descuento_de_si_mismo?: number | null; // DB: double precision (Mapeado a number)

  // Fórmulas para los espacios/cuadros interiores resultantes
  formula_cantidad_interiores?: string | null; // DB: character varying(255)
  formula_ancho_interior?: string | null; // DB: character varying(255)
  formula_alto_interior?: string | null; // DB: character varying(255)

  // Descuentos perimetrales por posición (en mm)
  descuento_izquierda?: number | null; // DB: integer
  descuento_derecha?: number | null; // DB: integer
  descuento_abajo?: number | null; // DB: integer
  descuento_arriba?: number | null; // DB: integer

  mo_especifica?: number | null; // DB: integer
}

export interface RecortePerfil {
  id: number;
  elemento?: string | null;
  cantidad?: number | null;
  medida?: number | null;
  color?: number | null;
  no_usar: boolean;
  fecha_ingreso?: string | Date | null;
  archivo_obra?: string | null;
  id_barra?: number | null;
}

// ─── Obras ────────────────────────────────────────────────────────────────────

export interface Obra {
  id: number;
  apellido?: string | null;
  nombre?: string | null;
  detalles?: string | null;
  numero?: number | null;
  archivo?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  ciudad?: string | null;
}

export interface ObraTipologia {
  id: number;
  id_obra: number | null;
  cantidad: number | null;
  descripcion: string;
  ancho: number | null;
  alto: number | null;

  // Cruces Horizontales con guion bajo
  hor_1?: number | null;
  hor_2?: number | null;
  hor_3?: number | null;
  hor_4?: number | null;
  hor_5?: number | null;

  // Cruces Verticales con guion bajo
  ver_1?: number | null;
  ver_2?: number | null;
  ver_3?: number | null;
  ver_4?: number | null;
  ver_5?: number | null;
}

export interface ObraDetalle {
  id: number;

  id_obra: number | null;
  id_tipologia: number | null;
  ubicacion_en_tipo: string | null;

  ancho: number | null;
  alto: number | null;

  // Booleanos estrictos (NOT NULL DEFAULT FALSE en DB)
  mismo_relleno_panel: boolean;
  difiere_en_ancho: boolean;
  difiere_en_alto: boolean;
  ligado_ancho_tipologia: boolean;
  ligado_alto_tipologia: boolean;
  llega_al_final_ancho: boolean;
  llega_al_final_alto: boolean;

  id_extrusora: number | null;
  id_linea: number | null;
  id_tipo: number | null;
  id_producto: number | null;
  color: number | null;
  marco: number | null;
  hoja: number | null;
  mano: string | null;
  interior: number | null;
  contravidrios: number | null;
  contravidrios_ext: number | null;
  cruce: number | null;
  mosquitero: number | null;
  tela: string | null;

  tipo_cruce: number | null;
  cant_centrados_horizontal: number | null;
  cant_centrados_vertical: number | null;

  // Cruces variables
  horizontal_1?: number | null;
  horizontal_2?: number | null;
  horizontal_3?: number | null;
  vertical_1?: number | null;
  vertical_2?: number | null;
  vertical_3?: number | null;
  vertical_4?: number | null;
  vertical_5?: number | null;

  // Interiores / Rellenos
  interior_1?: string | null;
  interior_2?: string | null;
  interior_3?: string | null;
  interior_4?: string | null;

  // DVH / Cámaras
  dvh_1_1?: string | null;
  dvh_1_2?: string | null;
  camara_1?: string | null;
  dvh_2_1?: string | null;
  dvh_2_2?: string | null;
  camara_2?: string | null;
  dvh_3_1?: string | null;
  dvh_3_2?: string | null;
  camara_3?: string | null;
  dvh_4_1?: string | null;
  dvh_4_2?: string | null;
  camara_4?: string | null;

  // Revestimientos
  revest_1?: string | null;
  direcc_1?: string | null;
  revest_2?: string | null;
  direcc_2?: string | null;
  revest_3?: string | null;
  direcc_3?: string | null;
  revest_4?: string | null;
  direcc_4?: string | null;

  // Acoples
  acople_desde?: string | null;
  acople_hasta?: string | null;
  perfil_acople?: string | null;

  // Vidrios Repartidos
  vr_1?: number | null;
  hor_vr_1?: number | null;
  ver_vr_1?: number | null;
  activo_vr_1: boolean; // NOT NULL

  vr_2?: number | null;
  hor_vr_2?: number | null;
  ver_vr_2?: number | null;
  activo_vr_2: boolean; // NOT NULL

  vr_3?: number | null;
  hor_vr_3?: number | null;
  ver_vr_3?: number | null;
  activo_vr_3: boolean; // NOT NULL

  vr_4?: number | null;
  hor_vr_4?: number | null;
  ver_vr_4?: number | null;
  activo_vr_4: boolean; // NOT NULL

  // Campos Finales
  colocacion: boolean; // NOT NULL
  descri_item_manual?: string | null;
  costo_item_manual?: number | null; // Mapea correctamente a double precision
  moneda_item_manual?: number | null;
}

export interface Optimizacion {
  id: number;
  perfil?: string | null; // DB: character varying(255)
  tratamiento?: number | null; // DB: integer (ID del color/tratamiento)
  resto?: number | null; // DB: integer (Milímetros sobrantes de la barra)
  corte1?: string | null; // DB: text
  modificado?: string | null; // DB: timestamp without time zone
}

// ─── Despiece Calculado ───────────────────────────────────────────────────────

export type TipoElemento = "PF" | "AC" | "VD" | "TL" | "MO" | "MN";

export interface ObraDespiece {
  id: number;
  id_obra: number | null;
  id_tipologia: number | null;
  id_producto_en_tipo: number | null; // DB: id_producto_en_tipo (FK a obra_detalles)
  id_producto: number | null;
  tipo_elemento: TipoElemento | null;
  elemento: string | null;
  cantidad: string | null; // En DB es varchar porque puede llevar fórmulas o textos
  ancho: string | null; // En DB es varchar por posibles fracciones o variables
  alto: string | null; // En DB es varchar por posibles fracciones o variables
  color: number | null; // ID del Tratamiento
  ubicacion: string | null;
  corte: string | null; // Ej: "45°/45°", "90°/90°"

  // Campos de control con valores por defecto (Garantizados en DB)
  manual: boolean;
  error: boolean;
  anulado: boolean;
  agregado_tipo: boolean;

  // El timestamp llega del cliente de Supabase como una String ISO
  modificado?: string | null;
}

export interface CortePerfil {
  id: number;
  ancho?: number | null; // DB: integer (Medida de corte del perfil en mm)
  cantidad?: number | null; // DB: integer (Cantidad de piezas a cortar)
  elemento?: string | null; // DB: character varying(255) (Ej: "Jamba", "Zócalo", "Unal")
  color?: number | null; // DB: integer (ID del tratamiento/color de la barra)
  long_tira?: number | null; // DB: integer (Longitud comercial de la barra, ej: 6000)
  id_tipologia?: number | null; // DB: integer (FK a obra_tipologias)
  id_obra?: number | null; // DB: integer (FK a obras)
  angulo?: string | null; // DB: character varying(255) (Ej: "45°/45°", "90°/90°")
}

export interface PortapapelesItemManual {
  id: number;
  id_obra?: number | null;
  id_tipologia?: number | null;
  id_producto_en_tipo?: number | null;
  id_producto?: number | null;
  tipo_elemento?: string | null;
  elemento?: string | null;
  cantidad?: string | null;
  ancho?: string | null;
  alto?: string | null;
  color?: number | null;
  ubicacion?: string | null;
  corte?: string | null;
  manual: boolean; // DB: NOT NULL DEFAULT false
  error: boolean; // DB: NOT NULL DEFAULT false
  anulado: boolean; // DB: NOT NULL DEFAULT false
  agregado_tipo: boolean; // DB: NOT NULL DEFAULT false
}

export interface PortapapelesProducto {
  id?: number | null; // Ojo: En DB es 'integer' sin clave primaria
  ubicacion_en_tipo?: string | null;
  difiere_en_ancho: boolean;
  difiere_en_alto: boolean;
  ligado_ancho_tipologia: boolean;
  ligado_alto_tipologia: boolean;
  llega_al_final_alto: boolean;
  llega_al_final_ancho: boolean;
  id_obra?: number | null;
  id_tipologia?: number | null;
  id_extrusora?: number | null;
  id_linea?: number | null;
  id_tipo?: number | null;
  id_producto?: number | null;
  ancho?: number | null;
  alto?: number | null;
  color?: number | null;
  marco?: number | null;
  hoja?: number | null;
  mano?: string | null;
  interior?: number | null;
  contravidrios?: number | null;
  contravidrios_ext?: number | null;
  cruce?: number | null;
  mosquitero?: number | null;
  tela?: string | null;
  tipo_cruce?: number | null;
  cant_centrados_horizontal?: number | null;
  cant_centrados_vertical?: number | null;
  horizontal_1?: number | null;
  horizontal_2?: number | null;
  horizontal_3?: number | null;
  vertical_1?: number | null;
  vertical_2?: number | null;
  vertical_3?: number | null;
  vertical_4?: number | null;
  vertical_5?: number | null;
  interior_1?: string | null;
  interior_2?: string | null;
  interior_3?: string | null;
  interior_4?: string | null;
  dvh_1_1?: string | null;
  dvh_1_2?: string | null;
  camara1?: string | null; // Ojo: en portapapeles se llama 'camara1' sin el guion bajo (_)
  dvh_2_1?: string | null;
  dvh_2_2?: string | null;
  camara_2?: string | null;
  dvh_3_1?: string | null;
  dvh_3_2?: string | null;
  camara_3?: string | null;
  dvh_4_1?: string | null;
  dvh_4_2?: string | null;
  camara_4?: string | null;
  revest_1?: string | null;
  direcc_1?: string | null;
  revest_2?: string | null;
  direcc_2?: string | null;
  revest_3?: string | null;
  direcc_3?: string | null;
  revest_4?: string | null;
  direcc_4?: string | null;
  acople_desde?: string | null;
  acople_hasta?: string | null;
  perfil_acople?: string | null;
  vr_1?: number | null;
  hor_vr_1?: number | null;
  ver_vr_1?: number | null;
  activo_vr_1: boolean;
  vr_2?: number | null;
  hor_vr_2?: number | null;
  ver_vr_2?: number | null;
  activo_vr_2: boolean;
  vr_3?: number | null;
  hor_vr_3?: number | null;
  ver_vr_3?: number | null;
  activo_vr_3: boolean;
  vr_4?: number | null;
  hor_vr_4?: number | null;
  ver_vr_4?: number | null;
  activo_vr_4: boolean;
  colocacion: boolean;
  descri_item_manual?: string | null;
  costo_item_manual?: number | null; // Ojo: En DB es integer, a diferencia de obra_detalles que es double precision
  moneda_item_manual?: number | null;
}

// ------------------OPCIONES-----------------------------
export interface Opciones {
  id: number;
  ultima_obra?: number | null;

  // Margenes de ganancia o porcentajes globales
  porcentaje_sobre_perfiles?: number | null;
  porcentaje_sobre_vidrios?: number | null;
  porcentaje_sobre_accesorios?: number | null;
  porcentaje_sobre_pinturas?: number | null;
  porcentaje_sobre_telas?: number | null;
  porcentaje_sobre_mano?: number | null;
  porcentaje_sobre_mano_colocacion?: number | null;
  porcentaje_sobre_items_manuales?: number | null;
  iva?: number | null;

  // Tiempos de mano de obra en Horas (Optimización de taller)
  tiempo_marco_horas?: number | null;
  tiempo_hoja_horas?: number | null;
  tiempo_interior_horas?: number | null;
  tiempo_cruce_horas?: number | null;
  tiempo_contravidrio_horas?: number | null;
  tiempo_mosquitero_horas?: number | null;

  // Tiempos de mano de obra en Minutos
  tiempo_marco_minutos?: number | null;
  tiempo_hoja_minutos?: number | null;
  tiempo_interior_minutos?: number | null;
  tiempo_cruce_minutos?: number | null;
  tiempo_contravidrio_minutos?: number | null;
  tiempo_mosquitero_minutos?: number | null;

  // Tiempos específicos para Vidrio Repartido (VR)
  tiempo_vidrio_vr_horas?: number | null;
  tiempo_cruce_vr_horas?: number | null;
  tiempo_contorno_vr_horas?: number | null;
  tiempo_vidrio_vr_minutos?: number | null;
  tiempo_cruce_vr_minutos?: number | null;
  tiempo_contorno_vr_minutos?: number | null;

  costo_hora_taller?: number | null;

  // Datos fijos de la empresa y reportes
  logo?: string | null;
  nombre?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  encabezado_pto?: string | null;
  pie_pto?: string | null;

  // Configuración de hardware y entorno
  simulaciones?: number | null;
  sierra?: number | null;
  camara: boolean;
  pedidos_con_costo: boolean;
  presupuesto_con_fecha: boolean;
  presupuesto_encabezado: boolean;
  imagen?: string | null;
  vidrios_detalles: boolean;
  usa_recortes: boolean;

  // Tiempos complementarios de armado
  tiempo_guias_cajon_horas?: number | null;
  tiempo_guias_cajon_minutos?: number | null;
  tiempo_pano_horas?: number | null;
  tiempo_pano_minutos?: number | null;

  // Flags visuales para el desglose del presupuesto
  desglosa_interiores: boolean;
  desglosa_mosquiteros: boolean;
  desglosa_colocacion: boolean;
  desglosa_premarcos: boolean;
  desglosa_tapajuntas: boolean;
  desglosa_persianas: boolean;
  sin_graficos: boolean;
  ajuste_zoom: boolean;
  fondo?: number | null;
  noticias_inicio: boolean;
  grafico_barras: boolean;

  // Interfaz gráfica y renderizado
  color_cortes?: number | null;
  tamano_letra?: number | null;
  definicion_imagen?: number | null;
  zoom_level?: number | null;

  // Valores globales por defecto para nuevas aberturas
  extrusora_defecto?: number | null;
  linea_defecto?: number | null;
  color_defecto?: number | null;
  vidrio_defecto?: string | null;

  // Control de impresión en hojas de producción y talleres
  detalles_producto: boolean;
  orden_con_perfiles: boolean;
  orden_con_accesorios: boolean;
  orden_con_interiores: boolean;
  orden_con_colores: boolean;
  tipos_vidrios: boolean;

  // Cotas y textos en el Canvas/Dibujo técnico del Frontend
  cotas_prod?: number | null;
  cotas_hor_ver?: number | null;
  texto_interno?: number | null;
  desglose_tipo: boolean;
  color_presu?: number | null;
  cant_decimales?: number | null;

  // Parámetros de visualización en el reporte PDF / Presupuesto para el cliente
  cotas_prod_presu?: number | null;
  cotas_hor_ver_presu?: number | null;
  texto_interno_presu?: number | null;
  resolucion_presu?: number | null;
  sin_cotas_presu: boolean;
  tipos_hojas_independientes: boolean;
  no_considerar_minimos: boolean;
}

export interface EncabezadoPie {
  id: number;
  descripcion?: string | null;
  encabezado?: string | null;
  pie?: string | null;
  bloqueado: boolean;
}

export interface Porcentajes {
  id: number;
  descripcion?: string | null;
  iva?: number | null;
  perfiles?: number | null;
  tratamientos?: number | null;
  accesorios?: number | null;
  vidrios?: number | null;
  telas?: number | null;
  taller?: number | null;
  colocacion?: number | null;
  manuales?: number | null;
  bloqueado: boolean;
  desperdicio_perfiles?: number | null;
  despercidio_pinturas?: number | null;
}

// ─── Usuarios, Roles y Permisos ────────────────────────────────────────────────

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string | null;
  bloqueado: boolean;
}

export type SeccionPermiso =
  | "inicio"
  | "obras"
  | "productos"
  | "catalogos"
  | "opciones"
  | "usuarios";

export interface Permiso {
  id: number;
  id_rol: number;
  seccion: SeccionPermiso;
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

export type AccionPermiso = "ver" | "crear" | "editar" | "eliminar";

export interface Usuario {
  id: string; // uuid (= auth.users.id)
  nombre: string;
  email: string;
  id_rol: number;
  activo: boolean;
  ultimo_acceso?: string | Date | null;
  creado_en?: string | Date | null;
  // Relación embebida (Supabase: usuarios.select("*, roles(*)"))
  roles?: Rol | null;
}

// ─── UI / Estado ──────────────────────────────────────────────────────────────

export type NavSection =
  | "inicio"
  | "obras"
  | "productos"
  | "catalogos"
  | "opciones"
  | "usuarios";

export type CatalogoTab =
  | "perfiles"
  | "accesorios"
  | "vidrios"
  | "tratamientos"
  | "extrusoras"
  | "lineas"
  | "monedas"
  | "tipos-interior";

// ─── Aliases de compatibilidad (tipos genéricos para despiece) ────────────────

/**
 * Tipo genérico que representa cualquier fila de las tablas despiece_perfiles_*
 * Contiene los campos comunes a todos los niveles (marco, hoja, mosquitero, VR, contravidrio).
 */
export type DespiecePerfil =
  | DespiecePerfilMarco
  | DespiecePerfilHoja
  | DespiecePerfilMosquitero
  | DespiecePerfilContravidrio
  | DespiecePerfilVidrioRepartido;

/**
 * Tipo genérico que representa cualquier fila de las tablas despiece_accesorios_*
 * Contiene los campos comunes a todos los niveles.
 */
export type DespieceAccesorio =
  | DespieceAccesorioMarco
  | DespieceAccesorioHoja
  | DespieceAccesorioInterior
  | DespieceAccesorioCruce
  | DespieceAccesorioContravidrio
  | DespieceAccesorioContravidrioExt
  | DespieceAccesorioMosquitero
  | DespieceAccesorioVidrioRepartido;

/** @deprecated Usar `Cruce` */
export type Cruces = Cruce;

/** @deprecated Usar `VidrioRepartido` */
export type VidRepartido = VidrioRepartido;

/** @deprecated Usar `DespieceCruce` */
export type DespieceCruces = DespieceCruce;
