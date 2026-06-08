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
  // ─── 1. PRIMERO: ABSOLUTAMENTE TODOS LOS HOOKS (SIN SUB DIVISIONES NI RETURNS EN MEDIO) ───

  // Queries de Base de Datos
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

  // Refs y States
  const stageRef = useRef<any>(null);

  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    hojaIndex: number;
    relativeX: number;
    relativeY: number;
  } | null>(null);

  // Variables base para el Layout técnico
  const A = detalles.ancho ?? 0;
  const H = detalles.alto ?? 0;

  // useMemo para cálculos matemáticos responsivos
  const layout = useMemo(() => {
    if (width === 0 || height === 0 || A === 0 || H === 0) {
      return {
        scale: 0.1,
        drawW: 0,
        drawH: 0,
        ox: 0,
        oy: 0,
        espesoPerfil: 0,
        innerH: 0,
        posH: [],
        posV: [],
      };
    }

    const padding = 80;
    const availableWidth = width - padding;
    const availableHeight = height - padding;
    const scale = Math.min(availableWidth / A, availableHeight / H, 0.55);

    const drawW = A * scale;
    const drawH = H * scale;
    const ox = (width - drawW) / 2;
    const oy = (height - drawH) / 2;

    const realFrameWidth = 45;
    const espesoPerfil = realFrameWidth * scale;
    const innerH = drawH - espesoPerfil * 2;

    const cantH = detalles.cant_centrados_horizontal ?? 0;
    let posH: number[] = [];
    if (cantH > 0) {
      posH = Array.from({ length: cantH }, (_, i) => {
        const pasoH = innerH / (cantH + 1);
        return innerH - pasoH * (i + 1);
      });
    } else {
      const crucesHorizontalesDb = [
        detalles.horizontal_1,
        detalles.horizontal_2,
        detalles.horizontal_3,
      ].filter((x): x is number => typeof x === "number" && x > 0);
      posH = crucesHorizontalesDb
        .sort((a, b) => a - b)
        .map((mm) => innerH - mm * scale);
    }

    const cantV = detalles.cant_centrados_vertical ?? 0;
    let posV: number[] = [];
    if (cantV > 0) {
      posV = Array.from({ length: cantV }, (_, i) => {
        const pasoV = drawW / (cantV + 1);
        return pasoV * (i + 1);
      });
    } else {
      const crucesVerticalesDb = [
        detalles.vertical_1,
        detalles.vertical_2,
        detalles.vertical_3,
        detalles.vertical_4,
        detalles.vertical_5,
      ].filter((x): x is number => typeof x === "number" && x > 0);
      posV = crucesVerticalesDb.sort((a, b) => a - b).map((mm) => mm * scale);
    }

    return { scale, drawW, drawH, ox, oy, espesoPerfil, innerH, posH, posV };
  }, [A, H, width, height, detalles]);

  // Effects recurrentes
  useEffect(() => {
    const handleClose = () => setMenu(null);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  const tieneHojaValida =
    typeof detalles.hoja === "number" && detalles.hoja > 0;
  const n_hojas = tieneHojaValida && hoja_detalle ? hoja_detalle.cantidad : 0;

  useEffect(() => {
    // Añadimos la protección "&& tipo" para evitar capturas vacías durante la carga
    if (onReady && stageRef.current && tipo) {
      const timer = setTimeout(() => {
        if (stageRef.current) {
          const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
          onReady(dataUrl);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [onReady, layout, tipo, detalles, n_hojas]);

  // ─── 2. SEGUNDO: EVALUACIONES DE CARGA Y LOGIC CONTROL (ABAJO DE LOS HOOKS) ───

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

  //  if (isPendingGlobal) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-64 space-y-2 text-muted-foreground animate-pulse">
  //       <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  //       <p className="text-sm font-medium">
  //         Cargando componentes técnicos y vidrios...
  //       </p>
  //     </div>
  //   );
  // }

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

  // ─── 3. TERCERO: RESOLUCIÓN ESTÉTICA Y RENDER COMPLETO DEL CANVAS ───

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
      espesoPerfil: layout.espesoPerfil,
      posH: layout.posH,
      posV: layout.posV,
      detalles: detalles,
      tipologia: tipologia,
      hojas: n_hojas,
      colors: colors,
    };

    if (formaTipoStr.includes("paño fijo")) {
      return <PañoFijoLayout {...commonProps} />;
    }

    return <PañoFijoLayout {...commonProps} />;
  };

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
          <Group x={layout.ox} y={layout.oy}>
            {renderSelectedLayout()}
          </Group>

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
