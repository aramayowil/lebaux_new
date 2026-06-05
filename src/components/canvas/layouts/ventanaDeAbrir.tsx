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

export const VentanaDeAbrirLayout = ({
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
  const jamba_Umbral_DintelDeMarco = 47.5 * scale;
  const encuentroCentral = 20 * scale; //perfil de encuentro cuando son 2 hojas

  // Dimensiones de las hojas
  const hojaW = drawW - jamba_Umbral_DintelDeMarco * 2;
  //Ancho de cada hoja
  const anchoHojaIndividual =
    hojas === 2 ? (hojaW - encuentroCentral) / 2 : hojaW;
  const hojaH = drawH - jamba_Umbral_DintelDeMarco * 2;

  //Perfiles de la hoja
  const jamba_Zocalo_CabezalDeHoja = 59.2 * scale;

  // Grosor del perfil de cruces
  const contravidrioThick = 17 * scale;

  //Bisagras de la hoja
  const bisagrasH = 90 * scale;
  const bisagrasW = 20 * scale;
  const colorBisagras = "#595959";

  //Color de Cerradura
  const cerraduraW = 20 * scale;
  const cerraduraH = 130 * scale;
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
          drawW - jamba_Umbral_DintelDeMarco,
          jamba_Umbral_DintelDeMarco,
          jamba_Umbral_DintelDeMarco,
          jamba_Umbral_DintelDeMarco,
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
          jamba_Umbral_DintelDeMarco,
          drawH,
          jamba_Umbral_DintelDeMarco,
          jamba_Umbral_DintelDeMarco,
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
          drawW - jamba_Umbral_DintelDeMarco,
          drawH,
          drawW - jamba_Umbral_DintelDeMarco,
          jamba_Umbral_DintelDeMarco,
        ]}
        closed
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Umbral a 45 */}
      <Line
        points={[
          0,
          drawH,
          drawW,
          drawH,

          drawW - jamba_Umbral_DintelDeMarco,
          drawH - jamba_Umbral_DintelDeMarco,

          jamba_Umbral_DintelDeMarco,
          drawH - jamba_Umbral_DintelDeMarco,
        ]}
        closed
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />

      {hojas === 2 && (
        <Rect
          x={drawW / 2 - encuentroCentral / 2}
          y={jamba_Umbral_DintelDeMarco}
          width={encuentroCentral}
          height={hojaH}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
      )}

      {/* Lineas a 45 grados */}
      <Line
        points={[0, 0, jamba_Umbral_DintelDeMarco, jamba_Umbral_DintelDeMarco]}
        stroke={contorno}
        strokeWidth={1}
      />

      <Line
        points={[
          drawW,
          0,
          drawW - jamba_Umbral_DintelDeMarco,
          jamba_Umbral_DintelDeMarco,
        ]}
        stroke={contorno}
        strokeWidth={1}
      />
    </Group>
  );

  const RenderHoja = ({
    width,
    height,
    index,
  }: {
    width: number;
    height: number;
    index: number;
  }) => {
    // Si es la segunda hoja (index 1), se desplaza el ancho de la primera + el encuentro
    const xPos = index === 0 ? 0 : width + encuentroCentral;
    const esHojaDerecha = index === 1;

    const anchoInternoHoja = width - jamba_Zocalo_CabezalDeHoja * 2;
    const altoInternoHoja = height - jamba_Zocalo_CabezalDeHoja * 2;

    return (
      <Group x={xPos}>
        {/* Perfiles de la hoja (se mantienen igual) */}
        <Line /* Perfil superior */
          points={[
            0,
            0,
            width,
            0,
            width - jamba_Zocalo_CabezalDeHoja,
            jamba_Zocalo_CabezalDeHoja,
            jamba_Zocalo_CabezalDeHoja,
            jamba_Zocalo_CabezalDeHoja,
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
            jamba_Zocalo_CabezalDeHoja,
            jamba_Zocalo_CabezalDeHoja,
            jamba_Zocalo_CabezalDeHoja,
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
            width - jamba_Zocalo_CabezalDeHoja,
            height,
            width - jamba_Zocalo_CabezalDeHoja,
            jamba_Zocalo_CabezalDeHoja,
          ]}
          closed
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        <Rect /* Zócalo */
          x={jamba_Zocalo_CabezalDeHoja}
          y={height - jamba_Zocalo_CabezalDeHoja}
          width={width - jamba_Zocalo_CabezalDeHoja * 2}
          height={jamba_Zocalo_CabezalDeHoja}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/* BISAGRAS: Se espejan si es la hoja derecha */}
        <Group x={esHojaDerecha ? width : -bisagrasW}>
          <Rect
            y={jamba_Zocalo_CabezalDeHoja}
            width={bisagrasW}
            height={bisagrasH}
            fill={colorBisagras}
            stroke={contorno}
            strokeWidth={1}
          />

          <Rect
            y={height - jamba_Zocalo_CabezalDeHoja - bisagrasH}
            width={bisagrasW}
            height={bisagrasH}
            fill={colorBisagras}
            stroke={contorno}
            strokeWidth={1}
          />
        </Group>

        {/* INTERIORES */}
        <Group x={jamba_Zocalo_CabezalDeHoja} y={jamba_Zocalo_CabezalDeHoja}>
          {RenderInteriores({
            width: anchoInternoHoja,
            height: altoInternoHoja,
            index,
          })}
        </Group>

        {/* CERRADURA */}
        {index === 0 && hojas === 1 && (
          <Rect
            x={width - jamba_Zocalo_CabezalDeHoja + cerraduraW}
            y={height / 2 - cerraduraH / 2}
            width={cerraduraW}
            height={cerraduraH}
            fill={colorCerradura}
            stroke={contorno}
            strokeWidth={1}
          />
        )}

        {index === 1 && hojas === 2 && (
          <Rect
            x={jamba_Zocalo_CabezalDeHoja - cerraduraW * 2}
            y={height / 2 - cerraduraH / 2}
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
          strokeWidth={0.6}
          dash={[6, 6]}
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
        <Group x={jamba_Umbral_DintelDeMarco} y={jamba_Umbral_DintelDeMarco}>
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
