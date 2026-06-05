import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Chip,
  Tooltip,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Input, // <- Agregado para los inputs de edición rápida
} from "@heroui/react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  SplitSquareHorizontal,
  SplitSquareVertical,
  Calculator,
  Layers,
  Square,
  SquaresSubtract,
  Eraser,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Settings2,
  PenLine,
  CircleCheckBig,
} from "lucide-react";
import clsx from "clsx";
import TipologiaCanvas from "@/components/canvas/TipologiaCanvas";
import TipologiaConfigPanel from "@/components/obras/TipologiaConfigPanel";
import NuevaTipologiaModal from "@/components/obras/NuevaTipologiaModal";
import DespieceModal from "@/components/obras/DespieceModal";

import { useObra } from "@/hooks/obra/useObras";
import {
  useAddTipologia,
  useDeleteTipologia,
  useTipologiasByObra,
  useUpdateTipologia, // <- Agregado
  useDuplicateTipologia, // <- Agregado
} from "@/hooks/obra/useObrasTipologias";
import {
  useUpsertObraDetalle,
  useObraDetallesByTipologia,
} from "@/hooks/obra/useObraDetalles";
import { useProductos } from "@/hooks/productos/useProducto";
import type { ObraDetalle, ObraTipologia } from "@/types";
import ObraEditorPageSkeleton from "@/components/obras/skeletons/ObrasEditorPageSkeleton";

export default function ObraEditorPage() {
  const params = useParams();
  const { id } = params;
  const idObra = id ? parseInt(id, 10) : null;

  if (idObra === null || isNaN(idObra)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
          <p className="font-bold">Error: ID de obra no encontrado</p>
        </div>
        <Button onPress={() => window.history.back()}>
          Volver a mis obras
        </Button>
      </div>
    );
  }

  const navigate = useNavigate();

  // ── ESTADOS DE SELECCIÓN Y UI ─────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNuevoModal, setShowNuevoModal] = useState(false);
  const [showDespieceModal, setShowDespieceModal] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // ── ESTADOS LOCALES PARA INPUTS DE EDICIÓN RÁPIDA (NUEVO) ─────────────────
  const [localDescripcion, setLocalDescripcion] = useState("");
  const [localAncho, setLocalAncho] = useState("");
  const [localAlto, setLocalAlto] = useState("");
  const [localCantidad, setLocalCantidad] = useState("");

  // ── HOOKS DE CARGA DE DATOS ───────────────────────────────────────────────
  const { data: obra, isLoading: loadObra } = useObra(idObra);
  const { data: tipologias = [], isLoading: loadTipos } =
    useTipologiasByObra(idObra);
  const { data: obraDetalles = [], isLoading: loadDetalles } =
    useObraDetallesByTipologia(selectedId ?? undefined);
  const { data: productos = [] } = useProductos();

  // ── MUTACIONES (HOOKS DE ACCIÓN) ──────────────────────────────────────────
  const { mutateAsync: addTipologia } = useAddTipologia();
  const { mutateAsync: updateTipologia, isPending: savingTipologia } =
    useUpdateTipologia(); // <- Agregado
  const { mutateAsync: duplicateTipologia } = useDuplicateTipologia(); // <- Agregado
  const { mutateAsync: deleteTipologia } = useDeleteTipologia();
  const { mutateAsync: upsertDetalle, isPending: savingDetalle } =
    useUpsertObraDetalle();

  // ── EFECTOS DE AUTOSELECCIÓN ──────────────────────────────────────────────
  useEffect(() => {
    if (!selectedId && tipologias.length > 0 && tipologias[0]?.id) {
      setSelectedId(tipologias[0].id);
    }
  }, [tipologias, selectedId]);

  const tipSel =
    tipologias.find((t: ObraTipologia) => t.id === selectedId) ?? null;
  const detallesObraSelect =
    obraDetalles.find((d) => d.id_tipologia === selectedId) ?? null;

  const isSaving = savingTipologia || savingDetalle;

  // ── EFECTO DE SINCRONIZACIÓN DE INPUTS LOCALES (NUEVO) ────────────────────
  useEffect(() => {
    if (tipSel) {
      setLocalDescripcion(tipSel.descripcion || "");
      setLocalAncho(String(tipSel.ancho ?? ""));
      setLocalAlto(String(tipSel.alto ?? ""));
      setLocalCantidad(String(tipSel.cantidad ?? "1"));
    }
  }, [
    selectedId,
    tipSel?.descripcion,
    tipSel?.ancho,
    tipSel?.alto,
    tipSel?.cantidad,
  ]);

  // ── MANEJADORES DE ACTUALIZACIÓN ATÓMICA AL SALIR O ENTER (NUEVO) ─────────
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
      const val = parseInt(localAncho, 10) || 600;
      if (val !== tipSel.ancho) {
        updateTipologia({ id: tipSel.id, data: { ancho: val } });
      }
    }
  };

  const handleSaveAlto = () => {
    if (tipSel) {
      const val = parseInt(localAlto, 10) || 600;
      if (val !== tipSel.alto) {
        updateTipologia({ id: tipSel.id, data: { alto: val } });
      }
    }
  };

  const handleSaveCantidad = () => {
    if (tipSel) {
      const val = parseInt(localCantidad, 10) || 1;
      if (val !== tipSel.cantidad) {
        updateTipologia({ id: tipSel.id, data: { cantidad: val } });
      }
    }
  };

  // ── MANEJADORES DE ENTRADA Y FLUJOS PRINCIPALES ───────────────────────────

  async function handleCrearTipologia(
    datos: {
      descripcion: string;
      ancho: number;
      alto: number;
      cantidad: number;
    },
    config: {
      id_producto?: number | null;
      id_marco?: number | null;
      id_hoja?: number | null;
      id_interior?: number | null;
      id_tipo?: number | null;
    },
  ) {
    try {
      const t = await addTipologia({ ...datos, id_obra: idObra });

      const productoSeleccionado = productos.find(
        (p) => p.id === config.id_producto,
      );

      const nuevoDetalle: Omit<ObraDetalle, "id"> = {
        id_obra: idObra,
        id_tipologia: t.id,
        ubicacion_en_tipo: null,

        ancho: datos.ancho,
        alto: datos.alto,

        difiere_en_ancho: false,
        difiere_en_alto: false,
        ligado_ancho_tipologia: false,
        ligado_alto_tipologia: false,
        llega_al_final_ancho: false,
        llega_al_final_alto: false,

        id_extrusora: productoSeleccionado?.id_extrusora ?? null,
        id_linea: productoSeleccionado?.id_linea ?? null,
        id_tipo: productoSeleccionado?.id_tipo ?? null,
        id_producto: config.id_producto ?? null,

        color: null,
        marco: config.id_marco ?? null,
        hoja: config.id_hoja ?? null,
        mano: null,
        interior: config.id_interior ?? null,
        contravidrios: null,
        contravidrios_ext: null,
        cruce: null,
        mosquitero: null,
        tela: null,

        tipo_cruce: 0,
        cant_centrados_horizontal: 0,
        cant_centrados_vertical: 0,

        activo_vr_1: false,
        activo_vr_2: false,
        activo_vr_3: false,
        activo_vr_4: false,

        colocacion: false,
        acople_desde: null,
        acople_hasta: null,
        perfil_acople: null,
        descri_item_manual: null,
        costo_item_manual: null,
        moneda_item_manual: null,
      };

      await upsertDetalle(nuevoDetalle);
      setSelectedId(t.id);
    } catch (error) {
      console.error("Error al crear tipología:", error);
    }
  }

  // Ahora llama efectivamente a la mutación en lugar del console.log anterior
  const handleDuplicar = useCallback(
    async (id: number) => {
      try {
        await duplicateTipologia(id);
      } catch (err) {
        console.error("Error al duplicar tipología:", err);
      }
    },
    [duplicateTipologia],
  );

  const handleBorrar = useCallback(
    async (id: number) => {
      try {
        await deleteTipologia({ id, id_obra: idObra });

        if (selectedId === id) {
          setSelectedId(null);
        }
      } catch (err) {
        console.error("Error al borrar tipología:", err);
      }
    },
    [deleteTipologia, selectedId, idObra],
  );

  // Loading global del layout
  const isLoadingGlobal = loadObra || loadTipos || loadDetalles;

  if (isLoadingGlobal) {
    return <ObraEditorPageSkeleton />;
  }

  return (
    <div className="flex flex-col w-full h-full bg-zinc-50 dark:bg-zinc-950 select-none overflow-hidden text-zinc-900 dark:text-zinc-100">
      {/* HEADER DE CONTROL */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            className="rounded-lg text-zinc-500 dark:text-zinc-400"
            onPress={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-baseline gap-1.5">
            <h1 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 capitalize">
              {obra?.nombre}
            </h1>
            {obra?.apellido && (
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 capitalize">
                {obra.apellido}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs h-8 rounded-lg px-3"
            startContent={<Calculator className="h-3.5 w-3.5" />}
            onPress={() => setShowDespieceModal(true)}
            isDisabled={!selectedId}
          >
            Ver Despiece Técnico
          </Button>
          <Button
            isIconOnly
            variant="bordered"
            size="sm"
            className="h-8 w-8 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
            onPress={() => setIsRightPanelOpen(!isRightPanelOpen)}
          >
            {isRightPanelOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* PANEL IZQUIERDO: LISTA DE TIPOLOGÍAS */}
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Tipologías en Obra
            </span>
            <Button
              size="sm"
              variant="bordered"
              className="h-7 px-2.5 text-[11px] font-semibold tracking-wide text-amber-600 dark:text-amber-500 border-amber-600 dark:border-amber-500/70 bg-transparent rounded-lg"
              startContent={<Plus className="h-3 w-3" />}
              onPress={() => setShowNuevoModal(true)}
            >
              Nueva
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {tipologias.map((t: ObraTipologia) => {
              const isActive = t.id === selectedId;
              const showSaving = isActive && isSaving;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={clsx(
                    "group flex flex-col p-2.5 rounded-xl cursor-pointer border transition-all",
                    isActive
                      ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-500/40 dark:border-amber-500/30"
                      : "bg-zinc-50 dark:bg-zinc-800/25 border-transparent hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Icono de estado: spinner si guardando, check si seleccionado */}
                    {(isActive || showSaving) && (
                      <div className="shrink-0 mt-0.5">
                        {showSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        ) : (
                          <CircleCheckBig className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </div>
                    )}

                    <span
                      className={clsx(
                        "text-xs font-bold truncate flex-1",
                        isActive
                          ? "text-amber-700 dark:text-amber-400/80"
                          : "text-zinc-700 dark:text-zinc-300",
                      )}
                    >
                      {t.descripcion}
                    </span>

                    {/* Botones siempre visibles, no solo en hover */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Popover placement="right" offset={10} showArrow>
                        <PopoverTrigger>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-3 w-52 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl">
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                              Duplicar tipología
                            </p>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                              Se creará una copia exacta de{" "}
                              <span className="font-semibold">
                                {t.descripcion}
                              </span>
                              .
                            </p>
                            <Button
                              size="sm"
                              className="h-7 text-xs font-bold bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg mt-1"
                              onPress={() => handleDuplicar(t.id)}
                            >
                              Confirmar copia
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover placement="right" offset={10} showArrow>
                        <PopoverTrigger>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-3 w-52 dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 shadow-xl rounded-xl">
                          <div className="flex flex-col gap-2">
                            <p className="text-xs text-center font-bold text-zinc-700 dark:text-zinc-200">
                              ¿Eliminar tipología?
                            </p>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                              Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Button
                                size="sm"
                                className="flex-1 h-7 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                onPress={() => handleBorrar(t.id)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    <span>
                      {t.ancho} × {t.alto} mm
                    </span>
                    <Chip
                      size="sm"
                      variant="flat"
                      className="h-4 text-[9px] px-1 font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      Cant: {t.cantidad || 1}
                    </Chip>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* CONTENEDOR CENTRAL: CANVAS DEL ENTORNO GRÁFICO CON SUB-TOOLBAR */}
        <main className="flex-1 bg-zinc-50 dark:bg-zinc-950 flex flex-col overflow-hidden relative">
          {tipSel && detallesObraSelect ? (
            <>
              {/* CONTENEDOR GRÁFICO DEL CANVAS */}
              <div className="flex-1 w-full flex items-center justify-center relative p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-100/60 to-zinc-50 dark:from-zinc-900/40 dark:to-zinc-950">
                {/* CANVAS DIBUJO TÉCNICO */}
                <TipologiaCanvas
                  tipologia={tipSel}
                  detalles={detallesObraSelect}
                  width={tipSel.ancho ?? 0}
                  height={tipSel.alto ?? 0}
                />
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-2 flex items-center gap-1 z-50">
                <Tooltip content="Añadir Travesaño Horizontal" delay={400}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="rounded-xl h-9 w-9 text-zinc-600 dark:text-zinc-300"
                    onPress={() => console.log("Agregar Travesaño Horizontal")}
                  >
                    <SplitSquareHorizontal className="h-5 w-5" />
                  </Button>
                </Tooltip>

                <Tooltip content="Añadir Travesaño Vertical" delay={400}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="rounded-xl h-9 w-9 text-zinc-600 dark:text-zinc-300"
                    onPress={() => console.log("Agregar Travesaño Vertical")}
                  >
                    <SplitSquareVertical className="h-5 w-5" />
                  </Button>
                </Tooltip>

                <Divider
                  orientation="vertical"
                  className="h-5 bg-zinc-200 dark:bg-zinc-800 mx-1"
                />

                {/* MENÚ DE EDICIÓN RÁPIDA REACTIVA */}
                <Popover placement="top" offset={20} showArrow={true}>
                  <PopoverTrigger>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="rounded-xl h-9 w-9 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60"
                      aria-label="Ajuste rápido"
                    >
                      <PenLine className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-4 w-72 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl">
                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-md font-bold text-zinc-700 dark:text-zinc-300 w-full text-center">
                          Ajustes Rápidos
                        </span>
                      </div>

                      <Input
                        label="Descripción"
                        size="md"
                        variant="faded"
                        placeholder="Ej. Ventana Cocina"
                        value={localDescripcion}
                        onValueChange={setLocalDescripcion}
                        onBlur={handleSaveDescripcion}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                          e.key === "Enter" && handleSaveDescripcion()
                        }
                      />

                      <div className="flex gap-2">
                        <Input
                          label="Ancho"
                          size="md"
                          variant="faded"
                          type="number"
                          min={0}
                          onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                            e.target.select()
                          }
                          endContent={
                            <span className="text-zinc-400 text-md">mm</span>
                          }
                          value={localAncho}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setLocalAncho(e.target.value)
                          }
                          onBlur={handleSaveAncho}
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>,
                          ) => e.key === "Enter" && handleSaveAncho()}
                          classNames={{
                            input:
                              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                          }}
                        />
                        <Input
                          label="Alto"
                          size="md"
                          type="number"
                          variant="faded"
                          min={0}
                          onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                            e.target.select()
                          }
                          endContent={
                            <span className="text-zinc-400 text-sm">mm</span>
                          }
                          value={localAlto}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setLocalAlto(e.target.value)
                          }
                          onBlur={handleSaveAlto}
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>,
                          ) => e.key === "Enter" && handleSaveAlto()}
                          classNames={{
                            input:
                              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                          }}
                        />
                      </div>

                      <Input
                        label="Cantidad"
                        size="md"
                        type="number"
                        variant="faded"
                        min={1}
                        onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                          e.target.select()
                        }
                        value={localCantidad}
                        onValueChange={setLocalCantidad}
                        onBlur={handleSaveCantidad}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                          e.key === "Enter" && handleSaveCantidad()
                        }
                        classNames={{
                          input:
                            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                <Divider
                  orientation="vertical"
                  className="h-5 bg-zinc-200 dark:bg-zinc-800 mx-1"
                />

                <Popover placement="top" offset={10}>
                  <PopoverTrigger>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="rounded-xl h-9 w-9 text-zinc-600 dark:text-zinc-300"
                    >
                      <Layers className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-2 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl">
                    <div className="flex flex-col gap-1 w-44">
                      <button className="flex items-center gap-2 px-2.5 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                        <Square className="h-3.5 w-3.5 text-amber-500" /> Añadir
                        Premarco
                      </button>
                      <button className="flex items-center gap-2 px-2.5 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                        <SquaresSubtract className="h-3.5 w-3.5 text-amber-500" />{" "}
                        Añadir Tapajuntas
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Tooltip content="Limpiar Modificaciones" delay={400}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="rounded-xl h-9 w-9 text-zinc-400 hover:text-red-500"
                  >
                    <Eraser className="h-5 w-5" />
                  </Button>
                </Tooltip>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto my-auto">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 mb-4">
                <Settings2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Ninguna tipología seleccionada
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
                Por favor, elija una tipología del panel de la izquierda o cree
                una nueva para inicializar el entorno técnico.
              </p>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 font-bold text-white text-xs rounded-lg px-4 h-8"
                onPress={() => setShowNuevoModal(true)}
              >
                Crear primera tipología
              </Button>
            </div>
          )}
        </main>

        {/* PANEL DERECHO: ESPECIFICACIONES TÉCNICAS */}
        {isRightPanelOpen && tipSel && detallesObraSelect && (
          <aside className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 overflow-y-auto">
            <TipologiaConfigPanel
              detalle={detallesObraSelect}
              upsertDetalle={async (fields) => {
                try {
                  await upsertDetalle({
                    ...detallesObraSelect,
                    ...fields,
                  });
                } catch (error) {
                  console.error("Error al guardar la especificación:", error);
                }
              }}
            />
          </aside>
        )}
      </div>

      {/* ── SECCIÓN DE MODALS FLOTANTES DE LA COMPAÑÍA ──────────────────────── */}

      {/* MODAL CREAR TIPOLOGÍA (PASO A PASO INTEGRADO) */}
      <NuevaTipologiaModal
        isOpen={showNuevoModal}
        onOpenChange={() => setShowNuevoModal(false)}
        onCrear={handleCrearTipologia}
      />

      {/* MODAL DE DESPIECE TÉCNICO COMPLETO */}
      {selectedId && (
        <DespieceModal
          idTipologia={selectedId}
          isOpen={showDespieceModal}
          onClose={() => setShowDespieceModal(false)}
        />
      )}
    </div>
  );
}
