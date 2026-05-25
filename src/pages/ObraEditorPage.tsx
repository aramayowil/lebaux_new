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
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
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
  Layers,
  Square,
  SquaresSubtract,
  Eraser,
  Palette,
  ChartPie,
  Loader2,
} from "lucide-react";

import { useObrasStore } from "@/store/obrasStore";
import TipologiaCanvas from "@/components/canvas/TipologiaCanvas";
import TipologiaConfigPanel from "@/components/obras/TipologiaConfigPanel";
import TravesanoModal from "@/components/obras/TravesanoModal";
import NuevaTipologiaModal from "@/components/obras/NuevaTipologiaModal";
import type { TipologiaConfig } from "@/store/obrasStore";
import { useDespiece } from "@/hooks/useDespiece";
import DespieceModal from "@/components/obras/DespieceModal";

import { useHojas } from "@/hooks/productos/useHojas";
import { useObra } from "@/hooks/obra/useObras";
import {
  useAddTipologia,
  useDeleteTipologia,
  useDuplicateTipologia,
  useTipologiasByObra,
  useUpdateTipologia,
} from "@/hooks/obra/useTipologias";
import { useProductos } from "@/hooks/productos/useProducto";
import { useTipos } from "@/hooks/obra/useTipos";
import { NumberInput } from "@heroui/react";

interface CruceModal {
  tipo: "H" | "V";
  valor: number;
}

export default function ObraEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idObra = Number(id);

  const { getConfig, patchConfig } = useObrasStore();

  // ── HOOKS PRODUCTOS Y TIPOS ──
  const {
    data: productos,
    isLoading: isLoadingProductos,
    isError: isErrorProductos,
  } = useProductos();
  const {
    data: tipos,
    isLoading: isLoadingTipos,
    isError: isErrorTipos,
  } = useTipos();

  // ── HOOKS HOJAS ──
  const {
    data: hojas,
    isLoading: isLoadingHojas,
    isError: isErrorHojas,
  } = useHojas();

  // ── HOOKS OBRAS ──
  const {
    data: obra,
    isLoading: isLoadingObra,
    isError: isErrorObra,
  } = useObra(idObra);

  // ── HOOKS TIPOLOGIAS ──
  const {
    data: tipologias = [],
    isLoading: isLoadingTipologias,
    isError: isErrorTipologias,
  } = useTipologiasByObra(idObra);

  const { mutateAsync: addTipologia } = useAddTipologia();
  const { mutateAsync: updateTipologia } = useUpdateTipologia();
  const { mutateAsync: deleteTipologia } = useDeleteTipologia();
  const { mutateAsync: duplicateTipologia } = useDuplicateTipologia();

  // ── ESTADOS DE UI ──
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const [showDespiece, setShowDespiece] = useState(false);
  const [cruceModal, setCruceModal] = useState<CruceModal | null>(null);

  const [showNuevoModal, setShowNuevoModal] = useState(false);
  const [travesanoOpen, setTravesanoOpen] = useState(false);
  const [showDespieceModal, setShowDespieceModal] = useState(false);

  const onCloseDespieceModal = () => setShowDespieceModal(false);

  // ── EVALUACIÓN DE SELECCIÓN ACTIVA ──
  const tipSel = tipologias.find((t) => t.id === selectedId) ?? null;
  const configSel = tipSel ? getConfig(tipSel.id) : null;

  const nHojas =
    configSel?.id_hoja && hojas
      ? (hojas.find((h) => h.id === configSel.id_hoja)?.cantidad ?? 1)
      : 1;

  const formaTipo =
    productos && configSel
      ? productos.find((p) => p.id === configSel.id_producto)?.id_tipo
      : null;
  const tipoDeProducto =
    tipos && formaTipo
      ? tipos.find((t) => t.id === formaTipo)?.forma_tipo
      : undefined;

  // Motor de despiece (Solo se ejecuta de manera interna si hay tipología activa)
  const {
    resultado: despieceResult,
    error: despieceError,
    configurado,
  } = useDespiece(tipSel);

  // ── ACCIONES DE CRUCES ──
  function addCruceH(mm?: number) {
    if (!selectedId || !tipSel) return;
    const cfg = getConfig(selectedId);
    const pos = mm ?? Math.round(tipSel.alto / 2);
    const posH = [...(cfg.pos_h ?? []), pos].sort((a, b) => a - b);
    patchConfig(selectedId, {
      tipo_cruce: 2,
      pos_h: posH,
      cruces_h: posH.length,
    });
  }

  function addCruceV(mm?: number) {
    if (!selectedId || !tipSel) return;
    const cfg = getConfig(selectedId);
    const pos = mm ?? Math.round(tipSel.ancho / 2);
    const posV = [...(cfg.pos_v ?? []), pos].sort((a, b) => a - b);
    patchConfig(selectedId, {
      tipo_cruce: 2,
      pos_v: posV,
      cruces_v: posV.length,
    });
  }

  const selectTipologia = useCallback((id: number) => {
    setSelectedId(id);
    setShowConfig(true);
  }, []);

  async function handleCrearTipologia(
    datos: {
      descripcion: string;
      ancho: number;
      alto: number;
      cantidad: number;
    },
    config: Partial<TipologiaConfig>,
  ) {
    const t = await addTipologia({ ...datos, id_obra: idObra });
    if (config.id_producto) {
      patchConfig(t.id, config);
    }
    setSelectedId(t.id);
  }

  // ── CONTROL DE CARGA GLOBAL Y ERRORES ──
  const globalLoading =
    isLoadingProductos ||
    isLoadingTipos ||
    isLoadingHojas ||
    isLoadingObra ||
    isLoadingTipologias;
  const globalError =
    isErrorProductos ||
    isErrorTipos ||
    isErrorHojas ||
    isErrorObra ||
    isErrorTipologias;

  if (globalLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-3 bg-white dark:bg-steel-950">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm text-steel-500 font-medium">
          Cargando datos del editor...
        </p>
      </div>
    );
  }

  if (globalError || !obra) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-4 bg-white dark:bg-steel-950">
        <p className="text-sm font-semibold text-red-500">
          No se pudo cargar la información de la obra
        </p>
        <Button variant="flat" size="sm" onPress={() => navigate("/obras")}>
          ← Volver a Obras
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -m-6 fade-in">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-steel-200 dark:border-steel-800 bg-white dark:bg-steel-900 shrink-0 shadow-sm z-10">
        <Button
          variant="light"
          isIconOnly
          size="sm"
          onPress={() => navigate("/obras")}
          className="text-steel-300 hover:text-steel-600"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </Button>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-steel-900 dark:text-steel-100 text-md">
              {obra.apellido}, {obra.nombre}
            </h2>

            <Divider orientation="vertical" className="h-8 mx-2" />

            {configurado && (
              <div className="flex items-center gap-2">
                <Tooltip content="Despiece del producto">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                      setShowDespiece(true);
                      setShowDespieceModal(true);
                    }}
                    className="bg-steel-100 dark:bg-steel-800 hover:bg-[#db924b]/20 transition-colors rounded-lg border border-steel-200 dark:border-steel-700"
                  >
                    <ChartPie size={18} />
                  </Button>
                </Tooltip>

                <Divider orientation="vertical" className="h-8 mx-1" />

                <Popover showArrow offset={10} placement="bottom">
                  <PopoverTrigger>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="bg-steel-100 dark:bg-steel-800 hover:bg-[#db924b]/20 transition-colors rounded-lg border border-steel-200 dark:border-steel-700"
                    >
                      <Tooltip content="Acciones globales" offset={17}>
                        <Layers size={18} />
                      </Tooltip>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" placement="bottom">
                    <div className="px-1 py-2 w-full">
                      <p className="text-small font-bold text-foreground px-2 mb-2">
                        Acciones
                      </p>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="light"
                          className="justify-start px-2"
                          startContent={<Square size={18} />}
                        >
                          Agregar premarcos
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          className="justify-start px-2"
                          startContent={<SquaresSubtract size={18} />}
                        >
                          Agregar tapajuntas
                        </Button>
                        <Divider className="my-1" />
                        <Button
                          size="sm"
                          variant="light"
                          className="justify-start px-2"
                          startContent={<Eraser size={18} />}
                        >
                          Borrar premarcos
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          className="justify-start px-2"
                          startContent={<Eraser size={18} />}
                        >
                          Borrar tapajuntas
                        </Button>
                        <Divider className="my-1" />
                        <Button
                          size="sm"
                          variant="light"
                          className="justify-start px-2"
                          startContent={<Palette size={18} />}
                        >
                          Cambiar color
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          className="justify-start px-2"
                          startContent={<Copy size={18} />}
                        >
                          Cambiar interiores
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Tooltip content="Presupuesto">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => navigate(`/obras/${idObra}/presupuesto`)}
              className="bg-steel-100 dark:bg-steel-800 hover:bg-[#db924b]/20 transition-colors rounded-lg border border-steel-200 dark:border-steel-700"
            >
              <Calculator size={19} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* ── Body Principal ── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar tipologías ── */}
        <aside className="w-56 shrink-0 border-r border-steel-200 dark:border-steel-800 bg-white dark:bg-steel-900 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-steel-100 dark:border-steel-800">
            <span className="text-xs font-sans font-semibold text-steel-500 uppercase tracking-wide">
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
              <li className="p-4 text-center text-xs text-steel-400 leading-relaxed">
                Sin tipologías.
                <br />
                <button
                  className="text-steel-500 underline hover:text-steel-700 mt-1 font-semibold"
                  onClick={() => setShowNuevoModal(true)}
                >
                  Crear una ahora
                </button>
              </li>
            )}
            {tipologias.map((t) => {
              const cfg = getConfig(t.id);
              const isSel = selectedId === t.id;
              const assigned =
                cfg?.id_producto !== null && cfg?.id_producto !== undefined;
              return (
                <li
                  key={t.id}
                  className={`group cursor-pointer border-b border-steel-100 dark:border-steel-800/60 transition-colors ${isSel ? "bg-steel-100 dark:bg-steel-800" : "hover:bg-steel-50 dark:hover:bg-steel-800/40"}`}
                  onClick={() => selectTipologia(t.id)}
                >
                  <div className="px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0">
                        {assigned ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-steel-300 dark:text-steel-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium truncate ${isSel ? "text-steel-900 dark:text-steel-100" : "text-steel-700 dark:text-steel-300"}`}
                        >
                          {t.descripcion}
                        </p>
                        <p className="text-xs font-mono text-steel-400 mt-0.5 tabular-nums">
                          {t.ancho} × {t.alto} mm
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Chip
                            size="sm"
                            variant="flat"
                            classNames={{
                              base: "h-4",
                              content: "text-xs px-1",
                            }}
                          >
                            ×{t.cantidad}
                          </Chip>
                          {cfg?.tipo_cruce === 1 &&
                            (cfg.cruces_h > 0 || cfg.cruces_v > 0) && (
                              <Chip
                                size="sm"
                                variant="flat"
                                color="secondary"
                                classNames={{
                                  base: "h-4",
                                  content: "text-xs px-1",
                                }}
                              >
                                {cfg.cruces_h}H {cfg.cruces_v}V
                              </Chip>
                            )}
                          {cfg?.tipo_cruce === 2 &&
                            ((cfg.pos_h?.length ?? 0) > 0 ||
                              (cfg.pos_v?.length ?? 0) > 0) && (
                              <Chip
                                size="sm"
                                variant="flat"
                                color="secondary"
                                classNames={{
                                  base: "h-4",
                                  content: "text-xs px-1",
                                }}
                              >
                                {cfg.pos_h?.length ?? 0}H{" "}
                                {cfg.pos_v?.length ?? 0}V var.
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
                            <Copy className="w-3 h-3 text-steel-400" />
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
                              deleteTipologia({ id: t.id, id_obra: obra.id });
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

        {/* ── Vista Central: Condicional según Selección ── */}
        {!tipSel || !configSel ? (
          <div className="flex-1 flex items-center justify-center bg-steel-50 dark:bg-steel-950/50">
            <div className="text-center space-y-2">
              <LayoutGrid
                className="w-12 h-12 text-steel-300 dark:text-steel-700 mx-auto"
                strokeWidth={1}
              />
              <p className="text-sm font-medium text-steel-500">
                {tipologias.length === 0
                  ? "No hay tipologías cargadas"
                  : "Seleccioná una tipología"}
              </p>
              <p className="text-xs text-steel-400">
                {tipologias.length === 0
                  ? "Creá una desde el panel izquierdo para comenzar"
                  : "Elegí un elemento de la lista para editar"}
              </p>
              {tipologias.length === 0 && (
                <Button
                  className="mt-2"
                  size="sm"
                  color="primary"
                  onPress={() => setShowNuevoModal(true)}
                >
                  Crear Tipología
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 min-w-0 min-h-0">
            <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-100 dark:bg-steel-950/80">
              {/* Barra interna superior de la tipología */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-steel-900 border-b border-steel-100 dark:border-steel-800 shrink-0">
                <Input
                  value={tipSel.descripcion}
                  onValueChange={(v: string) =>
                    updateTipologia({ id: tipSel.id, data: { descripcion: v } })
                  }
                  size="sm"
                  className="max-w-44"
                  classNames={{
                    inputWrapper:
                      "h-7 min-h-unit-7 bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700",
                  }}
                />

                <div className="flex items-center gap-1 text-xs font-mono text-steel-500">
                  <NumberInput
                    value={String(tipSel.ancho)}
                    onValueChange={(v: string) =>
                      updateTipologia({
                        id: tipSel.id,
                        data: { ancho: parseInt(v) || 600 },
                      })
                    }
                    size="sm"
                    className="w-24"
                    classNames={{
                      inputWrapper:
                        "h-7 min-h-unit-7 bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700",
                      input: "font-mono text-xs",
                    }}
                    endContent={
                      <span className="text-xs text-steel-400">mm</span>
                    }
                    aria-label="Ancho"
                  />
                  <span className="text-steel-300">×</span>
                  <NumberInput
                    value={String(tipSel.alto)}
                    onValueChange={(v: string) =>
                      updateTipologia({
                        id: tipSel.id,
                        data: { alto: parseInt(v) || 600 },
                      })
                    }
                    size="sm"
                    className="w-24"
                    classNames={{
                      inputWrapper:
                        "h-7 min-h-unit-7 bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700",
                      input: "font-mono text-xs",
                    }}
                    endContent={
                      <span className="text-xs text-steel-400">mm</span>
                    }
                    aria-label="Alto"
                  />
                  <span className="text-steel-400 text-xs">·</span>
                  <NumberInput
                    value={String(tipSel.cantidad)}
                    onValueChange={(v: string) =>
                      updateTipologia({
                        id: tipSel.id,
                        data: { cantidad: parseInt(v) || 1 },
                      })
                    }
                    size="sm"
                    className="w-16"
                    classNames={{
                      inputWrapper:
                        "h-7 min-h-unit-7 bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700",
                      input: "font-mono text-xs",
                    }}
                    startContent={
                      <span className="text-xs text-steel-400">×</span>
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
              </div>

              {/* Canvas contenedor */}
              <div className="flex-1 flex items-center justify-center overflow-hidden relative">
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
              </div>
            </div>

            {/* Panel lateral de configuración */}
            {showConfig && (
              <aside className="w-72 shrink-0 border-l border-steel-200 dark:border-steel-800 bg-white dark:bg-steel-900 overflow-y-auto scrollbar-thin">
                <div className="px-4 py-4 border-b border-steel-100 dark:border-steel-800">
                  <p className="font-sans text-xs font-semibold text-steel-500 uppercase tracking-wide">
                    Configuración
                  </p>
                </div>
                <div className="p-4">
                  <TipologiaConfigPanel
                    key={tipSel.id}
                    id_tipologia={tipSel.id}
                    ancho={tipSel.ancho}
                    alto={tipSel.alto}
                  />
                </div>
              </aside>
            )}

            {/* Modal despiece */}
            {showDespiece && (
              <DespieceModal
                isOpen={showDespieceModal}
                onOpenChange={onCloseDespieceModal}
                tipSel={tipSel}
                despieceError={despieceError}
                despieceResult={despieceResult}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Modales Globales ── */}
      <NuevaTipologiaModal
        isOpen={showNuevoModal}
        onOpenChange={() => setShowNuevoModal(false)}
        onCrear={handleCrearTipologia}
      />

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
          const posH = [...(cfg.pos_h ?? []), ...nuevosH].sort((a, b) => a - b);
          patchConfig(selectedId, {
            tipo_cruce: 2,
            pos_h: posH,
            cruces_h: posH.length,
          });
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
              <p className="text-xs text-steel-500">
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
                endContent={<span className="text-xs text-steel-400">mm</span>}
                description={`${((valor / total) * 100).toFixed(0)}% del ${tipo === "H" ? "alto" : "ancho"}`}
                classNames={{
                  inputWrapper:
                    "bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700",
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
