import { Group, Line, Circle, Path } from "react-konva";

interface WarningAlertDesignProps {
  x?: number;
  y?: number;
  width: number;
  height: number;
  scale: number;
}

export const WarningAlertDesign = ({
  x = 0,
  y = 0,
  width,
  height,
  scale,
}: WarningAlertDesignProps) => {
  const warningColor = "#f59e0b"; // Color Amber / Warning de Tailwind
  const iconSize = 98 * scale; // Tamaño adaptativo de la caja del icono central

  // El SVG original está diseñado en una matriz base de 24x24 px
  const escalaBase = iconSize / 24;

  return (
    <Group x={x} y={y}>
      {/* Línea diagonal 1 de la X */}
      <Line
        points={[0, 0, width, height]}
        stroke={warningColor}
        strokeWidth={2 * scale}
        dash={[6, 4]} // Estilo técnico discontinuo
      />
      {/* Línea diagonal 2 de la X */}
      <Line
        points={[0, height, width, 0]}
        stroke={warningColor}
        strokeWidth={2 * scale}
        dash={[6, 4]}
      />

      {/* Contenedor central posicionado en la intersección exacta de la X */}
      <Group x={width / 2} y={height / 2}>
        {/* Subgrupo para aplicar el escalado y recentrar el icono de 24x24 px */}
        <Group
          x={-iconSize / 2}
          y={-iconSize / 2}
          scale={{ x: escalaBase, y: escalaBase }}
        >
          {/* Silueta del Triángulo */}
          <Path
            data="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
            fill="none"
            stroke={warningColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Línea vertical del signo de exclamación (!) */}
          <Path
            data="M12 9v4"
            fill="none"
            stroke={warningColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Punto inferior corregido con propiedades nativas de Konva */}
          <Circle x={12} y={17} radius={1} fill={warningColor} />
        </Group>
      </Group>
    </Group>
  );
};

export default WarningAlertDesign;
