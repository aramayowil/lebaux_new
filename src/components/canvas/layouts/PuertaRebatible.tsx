import { Group, Rect, Line } from "react-konva";
import { ObraTipologia } from "@/types";
import { TipologiaConfig } from "@/store/obrasStore";
import { RenderContravidrio } from "../components/RenderContravidrios";
import RenderCruces from "../components/RenderCruces";
import { RenderFoco } from "../FocoRender";

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

export const PuertaRebatibleLayout = ({
  drawW,
  drawH,
  scale,
  config,
  hojas,
  isFocused,
  focusedHoja,
  colors,
  onContextMenu,
}: LayoutProps) => {
  const { colorDeAluminio, vidrio, contorno, lineasCotas } = colors;

  // Perfiles del marco
  const jambaYDintelDeMarco = 25.5 * scale;
  const encuentroCentral = 25.5 * scale; //perfil de encuentro cuando son 2 hojas

  // Dimensiones de las hojas
  const hojaW = drawW - jambaYDintelDeMarco * 2;
  //Ancho de cada hoja
  const anchoHojaIndividual =
    hojas === 2 ? (hojaW - encuentroCentral) / 2 : hojaW;
  const hojaH = drawH - jambaYDintelDeMarco;

  //Perfiles de la hoja
  const jambaYCabezalDeHoja = 76.2 * scale;
  const zocaloDeHoja = 123 * scale;

  // Grosor del perfil de cruces
  const contravidrioThick = 17 * scale;

  //Bisagras de la hoja
  const bisagrasH = 90 * scale;
  const bisagrasW = 20 * scale;
  const colorBisagras = "#595959";

  //Color de Cerradura
  const cerraduraW = 80 * scale;
  const cerraduraH = 20 * scale;
  const colorCerradura = "#595959";

  //perfil de cruce
  const perfilCruce = 61 * scale;

  const RenderMarco = () => (
    <Group>
      {/* Dintel a 45 */}
      <Line
        points={[
          0,
          0,
          drawW,
          0,
          drawW - jambaYDintelDeMarco,
          jambaYDintelDeMarco,
          jambaYDintelDeMarco,
          jambaYDintelDeMarco,
        ]}
        closed
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Jamba izquierda a 45 */}
      <Line
        points={[
          0,
          0,
          0,
          drawH,
          jambaYDintelDeMarco,
          drawH,
          jambaYDintelDeMarco,
          jambaYDintelDeMarco,
        ]}
        closed
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Jamba derecha a 45 */}
      <Line
        points={[
          drawW,
          0,
          drawW,
          drawH,
          drawW - jambaYDintelDeMarco,
          drawH,
          drawW - jambaYDintelDeMarco,
          jambaYDintelDeMarco,
        ]}
        closed
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />

      {hojas === 2 && (
        <Rect
          x={drawW / 2 - encuentroCentral / 2}
          y={jambaYDintelDeMarco}
          width={encuentroCentral}
          height={hojaH}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
      )}

      {/* Lineas a 45 grados */}
      <Line
        points={[0, 0, jambaYDintelDeMarco, jambaYDintelDeMarco]}
        stroke={contorno}
        strokeWidth={1}
      />

      <Line
        points={[drawW, 0, drawW - jambaYDintelDeMarco, jambaYDintelDeMarco]}
        stroke={contorno}
        strokeWidth={1}
      />
    </Group>
  );

  const RenderHoja = ({
    width,
    height,
    index = 0,
  }: {
    width: number;
    height: number;
    index?: number;
  }) => {
    // Si es la segunda hoja (index 1), se desplaza el ancho de la primera + el encuentro
    const xPos = index === 0 ? 0 : width + encuentroCentral;
    const esHojaDerecha = index === 1;

    const anchoInternoHoja = width - jambaYCabezalDeHoja * 2;
    const altoInternoHoja = height - zocaloDeHoja - jambaYCabezalDeHoja;

    return (
      <Group x={xPos}>
        {/* Perfiles de la hoja (se mantienen igual) */}
        <Line /* Perfil superior */
          points={[
            0,
            0,
            width,
            0,
            width - jambaYCabezalDeHoja,
            jambaYCabezalDeHoja,
            jambaYCabezalDeHoja,
            jambaYCabezalDeHoja,
          ]}
          closed
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        <Line /* Perfil izquierdo */
          points={[
            0,
            0,
            jambaYCabezalDeHoja,
            jambaYCabezalDeHoja,
            jambaYCabezalDeHoja,
            height,
            0,
            height,
          ]}
          closed
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        <Line /* Perfil derecho */
          points={[
            width,
            0,
            width,
            height,
            width - jambaYCabezalDeHoja,
            height,
            width - jambaYCabezalDeHoja,
            jambaYCabezalDeHoja,
          ]}
          closed
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        <Rect /* Zócalo */
          x={jambaYCabezalDeHoja}
          y={height - zocaloDeHoja}
          width={width - jambaYCabezalDeHoja * 2}
          height={zocaloDeHoja}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/* BISAGRAS: Se espejan si es la hoja derecha */}
        <Group x={esHojaDerecha ? width : -bisagrasW}>
          <Rect
            y={jambaYCabezalDeHoja}
            width={bisagrasW}
            height={bisagrasH}
            fill={colorBisagras}
            stroke={contorno}
            strokeWidth={1}
          />
          <Rect
            y={height / 2 - bisagrasH / 2}
            width={bisagrasW}
            height={bisagrasH}
            fill={colorBisagras}
            stroke={contorno}
            strokeWidth={1}
          />
          <Rect
            y={height - zocaloDeHoja - bisagrasH}
            width={bisagrasW}
            height={bisagrasH}
            fill={colorBisagras}
            stroke={contorno}
            strokeWidth={1}
          />
        </Group>

        {/* INTERIORES */}
        <Group x={jambaYCabezalDeHoja} y={jambaYCabezalDeHoja}>
          {RenderInteriores({
            width: anchoInternoHoja,
            height: altoInternoHoja,
            index,
          })}
        </Group>

        {/* CERRADURA */}
        {!esHojaDerecha && (
          <Rect
            x={width - jambaYCabezalDeHoja / 2 - cerraduraW}
            y={height / 2 - cerraduraH}
            width={cerraduraW}
            height={cerraduraH}
            fill={colorCerradura}
            stroke={contorno}
            strokeWidth={1}
          />
        )}

        {/* LÍNEAS DE APERTURA: Se espejan según la hoja */}
        <Line
          points={
            esHojaDerecha
              ? [width, 0, 0, height / 2, width, height]
              : [0, 0, width, height / 2, 0, height]
          }
          stroke={lineasCotas}
          strokeWidth={0.4}
          dash={[4, 4]}
        />
      </Group>
    );
  };

  const RenderInteriores = ({
    width,
    height,
    index, // Agregamos el índice de la hoja
  }: {
    width: number;
    height: number;
    index: number;
  }) => {
    // Determinamos si esta hoja específica es la que tiene el foco
    const estaEnFoco = isFocused && focusedHoja === index;

    return (
      <Group onContextMenu={(e) => onContextMenu?.(e, index)}>
        {/* Vidrio de hoja */}
        <Rect width={width} height={height} fill={vidrio} />

        {/* FOCO DE SELECCIÓN: Ahora solo se activa si coincide el índice */}
        {estaEnFoco && <RenderFoco width={width} height={height} />}

        <RenderContravidrio
          hojaW={width}
          hojaH={height}
          contravidrioThick={contravidrioThick}
          colors={colors}
        />

        <RenderCruces
          width={width}
          height={height}
          config={config}
          espesoPerfilCruce={perfilCruce}
          contravidrioThick={contravidrioThick}
          colors={colors}
        />
      </Group>
    );
  };
  return (
    <Group>
      <RenderMarco />
      {(hojas === 1 || hojas === 2) && (
        <Group x={jambaYDintelDeMarco} y={jambaYDintelDeMarco}>
          {Array.from({ length: hojas }).map((_, index) => (
            <RenderHoja
              key={index}
              width={anchoHojaIndividual}
              height={hojaH}
              index={index}
            />
          ))}
        </Group>
      )}
    </Group>
  );
};
