import { useEffect, useMemo, useState } from "react";
import { Stage, Layer, Group } from "react-konva";
import type { ObraTipologia } from "@/types";
import type { TipologiaConfig } from "@/store/obrasStore";

// Importación de Layouts
import { PañoFijoLayout } from "./layouts/PañoFijoLayout";
import { BanderolaLayout } from "./layouts/BanderolaLayout";
import { OscilobatienteLayout } from "./layouts/OscilobatienteLayout";
import { CorredizaLayout } from "./layouts/CorredizaLayout";

import { ContextMenu } from "./ContextMenu";
import { RenderCotas } from "./components/RenderCotas";
import { useCatalogosStore } from "@/store/catalogosStore";
import invertirColor from "@/utils/invertirColor";
import { PuertaRebatibleLayout } from "./layouts/PuertaRebatible";
import { VentanaDeAbrirLayout } from "./layouts/ventanaDeAbrir";
import { VentiluzLayout } from "./layouts/VentiluzLayaout";
import { ProjectanteLayout } from "./layouts/ProjectanteLayout";

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
  // COLORES DEL CANVAS SEGÚN EL TRATAMIENTO DE LA SERIE
  const { idTratamiento } = config;
  const { tratamientos } = useCatalogosStore();
  const tratamiento = tratamientos.find((t) => t.id === idTratamiento);

  const COLORS = {
    colorDeAluminio: tratamiento?.color || "#f2f2f2",
    vidrio: "#C5DDE8",
    contorno: tratamiento?.color ? invertirColor(tratamiento.color) : "#94a3b8", // bordes y contornos
    lineasCotas: "#878484", // color de flechas y lineas de cotas
  };

  const A = tipologia.ancho;
  const H = tipologia.alto;

  // --- ESTADO PARA EL MENÚ CONTEXTUAL ---
  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    hojaIndex: number;
    relativeX: number; // Posición en mm desde la izquierda
    relativeY: number; // Posición en mm desde abajo
  } | null>(null);

  // --- CÁLCULO DE LAYOUT Y ESCALA ---
  const layout = useMemo(() => {
    const padding = 100;
    const availableWidth = width - padding;
    const availableHeight = height - padding;

    const scale = Math.min(availableWidth / A, availableHeight / H, 0.8);

    const drawW = A * scale;
    const drawH = H * scale;
    const ox = (width - drawW) / 2;
    const oy = (height - drawH) / 2;

    const realFrameWidth = 20;
    const espesoPerfil = realFrameWidth * scale;

    const innerH = drawH - espesoPerfil * 2;

    // Mapeo de divisiones existentes
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
      espesoPerfil,
      innerH,
      posH,
      posV,
    };
  }, [A, H, width, height, config]);

  // --- MANEJADORES DE EVENTOS ---

  // Prevenir menú por defecto del navegador en todo el canvas
  const handleStageContextMenu = (e: any) => {
    e.evt.preventDefault();
  };

  const handleLeafContextMenu = (e: any, index: number) => {
    e.evt.preventDefault();
    e.cancelBubble = true; // Evita que el evento llegue al Stage

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Calculamos coordenadas relativas al dibujo en milímetros
    // relativeY se calcula de abajo hacia arriba (estilo carpintería)
    const relX = (pointerPos.x - layout.ox) / layout.scale;
    const relY = H - (pointerPos.y - layout.oy) / layout.scale;

    setMenu({
      x: e.evt.clientX,
      y: e.evt.clientY,
      hojaIndex: index,
      relativeX: Math.round(relX),
      relativeY: Math.round(relY),
    });
  };

  useEffect(() => {
    const handleClose = () => setMenu(null);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  // --- RENDERIZADO DEL LAYOUT ---
  const renderSelectedLayout = () => {
    const tipo = tipoDeProducto.toLowerCase();

    const commonProps = {
      drawW: layout.drawW,
      drawH: layout.drawH,
      scale: layout.scale,
      espesoPerfil: layout.espesoPerfil,
      posH: layout.posH,
      posV: layout.posV,
      config: config,
      tipologia: tipologia,
      hojas: hojas,
      isFocused: !!menu, // desplejar menu contextual
      focusedHoja: menu?.hojaIndex ?? -1, // hoja que se despleja el menu contextual
      colors: COLORS,
      onContextMenu: handleLeafContextMenu,
    };

    if (tipo.includes("banderola")) return <BanderolaLayout {...commonProps} />;
    if (tipo.includes("projectante"))
      return <ProjectanteLayout {...commonProps} />;
    if (tipo.includes("paño fijo")) return <PañoFijoLayout {...commonProps} />;
    if (tipo.includes("ventiluz")) return <VentiluzLayout {...commonProps} />;
    if (tipo.includes("oscilobatiente"))
      return <OscilobatienteLayout {...commonProps} />;
    if (tipo.includes("corrediza")) return <CorredizaLayout {...commonProps} />;
    if (tipo.includes("puerta"))
      return <PuertaRebatibleLayout {...commonProps} />;
    if (tipo.includes("ventana de abrir"))
      return <VentanaDeAbrirLayout {...commonProps} />;

    return null;
  };

  return (
    <div className="relative select-none" style={{ width, height }}>
      <Stage
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
            // Aquí ya tienes todos los datos para tu Store:
            console.log("Acción:", accion);
            console.log("Hoja:", menu.hojaIndex);
            console.log("Altura (mm):", menu.relativeY);
            console.log("Ancho (mm):", menu.relativeX);

            // Ejemplo: if(accion === "Travesaño") addTravesaño(menu.relativeY)
          }}
        />
      )}
    </div>
  );
}
