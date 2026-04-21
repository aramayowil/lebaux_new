import { Rect, Group, Arrow, Line } from "react-konva";

// Colores consistentes con tu diseño técnico
const COLORS = {
  frame: "#4a4a4a",
  leaf: "#7a7a7a",
  glass: "#dbeafe",
  stroke: "#1a1a1a",
  dim: "#64748b",
};

// Interfaz para las props que vienen del TipologiaCanvas original
interface LayoutProps {
  drawW: number;
  drawH: number;
  innerW: number;
  innerH: number;
  frameThick: number;
  leafThick: number;
  hojaW: number;
  posH: number[];
  posV: number[];
  scale: number;
}

export const Corrediza90Layout = ({
  drawH,
  drawW,
  innerH,
  innerW,
  frameThick,
  leafThick,
  hojaW,
  posH,
}: LayoutProps) => {
  const glassFrameThick = 4; // Grosor visual del junquillo

  const RenderCruceHorizontal = () => (
    <Group>
      {posH.map((yPos, i) => (
        <Group key={`h-group-${i}`}>
          {/* Fondo del travesaño */}
          <Rect
            x={leafThick + 4}
            y={yPos - leafThick / 2 - 4}
            width={hojaW - leafThick * 2 - 8}
            height={leafThick + 8}
            fill={COLORS.leaf}
            stroke={COLORS.stroke}
            strokeWidth={0.6}
          />
          {/* Cuerpo del travesaño */}
          <Rect
            x={0}
            y={yPos - leafThick / 2}
            width={hojaW - leafThick}
            height={leafThick}
            fill={COLORS.leaf}
            stroke={COLORS.stroke}
            strokeWidth={0.6}
          />
        </Group>
      ))}
    </Group>
  );

  const RenderMarcoPrincipal = () => (
    <Group>
      {/* Lateral Izquierdo */}
      <Rect
        width={frameThick}
        height={drawH}
        fill={COLORS.leaf}
        stroke={COLORS.stroke}
        strokeWidth={0.6}
      />
      {/* Lateral Derecho */}
      <Rect
        x={drawW - frameThick}
        width={frameThick}
        height={drawH}
        fill={COLORS.leaf}
        stroke={COLORS.stroke}
        strokeWidth={0.6}
      />
      {/* Superior */}
      <Rect
        x={frameThick}
        y={0}
        width={drawW - frameThick * 2}
        height={frameThick}
        fill={COLORS.leaf}
        stroke={COLORS.stroke}
        strokeWidth={0.6}
      />
      {/* Inferior */}
      <Rect
        x={frameThick}
        y={drawH - frameThick}
        width={drawW - frameThick * 2}
        height={frameThick}
        fill={COLORS.leaf}
        stroke={COLORS.stroke}
        strokeWidth={0.6}
      />
    </Group>
  );

  const RenderHoja = ({
    x,
    isRight = false,
  }: {
    x: number;
    isRight?: boolean;
  }) => (
    <Group x={x} y={frameThick}>
      {/* Base de la hoja */}
      <Rect width={hojaW} height={innerH} fill={COLORS.leaf} />

      {/* Vidrio */}
      <Rect
        x={leafThick + glassFrameThick}
        y={leafThick + glassFrameThick}
        width={hojaW - leafThick * 2 - glassFrameThick * 2}
        height={innerH - leafThick * 2 - glassFrameThick * 2}
        fill={COLORS.glass}
        stroke={COLORS.stroke}
        strokeWidth={0.6}
      />

      {/* Cruces (Travesaños) */}
      <RenderCruceHorizontal />

      {/* Parantes y Zócalos */}
      <Rect
        x={isRight ? hojaW - leafThick : 0}
        width={leafThick}
        height={innerH}
        fill={COLORS.leaf}
        stroke={COLORS.stroke}
        strokeWidth={0.6}
      />
      <Rect
        x={isRight ? 0 : hojaW - leafThick}
        width={leafThick}
        height={innerH}
        fill={COLORS.leaf}
        stroke={COLORS.stroke}
        strokeWidth={0.6}
      />
      <Rect
        x={leafThick}
        y={0}
        width={hojaW - leafThick * 2}
        height={leafThick}
        fill={COLORS.leaf}
        stroke={COLORS.stroke}
        strokeWidth={0.6}
      />
      <Rect
        x={leafThick}
        y={innerH - leafThick}
        width={hojaW - leafThick * 2}
        height={leafThick}
        fill={COLORS.leaf}
        stroke={COLORS.stroke}
        strokeWidth={0.6}
      />

      {/* Líneas de detalle en esquinas (Efecto técnico) */}
      <Line
        points={[
          leafThick,
          leafThick,
          leafThick + glassFrameThick,
          leafThick + glassFrameThick,
        ]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      <Line
        points={[
          leafThick,
          innerH - leafThick,
          leafThick + glassFrameThick,
          innerH - leafThick - glassFrameThick,
        ]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />

      {/* Flechas de apertura */}
      <Arrow
        points={
          isRight
            ? [hojaW * 0.7, innerH * 0.5, hojaW * 0.3, innerH * 0.5]
            : [hojaW * 0.3, innerH * 0.5, hojaW * 0.7, innerH * 0.5]
        }
        fill={COLORS.dim}
        stroke={COLORS.dim}
        pointerLength={8}
        pointerWidth={6}
      />
    </Group>
  );

  return (
    <Group>
      <RenderMarcoPrincipal />
      {/* Hoja Izquierda */}
      <RenderHoja x={frameThick} isRight={false} />
      {/* Hoja Derecha (superpuesta por el cruce) */}
      <RenderHoja x={frameThick + (hojaW - leafThick)} isRight={true} />
    </Group>
  );
};

export default Corrediza90Layout;
