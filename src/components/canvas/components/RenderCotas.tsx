import { Group, Arrow, Text, Line } from "react-konva";

interface Props {
  ox: number;
  oy: number;
  drawW: number;
  drawH: number;
  anchoReal: number;
  altoReal: number;
}

export const RenderCotas = ({
  ox,
  oy,
  drawW,
  drawH,
  anchoReal,
  altoReal,
}: Props) => {
  const COTA_COLOR = "#64748b";
  const TEXT_COLOR = "#475569";
  const OFFSET = 15; // Distancia de la cota al marco

  return (
    <Group>
      {/* --- COTA HORIZONTAL (ANCHO) --- */}
      <Group>
        <Arrow
          points={[ox, oy + drawH + OFFSET, ox + drawW, oy + drawH + OFFSET]}
          fill={COTA_COLOR}
          stroke={COTA_COLOR}
          strokeWidth={1}
          pointerLength={5}
          pointerWidth={5}
          pointerAtBeginning
        />
        {/* Líneas de referencia laterales */}
        <Line
          points={[ox, oy + drawH + 5, ox, oy + drawH + OFFSET + 10]}
          stroke={COTA_COLOR}
          strokeWidth={0.5}
          dash={[2, 2]}
        />
        <Line
          points={[
            ox + drawW,
            oy + drawH + 5,
            ox + drawW,
            oy + drawH + OFFSET + 10,
          ]}
          stroke={COTA_COLOR}
          strokeWidth={0.5}
          dash={[2, 2]}
        />

        <Text
          x={ox}
          y={oy + drawH + OFFSET + 8}
          width={drawW}
          text={`${anchoReal} mm`}
          align="center"
          fontSize={11}
          fontFamily="JetBrains Mono, monospace"
          fontStyle="bold"
          fill={TEXT_COLOR}
        />
      </Group>

      {/* --- COTA VERTICAL (ALTO) --- */}
      <Group>
        <Arrow
          points={[ox + drawW + OFFSET, oy, ox + drawW + OFFSET, oy + drawH]}
          fill={COTA_COLOR}
          stroke={COTA_COLOR}
          strokeWidth={1}
          pointerLength={5}
          pointerWidth={5}
          pointerAtBeginning
        />
        {/* Líneas de referencia superior/inferior */}
        <Line
          points={[ox + drawW + 5, oy, ox + drawW + OFFSET + 10, oy]}
          stroke={COTA_COLOR}
          strokeWidth={0.5}
          dash={[2, 2]}
        />
        <Line
          points={[
            ox + drawW + 5,
            oy + drawH,
            ox + drawW + OFFSET + 10,
            oy + drawH,
          ]}
          stroke={COTA_COLOR}
          strokeWidth={0.5}
          dash={[2, 2]}
        />

        <Text
          x={ox + drawW + OFFSET + 8}
          y={oy + drawH / 2 - 6}
          text={`${altoReal}`}
          fontSize={11}
          fontFamily="JetBrains Mono, monospace"
          fontStyle="bold"
          fill={TEXT_COLOR}
        />
        <Text
          x={ox + drawW + OFFSET + 8}
          y={oy + drawH / 2 + 8}
          text="mm"
          fontSize={9}
          fontFamily="JetBrains Mono, monospace"
          fill={COTA_COLOR}
        />
      </Group>
    </Group>
  );
};
