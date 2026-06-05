import { useEffect, useMemo, useState, useRef } from "react";
import { Stage, Layer, Group } from "react-konva";
import type { ObraDetalle, ObraTipologia } from "@/types";
import { CorredizaLayout } from "./layouts/CorredizaLayout";
import { ContextMenu } from "./ContextMenu";
import { RenderCotas } from "./components/RenderCotas";
import invertirColor from "@/utils/invertirColor";
import { useTratamientos } from "@/hooks/catalogo/useTratamientos";
import { useVidrios } from "@/hooks/catalogo/useVidrios";
import { useTipos } from "@/hooks/obra/useTipos";
import { useHojas } from "@/hooks/productos/useHojas";

interface ObraDetalleCanvas extends ObraDetalle {
  pos_h?: number[];
  pos_v?: number[];
}

interface Props {
  tipologia: ObraTipologia;
  detalles: ObraDetalleCanvas;
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
  const { data: tipos = [] } = useTipos();
  const { data: hojas = [] } = useHojas();
  const { data: tratamientos } = useTratamientos();
  const { data: vidrios } = useVidrios();

  const tratamiento = tratamientos?.find((t) => t.id === detalles.color);
  const vidrio = vidrios?.find(
    (v) => String(v.id) === String(detalles.interior),
  );
  const tipo_producto =
    tipos.find((t) => Number(t.id) === Number(detalles.id_tipo)) ?? null;

  const n_hojas = hojas?.find((h) => h.id === detalles?.hoja)?.cantidad ?? 0;

  const rgbNumToHex = (n: number): string => {
    const r = n & 0xff;
    const g = (n >> 8) & 0xff;
    const b = (n >> 16) & 0xff;
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const COLORS = {
    colorDeAluminio: tratamiento?.color || "#f2f2f2",
    vidrio:
      typeof vidrio?.color === "number"
        ? rgbNumToHex(vidrio.color)
        : "#1b1a1aff",
    contorno: tratamiento?.color ? invertirColor(tratamiento.color) : "#94a3b8",
    lineasCotas: "#878484",
  };

  const A = tipologia.ancho ?? 0;
  const H = tipologia.alto ?? 0;

  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    hojaIndex: number;
    relativeX: number;
    relativeY: number;
  } | null>(null);

  // ── LAYOUT TÉCNICO AUTORESPONSIVO DINÁMICO ──
  const layout = useMemo(() => {
    if (width === 0 || height === 0) {
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

    // Margen perimetral interno de seguridad dentro de la pantalla para las cotas externas
    const padding = 100;
    const availableWidth = width - padding;
    const availableHeight = height - padding;

    const scale = Math.min(availableWidth / A, availableHeight / H, 0.55);

    const drawW = A * scale;
    const drawH = H * scale;

    // Centrado exacto del dibujo técnico en la pantalla disponible
    const ox = (width - drawW) / 2;
    const oy = (height - drawH) / 2;

    const realFrameWidth = 20;
    const espesoPerfil = realFrameWidth * scale;
    const innerH = drawH - espesoPerfil * 2;

    const cantH = detalles.cant_centrados_horizontal ?? 0;
    const posH =
      cantH > 0
        ? Array.from({ length: cantH }, (_, i) => {
            const pasoH = innerH / (cantH + 1);
            return innerH - pasoH * (i + 1);
          })
        : (detalles.pos_h ?? [])
            .slice()
            .sort((a, b) => a - b)
            .map((mm) => innerH - mm * scale);

    const cantV = detalles.cant_centrados_vertical ?? 0;
    const posV =
      cantV > 0
        ? Array.from({ length: cantV }, (_, i) => {
            const pasoV = drawW / (cantV + 1);
            return pasoV * (i + 1);
          })
        : (detalles.pos_v ?? [])
            .slice()
            .sort((a, b) => a - b)
            .map((mm) => mm * scale);

    return { scale, drawW, drawH, ox, oy, espesoPerfil, innerH, posH, posV };
  }, [A, H, width, height, detalles]);

  const handleStageContextMenu = (e: any) => e.evt.preventDefault();

  const handleLeafContextMenu = (e: any, index: number) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
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

  const stageRef = useRef<any>(null);
  useEffect(() => {
    if (onReady && stageRef.current) {
      const timer = setTimeout(() => {
        if (stageRef.current) {
          const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
          onReady(dataUrl);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [onReady, layout, tipo_producto, detalles, n_hojas]);

  const renderSelectedLayout = () => {
    const tipo = tipo_producto?.forma_tipo?.toLowerCase() ?? "";

    const commonProps = {
      drawW: layout.drawW,
      drawH: layout.drawH,
      scale: layout.scale,
      espesoPerfil: layout.espesoPerfil,
      posH: layout.posH,
      posV: layout.posV,
      config: detalles,
      tipologia: tipologia,
      hojas: n_hojas,
      isFocused: !!menu,
      focusedHoja: menu?.hojaIndex ?? -1,
      colors: COLORS,
      onContextMenu: handleLeafContextMenu,
    };

    if (tipo.includes("corrediza")) return <CorredizaLayout {...commonProps} />;
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
          {/* El offset del grupo asegura el centrado correcto dentro de la caja dimensional */}
          <Group ref={stageRef} x={layout.ox} y={layout.oy}>
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
            console.log("Acción:", accion);
          }}
        />
      )}
    </div>
  );
}
