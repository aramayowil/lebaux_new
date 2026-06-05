import { Group, Rect, Line } from "react-konva";
import { ObraTipologia } from "@/types";
import { TipologiaConfig } from "@/types/canvasTypes";
import { RenderContravidrio } from "../components/RenderContravidrios";
import RenderCruces from "../components/RenderCruces";
import { RenderFoco } from "../components/FocoRender";

interface LayoutProps {
  drawW: number;
  drawH: number;
  scale: number;
  tipologia: ObraTipologia;
  config: TipologiaConfig;
  hojas: number;
  isFocused: boolean;
  focusedHoja: number;
  colors: {
    colorDeAluminio: string;
    vidrio: string;
    contorno: string;
    lineasCotas: string;
  };
  onContextMenu?: (e: any, index: number) => void;
}

export const VentiluzLayout = ({
  drawW,
  drawH,
  scale,
  config,
  isFocused,
  colors,
  onContextMenu,
}: LayoutProps) => {
  const { colorDeAluminio, vidrio, contorno } = colors;

  // Grosor del perfil de marco

  const perfilDeMarco = 42.5 * scale; //jambas, umbral y dintel de marco

  // Dimensiones de las hojas
  const hojaW = drawW - perfilDeMarco * 2;
  const hojaH = drawH - perfilDeMarco * 2;

  //Grosor perfil de hoja
  const perfilDeHoja = 35 * scale; // jambas, zocalo y cabezal de hoja

  // Grosor del perfil de cruces
  const contravidrioThick = 17 * scale; //perfil de cruces
  const perfilDeCruces = 57.8 * scale; //perfil de cruces

  //ACESORIOS
  //BOTON TIRANTE
  const botonTiranteW = 80 * scale;
  const botonTiranteH = 10 * scale;

  const colorManija = "#595959";

  const RenderMarco = () => (
    <Group>
      {/* DINTEL DE MARCO */}
      <Line
        points={[
          0,
          0,
          drawW,
          0,
          drawW - perfilDeMarco,
          perfilDeMarco,
          perfilDeMarco,
          perfilDeMarco,
        ]}
        closed
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* UMBRAL DE MARCO */}
      <Line
        points={[
          0,
          drawH,
          perfilDeMarco,
          drawH - perfilDeMarco,
          drawW - perfilDeMarco,
          drawH - perfilDeMarco,
          drawW,
          drawH,
        ]}
        closed
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* JAMBA IZQUIERDA DE MARCO */}
      <Line
        points={[
          0,
          0,
          perfilDeMarco,
          perfilDeMarco,
          perfilDeMarco,
          drawH - perfilDeMarco,

          0,
          drawH,
        ]}
        closed
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* JAMBA DERECHA DE MARCO */}
      <Line
        points={[
          drawW - perfilDeMarco,
          perfilDeMarco,
          drawW,
          0,
          drawW,
          drawH,
          drawW - perfilDeMarco,
          drawH - perfilDeMarco,
        ]}
        closed
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
    </Group>
  );

  const RenderHoja = ({ width, height }: { width: number; height: number }) => (
    <>
      {/* CABEZAL DE HOJA */}
      <Rect
        x={perfilDeHoja}
        width={width - perfilDeHoja}
        height={perfilDeHoja}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* ZOCALO DE HOJA */}
      <Rect
        x={0}
        y={height - perfilDeHoja}
        width={width - perfilDeHoja}
        height={perfilDeHoja}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* JAMBAS IZQUIERDA DE HOJA */}
      <Rect
        width={perfilDeHoja}
        height={height - perfilDeHoja}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* JAMBAS DERECHA DE HOJA */}
      <Rect
        x={width - perfilDeHoja}
        width={perfilDeHoja}
        height={height}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />

      {/*   INTERIOR DE HOJA */}
      <Group x={perfilDeHoja} y={perfilDeHoja}>
        {renderInteriorHoja(
          width - perfilDeHoja * 2,
          height - perfilDeHoja * 2,
        )}
      </Group>

      {/* Lineas de Apertura */}
      <Line
        points={[perfilDeHoja, perfilDeHoja, width / 2, height - perfilDeHoja]}
        stroke={colors.lineasCotas}
        dash={[6, 6]}
        strokeWidth={0.6}
      />

      <Line
        points={[
          width / 2,
          height - perfilDeHoja,
          width - perfilDeHoja,
          perfilDeHoja,
        ]}
        stroke={colors.lineasCotas}
        dash={[6, 6]}
        strokeWidth={0.6}
      />
      {/*Manija de apertura*/}
      <Rect
        x={width / 2 - botonTiranteW / 2}
        y={height - perfilDeHoja}
        width={botonTiranteW}
        height={botonTiranteH}
        fill={colorManija}
        stroke={colorManija}
        strokeWidth={1}
      />
      <Rect
        x={width / 2 - botonTiranteW / 2 - botonTiranteW}
        y={height - perfilDeHoja + botonTiranteH}
        width={2 * botonTiranteW}
        height={botonTiranteH}
        fill={colorManija}
        stroke={colorManija}
        strokeWidth={1}
      />
    </>
  );

  const renderInteriorHoja = (width: number, height: number) => (
    <Group>
      {/* ÁREA DE VIDRIO E INTERACCIÓN */}
      <Group onContextMenu={(e) => onContextMenu?.(e, 0)}>
        {/* Render Vidrio */}
        <Rect
          width={width}
          height={height}
          fill={vidrio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/* FOCO DE SELECCIÓN */}
        {isFocused && <RenderFoco width={width} height={height} />}

        {/* contravidrios  */}
        <RenderContravidrio
          hojaW={width}
          hojaH={height}
          contravidrioThick={contravidrioThick}
          colors={colors}
        />

        {/* DIVISIONES (Travesaños/Parantes) */}
        <RenderCruces
          width={width}
          height={height}
          config={config}
          espesoPerfilCruce={perfilDeCruces}
          contravidrioThick={contravidrioThick}
          colors={colors}
        />
      </Group>
    </Group>
  );

  return (
    <Group>
      <RenderMarco />
      <Group x={perfilDeMarco} y={perfilDeMarco}>
        <RenderHoja width={hojaW} height={hojaH} />
      </Group>
    </Group>
  );
};
