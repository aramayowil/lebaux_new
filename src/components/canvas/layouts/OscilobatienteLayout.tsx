import { Group, Rect, Line } from "react-konva";
import type { ObraDetalle, ObraTipologia, Perfil, Vidrio } from "@/types";
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
    perfiles: Perfil[];
  };
}

export const OscilobatienteLayout = ({
  drawW,
  drawH,
  scale,
  detalles,
  cantHojas,
  colors,
}: LayoutProps) => {
  const { aluminio, contorno, lineasCotas } = colors;

  // Perfiles del marco
  const jamba_Umbral_DintelDeMarco = 47.5 * scale;
  const encuentroCentral = 20 * scale; // perfil de encuentro cuando son 2 hojas

  // Dimensiones de las hojas
  const hojaW = drawW - jamba_Umbral_DintelDeMarco * 2;
  // Ancho de cada hoja
  const anchoHojaIndividual =
    cantHojas === 2 ? (hojaW - encuentroCentral) / 2 : hojaW;
  const hojaH = drawH - jamba_Umbral_DintelDeMarco * 2;

  // Perfiles de la hoja
  const jamba_Zocalo_CabezalDeHoja = 59.2 * scale;

  // Bisagras de la hoja
  const bisagrasH = 90 * scale;
  const bisagrasW = 20 * scale;
  const colorBisagras = "#595959";

  // Color de Cerradura
  const cerraduraW = 20 * scale;
  const cerraduraH = 130 * scale;
  const colorCerradura = "#595959";

  // perfil de cruce
  const perfilCruce = 61 * scale;

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
          drawW - jamba_Umbral_DintelDeMarco,
          jamba_Umbral_DintelDeMarco,
          jamba_Umbral_DintelDeMarco,
          jamba_Umbral_DintelDeMarco,
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
          jamba_Umbral_DintelDeMarco,
          drawH,
          jamba_Umbral_DintelDeMarco,
          jamba_Umbral_DintelDeMarco,
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
          drawW - jamba_Umbral_DintelDeMarco,
          drawH,
          drawW - jamba_Umbral_DintelDeMarco,
          jamba_Umbral_DintelDeMarco,
        ]}
        closed
        fill={aluminio}
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
        fill={aluminio}
        stroke={contorno}
        strokeWidth={1}
      />

      {cantHojas === 2 && (
        <Rect
          x={drawW / 2 - encuentroCentral / 2}
          y={jamba_Umbral_DintelDeMarco}
          width={encuentroCentral}
          height={hojaH}
          fill={aluminio}
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

  // --- ORQUESTADOR MODULAR DEL CONTENIDO INTERNO ---
  const renderContenidoInternoHoja = (
    xPosGlobal: number,
    interiorW: number,
    interiorH: number,
  ) => {
    const cantH = Number(detalles.cant_centrados_horizontal ?? 0);
    const cantV = Number(detalles.cant_centrados_vertical ?? 0);
    const tipoCruce = Number(detalles.tipo_cruce ?? 0);

    // CASO 1: Cruces Centrados
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

    // CASO 2: Cruces Variables
    if (tipoCruce === 2 && tieneCrucesVariables) {
      const inicioXVidrioGlobal =
        jamba_Umbral_DintelDeMarco + xPosGlobal + jamba_Zocalo_CabezalDeHoja;
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

    // CASO POR DEFECTO: Celda entera de vidrio
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
    // Si es la segunda hoja (index 1), se desplaza el ancho de la primera + el encuentro
    const xPos = index === 0 ? 0 : width + encuentroCentral;
    const esHojaDerecha = index === 1;

    const anchoInternoHoja = width - jamba_Zocalo_CabezalDeHoja * 2;
    const altoInternoHoja = height - jamba_Zocalo_CabezalDeHoja * 2;

    return (
      <Group x={xPos}>
        {/* Perfiles de la hoja */}
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
          fill={aluminio}
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
            width - jamba_Zocalo_CabezalDeHoja,
            height,
            width - jamba_Zocalo_CabezalDeHoja,
            jamba_Zocalo_CabezalDeHoja,
          ]}
          closed
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        <Rect /* Zócalo */
          x={jamba_Zocalo_CabezalDeHoja}
          y={height - jamba_Zocalo_CabezalDeHoja}
          width={width - jamba_Zocalo_CabezalDeHoja * 2}
          height={jamba_Zocalo_CabezalDeHoja}
          fill={aluminio}
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

        {/* INTERIORES (Orquestador) */}
        <Group x={jamba_Zocalo_CabezalDeHoja} y={jamba_Zocalo_CabezalDeHoja}>
          {renderContenidoInternoHoja(xPos, anchoInternoHoja, altoInternoHoja)}
        </Group>

        {/* CERRADURA */}
        {index === 0 && cantHojas === 1 && (
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
        {index === 1 && cantHojas === 2 && (
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
        {/* Apertura de Giro (Triángulo lateral) */}
        <Line
          points={
            !esHojaDerecha
              ? [
                  jamba_Zocalo_CabezalDeHoja,
                  jamba_Zocalo_CabezalDeHoja,
                  anchoHojaIndividual - jamba_Zocalo_CabezalDeHoja,
                  jamba_Zocalo_CabezalDeHoja + altoInternoHoja / 2,
                  jamba_Zocalo_CabezalDeHoja,
                  height - jamba_Zocalo_CabezalDeHoja,
                ]
              : [
                  anchoHojaIndividual - jamba_Zocalo_CabezalDeHoja,
                  jamba_Zocalo_CabezalDeHoja,
                  jamba_Zocalo_CabezalDeHoja,
                  jamba_Zocalo_CabezalDeHoja + altoInternoHoja / 2,
                  anchoHojaIndividual - jamba_Zocalo_CabezalDeHoja,
                  height - jamba_Zocalo_CabezalDeHoja,
                ]
          }
          stroke={lineasCotas}
          strokeWidth={0.8}
          dash={[5, 5]}
        />
        {/* Apertura de Tilt/Ventilación (Triángulo superior) */}
        {esHojaDerecha && (
          <Line
            points={[
              jamba_Zocalo_CabezalDeHoja,
              height - jamba_Zocalo_CabezalDeHoja,
              anchoHojaIndividual / 2,
              jamba_Zocalo_CabezalDeHoja,
              anchoHojaIndividual - jamba_Zocalo_CabezalDeHoja,
              height - jamba_Zocalo_CabezalDeHoja,
            ]}
            stroke={lineasCotas}
            strokeWidth={0.8}
            dash={[5, 5]}
          />
        )}
      </Group>
    );
  };

  return (
    <Group>
      <RenderMarco />

      {(cantHojas === 1 || cantHojas === 2) && (
        <Group x={jamba_Umbral_DintelDeMarco} y={jamba_Umbral_DintelDeMarco}>
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

export default OscilobatienteLayout;
