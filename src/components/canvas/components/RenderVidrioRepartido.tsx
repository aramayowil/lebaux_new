import { Group, Line } from "react-konva";
import { JSX } from "react";

interface RenderVidrioRepartidoProps {
  ancho: number;
  alto: number;
  scale: number;
  colors: {
    aluminio: string;
    contorno: string;
  };
  horVR: number;
  verVR: number;
}

export const RenderVidrioRepartido = ({
  ancho,
  alto,
  scale,
  colors,
  horVR,
  verVR,
}: RenderVidrioRepartidoProps) => {
  const filas = horVR + 1;
  const columnas = verVR + 1;

  // Tamaño disponible neto para cada cuadrito de vidrio
  const cellW = ancho / columnas;
  const cellH = alto / filas;

  // Profundidad del bisel (grosor de la varilla).
  // Seteado a 12 o limitado a un tercio del cuadrito para que no se deforme si hay muchísimos cruces.
  const maxT = Math.min(cellW / 3, cellH / 3);
  const t = Math.min(12 * scale, maxT);

  const elementos: JSX.Element[] = [];

  // Recorremos la grilla dibujando 4 trapecios (biseles) para cada cuadrito
  for (let r = 0; r < filas; r++) {
    for (let c = 0; c < columnas; c++) {
      const x = c * cellW;
      const y = r * cellH;

      // ─── TRAPECIO SUPERIOR ───
      elementos.push(
        <Line
          key={`vr-top-${r}-${c}`}
          points={[
            x,
            y, // Esquina exterior izquierda
            x + cellW,
            y, // Esquina exterior derecha
            x + cellW - t,
            y + t, // Esquina interior derecha
            x + t,
            y + t, // Esquina interior izquierda
          ]}
          closed
          fill={colors.aluminio}
          stroke={colors.contorno}
          strokeWidth={1}
        />,
      );

      // ─── TRAPECIO IZQUIERDO ───
      elementos.push(
        <Line
          key={`vr-left-${r}-${c}`}
          points={[x, y, x + t, y + t, x + t, y + cellH - t, x, y + cellH]}
          closed
          fill={colors.aluminio}
          stroke={colors.contorno}
          strokeWidth={1}
        />,
      );

      // ─── TRAPECIO DERECHO ───
      elementos.push(
        <Line
          key={`vr-right-${r}-${c}`}
          points={[
            x + cellW,
            y,
            x + cellW,
            y + cellH,
            x + cellW - t,
            y + cellH - t,
            x + cellW - t,
            y + t,
          ]}
          closed
          fill={colors.aluminio}
          stroke={colors.contorno}
          strokeWidth={1}
        />,
      );

      // ─── TRAPECIO INFERIOR ───
      elementos.push(
        <Line
          key={`vr-bottom-${r}-${c}`}
          points={[
            x,
            y + cellH,
            x + cellW,
            y + cellH,
            x + cellW - t,
            y + cellH - t,
            x + t,
            y + cellH - t,
          ]}
          closed
          fill={colors.aluminio}
          stroke={colors.contorno}
          strokeWidth={1}
        />,
      );
    }
  }

  return <Group>{elementos}</Group>;
};

export default RenderVidrioRepartido;
