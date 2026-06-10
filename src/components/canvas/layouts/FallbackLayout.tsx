import { Group, Rect, Line } from "react-konva";
import type { ObraDetalle, ObraTipologia, Vidrio } from "@/types";

interface LayoutProps {
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

export const FallbackLayout = ({ drawW, drawH, scale }: LayoutProps) => {
  const warningColor = "#CCAC1C";

  return (
    <Group>
      <Rect
        width={drawW}
        height={drawH}
        fill="transparent"
        stroke={warningColor}
        strokeWidth={1}
        dash={[30 * scale]}
      />

      <Line
        points={[0, 0, drawW, drawH]}
        stroke={warningColor}
        strokeWidth={1}
        dash={[30 * scale]}
      />
      <Line
        points={[drawW, 0, 0, drawH]}
        stroke={warningColor}
        strokeWidth={1}
        dash={[30 * scale]}
      />
    </Group>
  );
};

export default FallbackLayout;
