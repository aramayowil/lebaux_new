import { useCatalogosStore } from "@/store/catalogosStore";
import { Group, Rect, Line } from "react-konva";
import invertirColor from "@/utils/invertirColor";
import { ObraTipologia } from "@/types";
import { TipologiaConfig } from "@/store/obrasStore";
import { RenderFoco } from "../FocoRender";

interface LayoutProps {
  drawW: number; // Ancho total exterior
  drawH: number; // Alto total exterior
  frameThick: number;
  scale: number;
  tipologia: ObraTipologia;
  config: TipologiaConfig & { isFocused: boolean; focusedHoja: number };
  hojas: number;
  onContextMenu?: (e: any, index: number) => void;
}

export const OscilobatienteLayout = ({
  drawW,
  drawH,
  frameThick,
  scale,
  config,
  hojas,
  onContextMenu,
}: LayoutProps) => {
  const { idTratamiento } = config;
  const { tratamientos } = useCatalogosStore();
  const tratamiento = tratamientos.find((t) => t.id === idTratamiento);
  // Paleta de colores técnica y limpia
  const COLORS = {
    frame: tratamiento?.color || "#f2f2f2", // Gris perla para el marco
    glass: "#C5DDE8", // Blanco azulado para el vidrio
    stroke: tratamiento?.color ? invertirColor(tratamiento.color) : "#94a3b8", // Borde de los perfiles
    refAbrir: "#878484",
  };

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

      {/* Lineas a 45 grados */}
      {/* linea arriba-izquierda */}
      <Line
        points={[0, 0, frameThick / 2, frameThick / 2]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      {/* linea abajo-izquierda */}
      <Line
        points={[0, drawH, frameThick / 2, drawH - frameThick / 2]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      {/* linea arriba-derecha */}
      <Line
        points={[drawW, 0, drawW - frameThick / 2, frameThick / 2]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
      {/* linea abajo-derecha */}
      <Line
        points={[drawW, drawH, drawW - frameThick / 2, drawH - frameThick / 2]}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />
    </Group>
  );

  interface RenderHojaProps {
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
    invertida?: boolean;
    isHojaOscilobatiente?: boolean;
  }
  const RenderHoja = ({
    x,
    y,
    width,
    height,
    index,
    invertida = false,
    isHojaOscilobatiente = true,
  }: RenderHojaProps) => {
    // La hoja solo tiene foco si el layout general está enfocado Y este es su índice
    const isThisHojaFocused = config.isFocused && config.focusedHoja === index;

    return (
      <Group
        x={x}
        y={y}
        scaleX={invertida ? -1 : 1}
        offsetX={invertida ? width : 0}
      >
        {/* Perfil exterior de la hoja */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={COLORS.frame}
          stroke={COLORS.stroke}
          strokeWidth={1}
        />
        {/* Perfil interior de la hoja */}
        <Rect
          x={frameThick * 1.5}
          y={frameThick * 1.5}
          width={width - frameThick * 3}
          height={height - frameThick * 3}
          fill={COLORS.frame}
          stroke={COLORS.stroke}
          strokeWidth={1}
        />
        {/* <Rect
          x={frameThick * 2}
          y={frameThick * 2}
          width={width - frameThick * 4}
          height={height - frameThick * 4}
          fill={COLORS.frame}
          stroke={COLORS.stroke}
          strokeWidth={1}
        /> */}

        {/* Area interior (vidrio, travesaños y parantes) interactiva*/}
        <Group
          x={frameThick * 1.5}
          y={frameThick * 1.5}
          onContextMenu={(e) => onContextMenu?.(e, index)} // CLIC DERECHO AQUÍ
        >
          <Rect
            x={frameThick * 0.5}
            y={frameThick * 0.5}
            width={width - frameThick * 4}
            height={height - frameThick * 4}
            fill={COLORS.glass}
            stroke={COLORS.stroke}
            strokeWidth={1}
          />

          {/* Lineas de apertura '^'*/}
          <Group>
            {isHojaOscilobatiente && (
              <>
                <Line
                  points={[
                    0,
                    height - frameThick * 3,
                    width / 2 - frameThick * 1.5,
                    0,
                  ]}
                  stroke={COLORS.refAbrir}
                  strokeWidth={0.5}
                />
                <Line
                  points={[
                    width / 2 - frameThick * 1.5,
                    0,
                    width - frameThick * 3,
                    height - frameThick * 3,
                  ]}
                  stroke={COLORS.refAbrir}
                  strokeWidth={0.5}
                />
              </>
            )}
            {/* Lineas de apertura '>'*/}
            <Line
              points={[
                0,
                0,
                width - frameThick * 3,
                height / 2 - frameThick * 1.5,
              ]}
              stroke={COLORS.refAbrir}
              strokeWidth={0.5}
            />

            <Line
              points={[
                0,
                height - frameThick * 3,
                width - frameThick * 3,
                height / 2 - frameThick * 1.5,
              ]}
              stroke={COLORS.refAbrir}
              strokeWidth={0.5}
            />
          </Group>

          {/* Renderizado de Cruces (Travesaños y Parantes) */}
          <RenderParantes
            width={width - frameThick * 3}
            height={height - frameThick * 3}
          />
          <RenderTravesaños
            width={width - frameThick * 3}
            height={drawH - frameThick * 2}
          />

          {/* RENDERIZADO DEL FOCO (Líneas Rojas) */}
          {isThisHojaFocused && (
            <RenderFoco
              width={width - frameThick * 3.5}
              height={height - frameThick * 3.5}
            />
          )}
        </Group>

        {/* Lineas a 45 grados */}
        <Line
          points={[0, 0, frameThick * 2, frameThick * 2]}
          stroke={COLORS.stroke}
          strokeWidth={1}
        />
        <Line
          points={[0, height, frameThick * 2, height - frameThick * 2]}
          stroke={COLORS.stroke}
          strokeWidth={1}
        />
        <Line
          points={[width, 0, width - frameThick * 2, frameThick * 2]}
          stroke={COLORS.stroke}
          strokeWidth={1}
        />
        <Line
          points={[
            width,
            height,
            width - frameThick * 2,
            height - frameThick * 2,
          ]}
          stroke={COLORS.stroke}
          strokeWidth={1}
        />

        {/* Bisagras y manija lateral */}
        {/* Bisagras */}
        <Rect
          x={0}
          y={frameThick * 3.75}
          width={frameThick / 2}
          height={frameThick * 3}
          fill={COLORS.frame}
          stroke={COLORS.stroke}
          strokeWidth={1}
        />
        <Rect
          x={0}
          y={height - frameThick * 6.75}
          width={frameThick / 2}
          height={frameThick * 3}
          fill={COLORS.frame}
          stroke={COLORS.stroke}
          strokeWidth={1}
        />
        {/* Manija */}

        <Rect
          x={width - frameThick * 1.5}
          y={height / 2 - frameThick * 1.5}
          width={frameThick / 1.5}
          height={frameThick * 3}
          fill={COLORS.frame}
          stroke={COLORS.stroke}
          strokeWidth={1}
        />
      </Group>
    );
  };

  const RenderParantes = ({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) => (
    <Group>
      {config.posV?.map((posMm: number, idx: number) => {
        // Calculamos la posición X relativa al ancho de la hoja
        const xRelative = posMm * scale;

        // Validamos que no se pase del ancho de la hoja
        if (xRelative <= 0 || xRelative >= width) return null;

        return (
          <Group key={`v-div-${idx}`}>
            <Line
              points={[
                xRelative - divThick / 2,
                0,
                xRelative - divThick,
                frameThick / 2,
                xRelative - divThick,
                height - frameThick / 2,
                xRelative - divThick / 2,
                height,
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
              height={height} // Alto total de la hoja
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
                height - frameThick / 2,
                xRelative + divThick / 2,
                height,
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

  const RenderTravesaños = ({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) => (
    <Group>
      {config.posH?.map((posMm: number, idx: number) => {
        // 1. Calculamos la posición desde el borde inferior de la HOJA
        // height es el alto total de la hoja que recibimos por props
        const yRelative = height - posMm * scale;

        // 2. Validamos que esté dentro del área de la hoja
        // El rango útil es entre el borde superior e inferior
        if (yRelative <= 0 || yRelative >= height) return null;

        return (
          <Group key={`h-div-${idx}`}>
            {/* Detalle Superior */}
            <Line
              points={[
                0,
                yRelative - divThick / 2,
                frameThick / 2,
                yRelative - divThick,
                width - frameThick / 2,
                yRelative - divThick,
                width,
                yRelative - divThick / 2,
              ]}
              stroke={COLORS.stroke}
              fill={COLORS.frame}
              strokeWidth={1}
              closed={true}
            />

            {/* Perfil del Travesaño (Rectángulo principal) */}
            <Rect
              x={0}
              y={yRelative - divThick / 2}
              width={width} // Ahora usa el ancho de la hoja
              height={divThick}
              fill={COLORS.frame}
              stroke={COLORS.stroke}
              strokeWidth={1}
            />

            {/* Chaflán / Detalle Inferior */}
            <Line
              points={[
                0,
                yRelative + divThick / 2,
                frameThick / 2,
                yRelative + divThick,
                width - frameThick / 2,
                yRelative + divThick,
                width,
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

  return (
    <Group>
      {/* 1. Dibujamos el Marco Exterior */}
      <RenderMarco />

      {/* Area interna donde se dibujan las hojas */}
      <Group
        x={frameThick / 2}
        y={frameThick / 2}
        width={drawW - frameThick}
        height={drawH - frameThick}
      >
        {hojas === 0 && (
          <Rect
            x={0}
            y={0}
            width={drawW - frameThick}
            height={drawH - frameThick}
            fill="transparent"
            stroke={COLORS.stroke}
            strokeWidth={1}
          />
        )}
        {hojas === 1 && (
          <RenderHoja
            x={0}
            y={0}
            width={drawW - frameThick}
            height={drawH - frameThick}
            index={0}
          />
        )}
        {hojas > 1 && (
          <Group>
            <RenderHoja
              x={0}
              y={0}
              width={(drawW - frameThick) / hojas}
              height={drawH - frameThick}
              index={0}
              isHojaOscilobatiente={false}
            />

            <RenderHoja
              x={(drawW - frameThick) / hojas}
              y={0}
              width={(drawW - frameThick) / hojas}
              height={drawH - frameThick}
              index={1}
              invertida={true}
            />
          </Group>
        )}
      </Group>
    </Group>
  );
};
