import { useEffect, useMemo, useState, useRef } from "react";
import { Stage, Layer, Group } from "react-konva";
import type { ObraDetalle, ObraTipologia } from "@/types";
import { ContextMenu } from "./ContextMenu";
import { RenderCotas } from "./components/RenderCotas";
import invertirColor from "@/utils/invertirColor";
import { useTratamientoById } from "@/hooks/catalogo/useTratamientos";
import { useVidrios } from "@/hooks/catalogo/useVidrios";
import { useTipoById } from "@/hooks/obra/useTipos";
import { useHojasById } from "@/hooks/productos/useHojas";
import PañoFijoLayout from "./layouts/PañoFijoLayout";
import CorredizaLayout from "./layouts/CorredizaLayout";

interface Props {
  tipologia: ObraTipologia;
  detalles: ObraDetalle;
  width: number;
  height: number;
  onReady?: (base64: string) => void;
}

export default function TipologiaCanvas({
  tipologia,
  detalles,
  width,
  height,
  onReady,
}: Props) {
  // ─── 1. HOOKS DE CONSULTA DE DATOS (React Query) ───
  const {
    data: tipo,
    isPending: pendingTipo,
    error: errorTipo,
  } = useTipoById(detalles.id_tipo ?? undefined);

  const {
    data: hoja_detalle,
    isPending: pendingHoja,
    error: errorHoja,
  } = useHojasById(detalles.hoja ?? undefined);

  const {
    data: tratamiento,
    isPending: pendingTratamiento,
    error: errorTratamiento,
  } = useTratamientoById(detalles.color ?? undefined);

  const {
    data: vidrios = [],
    isPending: pendingVidrios,
    error: errorVidrios,
  } = useVidrios();

  // ─── 2. REFS Y ESTADOS LOCALES ───
  const stageRef = useRef<any>(null);

  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    hojaIndex: number;
    relativeX: number;
    relativeY: number;
  } | null>(null);

  // Dimensiones nominales de la abertura
  const A = detalles.ancho ?? 0;
  const H = detalles.alto ?? 0;

  // ─── 3. CÁLCULOS MATEMÁTICOS DE ESCALA Y CENTRADO ───
  const layout = useMemo(() => {
    if (width === 0 || height === 0 || A === 0 || H === 0) {
      return { scale: 0.1, drawW: 0, drawH: 0, ox: 0, oy: 0 };
    }

    const padding = 80;
    const availableWidth = width - padding;
    const availableHeight = height - padding;

    // Factor de escala adaptativo limitando el zoom máximo a 0.55
    const scale = Math.min(availableWidth / A, availableHeight / H, 0.55);

    const drawW = A * scale;
    const drawH = H * scale;

    // Coordenadas de desfase para centrar el canvas en el contenedor
    const ox = (width - drawW) / 2;
    const oy = (height - drawH) / 2;

    return { scale, drawW, drawH, ox, oy };
  }, [A, H, width, height]);

  // Manejador del menú contextual global
  useEffect(() => {
    const handleClose = () => setMenu(null);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  const tieneHojaValida =
    typeof detalles.hoja === "number" && detalles.hoja > 0;
  const n_hojas =
    tieneHojaValida && hoja_detalle ? Number(hoja_detalle.cantidad ?? 2) : 2;

  // ─── 4. DISPARADOR DE CAPTURA TÉCNICA (ON READY) ───
  useEffect(() => {
    if (onReady && stageRef.current && tipo) {
      const timer = setTimeout(() => {
        if (stageRef.current) {
          const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
          onReady(dataUrl);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [
    onReady,
    layout.scale,
    layout.drawW,
    layout.drawH,
    tipo,
    detalles,
    n_hojas,
  ]);

  // ─── 5. CONTROL DE FLUJO Y LOGIC CONTROL ───
  const tieneColorValido =
    typeof detalles.color === "number" && detalles.color > 0;

  const isPendingGlobal =
    pendingTipo ||
    pendingVidrios ||
    (tieneHojaValida && pendingHoja) ||
    (tieneColorValido && pendingTratamiento);

  const errorGlobal =
    errorTipo ||
    errorVidrios ||
    (tieneHojaValida && errorHoja) ||
    (tieneColorValido && errorTratamiento);

  if (isPendingGlobal) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-2 text-stone-500 animate-pulse">
        <div className="w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
        <p className="text-sm font-medium">
          Cargando componentes técnicos y vidrios...
        </p>
      </div>
    );
  }

  if (errorGlobal) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600 font-medium border border-red-200 bg-red-50 rounded-xl p-4">
        Error de conexión al recuperar las tipologías de la base de datos.
      </div>
    );
  }

  if (!tipo) {
    return (
      <div className="flex items-center justify-center h-64 text-amber-600 font-medium border border-amber-200 bg-amber-50 rounded-xl p-4">
        La tipología asignada a esta abertura ya no existe en el sistema.
      </div>
    );
  }

  if (tieneHojaValida && !hoja_detalle) {
    return (
      <div className="flex items-center justify-center h-64 text-amber-600 font-medium border border-amber-200 bg-amber-50 rounded-xl p-4">
        La hoja asignada a esta abertura ya no existe en el sistema.
      </div>
    );
  }

  if (tieneColorValido && !tratamiento) {
    return (
      <div className="flex items-center justify-center h-64 text-amber-600 font-medium border border-amber-200 bg-amber-50 rounded-xl p-4">
        El tratamiento asignado a esta abertura ya no existe en el sistema.
      </div>
    );
  }

  if (!vidrios || vidrios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-amber-600 font-medium border border-amber-200 bg-amber-50 rounded-xl p-4">
        Los vidrios asignados a esta abertura ya no existen en el sistema.
      </div>
    );
  }

  // ─── 6. RESOLUCIÓN DE COLOR Y PALETAS GRÁFICAS ───
  const colorAluminioBase =
    tieneColorValido && tratamiento?.color ? tratamiento.color : "#FFFCFC";

  const colors = {
    aluminio: colorAluminioBase,
    catalogVidrios: vidrios,
    contorno:
      colorAluminioBase !== "#FFFCFC"
        ? invertirColor(colorAluminioBase)
        : "#f59e0b",
    lineasCotas: "#78716c",
    revestimiento: "#94a3b8",
  };

  const handleStageContextMenu = (e: any) => e.evt.preventDefault();

  const renderSelectedLayout = () => {
    const formaTipoStr = tipo?.forma_tipo?.toLowerCase() ?? "";

    const commonProps = {
      drawW: layout.drawW,
      drawH: layout.drawH,
      scale: layout.scale,
      ox: layout.ox,
      oy: layout.oy,
      detalles: detalles,
      tipologia: tipologia,
      cantHojas: n_hojas,
      colors: colors,
    };

    // De momento canaliza hacia el layout modularizado de Paños Fijos
    if (formaTipoStr.includes("paño fijo")) {
      return <PañoFijoLayout {...commonProps} />;
    }

    if (formaTipoStr.includes("corrediza")) {
      return <CorredizaLayout {...commonProps} />;
    }

    return <PañoFijoLayout {...commonProps} />;
  };

  // ─── 7. RENDER COMPLETO DEL ESCENARIO KONVA ───
  return (
    <div
      className="relative select-none bg-stone-50/50 dark:bg-stone-950/20 rounded-xl overflow-hidden"
      style={{ width, height }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onContextMenu={handleStageContextMenu}
      >
        <Layer>
          {/* El contenedor principal se posiciona en las coordenadas de centrado (ox, oy) */}
          <Group x={layout.ox} y={layout.oy}>
            {renderSelectedLayout()}
          </Group>

          {/* Las cotas se dibujan por encima del marco tomando los límites escalados */}
          <RenderCotas
            ox={layout.ox}
            oy={layout.oy}
            drawW={layout.drawW}
            drawH={layout.drawH}
            anchoReal={A}
            altoReal={H}
          />
        </Layer>
      </Stage>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          onAction={(accion) => {
            console.log(
              `Operación ejecutada en coordenadas reales del paño [${menu.relativeX}x${menu.relativeY}]:`,
              accion,
            );
          }}
        />
      )}
    </div>
  );
}
