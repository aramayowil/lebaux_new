import { Group, Rect } from "react-konva";
interface RenderSubPanelProps {
  x: number;
  y: number;
  width: number;
  height: number;
  colorFondo: string;
  contorno: string;
  colors: any;
}

export const RenderSubPanel = ({
  x,
  y,
  width,
  height,
  colorFondo,
  contorno,
}: RenderSubPanelProps) => {
  return (
    <Group x={x} y={y}>
      <Group>
        <Rect
          width={width}
          height={height}
          fill={colorFondo}
          stroke={contorno}
          strokeWidth={1}
        />
      </Group>
    </Group>
  );
};

export default RenderSubPanel;
