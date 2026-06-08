import { Group, Rect } from "react-konva";
import { JSX } from "react";

interface RenderRevestimientoProps {
  width: number;
  height: number;
  scale: number;
  color: string;
  direccion: string | null;
  contorno: string;
}

export const RenderRevestimiento = ({
  width,
  height,
  scale,
  color,
  direccion,
  contorno,
}: RenderRevestimientoProps) => {
  const espesorTablilla = scale > 0 ? 110 * scale : 20;

  const esHorizontal = !direccion || direccion.toUpperCase().startsWith("H");

  const tablillas: JSX.Element[] = [];

  if (esHorizontal) {
    const cantidadTablillas = Math.ceil(height / espesorTablilla);

    for (let i = 0; i < cantidadTablillas; i++) {
      const currentY = i * espesorTablilla;

      const altoTablillaEfectivo = Math.min(espesorTablilla, height - currentY);
      if (altoTablillaEfectivo <= 0) break;

      tablillas.push(
        <Rect
          key={`tablilla-h-${i}`}
          x={0}
          y={currentY}
          width={width}
          height={altoTablillaEfectivo}
          fill={color}
          stroke={contorno}
          strokeWidth={0.5}
        />,
      );
    }
  } else {
    const cantidadTablillas = Math.ceil(width / espesorTablilla);

    for (let i = 0; i < cantidadTablillas; i++) {
      const currentX = i * espesorTablilla;

      const anchoTablillaEfectivo = Math.min(espesorTablilla, width - currentX);
      if (anchoTablillaEfectivo <= 0) break;

      tablillas.push(
        <Rect
          key={`tablilla-v-${i}`}
          x={currentX}
          y={0}
          width={anchoTablillaEfectivo}
          height={height}
          fill={color}
          stroke={contorno}
          strokeWidth={0.5}
        />,
      );
    }
  }

  return <Group>{tablillas}</Group>;
};

export default RenderRevestimiento;
