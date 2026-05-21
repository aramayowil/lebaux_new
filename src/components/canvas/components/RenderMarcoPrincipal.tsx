import { Rect, Group } from "react-konva";

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  thick: number; // El espesor del marco (frameThick)
}

export const RenderMarcoPrincipal = ({ x, y, width, height, thick }: Props) => {
  const FRAME_COLOR = "#334e68"; // Color del aluminio (Steel Blue)
  const FRAME_FILL = "#eceff4"; // Relleno del perfil

  return (
    <Group>
      {/* Sombra proyectada suave */}
      <Rect
        x={x + 4}
        y={y + 4}
        width={width}
        height={height}
        fill="#00000010"
        cornerRadius={2}
      />

      {/* Perfil del Marco */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={FRAME_FILL}
        stroke={FRAME_COLOR}
        strokeWidth={2}
        cornerRadius={1}
      />

      {/* Línea interna para dar efecto de profundidad al perfil de aluminio */}
      <Rect
        x={x + thick}
        y={y + thick}
        width={width - thick * 2}
        height={height - thick * 2}
        stroke={FRAME_COLOR}
        strokeWidth={1}
        opacity={0.3}
      />
    </Group>
  );
};
