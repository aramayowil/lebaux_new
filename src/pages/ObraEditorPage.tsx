import { useState, useCallback, useEffect } from "react";
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
  SlidersHorizontal,
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
    data: productos = [],
    isLoading: isLoadingProductos,
    isError: isErrorProductos,
  } = useProductos();
  const {
    data: tipos = [],
    isLoading: isLoadingTipos,
    isError: isErrorTipos,
  } = useTipos();
  const {
    data: hojas = [],
    isLoading: isLoadingHojas,
    isError: isErrorHojas,
  } = useHojas();
  const {
    data: obra,
    isLoading: isLoadingObra,
    isError: isErrorObra,
  } = useObra(idObra);
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

  // ── ESTADOS LOCALES DE EDICIÓN BUFFER ──
  const [localDescripcion, setLocalDescripcion] = useState("");
  const [localAncho, setLocalAncho] = useState("");
  const [localAlto, setLocalAlto] = useState("");
  const [localCantidad, setLocalCantidad] = useState("");

  const onCloseDespieceModal = () => setShowDespieceModal(false);

  // EVALUACIÓN DE SELECCIÓN ACTIVA
  const tipSel = tipologias.find((t) => t.id === selectedId) ?? null;
  const configSel = tipSel ? getConfig(tipSel.id) : null;

  // Sincronización del buffer local cuando cambia la tipología activa
  useEffect(() => {
    if (tipSel) {
      setLocalDescripcion(tipSel.descripcion || "");
      setLocalAncho(String(tipSel.ancho));
      setLocalAlto(String(tipSel.alto));
      setLocalCantidad(String(tipSel.cantidad));
    }
  }, [
    selectedId,
    tipSel?.descripcion,
    tipSel?.ancho,
    tipSel?.alto,
    tipSel?.cantidad,
  ]);

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

  const {
    resultado: despieceResult,
    error: despieceError,
    configurado,
  } = useDespiece(tipSel);

  // ── HANDLERS PERSISTENCIA CON DB ──
  const handleSaveDescripcion = () => {
    if (
      tipSel &&
      localDescripcion.trim() !== "" &&
      localDescripcion !== tipSel.descripcion
    ) {
      updateTipologia({
        id: tipSel.id,
        data: { descripcion: localDescripcion },
      });
    }
  };

  const handleSaveAncho = () => {
    if (tipSel) {
      const val = parseInt(localAncho) || 600;
      if (val !== tipSel.ancho)
        updateTipologia({ id: tipSel.id, data: { ancho: val } });
    }
  };

  const handleSaveAlto = () => {
    if (tipSel) {
      const val = parseInt(localAlto) || 600;
      if (val !== tipSel.alto)
        updateTipologia({ id: tipSel.id, data: { alto: val } });
    }
  };

  const handleSaveCantidad = () => {
    if (tipSel) {
      const val = parseInt(localCantidad) || 1;
      if (val !== tipSel.cantidad)
        updateTipologia({ id: tipSel.id, data: { cantidad: val } });
    }
  };

  // Cruces
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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-3 bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 stroke-[1.5]" />
        <p className="text-xs font-sans font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Cargando datos del editor...
        </p>
      </div>
    );
  }

  if (globalError || !obra) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-4 bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm font-semibold text-red-500 dark:text-red-400">
          No se pudo cargar la información de la obra
        </p>
        <Button
          variant="flat"
          size="sm"
          className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-transparent dark:border-zinc-800"
          onPress={() => navigate("/obras")}
        >
          ← Volver a Obras
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -m-6 animate-in fade-in duration-300 text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950">
      {/* ── TOP BAR MAESTRO (Diseño Unificado de Header) ── */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-zinc-200/60 dark:border-zinc-800/50 bg-gradient-to-r from-zinc-50 to-zinc-100/50 dark:from-zinc-900/40 dark:to-transparent shrink-0 z-10">
        <Button
          variant="light"
          isIconOnly
          size="sm"
          onPress={() => navigate("/obras")}
          className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-sans font-extrabold text-zinc-800 dark:text-zinc-100 text-base tracking-tight">
              {obra.apellido}, {obra.nombre}
            </h2>

            {configurado && (
              <div className="flex items-center gap-2 ml-2 animate-in fade-in duration-200">
                <Divider
                  orientation="vertical"
                  className="h-5 mx-1 bg-zinc-200 dark:bg-zinc-800"
                />

                <Tooltip content="Despiece del producto" size="sm">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="bordered"
                    onPress={() => {
                      setShowDespiece(true);
                      setShowDespieceModal(true);
                    }}
                    className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 rounded-xl"
                  >
                    <ChartPie size={16} />
                  </Button>
                </Tooltip>

                <Popover showArrow offset={10} placement="bottom">
                  <PopoverTrigger>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="bordered"
                      className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 rounded-xl"
                    >
                      <Tooltip
                        content="Acciones globales"
                        offset={17}
                        size="sm"
                      >
                        <Layers size={16} />
                      </Tooltip>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-zinc-700 dark:text-zinc-300 rounded-xl"
                    placement="bottom"
                  >
                    <div className="px-1 py-2 w-full">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 mb-2">
                        Acciones Estructura
                      </p>
                      <div className="flex flex-col gap-0.5">
                        <Button
                          size="sm"
                          variant="light"
                          className="justify-start px-2 text-xs text-zinc-700 dark:text-zinc-300"
                          startContent={<Square size={15} />}
                        >
                          Agregar premarcos
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          className="justify-start px-2 text-xs text-zinc-700 dark:text-zinc-300"
                          startContent={<SquaresSubtract size={15} />}
                        >
                          Agregar tapajuntas
                        </Button>
                        <Divider className="my-1.5 border-zinc-100 dark:border-zinc-800" />
                        <Button
                          size="sm"
                          variant="light"
                          className="justify-start px-2 text-xs text-red-500 dark:text-red-400"
                          startContent={<Eraser size={15} />}
                        >
                          Borrar premarcos
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          className="justify-start px-2 text-xs text-red-500 dark:text-red-400"
                          startContent={<Eraser size={15} />}
                        >
                          Borrar tapajuntas
                        </Button>
                        <Divider className="my-1.5 border-zinc-100 dark:border-zinc-800" />
                        <Button
                          size="sm"
                          variant="light"
                          className="justify-start px-2 text-xs text-zinc-700 dark:text-zinc-300"
                          startContent={<Palette size={15} />}
                        >
                          Cambiar color
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          className="justify-start px-2 text-xs text-zinc-700 dark:text-zinc-300"
                          startContent={<Copy size={15} />}
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
          <Tooltip content="Ver Presupuesto de Obra" size="sm">
            <Button
              isIconOnly
              variant="bordered"
              size="sm"
              onPress={() => navigate(`/obras/${idObra}/presupuesto`)}
              className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 h-9 w-9 rounded-xl shadow-none"
            >
              <Calculator size={17} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* ── BODY PRINCIPAL DE TRABAJO ── */}
      <div className="flex flex-1 min-h-0 bg-zinc-50 dark:bg-zinc-950">
        {/* ── SIDEBAR TIPOLOGÍAS (Estilo Card Dark/Transparente) ── */}
        <aside className="w-64 shrink-0 border-r border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/20">
            <span className="text-[11px] font-sans font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-widest">
              Tipologías
            </span>
            <Tooltip content="Nueva tipología" size="sm">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="w-6 h-6 min-w-6 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white rounded-md transition-all"
                onPress={() => setShowNuevoModal(true)}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              </Button>
            </Tooltip>
          </div>

          <ul className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            {tipologias.length === 0 && (
              <li className="py-12 px-4 text-center text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed flex flex-col items-center gap-2">
                Sin tipologías cargadas.
                <button
                  className="text-amber-500 underline hover:text-amber-600 font-semibold text-[11px]"
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
                  className={`group cursor-pointer rounded-xl transition-all ${
                    isSel
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-700/50"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 border border-transparent"
                  }`}
                  onClick={() => selectTipologia(t.id)}
                >
                  <div className="px-3 py-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {assigned ? (
                          <CheckCircle
                            className="w-3.5 h-3.5 text-emerald-500"
                            strokeWidth={2.5}
                          />
                        ) : (
                          <Circle
                            className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700"
                            strokeWidth={2}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-bold truncate ${isSel ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"}`}
                        >
                          {t.descripcion}
                        </p>
                        <p className="text-[10px] font-mono font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 tabular-nums">
                          {t.ancho} × {t.alto} mm
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <Chip
                            size="sm"
                            variant="flat"
                            className="h-4 bg-zinc-200/60 dark:bg-zinc-700/80 font-bold text-[10px] px-1 text-zinc-600 dark:text-zinc-300"
                          >
                            ×{t.cantidad}
                          </Chip>
                          {cfg?.tipo_cruce === 1 &&
                            (cfg.cruces_h > 0 || cfg.cruces_v > 0) && (
                              <Chip
                                size="sm"
                                variant="flat"
                                className="h-4 font-bold text-[10px] px-1 text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/10"
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
                                className="h-4 font-bold text-[10px] px-1 text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/10"
                              >
                                {cfg.pos_h?.length ?? 0}H{" "}
                                {cfg.pos_v?.length ?? 0}V var.
                              </Chip>
                            )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="w-5 h-5 min-w-5 text-zinc-400 hover:text-zinc-600"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            duplicateTipologia(t.id);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="w-5 h-5 min-w-5 text-red-400 hover:text-red-500"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            deleteTipologia({ id: t.id, id_obra: obra.id });
                            if (selectedId === t.id) setSelectedId(null);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── VISTA CENTRAL CENTRAL DEFAULT ASIMÉTRICA ── */}
        {!tipSel || !configSel ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 gap-6">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/60 shadow-sm animate-in zoom-in-95 duration-500">
              <LayoutGrid
                className="w-9 h-9 text-zinc-400 dark:text-zinc-600"
                strokeWidth={1.5}
              />
            </div>

            <div className="text-center space-y-2 max-w-sm px-4">
              <h3 className="font-sans text-lg font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">
                {tipologias.length === 0
                  ? "No hay tipologías"
                  : "Configurador Técnico de Obra"}
              </h3>
              <p className="font-sans text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                {tipologias.length === 0
                  ? "Creá una tipología desde el panel maestro izquierdo para inicializar el cálculo de perfiles, marcos e interiores."
                  : "Seleccioná un elemento de la lista izquierda para desplegar el lienzo técnico y su respectivo desglose de corte."}
              </p>
            </div>

            {tipologias.length === 0 && (
              <Button
                size="sm"
                className="bg-amber-500 font-bold text-white shadow-md rounded-xl px-5 hover:bg-amber-600 text-xs h-10"
                onPress={() => setShowNuevoModal(true)}
              >
                Crear Primera Tipología
              </Button>
            )}

            <Chip
              size="sm"
              variant="flat"
              avatar={<SlidersHorizontal className="w-3 h-3 text-amber-500" />}
              className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-2.5 h-6"
            >
              Módulo de Despiece Listo
            </Chip>
          </div>
        ) : (
          <div className="flex flex-1 min-w-0 min-h-0 animate-in fade-in duration-200">
            <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-zinc-50 dark:bg-zinc-950">
              {/* BARRA INTERNA DE EDICIÓN (Sub-Header con estilo de tarjeta) */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-zinc-900/50 border-b border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
                <Input
                  value={localDescripcion}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalDescripcion(e.target.value)
                  }
                  onBlur={handleSaveDescripcion}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    e.key === "Enter" && handleSaveDescripcion()
                  }
                  size="sm"
                  className="max-w-48"
                  aria-label="Descripción de la tipología"
                  variant="bordered"
                  classNames={{
                    trigger:
                      "h-9 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-xl",
                    inputWrapper:
                      "h-9 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-xl shadow-none px-2.5",
                    input:
                      "text-xs font-semibold text-zinc-800 dark:text-zinc-200",
                  }}
                />

                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 dark:text-zinc-500">
                  <NumberInput
                    value={localAncho}
                    onValueChange={(val: string) => setLocalAncho(val)}
                    onBlur={handleSaveAncho}
                    onKeyDown={(e: any) =>
                      e.key === "Enter" && handleSaveAncho()
                    }
                    size="sm"
                    className="w-24"
                    classNames={{
                      inputWrapper:
                        "h-9 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-none",
                      input:
                        "font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200",
                    }}
                    endContent={
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold">
                        W
                      </span>
                    }
                    aria-label="Ancho en milímetros"
                  />
                  <span className="text-zinc-400 dark:text-zinc-600 font-sans font-medium">
                    ×
                  </span>
                  <NumberInput
                    value={localAlto}
                    onValueChange={(val: string) => setLocalAlto(val)}
                    onBlur={handleSaveAlto}
                    onKeyDown={(e: any) =>
                      e.key === "Enter" && handleSaveAlto()
                    }
                    size="sm"
                    className="w-24"
                    classNames={{
                      inputWrapper:
                        "h-9 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-none",
                      input:
                        "font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200",
                    }}
                    endContent={
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold">
                        H
                      </span>
                    }
                    aria-label="Alto en milímetros"
                  />
                  <span className="text-zinc-400 dark:text-zinc-600 mx-0.5">
                    ·
                  </span>
                  <NumberInput
                    value={localCantidad}
                    onValueChange={(val: string) => setLocalCantidad(val)}
                    onBlur={handleSaveCantidad}
                    onKeyDown={(e: any) =>
                      e.key === "Enter" && handleSaveCantidad()
                    }
                    size="sm"
                    className="w-16"
                    classNames={{
                      inputWrapper:
                        "h-9 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-none",
                      input:
                        "font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200",
                    }}
                    startContent={
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold">
                        ×
                      </span>
                    }
                    aria-label="Cantidad de estructuras"
                  />
                </div>

                <div className="flex-1" />

                {/* BOTONES CRUCES RÁPIDOS */}
                <div className="flex items-center gap-1.5">
                  <Tooltip content="Insertar travesaño horizontal" size="sm">
                    <Button
                      size="sm"
                      variant="bordered"
                      isIconOnly
                      className="h-9 w-9 min-w-9 rounded-xl bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 shadow-none"
                      onPress={() =>
                        setCruceModal({
                          tipo: "H",
                          valor: Math.round(tipSel.alto / 2),
                        })
                      }
                    >
                      <SplitSquareVertical className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Insertar travesaño vertical" size="sm">
                    <Button
                      size="sm"
                      variant="bordered"
                      isIconOnly
                      className="h-9 w-9 min-w-9 rounded-xl bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 shadow-none"
                      onPress={() =>
                        setCruceModal({
                          tipo: "V",
                          valor: Math.round(tipSel.ancho / 2),
                        })
                      }
                    >
                      <SplitSquareHorizontal className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </div>
              </div>

              {/* CANVAS CONTENEDOR (Fondo puro estructurado) */}
              <div className="flex-1 flex items-center justify-center overflow-hidden relative p-6 bg-zinc-50 dark:bg-zinc-950">
                <TipologiaCanvas
                  tipologia={tipSel}
                  config={configSel}
                  tipoDeProducto={tipoDeProducto}
                  hojas={nHojas}
                  width={Math.max(
                    360,
                    (showConfig
                      ? window.innerWidth - 256 - 288
                      : window.innerWidth - 256) - 64,
                  )}
                  height={Math.max(280, window.innerHeight - 220)}
                />
              </div>
            </div>

            {/* PANEL CONFIGURACIÓN LATERAL */}
            {showConfig && (
              <aside className="w-72 shrink-0 border-l border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/50 overflow-y-auto scrollbar-thin flex flex-col">
                <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/20">
                  <p className="font-sans text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    Especificaciones Técnicas
                  </p>
                </div>
                <div className="p-4 flex-1">
                  <TipologiaConfigPanel
                    key={tipSel.id}
                    id_tipologia={tipSel.id}
                    ancho={tipSel.ancho}
                    alto={tipSel.alto}
                  />
                </div>
              </aside>
            )}

            {/* MODAL DESPIECE */}
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

      {/* MODALES GLOBALES */}
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

// ── CrucePositionModal (Mejoras estéticas y estructurales) ──────────────────────────────────
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
    <Modal
      isOpen
      onOpenChange={onClose}
      size="xs"
      classNames={{ backdrop: "bg-zinc-950/50 backdrop-blur-xs" }}
    >
      <ModalContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        {(onClose2: any) => (
          <>
            <ModalHeader className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-100 px-5 pt-5 pb-2">
              {tipo === "H" ? "Cruce Horizontal" : "Cruce Vertical"}
            </ModalHeader>
            <ModalBody className="gap-3 px-5 pb-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {tipo === "H"
                  ? `Posición en milímetros calculada desde la base (1 – ${alto - 1} mm):`
                  : `Posición en milímetros calculada desde la izquierda (1 – ${ancho - 1} mm):`}
              </p>
              <Input
                label="Ubicación"
                type="number"
                autoFocus
                value={String(valor)}
                min={1}
                max={max}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValor(parseInt(e.target.value) || 0)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    onConfirm(valor);
                    onClose2();
                  }
                }}
                size="sm"
                variant="bordered"
                endContent={
                  <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                    mm
                  </span>
                }
                description={`${((valor / total) * 100).toFixed(0)}% respecto al total.`}
                classNames={{
                  inputWrapper:
                    "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-none h-11",
                  input: "text-zinc-800 dark:text-zinc-100 font-medium",
                  description:
                    "text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-1",
                }}
              />
            </ModalBody>
            <ModalFooter className="border-t border-zinc-100 dark:border-zinc-800/60 py-3 px-5 justify-end gap-2">
              <Button
                variant="light"
                size="sm"
                className="font-bold text-xs text-zinc-500 dark:text-zinc-400 h-9 rounded-xl"
                onPress={onClose2}
              >
                Cancelar
              </Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 font-bold text-white text-xs rounded-xl h-9 px-4 shadow-none"
                size="sm"
                onPress={() => {
                  onConfirm(valor);
                  onClose2();
                }}
              >
                Insertar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
