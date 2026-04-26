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
  { id: 1, idExtrusora: 1, linea: "Modena", bloqueado: false },
  { id: 2, idExtrusora: 1, linea: "Herrero", bloqueado: false },
  { id: 3, idExtrusora: 1, linea: "Doble", bloqueado: false },
  { id: 4, idExtrusora: 2, linea: "Serie 25", bloqueado: false },
  { id: 5, idExtrusora: 2, linea: "Serie 30", bloqueado: false },
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
    nroPerfil: "001",
    idLinea: 1,
    descri: "Marco inferior",
    pesoMetro: 0.42,
    longTira: 6000,
    precioKg: 850,
    moneda: 1,
    cubre: 40,
    bloqueado: false,
  },
  {
    nroPerfil: "002",
    idLinea: 1,
    descri: "Marco superior",
    pesoMetro: 0.38,
    longTira: 6000,
    precioKg: 850,
    moneda: 1,
    cubre: 40,
    bloqueado: false,
  },
  {
    nroPerfil: "003",
    idLinea: 1,
    descri: "Marco lateral",
    pesoMetro: 0.45,
    longTira: 6000,
    precioKg: 850,
    moneda: 1,
    cubre: 38,
    bloqueado: false,
  },
  {
    nroPerfil: "004",
    idLinea: 1,
    descri: "Hoja inferior",
    pesoMetro: 0.35,
    longTira: 6000,
    precioKg: 850,
    moneda: 1,
    cubre: 35,
    bloqueado: false,
  },
  {
    nroPerfil: "005",
    idLinea: 1,
    descri: "Hoja superior",
    pesoMetro: 0.32,
    longTira: 6000,
    precioKg: 850,
    moneda: 1,
    cubre: 35,
    bloqueado: false,
  },
  {
    nroPerfil: "006",
    idLinea: 1,
    descri: "Contravidrio",
    pesoMetro: 0.18,
    longTira: 6000,
    precioKg: 850,
    moneda: 1,
    cubre: 12,
    bloqueado: false,
  },
  {
    nroPerfil: "101",
    idLinea: 4,
    descri: "Marco Serie 25 INF",
    pesoMetro: 0.51,
    longTira: 6500,
    precioKg: 900,
    moneda: 1,
    cubre: 45,
    bloqueado: false,
  },
];

const MOCK_ACCESORIOS: Accesorio[] = [
  {
    codParte: "ESP-001",
    descri: "Espejo doble contacto",
    precio: 150,
    contenido: 1,
    unidad: 0,
    moneda: 1,
    bloqueado: false,
  },
  {
    codParte: "PIV-001",
    descri: "Pivote inferior",
    precio: 220,
    contenido: 1,
    unidad: 0,
    moneda: 1,
    bloqueado: false,
  },
  {
    codParte: "PIV-002",
    descri: "Pivote superior",
    precio: 180,
    contenido: 1,
    unidad: 0,
    moneda: 1,
    bloqueado: false,
  },
  {
    codParte: "RUL-001",
    descri: "Ruliman x4",
    precio: 380,
    contenido: 4,
    unidad: 0,
    moneda: 1,
    bloqueado: false,
  },
  {
    codParte: "SEL-001",
    descri: "Sellador silicona blanco",
    precio: 12,
    contenido: 1,
    unidad: 1,
    moneda: 1,
    bloqueado: false,
  },
  {
    codParte: "TIR-001",
    descri: "Tirador cromo mate",
    precio: 450,
    contenido: 1,
    unidad: 0,
    moneda: 1,
    bloqueado: false,
  },
  {
    codParte: "COR-001",
    descri: "Corredor bajo",
    precio: 95,
    contenido: 1,
    unidad: 0,
    moneda: 1,
    bloqueado: false,
  },
];

const MOCK_VIDRIOS: Vidrio[] = [
  // color como número RGB igual que la DB (16777215 = blanco/incoloro, etc.)
  {
    codigo: "FLOAT4",
    descri: "Float 4mm incoloro",
    precio: 440,
    base: 3600,
    altura: 2500,
    espesor: 4,
    tipoRev: 1,
    moneda: 1,
    color: 16777147,
    bloqueado: false,
  },
  {
    codigo: "FLOAT6",
    descri: "Float 6mm incoloro",
    precio: 850,
    base: 3600,
    altura: 2500,
    espesor: 6,
    tipoRev: 1,
    moneda: 1,
    color: 16777147,
    bloqueado: false,
  },
  {
    codigo: "FGRIS6",
    descri: "Float 6mm gris",
    precio: 1181,
    base: 2500,
    altura: 3600,
    espesor: 6,
    tipoRev: 1,
    moneda: 1,
    color: 12632256,
    bloqueado: false,
  },
  {
    codigo: "ESPBR4",
    descri: "Espejo bronce 4mm",
    precio: 1478,
    base: 2500,
    altura: 3600,
    espesor: 4,
    tipoRev: 1,
    moneda: 1,
    color: 16777150,
    bloqueado: false,
  },
  {
    codigo: "TELAI",
    descri: "Tela aluminizada",
    precio: 252,
    base: 1000,
    altura: 1000,
    espesor: 1,
    tipoRev: 5,
    moneda: 1,
    color: 3618615,
    bloqueado: false,
  },
];

const MOCK_TRATAMIENTOS: Tratamiento[] = [
  {
    id: 1,
    descripcion: "Pintado blanco",
    precioPorKilo: 390,
    color: "#DBDBDB",
    moneda: 1,
    bloqueado: false,
  },
  {
    id: 2,
    descripcion: "Anodizado negro",
    precioPorKilo: 320,
    color: "#1a1a1a",
    moneda: 1,
    bloqueado: false,
  },
  {
    id: 3,
    descripcion: "Anodizado plata",
    precioPorKilo: 280,
    color: "#C0C0C0",
    moneda: 1,
    bloqueado: false,
  },
  {
    id: 4,
    descripcion: "Anodizado bronce",
    precioPorKilo: 310,
    color: "#8B6914",
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
          perfiles: s.perfiles.some((x) => x.nroPerfil === p.nroPerfil)
            ? s.perfiles.map((x) => (x.nroPerfil === p.nroPerfil ? p : x))
            : [...s.perfiles, p],
        })),
      deletePerfil: (nro) =>
        set((s) => ({
          perfiles: s.perfiles.filter((x) => x.nroPerfil !== nro),
        })),

      setAccesorio: (a) =>
        set((s) => ({
          accesorios: s.accesorios.some((x) => x.codParte === a.codParte)
            ? s.accesorios.map((x) => (x.codParte === a.codParte ? a : x))
            : [...s.accesorios, a],
        })),
      deleteAccesorio: (cod) =>
        set((s) => ({
          accesorios: s.accesorios.filter((x) => x.codParte !== cod),
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
