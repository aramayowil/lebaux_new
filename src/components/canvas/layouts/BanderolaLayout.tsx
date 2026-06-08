import { Group, Rect, Line } from "react-konva";
import { ObraDetalle, ObraTipologia } from "@/types";
import { RenderContravidrio } from "../components/RenderProfundidad";
import RenderCruces from "../components/RenderCruces";
import { RenderFoco } from "../components/FocoRender";

interface LayoutProps {
  drawW: number;
  drawH: number;
  scale: number;
  tipologia: ObraTipologia;
  config: ObraDetalle;
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

export const BanderolaLayout = ({
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
  const perfilDeHoja = (59.2 / 2) * scale; // jambas, zocalo y cabezal de hoja

  // Grosor del perfil de cruces
  const contravidrioThick = 17 * scale; //perfil de cruces
  const perfilDeCruces = 57.8 * scale; //perfil de cruces

  //ACESORIOS
  // BISAGRAS SUPERIORES
  const bisagraW = 90 * scale;
  const bisagraH = 20 * scale;
  const colorBisagras = "#595959";
  //BOTON TIRANTE
  const botonTirante = 45 * scale;

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
        points={[perfilDeHoja, height - perfilDeHoja, width / 2, perfilDeHoja]}
        stroke={colors.lineasCotas}
        dash={[6, 6]}
        strokeWidth={0.6}
      />

      <Line
        points={[
          width - perfilDeHoja,
          height - perfilDeHoja,
          width / 2,
          perfilDeHoja,
        ]}
        stroke={colors.lineasCotas}
        dash={[6, 6]}
        strokeWidth={0.6}
      />
      {/*BOTON TIRANTE*/}
      <Rect
        x={width / 2 - botonTirante / 2}
        y={perfilDeHoja - botonTirante}
        width={botonTirante}
        height={botonTirante}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* BISAGRAS INTERIORES */}
      <Rect
        x={perfilDeHoja + bisagraW}
        y={height - bisagraH}
        width={bisagraW}
        height={bisagraH}
        fill={colorBisagras}
        stroke={contorno}
        strokeWidth={1}
      />
      <Rect
        x={width - perfilDeHoja - bisagraW * 2}
        y={height - bisagraH}
        width={bisagraW}
        height={bisagraH}
        fill={colorBisagras}
        stroke={contorno}
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
