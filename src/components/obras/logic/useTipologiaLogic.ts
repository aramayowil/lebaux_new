import { useState, useEffect } from "react";
import type { ObraDetalle } from "@/types";

export type ModoRelleno = "simple" | "dvh" | "revestimiento";

export const FILA_FIELDS = [
  {
    interior: "interior_1",
    dvh1: "dvh_1_1",
    dvh2: "dvh_1_2",
    camara: "camara_1",
    revest: "revest_1",
    direcc: "direcc_1",
    vr: "vr_1",
    hor: "hor_vr_1",
    ver: "ver_vr_1",
    activoVr: "activo_vr_1",
  },
  {
    interior: "interior_2",
    dvh1: "dvh_2_1",
    dvh2: "dvh_2_2",
    camara: "camara_2",
    revest: "revest_2",
    direcc: "direcc_2",
    vr: "vr_2",
    hor: "hor_vr_2",
    ver: "ver_vr_2",
    activoVr: "activo_vr_2",
  },
  {
    interior: "interior_3",
    dvh1: "dvh_3_1",
    dvh2: "dvh_3_2",
    camara: "camara_3",
    revest: "revest_3",
    direcc: "direcc_3",
    vr: "vr_3",
    hor: "hor_vr_3",
    ver: "ver_vr_3",
    activoVr: "activo_vr_3",
  },
  {
    interior: "interior_4",
    dvh1: "dvh_4_1",
    dvh2: "dvh_4_2",
    camara: "camara_4",
    revest: "revest_4",
    direcc: "direcc_4",
    vr: "vr_4",
    hor: "hor_vr_4",
    ver: "ver_vr_4",
    activoVr: "activo_vr_4",
  },
] as const;

export function useTipologiaLogic(
  detalle: ObraDetalle | undefined,
  upsertDetalle: (fields: Partial<ObraDetalle>) => void,
) {
  // ── Estados de la UI ────────────────────────────────────────────────────────
  const [openSections, setOpenSections] = useState({
    acabado: true,
    estructura: true,
    cruces: true,
  });
  const [inputH, setInputH] = useState("");
  const [inputV, setInputV] = useState("");
  const [mismoRellenoPanel, setMismoRellenoPanel] = useState<boolean>(
    () => detalle?.mismo_relleno_panel ?? false,
  );

  useEffect(() => {
    if (detalle) {
      setMismoRellenoPanel(detalle.mismo_relleno_panel ?? false);
    }
  }, [detalle?.mismo_relleno_panel, detalle?.id]);

  // ── Variables Derivadas de Cruces ───────────────────────────────────────────
  const tipoCruce = detalle?.tipo_cruce ?? 0;
  const posH = [
    detalle?.horizontal_1,
    detalle?.horizontal_2,
    detalle?.horizontal_3,
  ].filter((v): v is number => typeof v === "number" && v > 0);
  const posV = [
    detalle?.vertical_1,
    detalle?.vertical_2,
    detalle?.vertical_3,
    detalle?.vertical_4,
    detalle?.vertical_5,
  ].filter((v): v is number => typeof v === "number" && v > 0);

  const cantFilasDeRelleno =
    tipoCruce === 0
      ? 1
      : tipoCruce === 1
        ? (detalle?.cant_centrados_horizontal ?? 0) + 1
        : posH.length + 1;
  const panosCount = Math.min(cantFilasDeRelleno, 4);

  // ── Lógica de Modos de Relleno ──────────────────────────────────────────────
  function modoDesdeDB(d: ObraDetalle | undefined): ModoRelleno {
    if (!d) return "simple";
    if (d.revest_1) return "revestimiento";
    if (d.dvh_1_1) return "dvh";
    return "simple";
  }

  const [modoRelleno, setModoRelleno] = useState<ModoRelleno>(() =>
    modoDesdeDB(detalle),
  );

  useEffect(() => {
    setModoRelleno(modoDesdeDB(detalle));
  }, [detalle?.id]);

  const [modoRellenoByFila, setModoRellenoByFila] = useState<ModoRelleno[]>([
    "simple",
    "simple",
    "simple",
    "simple",
  ]);

  useEffect(() => {
    if (!detalle) return;
    setModoRellenoByFila([
      detalle.revest_1 ? "revestimiento" : detalle.dvh_1_1 ? "dvh" : "simple",
      detalle.revest_2 ? "revestimiento" : detalle.dvh_2_1 ? "dvh" : "simple",
      detalle.revest_3 ? "revestimiento" : detalle.dvh_3_1 ? "dvh" : "simple",
      detalle.revest_4 ? "revestimiento" : detalle.dvh_4_1 ? "dvh" : "simple",
    ]);
  }, [detalle?.id]);

  // ── Funciones de Actualización (Acciones) ───────────────────────────────────
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const upd = (fields: Partial<ObraDetalle>) => {
    if (!detalle) return;
    let finalFields = { ...fields };

    if (mismoRellenoPanel) {
      const mapeoReplicacion = [
        {
          origen: "interior_1",
          destinos: ["interior_2", "interior_3", "interior_4"],
        },
        { origen: "dvh_1_1", destinos: ["dvh_2_1", "dvh_3_1", "dvh_4_1"] },
        { origen: "dvh_1_2", destinos: ["dvh_2_2", "dvh_3_2", "dvh_4_2"] },
        { origen: "camara_1", destinos: ["camara_2", "camara_3", "camara_4"] },
        { origen: "revest_1", destinos: ["revest_2", "revest_3", "revest_4"] },
        { origen: "direcc_1", destinos: ["direcc_2", "direcc_3", "direcc_4"] },
        { origen: "vr_1", destinos: ["vr_2", "vr_3", "vr_4"] },
        { origen: "hor_vr_1", destinos: ["hor_vr_2", "hor_vr_3", "hor_vr_4"] },
        { origen: "ver_vr_1", destinos: ["ver_vr_2", "ver_vr_3", "ver_vr_4"] },
        {
          origen: "activo_vr_1",
          destinos: ["activo_vr_2", "activo_vr_3", "activo_vr_4"],
        },
      ] as const;

      mapeoReplicacion.forEach(({ origen, destinos }) => {
        if (origen in fields) {
          const valor = fields[origen as keyof typeof fields];
          destinos.forEach((destino, index) => {
            const numeroDeFila = index + 2;
            if (numeroDeFila <= panosCount) {
              (finalFields as any)[destino] = valor;
            } else {
              (finalFields as any)[destino] = null;
            }
          });
        }
      });
    }

    upsertDetalle({ ...detalle, ...finalFields });
  };

  function cambiarModo(nuevo: ModoRelleno) {
    setModoRelleno(nuevo);
    const resetPatch: any = {};

    FILA_FIELDS.forEach((f) => {
      resetPatch[f.interior] = null;
      resetPatch[f.dvh1] = null;
      resetPatch[f.dvh2] = null;
      resetPatch[f.camara] = null;
      resetPatch[f.revest] = null;
      resetPatch[f.direcc] = null;
      // Al cambiar de modo, desactivamos VR en todas las filas
      resetPatch[f.activoVr] = false;
    });

    if (nuevo === "revestimiento") {
      resetPatch.direcc_1 = "horizontal";
      if (mismoRellenoPanel) {
        if (panosCount >= 2) resetPatch.direcc_2 = "horizontal";
        if (panosCount >= 3) resetPatch.direcc_3 = "horizontal";
        if (panosCount >= 4) resetPatch.direcc_4 = "horizontal";
      }
    }

    upsertDetalle({ ...detalle, ...resetPatch });
  }

  function cambiarModoFila(idx: number, nuevo: ModoRelleno) {
    const f = FILA_FIELDS[idx];
    const patch: any = {
      [f.interior]: null,
      [f.dvh1]: null,
      [f.dvh2]: null,
      [f.camara]: null,
      [f.revest]: null,
      [f.direcc]: null,
      [f.activoVr]: false, // Al cambiar modo, desactivamos VR
    };

    if (nuevo === "revestimiento") patch[f.direcc] = "horizontal";

    upsertDetalle({ ...detalle, ...patch });
  }

  // Nueva función para toggle de VR
  function toggleVidrioRepartido(idx: number, activo: boolean) {
    const f = FILA_FIELDS[idx];
    upsertDetalle({ ...detalle, [f.activoVr]: activo } as any);
  }

  const handleToggleRellenoPorPanel = (porPanel: boolean) => {
    if (!detalle) return;
    setMismoRellenoPanel(porPanel);

    const patch: any = { mismo_relleno_panel: porPanel };

    const filasRealesDeLaTipologia =
      tipoCruce === 0
        ? 1
        : tipoCruce === 1
          ? (detalle.cant_centrados_horizontal ?? 0) + 1
          : posH.length + 1;

    const limiteFilasActivas = Math.min(filasRealesDeLaTipologia, 4);

    FILA_FIELDS.slice(1).forEach((f, index) => {
      const numeroDeFila = index + 2;

      if (porPanel && numeroDeFila <= limiteFilasActivas) {
        patch[f.interior] = detalle.interior_1 ?? null;
        patch[f.dvh1] = detalle.dvh_1_1 ?? null;
        patch[f.dvh2] = detalle.dvh_1_2 ?? null;
        patch[f.camara] = detalle.camara_1 ?? null;
        patch[f.revest] = detalle.revest_1 ?? null;
        patch[f.direcc] = detalle.direcc_1 ?? null;
        patch[f.vr] = detalle.vr_1 ?? null;
        patch[f.hor] = detalle.hor_vr_1 ?? null;
        patch[f.ver] = detalle.ver_vr_1 ?? null;
        patch[f.activoVr] = detalle.activo_vr_1 ?? false;
      } else {
        patch[f.interior] = null;
        patch[f.dvh1] = null;
        patch[f.dvh2] = null;
        patch[f.camara] = null;
        patch[f.revest] = null;
        patch[f.direcc] = null;
        patch[f.vr] = null;
        patch[f.hor] = null;
        patch[f.ver] = null;
        patch[f.activoVr] = false;
      }
    });

    upsertDetalle({ ...detalle, ...patch });
  };

  const savePosH = (arr: number[]) => {
    const next = [...arr].sort((a, b) => a - b).slice(0, 3);
    upsertDetalle({
      ...detalle,
      horizontal_1: next[0] ?? null,
      horizontal_2: next[1] ?? null,
      horizontal_3: next[2] ?? null,
      cant_centrados_horizontal: next.length,
    });
  };

  const savePosV = (arr: number[]) => {
    const next = [...arr].sort((a, b) => a - b).slice(0, 5);
    upsertDetalle({
      ...detalle,
      vertical_1: next[0] ?? null,
      vertical_2: next[1] ?? null,
      vertical_3: next[2] ?? null,
      vertical_4: next[3] ?? null,
      vertical_5: next[4] ?? null,
      cant_centrados_vertical: next.length,
    });
  };

  const addCruceH = (mm?: number) => {
    const val = mm ?? Math.round((detalle?.alto ?? 1000) / 2);
    if (val <= 0 || val >= (detalle?.alto ?? 9999)) return;
    savePosH([...posH, val]);
  };

  const addCruceV = (mm?: number) => {
    const val = mm ?? Math.round((detalle?.ancho ?? 1000) / 2);
    if (val <= 0 || val >= (detalle?.ancho ?? 9999)) return;
    savePosV([...posV, val]);
  };

  const handleCruceMode = (mode: number) => {
    if (mode === 0) {
      upsertDetalle({
        ...detalle,
        tipo_cruce: 0,
        interior_2: null,
        interior_3: null,
        interior_4: null,
        dvh_2_1: null,
        dvh_3_1: null,
        dvh_4_1: null,
        dvh_2_2: null,
        dvh_3_2: null,
        dvh_4_2: null,
        camara_2: null,
        camara_3: null,
        camara_4: null,
        revest_2: null,
        revest_3: null,
        revest_4: null,
        direcc_2: null,
        direcc_3: null,
        direcc_4: null,
        activo_vr_2: false,
        activo_vr_3: false,
        activo_vr_4: false,
      });
    } else if (mode === 1) {
      upsertDetalle({ ...detalle, tipo_cruce: 1 });
    } else if (mode === 2) {
      upsertDetalle({ ...detalle, tipo_cruce: 2 });
    }
  };

  return {
    state: {
      openSections,
      inputH,
      inputV,
      mismoRellenoPanel,
      tipoCruce,
      posH,
      posV,
      panosCount,
      modoRelleno,
      modoRellenoByFila,
    },
    actions: {
      setInputH,
      setInputV,
      toggleSection,
      upd,
      cambiarModo,
      cambiarModoFila,
      toggleVidrioRepartido,
      handleToggleRellenoPorPanel,
      savePosH,
      savePosV,
      addCruceH,
      addCruceV,
      handleCruceMode,
    },
  };
}
