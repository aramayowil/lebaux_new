import { Group, Rect, Text } from "react-konva";
import type { ObraDetalle, ObraTipologia, Vidrio } from "@/types";

interface FallbackLayoutProps {
  drawW: number;
  drawH: number;
  scale: number;
  tipologia?: ObraTipologia;
  detalles?: ObraDetalle;
  cantHojas?: number;
  colors?: {
    aluminio: string;
    catalogVidrios: Vidrio[];
    contorno: string;
    lineasCotas: string;
    revestimiento?: string;
  };
}

export const FallbackLayout = ({
  drawW,
  drawH,
  scale,
}: FallbackLayoutProps) => {
  return (
    <Group>
      {/* Rectángulo de fondo gris para indicar error */}
      <Rect
        width={drawW}
        height={drawH}
        fill="#e0e0e0"
        stroke="#c0c0c0"
        strokeWidth={2}
      />
      {/* Texto de advertencia */}
      <Text
        x={20}
        y={20}
        width={drawW - 40}
        text="Error: Layout no disponible para esta tipología"
        fontSize={18 * scale}
        fill="#c62828"
        align="center"
        fontFamily="Arial"
        wrap="word"
      />
    </Group>
  );
};
