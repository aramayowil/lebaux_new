import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Perfil,
  Accesorio,
  Vidrio,
  Tratamiento,
  Extrusora,
  Linea,
  Moneda,
  TipoInterior,
  Opciones,
} from "@/types";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_EXTRUSORAS: Extrusora[] = [
  { id: 1, extrusora: "Aluar", bloqueado: false },
  { id: 2, extrusora: "Proal", bloqueado: false },
  { id: 3, extrusora: "Cortizo", bloqueado: false },
];

const MOCK_LINEAS: Linea[] = [
  { id: 1, id_extrusora: 1, linea: "Modena", bloqueado: false },
  { id: 2, id_extrusora: 1, linea: "Herrero", bloqueado: false },
  { id: 3, id_extrusora: 1, linea: "Doble", bloqueado: false },
  { id: 4, id_extrusora: 2, linea: "Serie 25", bloqueado: false },
  { id: 5, id_extrusora: 2, linea: "Serie 30", bloqueado: false },
];

const MOCK_MONEDAS: Moneda[] = [
  {
    id: 1,
    descripcion: "Peso argentino",
    cotizacion: 1,
    bloqueado: false,
    simbolo: "$",
  },
  {
    id: 2,
    descripcion: "Dólar USD",
    cotizacion: 1035,
    bloqueado: false,
    simbolo: "U$S",
  },
];

const MOCK_TIPOS_INTERIOR: TipoInterior[] = [
  { id: 1, descripcion: "Vidrio crudo", bloqueado: false },
  { id: 2, descripcion: "Vidrio laminado", bloqueado: false },
  { id: 3, descripcion: "Vidrio templado", bloqueado: false },
  { id: 4, descripcion: "Panel compuesto", bloqueado: false },
  { id: 5, descripcion: "Tela mosquitera", bloqueado: true },
  { id: 6, descripcion: "Melamina", bloqueado: false },
  { id: 7, descripcion: "Policarbonato alveolar", bloqueado: false },
  { id: 8, descripcion: "Policarbonato compacto", bloqueado: false },
  { id: 9, descripcion: "Poliestireno gofrado", bloqueado: false },
  { id: 10, descripcion: "Acrílico", bloqueado: false },
  { id: 11, descripcion: "Otros", bloqueado: true },
];

const MOCK_PERFILES: Perfil[] = [
  {
    id: 1,
    nro_perfil: "001",
    id_linea: 1,
    descri: "Marco inferior",
    peso_metro: 0.42,
    long_tira: 6000,
    precio_kg: 850,
    id_moneda: 1,
    cubre: 40,
    bloqueado: false,
  },
  {
    id: 2,
    nro_perfil: "002",
    id_linea: 1,
    descri: "Marco superior",
    peso_metro: 0.38,
    long_tira: 6000,
    precio_kg: 850,
    id_moneda: 1,
    cubre: 40,
    bloqueado: false,
  },
  {
    id: 3,
    nro_perfil: "003",
    id_linea: 1,
    descri: "Marco lateral",
    peso_metro: 0.45,
    long_tira: 6000,
    precio_kg: 850,
    id_moneda: 1,
    cubre: 38,
    bloqueado: false,
  },
  {
    id: 4,
    nro_perfil: "004",
    id_linea: 1,
    descri: "Hoja inferior",
    peso_metro: 0.35,
    long_tira: 6000,
    precio_kg: 850,
    id_moneda: 1,
    cubre: 35,
    bloqueado: false,
  },
  {
    id: 5,
    nro_perfil: "005",
    id_linea: 1,
    descri: "Hoja superior",
    peso_metro: 0.32,
    long_tira: 6000,
    precio_kg: 850,
    id_moneda: 1,
    cubre: 35,
    bloqueado: false,
  },
  {
    id: 6,
    nro_perfil: "006",
    id_linea: 1,
    descri: "Contravidrio",
    peso_metro: 0.18,
    long_tira: 6000,
    precio_kg: 850,
    id_moneda: 1,
    cubre: 12,
    bloqueado: false,
  },
  {
    id: 7,
    nro_perfil: "101",
    id_linea: 4,
    descri: "Marco Serie 25 INF",
    peso_metro: 0.51,
    long_tira: 6500,
    precio_kg: 900,
    id_moneda: 1,
    cubre: 45,
    bloqueado: false,
  },
];

const MOCK_ACCESORIOS: Accesorio[] = [
  {
    id: 1,
    cod_parte: "ESP-001",
    descri: "Espejo doble contacto",
    precio: 150,
    contenido: 1,
    unidad: 0,
    id_moneda: 1,
    bloqueado: false,
  },
  {
    id: 2,
    cod_parte: "PIV-001",
    descri: "Pivote inferior",
    precio: 220,
    contenido: 1,
    unidad: 0,
    id_moneda: 1,
    bloqueado: false,
  },
  {
    id: 3,
    cod_parte: "PIV-002",
    descri: "Pivote superior",
    precio: 180,
    contenido: 1,
    unidad: 0,
    id_moneda: 1,
    bloqueado: false,
  },
  {
    id: 4,
    cod_parte: "RUL-001",
    descri: "Ruliman x4",
    precio: 380,
    contenido: 4,
    unidad: 0,
    id_moneda: 1,
    bloqueado: false,
  },
  {
    id: 5,
    cod_parte: "SEL-001",
    descri: "Sellador silicona blanco",
    precio: 12,
    contenido: 1,
    unidad: 1,
    id_moneda: 1,
    bloqueado: false,
  },
  {
    id: 6,
    cod_parte: "TIR-001",
    descri: "Tirador cromo mate",
    precio: 450,
    contenido: 1,
    unidad: 0,
    id_moneda: 1,
    bloqueado: false,
  },
  {
    id: 7,
    cod_parte: "COR-001",
    descri: "Corredor bajo",
    precio: 95,
    contenido: 1,
    unidad: 0,
    id_moneda: 1,
    bloqueado: false,
  },
];

const MOCK_VIDRIOS: Vidrio[] = [
  // color como número RGB igual que la DB (16777215 = blanco/incoloro, etc.)
  {
    id: 1,
    codigo: "FLOAT4",
    descri: "Float 4mm incoloro",
    precio: 440,
    base: 3600,
    altura: 2500,
    espesor: 4,
    tipo_rev: 1,
    id_moneda: 1,
    color: 16777147,
    bloqueado: false,
  },
  {
    id: 2,
    codigo: "FLOAT6",
    descri: "Float 6mm incoloro",
    precio: 850,
    base: 3600,
    altura: 2500,
    espesor: 6,
    tipo_rev: 1,
    id_moneda: 1,
    color: 16777147,
    bloqueado: false,
  },
  {
    id: 3,
    codigo: "FGRIS6",
    descri: "Float 6mm gris",
    precio: 1181,
    base: 2500,
    altura: 3600,
    espesor: 6,
    tipo_rev: 1,
    id_moneda: 1,
    color: 12632256,
    bloqueado: false,
  },
  {
    id: 4,
    codigo: "ESPBR4",
    descri: "Espejo bronce 4mm",
    precio: 1478,
    base: 2500,
    altura: 3600,
    espesor: 4,
    tipo_rev: 1,
    id_moneda: 1,
    color: 16777150,
    bloqueado: false,
  },
  {
    id: 5,
    codigo: "TELAI",
    descri: "Tela aluminizada",
    precio: 252,
    base: 1000,
    altura: 1000,
    espesor: 1,
    tipo_rev: 5,
    id_moneda: 1,
    color: 3618615,
    bloqueado: false,
  },
];

const MOCK_TRATAMIENTOS: Tratamiento[] = [
  {
    id: 1,
    descripcion: "Anodizado plata",
    precioPorKilo: 280,
    color: "#C0C0C0",
    moneda: 1,
    bloqueado: false,
  },
  {
    id: 2,
    descripcion: "Anodizado bronce",
    precioPorKilo: 310,
    color: "#8B6914",
    moneda: 1,
    bloqueado: false,
  },
  {
    id: 3,
    descripcion: "Anodizado negro",
    precioPorKilo: 320,
    color: "#1a1a1a",
    moneda: 1,
    bloqueado: false,
  },
  {
    id: 4,
    descripcion: "Pintado blanco",
    precioPorKilo: 390,
    color: "#FFFFFF",
    moneda: 1,
    bloqueado: false,
  },
  {
    id: 5,
    descripcion: "Pintado champagne",
    precioPorKilo: 395,
    color: "#F7E7CE",
    moneda: 1,
    bloqueado: false,
  },
];

const DEFAULT_OPCIONES: Opciones = {
  id: 1,
  iva: 21,
  porcentajeSobrePerfiles: 30,
  porcentajeSobreVidrios: 20,
  porcentajeSobreAccesorios: 25,
  porcentajeSobrePinturas: 20,
  porcentajeSobreTelas: 20,
  porcentajeSobreMano: 15,
  porcentajeSobreManoColocacion: 10,
  porcentajeSobreItemsManuales: 0,
  costoHoraTaller: 2500,
  tiempoMarcoHoras: 0,
  tiempoMarcoMinutos: 12,
  tiempoHojaHoras: 0,
  tiempoHojaMinutos: 8,
  tiempoInteriorHoras: 0,
  tiempoInteriorMinutos: 5,
  tiempoCruceHoras: 0,
  tiempoCruceMinutos: 6,
  tiempoContravidrioHoras: 0,
  tiempoContravidrioMinutos: 4,
  tiempoMosquiteroHoras: 0,
  tiempoMosquiteroMinutos: 10,
  nombre: "Mi empresa",
  direccion: "",
  telefono: "",
  email: "",
  encabezadoDePto: "PRESUPUESTO",
  pieDePto: "Precios sujetos a variación sin previo aviso.",
};

// ─── Store ────────────────────────────────────────────────────────────────────

interface CatalogosState {
  perfiles: Perfil[];
  accesorios: Accesorio[];
  vidrios: Vidrio[];
  tratamientos: Tratamiento[];
  extrusoras: Extrusora[];
  lineas: Linea[];
  monedas: Moneda[];
  tiposInterior: TipoInterior[];
  opciones: Opciones;

  // Acciones
  setPerfil: (p: Perfil) => void;
  deletePerfil: (nroPerfil: string) => void;
  setAccesorio: (a: Accesorio) => void;
  deleteAccesorio: (cod: string) => void;
  setVidrio: (v: Vidrio) => void;
  deleteVidrio: (cod: string) => void;
  setTratamiento: (t: Tratamiento) => void;
  deleteTratamiento: (id: number) => void;
  setExtrusora: (e: Extrusora) => void;
  setLinea: (l: Linea) => void;
  setMoneda: (m: Moneda) => void;
  setOpciones: (o: Partial<Opciones>) => void;

  // Helper: cotización a pesos
  toPesos: (precio: number, monedaId: number) => number;
}

export const useCatalogosStore = create<CatalogosState>()(
  persist(
    (set, get) => ({
      perfiles: MOCK_PERFILES,
      accesorios: MOCK_ACCESORIOS,
      vidrios: MOCK_VIDRIOS,
      tratamientos: MOCK_TRATAMIENTOS,
      extrusoras: MOCK_EXTRUSORAS,
      lineas: MOCK_LINEAS,
      monedas: MOCK_MONEDAS,
      tiposInterior: MOCK_TIPOS_INTERIOR,
      opciones: DEFAULT_OPCIONES,

      setPerfil: (p) =>
        set((s) => ({
          perfiles: s.perfiles.some((x) => x.nro_perfil === p.nro_perfil)
            ? s.perfiles.map((x) => (x.nro_perfil === p.nro_perfil ? p : x))
            : [...s.perfiles, p],
        })),
      deletePerfil: (nro) =>
        set((s) => ({
          perfiles: s.perfiles.filter((x) => x.nro_perfil !== nro),
        })),

      setAccesorio: (a) =>
        set((s) => ({
          accesorios: s.accesorios.some((x) => x.cod_parte === a.cod_parte)
            ? s.accesorios.map((x) => (x.cod_parte === a.cod_parte ? a : x))
            : [...s.accesorios, a],
        })),
      deleteAccesorio: (cod) =>
        set((s) => ({
          accesorios: s.accesorios.filter((x) => x.cod_parte !== cod),
        })),

      setVidrio: (v) =>
        set((s) => ({
          vidrios: s.vidrios.some((x) => x.codigo === v.codigo)
            ? s.vidrios.map((x) => (x.codigo === v.codigo ? v : x))
            : [...s.vidrios, v],
        })),
      deleteVidrio: (cod) =>
        set((s) => ({ vidrios: s.vidrios.filter((x) => x.codigo !== cod) })),

      setTratamiento: (t) =>
        set((s) => ({
          tratamientos: s.tratamientos.some((x) => x.id === t.id)
            ? s.tratamientos.map((x) => (x.id === t.id ? t : x))
            : [...s.tratamientos, t],
        })),
      deleteTratamiento: (id) =>
        set((s) => ({
          tratamientos: s.tratamientos.filter((x) => x.id !== id),
        })),

      setExtrusora: (e) =>
        set((s) => ({
          extrusoras: s.extrusoras.some((x) => x.id === e.id)
            ? s.extrusoras.map((x) => (x.id === e.id ? e : x))
            : [...s.extrusoras, e],
        })),
      setLinea: (l) =>
        set((s) => ({
          lineas: s.lineas.some((x) => x.id === l.id)
            ? s.lineas.map((x) => (x.id === l.id ? l : x))
            : [...s.lineas, l],
        })),
      setMoneda: (m) =>
        set((s) => ({
          monedas: s.monedas.some((x) => x.id === m.id)
            ? s.monedas.map((x) => (x.id === m.id ? m : x))
            : [...s.monedas, m],
        })),
      setOpciones: (o) => set((s) => ({ opciones: { ...s.opciones, ...o } })),

      toPesos: (precio, monedaId) => {
        const m = get().monedas.find((x) => x.id === monedaId);
        return precio * (m?.cotizacion ?? 1);
      },
    }),
    { name: "open2d2-catalogos" },
  ),
);
