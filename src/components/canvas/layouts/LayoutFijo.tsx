import { useCatalogosStore } from "@/store/catalogosStore";
import { Group, Rect, Line } from "react-konva";
import invertirColor from "@/utils/invertirColor";

interface LayoutProps {
  drawW: number; // Ancho total exterior
  drawH: number; // Alto total exterior
  frameThick: number;
  scale: number;
  config: any;
  tipologia: any;
}

export const FijoLayout = ({
  drawW,
  drawH,
  frameThick,
  scale,
  config,
}: LayoutProps) => {
  const { idTratamiento } = config;
  const { tratamientos } = useCatalogosStore();
  const tratamiento = tratamientos.find((t) => t.id === idTratamiento);
  // Paleta de colores técnica y limpia
  const COLORS = {
    frame: tratamiento?.color || "#f2f2f2", // Gris perla para el marco
    glass: "#C5DDE8", // Blanco azulado para el vidrio
    stroke: tratamiento?.color ? invertirColor(tratamiento.color) : "#94a3b8", // Borde de los perfiles
  };

  // Dimensiones internas (donde vive el vidrio)
  const innerW = drawW - frameThick * 2;
  const innerH = drawH - frameThick * 2;

  // Definimos un grosor para el perfil de división (aprox 40mm reales)
  const divThick = 40 * scale;

  const RenderMarco = () => (
    <Group>
      {/* Perfil Exterior */}
      <Rect
        width={drawW}
        height={drawH}
        fill={COLORS.frame}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      {/* Perfil interior */}
      <Rect
        x={frameThick}
        y={frameThick}
        width={innerW}
        height={innerH}
        fill={COLORS.glass}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      {/* Lineas a 45 grados */}
      <Line
        points={[0, 0, frameThick, frameThick]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      <Line
        points={[0, drawH, frameThick, drawH - frameThick]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      <Line
        points={[drawW, 0, drawW - frameThick, frameThick]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      <Line
        points={[drawW, drawH, drawW - frameThick, drawH - frameThick]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
    </Group>
  );

  const Contravidrio = () => (
    <Group>
      <Rect
        x={frameThick}
        y={frameThick}
        width={innerW}
        height={innerH}
        fill={COLORS.frame}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      <Rect
        x={frameThick + frameThick / 2}
        y={frameThick + frameThick / 2}
        width={innerW - frameThick}
        height={innerH - frameThick}
        fill={COLORS.glass}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      {/* Lineas a 45 grados */}
      {/* Linea arriba-izquierda */}
      <Line
        points={[
          frameThick,
          frameThick,
          frameThick + frameThick / 2,
          frameThick + frameThick / 2,
        ]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      {/* Linea abajo-izquierda */}
      <Line
        points={[
          frameThick,
          innerH + frameThick,
          frameThick + frameThick / 2,
          innerH + frameThick / 2,
        ]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      {/* Linea arriba-derecha */}
      <Line
        points={[
          drawW - frameThick,
          frameThick,
          drawW - frameThick - frameThick / 2,
          frameThick + frameThick / 2,
        ]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      {/* Linea abajo-derecha */}
      <Line
        points={[
          drawW - frameThick,
          innerH + frameThick,
          drawW - frameThick - frameThick / 2,
          innerH + frameThick / 2,
        ]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
    </Group>
  );

  const RenderTravesaños = () => (
    <Group>
      {config.posH?.map((posMm: number, idx: number) => {
        // 1. Calculamos la posición absoluta desde el borde inferior
        const yAbsoluto = drawH - posMm * scale;

        // 2. Restamos el frameThick porque el Group padre ya tiene y={frameThick}
        const yRelative = yAbsoluto - frameThick;

        // Validamos que esté dentro del área de vidrio (innerH)
        if (yRelative <= 0 || yRelative >= innerH) return null;

        return (
          <Group key={`h-div-${idx}`}>
            <Line
              points={[
                0,
                yRelative - divThick / 2,
                frameThick / 2,
                yRelative - divThick,
                innerW - frameThick / 2,
                yRelative - divThick,
                innerW,
                yRelative - divThick / 2,
              ]}
              stroke={COLORS.stroke}
              fill={COLORS.frame}
              strokeWidth={1}
              closed={true}
            />
            <Rect
              x={0}
              y={yRelative - divThick / 2} // Centramos el perfil sobre la línea de medida
              width={innerW}
              height={divThick}
              fill={COLORS.frame}
              stroke={COLORS.stroke}
              strokeWidth={1}
            />
            <Line
              points={[
                0,
                yRelative + divThick / 2,
                frameThick / 2,
                yRelative + divThick,
                innerW - frameThick / 2,
                yRelative + divThick,
                innerW,
                yRelative + divThick / 2,
              ]}
              stroke={COLORS.stroke}
              fill={COLORS.frame}
              strokeWidth={1}
              closed={true}
            />
          </Group>
        );
      })}
    </Group>
  );

  const RenderParantes = () => (
    <Group>
      {config.posV?.map((posMm: number, idx: number) => {
        // 1. Calculamos la posición absoluta desde el borde izquierdo
        const xAbsoluto = posMm * scale;

        // 2. Restamos el frameThick para compensar el x={frameThick} del Group
        const xRelative = xAbsoluto - frameThick;

        if (xRelative <= 0 || xRelative >= innerW) return null;

        return (
          <Group key={`v-div-${idx}`}>
            <Line
              points={[
                xRelative - divThick / 2,
                0,
                xRelative - divThick,
                frameThick / 2,
                xRelative - divThick,
                innerH - frameThick / 2,
                xRelative - divThick / 2,
                innerH,
              ]}
              stroke={COLORS.stroke}
              fill={COLORS.frame}
              strokeWidth={1}
              closed={true}
            />
            <Rect
              x={xRelative - divThick / 2}
              y={0}
              width={divThick}
              height={innerH}
              fill={COLORS.frame}
              stroke={COLORS.stroke}
              strokeWidth={1}
            />
            <Line
              points={[
                xRelative + divThick / 2,
                0,
                xRelative + divThick,
                frameThick / 2,
                xRelative + divThick,
                innerH - frameThick / 2,
                xRelative + divThick / 2,
                innerH,
              ]}
              stroke={COLORS.stroke}
              fill={COLORS.frame}
              strokeWidth={1}
              closed={true}
            />
          </Group>
        );
      })}
    </Group>
  );

  const RenderVidrio = () => (
    <Group>
      <Rect
        x={frameThick}
        y={frameThick}
        width={innerW}
        height={innerH}
        fill={COLORS.glass}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
    </Group>
  );

  return (
    <Group>
      {/* 1. Dibujamos el Marco Exterior */}
      <RenderMarco />
      <RenderVidrio />
      <Contravidrio />

      {/* Area interna donde se dibujan las divisiones */}
      <Group x={frameThick} y={frameThick} width={innerW} height={innerH}>
        <RenderParantes />
        <RenderTravesaños />
      </Group>
    </Group>
  );
};
