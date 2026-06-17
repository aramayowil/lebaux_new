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

export const BanderolaLayout = ({
  drawW,
  drawH,
  scale,
  detalles,
  colors,
}: LayoutProps) => {
  const { aluminio, contorno, lineasCotas } = colors;

  // --- CONFIGURACIÓN DE PERFILES TÉCNICOS ESCALADOS ---
  // Grosor del perfil de marco
  const perfilDeMarco = 42.5 * scale; // jambas, umbral y dintel de marco

  // Dimensiones de la hoja
  const hojaW = drawW - perfilDeMarco * 2;
  const hojaH = drawH - perfilDeMarco * 2;

  // Grosor perfil de hoja
  const perfilDeHoja = (59.2 / 2) * scale; // jambas, zocalo y cabezal de hoja

  // Grosor del perfil de cruces
  const perfilCruce = 57.8 * scale;

  // ACCESORIOS
  // Bisagras Inferiores (en Banderola suelen ir abajo y abrir hacia adentro/afuera)
  const bisagraW = 90 * scale;
  const bisagraH = 20 * scale;
  const colorBisagras = "#595959";
  // Botón Tirante / Cierre
  const botonTirante = 45 * scale;

  const tieneTratamiento =
    detalles.color != null || (detalles as any).tratamiento != null;

  // --- RENDER DEL MARCO PRINCIPAL EXTERIOR ---
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
        fill={aluminio}
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
        fill={aluminio}
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
        fill={aluminio}
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
        fill={aluminio}
        stroke={contorno}
        strokeWidth={1}
      />
    </Group>
  );

  // --- ORQUESTADOR MODULAR DEL CONTENIDO INTERNO DE LA HOJA ---
  const renderContenidoInternoHoja = (interiorW: number, interiorH: number) => {
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

    // Comprobamos si existen cruces variables cargados
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
      // Cálculo del inicio real para ajustar la matriz
      const inicioXVidrioGlobal = perfilDeMarco + perfilDeHoja;
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

  // --- RENDER DE LA HOJA ---
  const RenderHoja = ({ width, height }: { width: number; height: number }) => {
    const interiorW = width - perfilDeHoja * 2;
    const interiorH = height - perfilDeHoja * 2;

    return (
      <>
        {/* CABEZAL DE HOJA */}
        <Rect
          x={perfilDeHoja}
          width={width - perfilDeHoja}
          height={perfilDeHoja}
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        {/* ZOCALO DE HOJA */}
        <Rect
          x={0}
          y={height - perfilDeHoja}
          width={width - perfilDeHoja}
          height={perfilDeHoja}
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        {/* JAMBA IZQUIERDA DE HOJA */}
        <Rect
          width={perfilDeHoja}
          height={height - perfilDeHoja}
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        {/* JAMBA DERECHA DE HOJA */}
        <Rect
          x={width - perfilDeHoja}
          width={perfilDeHoja}
          height={height}
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/* INTERIOR DE HOJA (Orquestador) */}
        <Group x={perfilDeHoja} y={perfilDeHoja}>
          {renderContenidoInternoHoja(interiorW, interiorH)}
        </Group>

        {/* Líneas de Apertura Técnicas (Vértices al centro superior en banderola) */}
        <Line
          points={[
            perfilDeHoja,
            height - perfilDeHoja,
            width / 2,
            perfilDeHoja,
          ]}
          stroke={lineasCotas}
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
          stroke={lineasCotas}
          dash={[6, 6]}
          strokeWidth={0.6}
        />

        {/* Botón Tirante / Cierre (Superior) */}
        <Rect
          x={width / 2 - botonTirante / 2}
          y={perfilDeHoja - botonTirante}
          width={botonTirante}
          height={botonTirante}
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/* Bisagras (Inferiores) */}
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
  };

  return (
    <Group>
      <RenderMarco />
      <Group x={perfilDeMarco} y={perfilDeMarco}>
        <RenderHoja width={hojaW} height={hojaH} />
      </Group>

      {/* Capa superior de Advertencia si falta el tratamiento de color */}
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

export default BanderolaLayout;
