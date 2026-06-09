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
  const jambaYDintelDeMarco = 25.5 * scale;
  const encuentroCentral = 25.5 * scale;

  const hojaW = drawW - jambaYDintelDeMarco * 2;
  const anchoHojaIndividual =
    cantHojas === 2 ? (hojaW - encuentroCentral) / 2 : hojaW;
  const hojaH = drawH - jambaYDintelDeMarco * 2;

  const jamba_Zocalo_CabezalDeHoja = 59.2 * scale;
  const perfilCruce = 61 * scale;

  const tieneTratamiento =
    detalles.color != null || (detalles as any).tratamiento != null;

  // --- RENDER DEL MARCO PRINCIPAL EXTERIOR ---
  const RenderMarco = () => (
    <Group>
      <Rect
        width={drawW}
        height={drawH}
        fill={aluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Hueco interno */}
      <Rect
        x={jambaYDintelDeMarco}
        y={jambaYDintelDeMarco}
        width={drawW - jambaYDintelDeMarco * 2}
        height={drawH - jambaYDintelDeMarco * 2}
        fill="white"
        opacity={0.1}
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
        jambaYDintelDeMarco + xPosGlobal + jamba_Zocalo_CabezalDeHoja;
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
    const anchoInternoHoja = width - jamba_Zocalo_CabezalDeHoja * 2;
    const altoInternoHoja = height - jamba_Zocalo_CabezalDeHoja * 2;

    return (
      <Group x={xPos}>
        {/* Perfilería de hoja */}
        <Rect
          width={width}
          height={height}
          stroke={contorno}
          strokeWidth={1}
          fill={aluminio}
        />

        {/* Orquestador */}
        <Group x={jamba_Zocalo_CabezalDeHoja} y={jamba_Zocalo_CabezalDeHoja}>
          {renderContenidoInternoHoja(xPos, anchoInternoHoja, altoInternoHoja)}
        </Group>

        {/* Línea de abatimiento */}
        <Line
          points={index === 0 ? [width, 0, 0, height] : [0, 0, width, height]}
          stroke={lineasCotas}
          strokeWidth={0.6}
          dash={[5, 5]}
        />
      </Group>
    );
  };

  return (
    <Group>
      <RenderMarco />
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
