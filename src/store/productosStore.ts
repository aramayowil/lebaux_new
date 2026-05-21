import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Producto,
  Marco,
  Hoja,
  Interior,
  Contravidrio,
  ContravidrioExterior,
  Cruces,
  Mosquitero,
  VidRepartido,
  DespiecePerfil,
  DespiecePerfilContravidrio,
  DespieceAccesorio,
  DespieceInterior,
  DespieceCruces,
  DespieceVR,
  DespieceInteriorMosquitero,
} from "@/types";

// ─── IDs auto-increment ──────────────────────────────────────────────────────
let nextProductoId = 10;
let nextMarcoId = 10;
let nextHojaId = 10;
let nextInteriorId = 10;
let nextContrId = 10;
let nextCrucesId = 10;
let nextMosqId = 10;
let nextVRId = 10;
let nextDespPerfId = 100;
let nextDespAccId = 100;
let nextDespIntId = 100;
let nextDespCrucesId = 100;
let nextDespVRId = 100;
let nextDespMosqId = 100;

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_TIPOS: { id: number; formaTipo: string; orden: number }[] = [
  { id: 1, formaTipo: "Corrediza", orden: 1 },
  { id: 2, formaTipo: "Banderola", orden: 2 },
  { id: 3, formaTipo: "Desplazable", orden: 3 },
  { id: 4, formaTipo: "Oscilobatiente", orden: 4 },
  { id: 5, formaTipo: "Paño Fijo", orden: 5 },
  { id: 6, formaTipo: "Proyectante", orden: 6 },
  { id: 7, formaTipo: "Ventana de abrir", orden: 7 },
  { id: 8, formaTipo: "Puerta", orden: 8 },
  { id: 9, formaTipo: "Rebatible", orden: 9 },
];

const MOCK_PRODUCTOS: Producto[] = [
  {
    id: 1,
    descripcion: "Ventana corrediza 2 hojas",
    id_extrusora: 1,
    id_linea: 1,
    id_tipo: 1,
  },
  {
    id: 2,
    descripcion: "Ventana corrediza 4 hojas",
    id_extrusora: 1,
    id_linea: 1,
    id_tipo: 1,
  },
  {
    id: 3,
    descripcion: "Puerta balcón 1 hoja",
    id_extrusora: 1,
    id_linea: 2,
    id_tipo: 2,
  },
];

const MOCK_MARCOS: Marco[] = [
  {
    id: 1,
    id_producto: 1,
    descripcion: "Marco estándar",
    predeterminado: true,
  },
  {
    id: 2,
    id_producto: 2,
    descripcion: "Marco estándar 4h",
    predeterminado: true,
  },
  {
    id: 3,
    id_producto: 3,
    descripcion: "Marco puerta balcón",
    predeterminado: true,
  },
];

const MOCK_HOJAS: Hoja[] = [
  {
    id: 1,
    id_marco: 1,
    descripcion: "Hoja móvil",
    cantidad: 2,
    predeterminado: true,
  },
  {
    id: 2,
    id_marco: 2,
    descripcion: "Hoja móvil 4h",
    cantidad: 4,
    predeterminado: true,
  },
  {
    id: 3,
    id_marco: 3,
    descripcion: "Hoja puerta",
    cantidad: 1,
    predeterminado: true,
  },
];

// Interior: solo datos base. Las fórmulas/descuentos están en DespieceInterior (tabla separada en DB)
const MOCK_INTERIORES: Interior[] = [
  { id: 1, id_hoja: 1, descripcion: "Interior estándar", predeterminado: true },
  { id: 2, id_hoja: 3, descripcion: "Interior puerta", predeterminado: true },
];

// DespieceInterior: fórmulas y descuentos del interior (tabla "Despiece interior" en DB)
const MOCK_DESPIECE_INTERIORES: DespieceInterior[] = [
  {
    id: 1,
    id_interior: 1,
    formula_cantidad_interiores: "1",
    formula_ancho_interior: "ancho/hojas - 10",
    formula_alto_interior: "alto - 60",
    descuento_izquierda: 5,
    descuento_derecha: 5,
    descuento_abajo: 5,
    descuento_arriba: 5,
  },
  {
    id: 2,
    id_interior: 2,
    formula_cantidad_interiores: "1",
    formula_ancho_interior: "ancho - 60",
    formula_alto_interior: "alto - 80",
    descuento_izquierda: 5,
    descuento_derecha: 5,
    descuento_abajo: 10,
    descuento_arriba: 5,
  },
];

const MOCK_DESPIECE_PERFILES_MARCO: DespiecePerfil[] = [
  {
    id: 1,
    id_parent: 1,
    id_perfil: 1,
    formula_cantidad: "2",
    formula_perfil: "ancho",
    angulo: "45",
  },
  {
    id: 2,
    id_parent: 1,
    id_perfil: 2,
    formula_cantidad: "2",
    formula_perfil: "alto",
    angulo: "45",
  },
];

const MOCK_DESPIECE_PERFILES_HOJA: DespiecePerfil[] = [
  {
    id: 3,
    id_parent: 1,
    id_perfil: 4,
    formula_cantidad: "2*hojas",
    formula_perfil: "ancho/hojas - 10",
    angulo: "45",
  },
  {
    id: 4,
    id_parent: 1,
    id_perfil: 5,
    formula_cantidad: "2*hojas",
    formula_perfil: "alto - 60",
    angulo: "45",
  },
];

const MOCK_DESPIECE_ACCESORIOS_MARCO: DespieceAccesorio[] = [
  {
    id: 1,
    id_parent: 1,
    id_accesorio: 1,
    // id_accesorio: "RUL-001",
    formula_cantidad: "hojas * 2",
  },
  { id: 2, id_parent: 1, id_accesorio: 2, formula_cantidad: "4" },
];

// ─── State types ─────────────────────────────────────────────────────────────

interface ProductosState {
  tipos: { id: number; formaTipo: string; orden: number }[];
  productos: Producto[];
  marcos: Marco[];
  hojas: Hoja[];
  interiores: Interior[];
  contravidrios: Contravidrio[];
  contravidriosExt: ContravidrioExterior[];
  cruces: Cruces[];
  mosquiteros: Mosquitero[];
  vidRepartidos: VidRepartido[];

  // Despiece perfiles: Marco, Hoja, Mosquitero (estructura simple)
  despiecePerfilesMarco: DespiecePerfil[];
  despiecePerfilesHoja: DespiecePerfil[];
  despiecePerfilesMosquitero: DespiecePerfil[];

  // Despiece perfiles: Contravidrio Int. y Ext. (estructura propia con fórmulas del CV)
  despiecePerfilesContravidrio: DespiecePerfilContravidrio[];
  despiecePerfilesContravidrioExt: DespiecePerfilContravidrio[];

  // Despiece cruces (perfil + fórmulas del cruce — tabla "Despiece cruces")
  despieceCruces: DespieceCruces[];

  // Despiece VR (perfil contorno + cruce + interiores del VR)
  despieceVR: DespieceVR[];

  // Despiece interiores (fórmulas y descuentos — tabla "Despiece interior")
  despieceInteriores: DespieceInterior[];
  despieceInterioresMosquitero: DespieceInteriorMosquitero[];

  // Despiece accesorios
  despieceAccesoriosMarco: DespieceAccesorio[];
  despieceAccesoriosHoja: DespieceAccesorio[];
  despieceAccesoriosInterior: DespieceAccesorio[];
  despieceAccesoriosContravidrio: DespieceAccesorio[];
  despieceAccesoriosCruces: DespieceAccesorio[];
  despieceAccesoriosMosquitero: DespieceAccesorio[];

  // ── Productos ──
  addProducto: (p: Omit<Producto, "id">) => Producto;
  updateProducto: (id: number, data: Partial<Producto>) => void;
  deleteProducto: (id: number) => void;

  // ── Marcos ──
  addMarco: (m: Omit<Marco, "id">) => Marco;
  updateMarco: (id: number, data: Partial<Marco>) => void;
  deleteMarco: (id: number) => void;
  getMarcosByProducto: (idProducto: number) => Marco[];

  // ── Hojas ──
  addHoja: (h: Omit<Hoja, "id">) => Hoja;
  updateHoja: (id: number, data: Partial<Hoja>) => void;
  deleteHoja: (id: number) => void;
  getHojasByMarco: (idMarco: number) => Hoja[];

  // ── Interiores ──
  addInterior: (i: Omit<Interior, "id">) => Interior;
  updateInterior: (id: number, data: Partial<Interior>) => void;
  deleteInterior: (id: number) => void;
  getInterioresByHoja: (idHoja: number) => Interior[];

  // ── DespieceInterior (fórmulas del interior — tabla separada) ──
  addDespieceInterior: (d: Omit<DespieceInterior, "id">) => DespieceInterior;
  updateDespieceInterior: (id: number, data: Partial<DespieceInterior>) => void;
  deleteDespieceInterior: (id: number) => void;
  getDespieceInteriorByInterior: (
    idInterior: number,
  ) => DespieceInterior | undefined;

  // ── Contravidrios Int. ──
  addContravidrio: (c: Omit<Contravidrio, "id">) => Contravidrio;
  updateContravidrio: (id: number, data: Partial<Contravidrio>) => void;
  deleteContravidrio: (id: number) => void;
  getContravidriosByInterior: (idInterior: number) => Contravidrio[];

  // ── Contravidrios Ext. ──
  addContravidrioExt: (
    c: Omit<ContravidrioExterior, "id">,
  ) => ContravidrioExterior;
  updateContravidrioExt: (
    id: number,
    data: Partial<ContravidrioExterior>,
  ) => void;
  deleteContravidrioExt: (id: number) => void;
  getContravidriosExtByInterior: (idInterior: number) => ContravidrioExterior[];

  // ── Despiece perfiles contravidrio ──
  addDespiecePerfilContravidrio: (
    nivel: "contravidrio" | "contravidrioExt",
    d: Omit<DespiecePerfilContravidrio, "id">,
  ) => void;
  updateDespiecePerfilContravidrio: (
    nivel: "contravidrio" | "contravidrioExt",
    id: number,
    data: Partial<DespiecePerfilContravidrio>,
  ) => void;
  deleteDespiecePerfilContravidrio: (
    nivel: "contravidrio" | "contravidrioExt",
    id: number,
  ) => void;
  getDespiecePerfilesContravidrio: (
    nivel: "contravidrio" | "contravidrioExt",
    idContravidrio: number,
  ) => DespiecePerfilContravidrio[];

  // ── Cruces ──
  addCruces: (c: Omit<Cruces, "id">) => Cruces;
  updateCruces: (id: number, data: Partial<Cruces>) => void;
  deleteCruces: (id: number) => void;
  getCrucesByInterior: (idInterior: number) => Cruces[];

  // ── DespieceCruces (perfil + fórmulas del cruce) ──
  addDespieceCruces: (d: Omit<DespieceCruces, "id">) => DespieceCruces;
  updateDespieceCruces: (id: number, data: Partial<DespieceCruces>) => void;
  deleteDespieceCruces: (id: number) => void;
  getDespieceCrucesByCruces: (idCruces: number) => DespieceCruces | undefined;

  // ── Mosquiteros ──
  addMosquitero: (m: Omit<Mosquitero, "id">) => Mosquitero;
  updateMosquitero: (id: number, data: Partial<Mosquitero>) => void;
  deleteMosquitero: (id: number) => void;
  getMosquiterosByHoja: (idHoja: number) => Mosquitero[];

  // ── DespieceInteriorMosquitero ──
  addDespieceInteriorMosquitero: (
    d: Omit<DespieceInteriorMosquitero, "id">,
  ) => DespieceInteriorMosquitero;
  updateDespieceInteriorMosquitero: (
    id: number,
    data: Partial<DespieceInteriorMosquitero>,
  ) => void;
  deleteDespieceInteriorMosquitero: (id: number) => void;
  getDespieceInteriorMosquiteroByMosquitero: (
    idMosquitero: number,
  ) => DespieceInteriorMosquitero | undefined;

  // ── VidRepartidos ──
  addVidRepartido: (v: Omit<VidRepartido, "id">) => VidRepartido;
  updateVidRepartido: (id: number, data: Partial<VidRepartido>) => void;
  deleteVidRepartido: (id: number) => void;
  getVidRepartidosByInterior: (idInterior: number) => VidRepartido[];

  // ── DespieceVR ──
  addDespieceVR: (d: Omit<DespieceVR, "id">) => DespieceVR;
  updateDespieceVR: (id: number, data: Partial<DespieceVR>) => void;
  deleteDespieceVR: (id: number) => void;
  getDespieceVRByVR: (idVR: number) => DespieceVR | undefined;

  // ── Despiece perfiles (marco / hoja / mosquitero) ──
  addDespiecePerfil: (
    nivel: "marco" | "hoja" | "mosquitero",
    d: Omit<DespiecePerfil, "id">,
  ) => void;
  updateDespiecePerfil: (
    nivel: "marco" | "hoja" | "mosquitero",
    id: number,
    data: Partial<DespiecePerfil>,
  ) => void;
  deleteDespiecePerfil: (
    nivel: "marco" | "hoja" | "mosquitero",
    id: number,
  ) => void;
  getDespiecePerfiles: (
    nivel: "marco" | "hoja" | "mosquitero",
    idParent: number,
  ) => DespiecePerfil[];

  // ── Despiece accesorios ──
  addDespieceAccesorio: (
    nivel:
      | "marco"
      | "hoja"
      | "interior"
      | "contravidrio"
      | "cruces"
      | "mosquitero",
    d: Omit<DespieceAccesorio, "id">,
  ) => void;
  updateDespieceAccesorio: (
    nivel:
      | "marco"
      | "hoja"
      | "interior"
      | "contravidrio"
      | "cruces"
      | "mosquitero",
    id: number,
    data: Partial<DespieceAccesorio>,
  ) => void;
  deleteDespieceAccesorio: (
    nivel:
      | "marco"
      | "hoja"
      | "interior"
      | "contravidrio"
      | "cruces"
      | "mosquitero",
    id: number,
  ) => void;
  getDespieceAccesorios: (
    nivel:
      | "marco"
      | "hoja"
      | "interior"
      | "contravidrio"
      | "cruces"
      | "mosquitero",
    idParent: number,
  ) => DespieceAccesorio[];
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useProductosStore = create<ProductosState>()(
  persist(
    (set, get) => ({
      tipos: MOCK_TIPOS,
      productos: MOCK_PRODUCTOS,
      marcos: MOCK_MARCOS,
      hojas: MOCK_HOJAS,
      interiores: MOCK_INTERIORES,
      contravidrios: [],
      contravidriosExt: [],
      cruces: [],
      mosquiteros: [],
      vidRepartidos: [],

      despiecePerfilesMarco: MOCK_DESPIECE_PERFILES_MARCO,
      despiecePerfilesHoja: MOCK_DESPIECE_PERFILES_HOJA,
      despiecePerfilesMosquitero: [],
      despiecePerfilesContravidrio: [],
      despiecePerfilesContravidrioExt: [],
      despieceCruces: [],
      despieceVR: [],
      despieceInteriores: MOCK_DESPIECE_INTERIORES,
      despieceInterioresMosquitero: [],
      despieceAccesoriosMarco: MOCK_DESPIECE_ACCESORIOS_MARCO,
      despieceAccesoriosHoja: [],
      despieceAccesoriosInterior: [],
      despieceAccesoriosContravidrio: [],
      despieceAccesoriosCruces: [],
      despieceAccesoriosMosquitero: [],

      // ── Productos ──
      addProducto: (p) => {
        const item: Producto = { ...p, id: ++nextProductoId };
        set((s) => ({ productos: [...s.productos, item] }));
        return item;
      },
      updateProducto: (id, data) =>
        set((s) => ({
          productos: s.productos.map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        })),
      deleteProducto: (id) =>
        set((s) => ({
          productos: s.productos.filter((x) => x.id !== id),
          marcos: s.marcos.filter((x) => x.id_producto !== id),
        })),

      // ── Marcos ──
      addMarco: (m) => {
        const item: Marco = { ...m, id: ++nextMarcoId };
        set((s) => ({ marcos: [...s.marcos, item] }));
        return item;
      },
      updateMarco: (id, data) =>
        set((s) => ({
          marcos: s.marcos.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
      deleteMarco: (id) =>
        set((s) => ({
          marcos: s.marcos.filter((x) => x.id !== id),
          hojas: s.hojas.filter((x) => x.id_marco !== id),
        })),
      getMarcosByProducto: (id) =>
        get().marcos.filter((x) => x.id_producto === id),

      // ── Hojas ──
      addHoja: (h) => {
        const item: Hoja = { ...h, id: ++nextHojaId };
        set((s) => ({ hojas: [...s.hojas, item] }));
        return item;
      },
      updateHoja: (id, data) =>
        set((s) => ({
          hojas: s.hojas.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
      deleteHoja: (id) =>
        set((s) => ({
          hojas: s.hojas.filter((x) => x.id !== id),
          interiores: s.interiores.filter((x) => x.id_hoja !== id),
        })),
      getHojasByMarco: (id) => get().hojas.filter((x) => x.id_marco === id),

      // ── Interiores ──
      addInterior: (i) => {
        const item: Interior = { ...i, id: ++nextInteriorId };
        set((s) => ({ interiores: [...s.interiores, item] }));
        return item;
      },
      updateInterior: (id, data) =>
        set((s) => ({
          interiores: s.interiores.map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        })),
      deleteInterior: (id) =>
        set((s) => ({ interiores: s.interiores.filter((x) => x.id !== id) })),
      getInterioresByHoja: (id) =>
        get().interiores.filter((x) => x.id_hoja === id),

      // ── DespieceInterior ──
      addDespieceInterior: (d) => {
        const item: DespieceInterior = { ...d, id: ++nextDespIntId };
        set((s) => ({ despieceInteriores: [...s.despieceInteriores, item] }));
        return item;
      },
      updateDespieceInterior: (id, data) =>
        set((s) => ({
          despieceInteriores: s.despieceInteriores.map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        })),
      deleteDespieceInterior: (id) =>
        set((s) => ({
          despieceInteriores: s.despieceInteriores.filter((x) => x.id !== id),
        })),
      getDespieceInteriorByInterior: (idInterior) =>
        get().despieceInteriores.find((x) => x.id_interior === idInterior),

      // ── Contravidrios Int. ──
      addContravidrio: (c) => {
        const item: Contravidrio = { ...c, id: ++nextContrId };
        set((s) => ({ contravidrios: [...s.contravidrios, item] }));
        return item;
      },
      updateContravidrio: (id, data) =>
        set((s) => ({
          contravidrios: s.contravidrios.map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        })),
      deleteContravidrio: (id) =>
        set((s) => ({
          contravidrios: s.contravidrios.filter((x) => x.id !== id),
        })),
      getContravidriosByInterior: (id) =>
        get().contravidrios.filter((x) => x.id_interior === id),

      // ── Contravidrios Ext. ──
      addContravidrioExt: (c) => {
        const item: ContravidrioExterior = { ...c, id: ++nextContrId };
        set((s) => ({ contravidriosExt: [...s.contravidriosExt, item] }));
        return item;
      },
      updateContravidrioExt: (id, data) =>
        set((s) => ({
          contravidriosExt: s.contravidriosExt.map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        })),
      deleteContravidrioExt: (id) =>
        set((s) => ({
          contravidriosExt: s.contravidriosExt.filter((x) => x.id !== id),
        })),
      getContravidriosExtByInterior: (id) =>
        get().contravidriosExt.filter((x) => x.id_interior === id),

      // ── Despiece perfiles contravidrio ──
      addDespiecePerfilContravidrio: (nivel, d) => {
        const item: DespiecePerfilContravidrio = { ...d, id: ++nextDespPerfId };
        const key =
          nivel === "contravidrio"
            ? "despiecePerfilesContravidrio"
            : "despiecePerfilesContravidrioExt";
        set((s) => ({
          [key]: [...(s[key] as DespiecePerfilContravidrio[]), item],
        }));
      },
      updateDespiecePerfilContravidrio: (nivel, id, data) => {
        const key =
          nivel === "contravidrio"
            ? "despiecePerfilesContravidrio"
            : "despiecePerfilesContravidrioExt";
        set((s) => ({
          [key]: (s[key] as DespiecePerfilContravidrio[]).map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        }));
      },
      deleteDespiecePerfilContravidrio: (nivel, id) => {
        const key =
          nivel === "contravidrio"
            ? "despiecePerfilesContravidrio"
            : "despiecePerfilesContravidrioExt";
        set((s) => ({
          [key]: (s[key] as DespiecePerfilContravidrio[]).filter(
            (x) => x.id !== id,
          ),
        }));
      },
      getDespiecePerfilesContravidrio: (nivel, idContravidrio) => {
        const key =
          nivel === "contravidrio"
            ? "despiecePerfilesContravidrio"
            : "despiecePerfilesContravidrioExt";
        return (get()[key] as DespiecePerfilContravidrio[]).filter(
          (x) => x.id_contravidrio === idContravidrio,
        );
      },

      // ── Cruces ──
      addCruces: (c) => {
        const item: Cruces = { ...c, id: ++nextCrucesId };
        set((s) => ({ cruces: [...s.cruces, item] }));
        return item;
      },
      updateCruces: (id, data) =>
        set((s) => ({
          cruces: s.cruces.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
      deleteCruces: (id) =>
        set((s) => ({ cruces: s.cruces.filter((x) => x.id !== id) })),
      getCrucesByInterior: (id) =>
        get().cruces.filter((x) => x.id_interior === id),

      // ── DespieceCruces ──
      addDespieceCruces: (d) => {
        const item: DespieceCruces = { ...d, id: ++nextDespCrucesId };
        set((s) => ({ despieceCruces: [...s.despieceCruces, item] }));
        return item;
      },
      updateDespieceCruces: (id, data) =>
        set((s) => ({
          despieceCruces: s.despieceCruces.map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        })),
      deleteDespieceCruces: (id) =>
        set((s) => ({
          despieceCruces: s.despieceCruces.filter((x) => x.id !== id),
        })),
      getDespieceCrucesByCruces: (idCruces) =>
        get().despieceCruces.find((x) => x.id_cruces === idCruces),

      // ── Mosquiteros ──
      addMosquitero: (m) => {
        const item: Mosquitero = { ...m, id: ++nextMosqId };
        set((s) => ({ mosquiteros: [...s.mosquiteros, item] }));
        return item;
      },
      updateMosquitero: (id, data) =>
        set((s) => ({
          mosquiteros: s.mosquiteros.map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        })),
      deleteMosquitero: (id) =>
        set((s) => ({ mosquiteros: s.mosquiteros.filter((x) => x.id !== id) })),
      getMosquiterosByHoja: (id) =>
        get().mosquiteros.filter((x) => x.idHoja === id),

      // ── DespieceInteriorMosquitero ──
      addDespieceInteriorMosquitero: (d) => {
        const item: DespieceInteriorMosquitero = { ...d, id: ++nextDespMosqId };
        set((s) => ({
          despieceInterioresMosquitero: [
            ...s.despieceInterioresMosquitero,
            item,
          ],
        }));
        return item;
      },
      updateDespieceInteriorMosquitero: (id, data) =>
        set((s) => ({
          despieceInterioresMosquitero: s.despieceInterioresMosquitero.map(
            (x) => (x.id === id ? { ...x, ...data } : x),
          ),
        })),
      deleteDespieceInteriorMosquitero: (id) =>
        set((s) => ({
          despieceInterioresMosquitero: s.despieceInterioresMosquitero.filter(
            (x) => x.id !== id,
          ),
        })),
      getDespieceInteriorMosquiteroByMosquitero: (idMosquitero) =>
        get().despieceInterioresMosquitero.find(
          (x) => x.idMosquitero === idMosquitero,
        ),

      // ── VidRepartidos ──
      addVidRepartido: (v) => {
        const item: VidRepartido = { ...v, id: ++nextVRId };
        set((s) => ({ vidRepartidos: [...s.vidRepartidos, item] }));
        return item;
      },
      updateVidRepartido: (id, data) =>
        set((s) => ({
          vidRepartidos: s.vidRepartidos.map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        })),
      deleteVidRepartido: (id) =>
        set((s) => ({
          vidRepartidos: s.vidRepartidos.filter((x) => x.id !== id),
        })),
      getVidRepartidosByInterior: (id) =>
        get().vidRepartidos.filter((x) => x.id_interior === id),

      // ── DespieceVR ──
      addDespieceVR: (d) => {
        const item: DespieceVR = { ...d, id: ++nextDespVRId };
        set((s) => ({ despieceVR: [...s.despieceVR, item] }));
        return item;
      },
      updateDespieceVR: (id, data) =>
        set((s) => ({
          despieceVR: s.despieceVR.map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        })),
      deleteDespieceVR: (id) =>
        set((s) => ({ despieceVR: s.despieceVR.filter((x) => x.id !== id) })),
      getDespieceVRByVR: (idVR) =>
        get().despieceVR.find((x) => x.id_vr === idVR),

      // ── Despiece perfiles (marco / hoja / mosquitero) ──
      addDespiecePerfil: (nivel, d) => {
        const item: DespiecePerfil = { ...d, id: ++nextDespPerfId };
        const key =
          `despiecePerfiles${nivel.charAt(0).toUpperCase() + nivel.slice(1)}` as keyof ProductosState;
        set((s) => ({ [key]: [...(s[key] as DespiecePerfil[]), item] }));
      },
      updateDespiecePerfil: (nivel, id, data) => {
        const key =
          `despiecePerfiles${nivel.charAt(0).toUpperCase() + nivel.slice(1)}` as keyof ProductosState;
        set((s) => ({
          [key]: (s[key] as DespiecePerfil[]).map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        }));
      },
      deleteDespiecePerfil: (nivel, id) => {
        const key =
          `despiecePerfiles${nivel.charAt(0).toUpperCase() + nivel.slice(1)}` as keyof ProductosState;
        set((s) => ({
          [key]: (s[key] as DespiecePerfil[]).filter((x) => x.id !== id),
        }));
      },
      getDespiecePerfiles: (nivel, idParent) => {
        const key =
          `despiecePerfiles${nivel.charAt(0).toUpperCase() + nivel.slice(1)}` as keyof ProductosState;
        return (get()[key] as DespiecePerfil[]).filter(
          (x) => x.id_parent === idParent,
        );
      },

      // ── Despiece accesorios ──
      addDespieceAccesorio: (nivel, d) => {
        const item: DespieceAccesorio = { ...d, id: ++nextDespAccId };
        const key =
          `despieceAccesorios${nivel.charAt(0).toUpperCase() + nivel.slice(1)}` as keyof ProductosState;
        set((s) => ({ [key]: [...(s[key] as DespieceAccesorio[]), item] }));
      },
      updateDespieceAccesorio: (nivel, id, data) => {
        const key =
          `despieceAccesorios${nivel.charAt(0).toUpperCase() + nivel.slice(1)}` as keyof ProductosState;
        set((s) => ({
          [key]: (s[key] as DespieceAccesorio[]).map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        }));
      },
      deleteDespieceAccesorio: (nivel, id) => {
        const key =
          `despieceAccesorios${nivel.charAt(0).toUpperCase() + nivel.slice(1)}` as keyof ProductosState;
        set((s) => ({
          [key]: (s[key] as DespieceAccesorio[]).filter((x) => x.id !== id),
        }));
      },
      getDespieceAccesorios: (nivel, idParent) => {
        const key =
          `despieceAccesorios${nivel.charAt(0).toUpperCase() + nivel.slice(1)}` as keyof ProductosState;
        return (get()[key] as DespieceAccesorio[]).filter(
          (x) => x.id_parent === idParent,
        );
      },
    }),
    { name: "open2d2-productos" },
  ),
);
