import { Group, Rect, Line } from "react-konva";
import type { ObraDetalle, ObraTipologia, Vidrio } from "@/types";
import { RenderCelda } from "../components/RenderCelda";
import { RenderCrucesCentrados } from "../components/RenderCrucesCentrados";
import { RenderCrucesVariables } from "../components/RenderCrucesVariables";
import WarningAlertDesign from "../components/WarningAlertDesign";

interface LayoutProps {
  drawW: number;
  drawH: number;
  scale: number;
  tipologia: ObraTipologia;
  detalles: ObraDetalle;
  cantHojas: number;
  colors: {
    aluminio: string;
    catalogVidrios: Vidrio[];
    contorno: string;
    lineasCotas: string;
    revestimiento?: string;
  };
}

export const PuertaRebatibleLayout = ({
  drawW,
  drawH,
  scale,
  detalles,
  cantHojas,
  colors,
}: LayoutProps) => {
  const { aluminio, contorno, lineasCotas } = colors;

  // --- CONFIGURACIÓN DE PERFILES TÉCNICOS ESCALADOS ---
  // Perfiles del marco
  const jambaYDintelDeMarco = 25.5 * scale;
  const encuentroCentral = 25.5 * scale; // perfil de encuentro cuando son 2 hojas

  // Dimensiones de las hojas
  const hojaW = drawW - jambaYDintelDeMarco * 2;
  const anchoHojaIndividual =
    cantHojas === 2 ? (hojaW - encuentroCentral) / 2 : hojaW;
  const hojaH = drawH - jambaYDintelDeMarco; // La puerta no suele tener umbral inferior

  // Perfiles de la hoja
  const jambaYCabezalDeHoja = 76.2 * scale;
  const zocaloDeHoja = 123 * scale;

  // Grosor del perfil de cruces
  const perfilCruce = 61 * scale;

  // Bisagras de la hoja
  const bisagrasH = 90 * scale;
  const bisagrasW = 20 * scale;
  const colorBisagras = "#595959";

  // Color de Cerradura
  const cerraduraW = 80 * scale;
  const cerraduraH = 20 * scale;
  const colorCerradura = "#595959";

  const tieneTratamiento =
    detalles.color != null || (detalles as any).tratamiento != null;

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
        fill={aluminio}
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
        fill={aluminio}
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
        fill={aluminio}
        stroke={contorno}
        strokeWidth={1}
      />

      {cantHojas === 2 && (
        <Rect
          x={drawW / 2 - encuentroCentral / 2}
          y={jambaYDintelDeMarco}
          width={encuentroCentral}
          height={hojaH}
          fill={aluminio}
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

  // --- ORQUESTADOR MODULAR ---
  const renderContenidoInternoHoja = (
    xPosGlobal: number,
    interiorW: number,
    interiorH: number,
  ) => {
    const cantH = Number(detalles.cant_centrados_horizontal ?? 0);
    const cantV = Number(detalles.cant_centrados_vertical ?? 0);
    const tipoCruce = Number(detalles.tipo_cruce ?? 0);

    if (tipoCruce === 1 && (cantH > 0 || cantV > 0)) {
      return (
        <RenderCrucesCentrados
          interiorW={interiorW}
          interiorH={interiorH}
          sizePerfilCruce={perfilCruce}
          scale={scale}
          colors={colors}
          detalles={detalles}
        />
      );
    }

    const tieneCrucesVariables = [
      detalles.horizontal_1,
      detalles.horizontal_2,
      detalles.horizontal_3,
      detalles.vertical_1,
      detalles.vertical_2,
      detalles.vertical_3,
      detalles.vertical_4,
      detalles.vertical_5,
    ].some((v) => typeof v === "number" && v > 0);

    if (tipoCruce === 2 && tieneCrucesVariables) {
      const inicioXVidrioGlobal =
        jambaYDintelDeMarco + xPosGlobal + jambaYCabezalDeHoja;
      const windowWFicticia = interiorW + inicioXVidrioGlobal * 2;
      return (
        <RenderCrucesVariables
          windowW={windowWFicticia}
          windowH={drawH}
          interiorHojaW={interiorW}
          interiorHojaH={interiorH}
          sizePerfilCruce={perfilCruce}
          scale={scale}
          colors={colors}
          detalles={detalles}
        />
      );
    }

    return (
      <RenderCelda
        filaId={1}
        ancho={interiorW}
        alto={interiorH}
        scale={scale}
        colors={colors}
        detalles={detalles}
      />
    );
  };

  const RenderHoja = ({
    width,
    height,
    index,
  }: {
    width: number;
    height: number;
    index: number;
  }) => {
    const xPos = index === 0 ? 0 : width + encuentroCentral;
    const esHojaDerecha = index === 1;

    const anchoInternoHoja = width - jambaYCabezalDeHoja * 2;
    const altoInternoHoja = height - zocaloDeHoja - jambaYCabezalDeHoja;

    return (
      <Group x={xPos}>
        {/* PERFILES DE LA HOJA */}
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
          fill={aluminio}
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
          fill={aluminio}
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
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        <Rect /* Zócalo */
          x={jambaYCabezalDeHoja}
          y={height - zocaloDeHoja}
          width={width - jambaYCabezalDeHoja * 2}
          height={zocaloDeHoja}
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/* BISAGRAS */}
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

        {/* INTERIORES (Orquestador) */}
        <Group x={jambaYCabezalDeHoja} y={jambaYCabezalDeHoja}>
          {renderContenidoInternoHoja(xPos, anchoInternoHoja, altoInternoHoja)}
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

        {/* LÍNEAS DE APERTURA */}
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

  return (
    <Group>
      <RenderMarco />
      {(cantHojas === 1 || cantHojas === 2) && (
        <Group x={jambaYDintelDeMarco} y={jambaYDintelDeMarco}>
          {Array.from({ length: cantHojas }).map((_, index) => (
            <RenderHoja
              key={index}
              width={anchoHojaIndividual}
              height={hojaH}
              index={index}
            />
          ))}
        </Group>
      )}

      {/* Alerta de Tratamiento */}
      {!tieneTratamiento && (
        <WarningAlertDesign
          x={0}
          y={0}
          width={drawW}
          height={drawH}
          scale={scale}
        />
      )}
    </Group>
  );
};

export default PuertaRebatibleLayout;
