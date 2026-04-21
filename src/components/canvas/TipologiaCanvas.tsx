import { useMemo } from "react";
import { Stage, Layer, Group } from "react-konva";

// Importación de Layouts
import { FijoLayout } from "./layouts/LayoutFijo";
import Corrediza90Layout from "./layouts/Corrediza_90_Layout";

import type { ObraTipologia } from "@/types";
import type { TipologiaConfig } from "@/store/obrasStore";
import { RenderCotas } from "./components/RenderCotas";

interface Props {
  tipologia: ObraTipologia;
  config: TipologiaConfig;
  tipoDeProducto?: string;
  hojas?: number;
  width?: number;
  height?: number;
}

export default function TipologiaCanvas({
  tipologia,
  config,
  tipoDeProducto = "",
  hojas = 1,
  width = 640,
  height = 480,
}: Props) {
  // Desestructuramos para mayor claridad en el useMemo
  const A = tipologia.ancho;
  const H = tipologia.alto;

  const layout = useMemo(() => {
    const padding = 100;
    const availableWidth = width - padding;
    const availableHeight = height - padding;

    // 1. Escala basada en el contenedor y medidas reales
    const scale = Math.min(availableWidth / A, availableHeight / H, 0.8);

    const drawW = A * scale;
    const drawH = H * scale;
    const ox = (width - drawW) / 2;
    const oy = (height - drawH) / 2;

    // 2. Grosores reales (mm) -> Píxeles
    const realFrameWidth = 45; // Perfil 7714
    const realLeafWidth = 40; // Perfil 7715
    const realGlassGap = 8;

    const frameThick = realFrameWidth * scale;
    const leafThick = realLeafWidth * scale;
    const glassFrameThick = realGlassGap * scale;

    const innerW = drawW - frameThick * 2;
    const innerH = drawH - frameThick * 2;

    // Solape central para corredizas
    const hojaW = innerW / 2 + leafThick / 2;

    // Mapeo de divisiones (mm desde abajo -> px desde arriba del vano)
    const posH = (config.posH ?? [])
      .slice()
      .sort((a, b) => a - b)
      .map((mm) => innerH - mm * scale);

    const posV = (config.posV ?? [])
      .slice()
      .sort((a, b) => a - b)
      .map((mm) => mm * scale);

    return {
      scale,
      drawW,
      drawH,
      ox,
      oy,
      frameThick,
      leafThick,
      glassFrameThick,
      innerW,
      innerH,
      hojaW,
      posH,
      posV,
    };
  }, [A, H, width, height, config]); // Reacciona a cambios en medidas o configuración

  // --- SWITCH DE SELECCIÓN DE LAYOUT ---
  const renderSelectedLayout = () => {
    const tipo = tipoDeProducto.toLowerCase();

    const commonProps = {
      drawW: layout.drawW,
      drawH: layout.drawH,
      innerW: layout.innerW,
      innerH: layout.innerH,
      scale: layout.scale,
      frameThick: layout.frameThick,
      leafThick: layout.leafThick,
      glassFrameThick: layout.glassFrameThick,
      hojaW: layout.hojaW,
      posH: layout.posH,
      posV: layout.posV,
      config: config,
      tipologia: tipologia,
      hojas: hojas,
    };

    switch (true) {
      case tipo.includes("corrediza"):
        return <Corrediza90Layout {...commonProps} />;

      case tipo.includes("paño fijo"):
      case tipo.includes("fijo"):
        return <FijoLayout {...commonProps} />;

      default:
        return null;
    }
  };

  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* El dibujo se centra usando ox y oy */}
        <Group x={layout.ox} y={layout.oy}>
          {renderSelectedLayout()}
        </Group>

        {/* Cotas externas */}
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
  );
}
