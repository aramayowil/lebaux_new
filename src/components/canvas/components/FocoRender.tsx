import { Line, Group } from "react-konva"; // Importación correcta para Canvas

interface RenderFocoProps {
  width: number;
  height: number;
}

export const RenderFoco = ({ width, height }: RenderFocoProps) => {
  const step = 6; // Espaciado entre líneas
  const lines = [];

  // Generamos las líneas diagonales
  for (let i = -height; i < width; i += step) {
    lines.push(
      <Line
        key={`foco-${i}`}
        points={[i, height, i + height, 0]}
        stroke="red"
        strokeWidth={0.5}
        opacity={0.6}
        listening={false} // Evita que interfiera con eventos del mouse
      />,
    );
  }

  return (
    <Group
      clipFunc={(ctx) => {
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.closePath();
      }}
    >
      {lines}
    </Group>
  );
};
