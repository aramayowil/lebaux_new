import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Obra, ObraTipologia, ObraDespiece } from "@/types";

let nextObraId = 10;
let nextTipoId = 100;

// ─── Módulo (paño individual en grilla de cruces variables) ──────────────────

export type TipoModulo = "vidrio" | "panel" | "persiana" | "vacio";

export interface ModuloConfig {
  fila: number;
  col: number;
  tipo: TipoModulo;
  id_vidrio: string | null;
  id_revestimiento: string | null; // vidrio secundario / revestimiento por paño
  id_contravidrio: number | null;
  id_contravidrio_ext: number | null;
  id_producto: number | null;
  id_marco: number | null;
  id_interior: number | null;
  notas: string;
}

export function emptyModulo(fila: number, col: number): ModuloConfig {
  return {
    fila,
    col,
    tipo: "vidrio",
    id_vidrio: null,
    id_revestimiento: null,
    id_contravidrio: null,
    id_contravidrio_ext: null,
    id_producto: null,
    id_marco: null,
    id_interior: null,
    notas: "",
  };
}

// ─── Configuración completa de una tipología ─────────────────────────────────

export interface TipologiaConfig {
  id?: number;
  id_tipologia: number;
  // Producto
  id_producto: number | null;
  id_marco: number | null;
  id_hoja: number | null;
  id_interior: number | null;
  id_contravidrio: number | null;
  id_contravidrio_ext: number | null;
  id_mosquitero: number | null;
  id_vid_repartido: number | null;
  // Acabado
  id_tratamiento: number;
  // Cruces
  tipo_cruce: 0 | 1 | 2; // 0=sin, 1=centrados, 2=variables
  cruces_h: number;
  cruces_v: number;
  pos_h: number[]; // mm desde abajo (tipoCruce===2)
  pos_v: number[]; // mm desde izquierda (tipoCruce===2)
  modulosConfig: ModuloConfig[];
  // Vidrio principal + revestimiento
  id_vidrio: string | null;
  id_revestimiento: string | null; // revestimiento / material secundario global
  // Opciones
  con_premarco: boolean;
  con_tapajuntas: boolean;
  notas: string;
}

export function emptyConfig(idTipologia: number): TipologiaConfig {
  return {
    id_tipologia: idTipologia,
    id_producto: null,
    id_marco: null,
    id_hoja: null,
    id_interior: null,
    id_contravidrio: null,
    id_contravidrio_ext: null,
    id_mosquitero: null,
    id_vid_repartido: null,
    id_tratamiento: 1,
    tipo_cruce: 0,
    cruces_h: 0,
    cruces_v: 0,
    pos_h: [],
    pos_v: [],
    modulosConfig: [],
    id_vidrio: null,
    id_revestimiento: null,
    con_premarco: false,
    con_tapajuntas: false,
    notas: "",
  };
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_OBRAS: Obra[] = [
  {
    id: 1,
    apellido: "García",
    nombre: "Martín",
    direccion: "Av. Corrientes 1234",
    telefono: "11-4321-0000",
    ciudad: "CABA",
  },
  {
    id: 2,
    apellido: "Fernández",
    nombre: "Laura",
    direccion: "Calle Falsa 742",
    telefono: "351-555-1212",
    ciudad: "Córdoba",
  },
  {
    id: 3,
    apellido: "López",
    nombre: "Roberto",
    direccion: "San Martín 88",
    telefono: "261-444-9876",
    ciudad: "Mendoza",
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface ObrasState {
  obras: Obra[];
  tipologias: ObraTipologia[];
  configs: TipologiaConfig[];
  despieces: ObraDespiece[];

  // Obras
  addObra: (o: Omit<Obra, "id">) => Obra;
  updateObra: (id: number, data: Partial<Obra>) => void;
  deleteObra: (id: number) => void;
  getObra: (id: number) => Obra | undefined;

  // Tipologías
  addTipologia: (t: Omit<ObraTipologia, "id">) => ObraTipologia;
  updateTipologia: (id: number, data: Partial<ObraTipologia>) => void;
  deleteTipologia: (id: number) => void;
  duplicateTipologia: (id: number) => ObraTipologia | null;
  getTipologiasByObra: (idObra: number) => ObraTipologia[];

  // Config
  getConfig: (idTipologia: number) => TipologiaConfig;
  setConfig: (config: TipologiaConfig) => void;
  patchConfig: (idTipologia: number, data: Partial<TipologiaConfig>) => void;
  getModulo: (idTipologia: number, fila: number, col: number) => ModuloConfig;
  patchModulo: (
    idTipologia: number,
    fila: number,
    col: number,
    data: Partial<ModuloConfig>,
  ) => void;

  // Despiece guardado
  setDespieces: (
    idObra: number,
    idTipologia: number,
    items: ObraDespiece[],
  ) => void;
  getDespieces: (idObra: number) => ObraDespiece[];
}

export const useObrasStore = create<ObrasState>()(
  persist(
    (set, get) => ({
      obras: MOCK_OBRAS,
      tipologias: [],
      configs: [],
      despieces: [],

      // ── Obras ────────────────────────────────────────────────────────────────
      addObra: (o) => {
        const obra: Obra = { ...o, id: ++nextObraId };
        set((s) => ({ obras: [...s.obras, obra] }));
        return obra;
      },
      updateObra: (id, data) =>
        set((s) => ({
          obras: s.obras.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
      deleteObra: (id) =>
        set((s) => {
          const tipoIds = s.tipologias
            .filter((t) => t.id_obra === id)
            .map((t) => t.id);
          return {
            obras: s.obras.filter((x) => x.id !== id),
            tipologias: s.tipologias.filter((x) => x.id_obra !== id),
            configs: s.configs.filter((x) => !tipoIds.includes(x.id_tipologia)),
            despieces: s.despieces.filter((x) => x.id_obra !== id),
          };
        }),
      getObra: (id) => get().obras.find((x) => x.id === id),

      // ── Tipologías ───────────────────────────────────────────────────────────
      addTipologia: (t) => {
        const tip: ObraTipologia = { ...t, id: ++nextTipoId };
        set((s) => ({ tipologias: [...s.tipologias, tip] }));
        return tip;
      },
      updateTipologia: (id, data) =>
        set((s) => ({
          tipologias: s.tipologias.map((x) =>
            x.id === id ? { ...x, ...data } : x,
          ),
        })),
      deleteTipologia: (id) =>
        set((s) => ({
          tipologias: s.tipologias.filter((x) => x.id !== id),
          configs: s.configs.filter((x) => x.id_tipologia !== id),
          despieces: s.despieces.filter((x) => x.id_tipologia !== id),
        })),
      duplicateTipologia: (id) => {
        const original = get().tipologias.find((x) => x.id === id);
        if (!original) return null;
        const nueva = get().addTipologia({
          ...original,
          descripcion: `${original.descripcion} (copia)`,
        });
        const cfg = get().getConfig(id);
        get().setConfig({ ...cfg, id_tipologia: nueva.id });
        return nueva;
      },
      getTipologiasByObra: (idObra) =>
        get().tipologias.filter((x) => x.id_obra === idObra),

      // ── Config ───────────────────────────────────────────────────────────────
      getConfig: (idTipologia) =>
        get().configs.find((x) => x.id_tipologia === idTipologia) ??
        emptyConfig(idTipologia),

      setConfig: (config) =>
        set((s) => ({
          configs: s.configs.some((x) => x.id_tipologia === config.id_tipologia)
            ? s.configs.map((x) =>
              x.id_tipologia === config.id_tipologia ? config : x,
            )
            : [...s.configs, config],
        })),

      patchConfig: (idTipologia, data) => {
        const current = get().getConfig(idTipologia);
        get().setConfig({ ...current, ...data });
      },

      getModulo: (idTipologia, fila, col) => {
        const cfg = get().getConfig(idTipologia);
        return (
          cfg.modulosConfig.find((m) => m.fila === fila && m.col === col) ??
          emptyModulo(fila, col)
        );
      },

      patchModulo: (idTipologia, fila, col, data) => {
        const cfg = get().getConfig(idTipologia);
        const existing = cfg.modulosConfig.find(
          (m) => m.fila === fila && m.col === col,
        );
        const updated = existing
          ? cfg.modulosConfig.map((m) =>
            m.fila === fila && m.col === col ? { ...m, ...data } : m,
          )
          : [...cfg.modulosConfig, { ...emptyModulo(fila, col), ...data }];
        get().setConfig({ ...cfg, modulosConfig: updated });
      },

      // ── Despiece ─────────────────────────────────────────────────────────────
      setDespieces: (idObra, idTipologia, items) =>
        set((s) => ({
          despieces: [
            ...s.despieces.filter(
              (x) => !(x.id_obra === idObra && x.id_tipologia === idTipologia),
            ),
            ...items,
          ],
        })),
      getDespieces: (idObra) =>
        get().despieces.filter((x) => x.id_obra === idObra),
    }),
    { name: "open2d2-obras" },
  ),
);
