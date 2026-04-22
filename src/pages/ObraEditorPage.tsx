import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Chip,
  Tooltip,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  LayoutGrid,
  CheckCircle,
  Circle,
  SplitSquareHorizontal,
  SplitSquareVertical,
  Calculator,
} from "lucide-react";
import clsx from "clsx";
import { useObrasStore } from "@/store/obrasStore";
import { useProductosStore } from "@/store/productosStore";
import TipologiaCanvas from "@/components/canvas/TipologiaCanvas";
import TipologiaConfigPanel from "@/components/obras/TipologiaConfigPanel";
import TravesanoModal from "@/components/obras/TravesanoModal";
import NuevaTipologiaModal from "@/components/obras/NuevaTipologiaModal";
import type { TipologiaConfig } from "@/store/obrasStore";
import { useDespiece } from "@/hooks/useDespiece";
import DespieceView from "@/components/obras/DespieceView";

interface CruceModal {
  tipo: "H" | "V";
  valor: number;
}

export default function ObraEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idObra = Number(id);

  const {
    getObra,
    getTipologiasByObra,
    addTipologia,
    updateTipologia,
    deleteTipologia,
    duplicateTipologia,
    getConfig,
    patchConfig,
  } = useObrasStore();
  const { hojas } = useProductosStore();

  const obra = getObra(idObra);
  const tipologias = getTipologiasByObra(idObra);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const [showDespiece, setShowDespiece] = useState(false);
  const [cruceModal, setCruceModal] = useState<CruceModal | null>(null);

  const [showNuevoModal, setShowNuevoModal] = useState(false);
  const [travesanoOpen, setTravesanoOpen] = useState(false);

  function handleCrearTipologia(
    datos: {
      descripcion: string;
      ancho: number;
      alto: number;
      cantidad: number;
    },
    config: Partial<TipologiaConfig>,
  ) {
    const t = addTipologia({ ...datos, idObra });
    if (config.idProducto) {
      patchConfig(t.id, config);
    }
    setSelectedId(t.id);
  }

  const tipSel = tipologias.find((t) => t.id === selectedId) ?? null;
  const configSel = tipSel ? getConfig(tipSel.id) : null;
  const nHojas = configSel?.idHoja
    ? (hojas.find((h) => h.id === configSel.idHoja)?.cantidad ?? 1)
    : 1;
  const formaTipo = useProductosStore(
    (state) =>
      state.productos.find((p) => p.id === configSel?.idProducto)?.idTipo,
  );
  const tipoDeProducto = useProductosStore(
    (state) => state.tipos.find((t) => t.id === formaTipo)?.formaTipo,
  );

  // Motor de despiece
  const {
    resultado: despieceResult,
    error: despieceError,
    configurado,
  } = useDespiece(tipSel);

  // ── Acciones de cruces ─────────────────────────────────────────────────────
  function addCruceH(mm?: number) {
    if (!selectedId || !tipSel) return;
    const cfg = getConfig(selectedId);
    const pos = mm ?? Math.round(tipSel.alto / 2);
    const posH = [...(cfg.posH ?? []), pos].sort((a, b) => a - b);
    patchConfig(selectedId, { tipoCruce: 2, posH, crucesH: posH.length });
  }
  function addCruceV(mm?: number) {
    if (!selectedId || !tipSel) return;
    const cfg = getConfig(selectedId);
    const pos = mm ?? Math.round(tipSel.ancho / 2);
    const posV = [...(cfg.posV ?? []), pos].sort((a, b) => a - b);
    patchConfig(selectedId, { tipoCruce: 2, posV, crucesV: posV.length });
  }

  const selectTipologia = useCallback((id: number) => {
    setSelectedId(id);
    setShowConfig(true);
  }, []);

  if (!obra) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-400">
        <p>Obra no encontrada</p>
        <Button variant="light" onPress={() => navigate("/obras")}>
          ← Volver
        </Button>
      </div>
    );
  }

  const totalUnidades = tipologias.reduce((s, t) => s + t.cantidad, 0);
  const asignadas = tipologias.filter(
    (t) => getConfig(t.id).idProducto !== null,
  ).length;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -m-6 fade-in">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 shadow-sm z-10">
        <Button
          variant="light"
          isIconOnly
          size="sm"
          onPress={() => navigate("/obras")}
          className="text-zinc-400 hover:text-zinc-600"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </Button>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-md">
              {obra.apellido}, {obra.nombre}
            </h2>
            {obra.ciudad && (
              <Chip
                size="sm"
                variant="flat"
                classNames={{
                  base: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 h-5",
                  content: "text-xs font-medium",
                }}
              >
                {obra.ciudad}
              </Chip>
            )}
          </div>
          {obra.telefono && (
            <span className="text-[11px] text-zinc-400 hidden md:block truncate mt-0.5">
              {obra.telefono}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {tipologias.length} Tipo{tipologias.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {totalUnidades} Unid.
            </span>
          </div>
          {tipologias.length > 0 && (
            <div
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1 rounded-full border",
                asignadas === tipologias.length
                  ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                  : "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
              )}
            >
              <span className="text-[11px] font-medium">
                {asignadas}/{tipologias.length} Asignados
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar tipologías ── */}
        <aside className="w-56 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-sans font-semibold text-zinc-500 uppercase tracking-wide">
              Tipologías
            </span>
            <Tooltip content="Nueva tipología" size="sm">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={() => setShowNuevoModal(true)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </Tooltip>
          </div>

          <ul className="flex-1 overflow-y-auto scrollbar-thin">
            {tipologias.length === 0 && (
              <li className="p-4 text-center text-xs text-zinc-400 leading-relaxed">
                Sin tipologías.
                <br />
                <button
                  className="text-zinc-500 underline hover:text-zinc-700 mt-1"
                  onClick={() => setShowNuevoModal(true)}
                >
                  Crear una ahora
                </button>
              </li>
            )}
            {tipologias.map((t) => {
              const cfg = getConfig(t.id);
              const isSel = selectedId === t.id;
              const assigned = cfg.idProducto !== null;
              return (
                <li
                  key={t.id}
                  className={`group cursor-pointer border-b border-zinc-100 dark:border-zinc-800/60 transition-colors ${isSel ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"}`}
                  onClick={() => selectTipologia(t.id)}
                >
                  <div className="px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0">
                        {assigned ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium truncate ${isSel ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"}`}
                        >
                          {t.descripcion}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-400 mt-0.5 tabular-nums">
                          {t.ancho} × {t.alto} mm
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Chip
                            size="sm"
                            variant="flat"
                            classNames={{
                              base: "h-4",
                              content: "text-[10px] px-1",
                            }}
                          >
                            ×{t.cantidad}
                          </Chip>
                          {cfg.tipoCruce === 1 &&
                            (cfg.crucesH > 0 || cfg.crucesV > 0) && (
                              <Chip
                                size="sm"
                                variant="flat"
                                color="secondary"
                                classNames={{
                                  base: "h-4",
                                  content: "text-[10px] px-1",
                                }}
                              >
                                {cfg.crucesH}H {cfg.crucesV}V
                              </Chip>
                            )}
                          {cfg.tipoCruce === 2 &&
                            ((cfg.posH?.length ?? 0) > 0 ||
                              (cfg.posV?.length ?? 0) > 0) && (
                              <Chip
                                size="sm"
                                variant="flat"
                                color="secondary"
                                classNames={{
                                  base: "h-4",
                                  content: "text-[10px] px-1",
                                }}
                              >
                                {cfg.posH?.length ?? 0}H {cfg.posV?.length ?? 0}
                                V var.
                              </Chip>
                            )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Tooltip content="Duplicar" size="sm">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onClick={(e: any) => {
                              e.stopPropagation();
                              duplicateTipologia(t.id);
                            }}
                          >
                            <Copy className="w-3 h-3 text-zinc-400" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Eliminar" size="sm">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onClick={(e: any) => {
                              e.stopPropagation();
                              deleteTipologia(t.id);
                              if (selectedId === t.id) setSelectedId(null);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── Main canvas ── */}
        {!tipSel ? (
          <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950/50">
            <div className="text-center space-y-2">
              <LayoutGrid
                className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto"
                strokeWidth={1}
              />
              <p className="text-sm font-medium text-zinc-500">
                Seleccioná una tipología
              </p>
              <p className="text-xs text-zinc-400">
                o creá una nueva desde el panel izquierdo
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 min-w-0 min-h-0">
            <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-100 dark:bg-zinc-950/80">
              {/* Barra de tipología */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <Input
                  value={tipSel.descripcion}
                  onValueChange={(v: string) =>
                    updateTipologia(tipSel.id, { descripcion: v })
                  }
                  size="sm"
                  className="max-w-44"
                  classNames={{
                    inputWrapper:
                      "h-7 min-h-unit-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
                  }}
                />

                <div className="flex items-center gap-1 text-xs font-mono text-zinc-500">
                  <Input
                    type="number"
                    value={String(tipSel.ancho)}
                    onValueChange={(v: string) =>
                      updateTipologia(tipSel.id, { ancho: parseInt(v) || 600 })
                    }
                    size="sm"
                    className="w-20"
                    classNames={{
                      inputWrapper:
                        "h-7 min-h-unit-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
                      input: "font-mono text-xs",
                    }}
                    endContent={
                      <span className="text-[10px] text-zinc-400">mm</span>
                    }
                    aria-label="Ancho"
                  />
                  <span className="text-zinc-300">×</span>
                  <Input
                    type="number"
                    value={String(tipSel.alto)}
                    onValueChange={(v: string) =>
                      updateTipologia(tipSel.id, { alto: parseInt(v) || 600 })
                    }
                    size="sm"
                    className="w-20"
                    classNames={{
                      inputWrapper:
                        "h-7 min-h-unit-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
                      input: "font-mono text-xs",
                    }}
                    endContent={
                      <span className="text-[10px] text-zinc-400">mm</span>
                    }
                    aria-label="Alto"
                  />
                  <span className="text-zinc-400 text-[10px]">·</span>
                  <Input
                    type="number"
                    value={String(tipSel.cantidad)}
                    onValueChange={(v: string) =>
                      updateTipologia(tipSel.id, { cantidad: parseInt(v) || 1 })
                    }
                    size="sm"
                    className="w-14"
                    classNames={{
                      inputWrapper:
                        "h-7 min-h-unit-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
                      input: "font-mono text-xs",
                    }}
                    startContent={
                      <span className="text-[10px] text-zinc-400">×</span>
                    }
                    aria-label="Cantidad"
                  />
                </div>

                <div className="flex-1" />

                {/* Botones de cruce rápido */}
                <div className="flex items-center gap-1 mr-1">
                  <Tooltip content="Agregar cruce horizontal" size="sm">
                    <Button
                      size="sm"
                      variant="flat"
                      isIconOnly
                      className="h-7 w-7 min-w-7"
                      onPress={() =>
                        setCruceModal({
                          tipo: "H",
                          valor: Math.round(tipSel.alto / 2),
                        })
                      }
                    >
                      <SplitSquareVertical className="w-3.5 h-3.5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Agregar cruce vertical" size="sm">
                    <Button
                      size="sm"
                      variant="flat"
                      isIconOnly
                      className="h-7 w-7 min-w-7"
                      onPress={() =>
                        setCruceModal({
                          tipo: "V",
                          valor: Math.round(tipSel.ancho / 2),
                        })
                      }
                    >
                      <SplitSquareHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </Tooltip>
                </div>

                <Button
                  size="sm"
                  variant={showConfig ? "flat" : "light"}
                  onPress={() => setShowConfig((s) => !s)}
                  className="text-xs"
                >
                  {showConfig ? "Ocultar config" : "Configurar"}
                </Button>

                {configurado && (
                  <Button
                    size="sm"
                    variant={showDespiece ? "solid" : "flat"}
                    color={showDespiece ? "primary" : "default"}
                    onPress={() => {
                      setShowDespiece((s) => !s);
                      setShowConfig(false);
                    }}
                    className="text-xs"
                    startContent={<Calculator className="w-3 h-3" />}
                  >
                    {showDespiece ? "Ocultar despiece" : "Calcular"}
                  </Button>
                )}
              </div>

              {/* Canvas */}
              <div className="flex-1 flex items-center justify-center overflow-hidden relative">
                {configSel && (
                  <TipologiaCanvas
                    tipologia={tipSel}
                    config={configSel}
                    tipoDeProducto={tipoDeProducto}
                    hojas={nHojas}
                    width={Math.max(
                      360,
                      (showConfig
                        ? window.innerWidth - 224 - 288
                        : window.innerWidth - 224) - 32,
                    )}
                    height={Math.max(280, window.innerHeight - 200)}
                  />
                )}
              </div>
            </div>

            {/* Panel config */}
            {showConfig && (
              <aside className="w-72 shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto scrollbar-thin">
                <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="font-sans text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Configuración
                  </p>
                </div>
                <div className="p-4">
                  <TipologiaConfigPanel
                    key={tipSel.id}
                    idTipologia={tipSel.id}
                    ancho={tipSel.ancho}
                    alto={tipSel.alto}
                  />
                </div>
              </aside>
            )}

            {/* Right panel: despiece */}
            {showDespiece && (
              <aside className="w-96 shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto scrollbar-thin">
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5 text-zinc-400" />
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                    Despiece — {tipSel.descripcion}
                  </p>
                </div>
                <div className="p-4">
                  {despieceError && (
                    <div className="flex items-start gap-2 text-danger-600 bg-danger-50 dark:bg-danger-900/20 rounded-lg p-3 mb-3 text-sm">
                      <span>⚠ Error: {despieceError}</span>
                    </div>
                  )}
                  {despieceResult ? (
                    <DespieceView resultado={despieceResult} />
                  ) : (
                    <div className="text-center py-8 text-zinc-400 text-sm">
                      <Calculator className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Configurá un producto para calcular el despiece</p>
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        )}
      </div>
      {/* ── NuevaTipologiaModal ── */}
      <NuevaTipologiaModal
        isOpen={showNuevoModal}
        onOpenChange={() => setShowNuevoModal(false)}
        onCrear={handleCrearTipologia}
      />

      {/* ── Modal posición de cruce ── */}
      {cruceModal && tipSel && (
        <CrucePositionModal
          tipo={cruceModal.tipo}
          valorInicial={cruceModal.valor}
          alto={tipSel.alto}
          ancho={tipSel.ancho}
          onClose={() => setCruceModal(null)}
          onConfirm={(val) => {
            cruceModal.tipo === "H" ? addCruceH(val) : addCruceV(val);
            setCruceModal(null);
          }}
        />
      )}

      <TravesanoModal
        isOpen={travesanoOpen}
        onOpenChange={() => setTravesanoOpen(false)}
        onAccept={(data) => {
          if (!selectedId || !tipSel) return;
          const cfg = getConfig(selectedId);
          const nuevosH = Array.from({ length: data.cantidad }, (_, i) =>
            Math.round((tipSel.alto / (data.cantidad + 1)) * (i + 1)),
          );
          const posH = [...(cfg.posH ?? []), ...nuevosH].sort((a, b) => a - b);
          patchConfig(selectedId, { tipoCruce: 2, posH, crucesH: posH.length });
        }}
      />
    </div>
  );
}

// ── CrucePositionModal ────────────────────────────────────────────────────────
function CrucePositionModal({
  tipo,
  valorInicial,
  alto,
  ancho,
  onClose,
  onConfirm,
}: {
  tipo: "H" | "V";
  valorInicial: number;
  alto: number;
  ancho: number;
  onClose: () => void;
  onConfirm: (val: number) => void;
}) {
  const [valor, setValor] = useState(valorInicial);
  const max = tipo === "H" ? alto - 1 : ancho - 1;
  const total = tipo === "H" ? alto : ancho;

  return (
    <Modal isOpen onOpenChange={onClose} size="xs">
      <ModalContent>
        {(onClose2: any) => (
          <>
            <ModalHeader className="font-display text-base">
              {tipo === "H" ? "Cruce horizontal" : "Cruce vertical"}
            </ModalHeader>
            <ModalBody className="gap-2 pb-2">
              <p className="text-xs text-zinc-500">
                {tipo === "H"
                  ? `Posición desde abajo (1 – ${alto - 1} mm)`
                  : `Posición desde izquierda (1 – ${ancho - 1} mm)`}
              </p>
              <Input
                label="Posición (mm)"
                type="number"
                autoFocus
                value={String(valor)}
                min={1}
                max={max}
                onValueChange={(v: string) => setValor(parseInt(v) || 0)}
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") {
                    onConfirm(valor);
                    onClose2();
                  }
                }}
                size="sm"
                endContent={
                  <span className="text-[10px] text-zinc-400">mm</span>
                }
                description={`${((valor / total) * 100).toFixed(0)}% del ${tipo === "H" ? "alto" : "ancho"}`}
                classNames={{
                  inputWrapper:
                    "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" size="sm" onPress={onClose2}>
                Cancelar
              </Button>
              <Button
                color="primary"
                size="sm"
                onPress={() => {
                  onConfirm(valor);
                  onClose2();
                }}
              >
                Agregar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
