import { Group, Rect, Arrow } from "react-konva";
import { ObraTipologia, ObraDetalle } from "@/types"; // 🌟 Importamos ObraDetalle
import { RenderFoco } from "../components/FocoRender";
import RenderCruces from "../components/RenderCruces";
import { RenderContravidrio } from "../components/RenderContravidrios";

interface LayoutProps {
  drawW: number;
  drawH: number;
  scale: number;
  tipologia: ObraTipologia;
  config: ObraDetalle; // 🌟 Cambiado de TipologiaConfig a ObraDetalle
  hojas: number; // Recibe el número de hojas (ej: 2, 3, 4, 6)
  isFocused: boolean;
  focusedHoja: number;
  colors: {
    colorDeAluminio: string;
    vidrio: string;
    contorno: string;
    lineasCotas: string;
  };
  onContextMenu?: (e: any, index: number) => void;

  // 🌟 Agregados como opcionales para absorber las propiedades calculadas de commonProps sin romper TS
  posH?: number[];
  posV?: number[];
  espesoPerfil?: number;
}

export const CorredizaLayout = ({
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

  // --- CONFIGURACIÓN DE PERFILES TÉCNICOS ---
  const jambaMarco = (36 - 6) * scale;
  const umbralYdintelMarco = 49.1 * scale;
  const paranteHoja = 53.5 * scale;
  const zocaloYcabezalHoja = 52.4 * scale;
  const perfilDeCruce = 55 * scale;
  const contravidrioThick = 17 * scale;

  const marcoHojaW = drawW - jambaMarco * 2;
  const marcoHojaH = drawH - umbralYdintelMarco * 2;

  const cierreLateralW = 20 * scale;
  const cierreLateralH = 80 * scale;
  const colorCierreLateral = "#595959";

  const RenderMarcoPrincipal = () => (
    <Group>
      <Rect
        width={jambaMarco}
        height={drawH}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      <Rect
        x={drawW - jambaMarco}
        width={jambaMarco}
        height={drawH}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      <Rect
        x={jambaMarco}
        y={0}
        width={drawW - jambaMarco * 2}
        height={umbralYdintelMarco}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      <Rect
        x={jambaMarco}
        y={drawH - umbralYdintelMarco}
        width={drawW - jambaMarco * 2}
        height={umbralYdintelMarco}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
    </Group>
  );

  const RenderHojaIndividual = ({
    id,
    index,
    hojaW,
    hojaH,
    direction,
  }: {
    id: number;
    index: number;
    hojaW: number;
    hojaH: number;
    direction: "left" | "right" | "center";
  }) => {
    const xPos = index * (hojaW - paranteHoja);

    return (
      <Group x={xPos}>
        <Rect
          x={paranteHoja}
          width={hojaW - paranteHoja * 2}
          height={zocaloYcabezalHoja}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        <Rect
          width={paranteHoja}
          height={hojaH}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        <Rect
          x={hojaW - paranteHoja}
          width={paranteHoja}
          height={hojaH}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        <Rect
          x={paranteHoja}
          y={hojaH - zocaloYcabezalHoja}
          width={hojaW - paranteHoja * 2}
          height={zocaloYcabezalHoja}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        <Group x={paranteHoja} y={zocaloYcabezalHoja}>
          {RenderInteriorHoja(
            hojaW - paranteHoja * 2,
            hojaH - zocaloYcabezalHoja * 2,
            id,
            direction,
          )}
        </Group>

        {direction === "left" && (
          <Rect
            x={paranteHoja - cierreLateralW}
            width={cierreLateralW}
            y={hojaH / 2 - cierreLateralH / 2}
            height={cierreLateralH}
            fill={colorCierreLateral}
            stroke={colorCierreLateral}
            strokeWidth={1}
          />
        )}
        {direction === "right" && (
          <Rect
            x={hojaW - paranteHoja}
            width={cierreLateralW}
            y={hojaH / 2 - cierreLateralH / 2}
            height={cierreLateralH}
            fill={colorCierreLateral}
            stroke={colorCierreLateral}
            strokeWidth={1}
          />
        )}
      </Group>
    );
  };

  const RenderInteriorHoja = (
    interiorW: number,
    interiorH: number,
    index: number,
    direction: "left" | "right" | "center",
  ) => {
    const estaEnFoco = isFocused && focusedHoja === index;
    const centerY = interiorH / 2;
    const xStart = interiorW * 0.3;
    const xEnd = interiorW * 0.7;

    return (
      <Group onContextMenu={(e) => onContextMenu?.(e, index)}>
        <Rect
          width={interiorW}
          height={interiorH}
          fill={vidrio}
          stroke={contorno}
          strokeWidth={1}
        />
        {estaEnFoco && <RenderFoco width={interiorW} height={interiorH} />}
        <RenderContravidrio
          hojaW={interiorW}
          hojaH={interiorH}
          contravidrioThick={contravidrioThick}
          colors={colors}
        />

        {/* 🌟 DIVISIONES DINÁMICAS (Se le pasa config que ahora es ObraDetalle) */}
        <RenderCruces
          width={interiorW}
          height={interiorH}
          config={config}
          espesoPerfilCruce={perfilDeCruce}
          contravidrioThick={contravidrioThick}
          colors={colors}
        />

        <Arrow
          points={
            direction === "right"
              ? [xEnd, centerY, xStart, centerY]
              : [xStart, centerY, xEnd, centerY]
          }
          pointerAtBeginning={direction === "center"}
          fill={lineasCotas}
          stroke={lineasCotas}
          strokeWidth={1.5}
          pointerLength={8}
          pointerWidth={6}
          opacity={0.6}
        />
      </Group>
    );
  };

  const renderPorCasos = (
    hojasCount: number,
    width: number,
    height: number,
  ) => {
    const hojaW = (width + (hojasCount - 1) * paranteHoja) / hojasCount;
    const hojaWpara4 = width / 2;
    const widthHoja4 = (hojaWpara4 + paranteHoja) / 2;
    const hojasWpara3 = width / 2;
    const widthHoja3 = (hojasWpara3 + 2 * paranteHoja) / 3;

    switch (hojasCount) {
      case 2:
        return (
          <>
            <RenderHojaIndividual
              key={0}
              id={0}
              index={0}
              hojaW={hojaW}
              hojaH={height}
              direction="left"
            />
            <RenderHojaIndividual
              key={1}
              id={1}
              index={1}
              hojaW={hojaW}
              hojaH={height}
              direction="right"
            />
          </>
        );
      case 3:
        return (
          <>
            <RenderHojaIndividual
              key={0}
              id={0}
              index={0}
              hojaW={hojaW}
              hojaH={height}
              direction="left"
            />
            <RenderHojaIndividual
              key={1}
              id={1}
              index={1}
              hojaW={hojaW}
              hojaH={height}
              direction="center"
            />
            <RenderHojaIndividual
              key={2}
              id={2}
              index={2}
              hojaW={hojaW}
              hojaH={height}
              direction="right"
            />
          </>
        );
      case 4:
        return (
          <>
            <Group>
              <RenderHojaIndividual
                key={0}
                id={0}
                index={0}
                hojaW={widthHoja4}
                hojaH={height}
                direction="left"
              />
              <RenderHojaIndividual
                key={1}
                id={1}
                index={1}
                hojaW={widthHoja4}
                hojaH={height}
                direction="right"
              />
            </Group>
            <Group x={width / 2}>
              <RenderHojaIndividual
                key={2}
                id={2}
                index={0}
                hojaW={widthHoja4}
                hojaH={height}
                direction="left"
              />
              <RenderHojaIndividual
                key={3}
                id={3}
                index={1}
                hojaW={widthHoja4}
                hojaH={height}
                direction="right"
              />
            </Group>
          </>
        );
      case 6:
        return (
          <>
            <Group>
              <RenderHojaIndividual
                key={0}
                id={0}
                index={0}
                hojaW={widthHoja3}
                hojaH={height}
                direction="left"
              />
              <RenderHojaIndividual
                key={1}
                id={1}
                index={1}
                hojaW={widthHoja3}
                hojaH={height}
                direction="center"
              />
              <RenderHojaIndividual
                key={2}
                id={2}
                index={2}
                hojaW={widthHoja3}
                hojaH={height}
                direction="right"
              />
            </Group>
            <Group x={width / 2}>
              <RenderHojaIndividual
                key={3}
                id={3}
                index={0}
                hojaW={widthHoja3}
                hojaH={height}
                direction="left"
              />
              <RenderHojaIndividual
                key={4}
                id={4}
                index={1}
                hojaW={widthHoja3}
                hojaH={height}
                direction="center"
              />
              <RenderHojaIndividual
                key={5}
                id={5}
                index={2}
                hojaW={widthHoja3}
                hojaH={height}
                direction="right"
              />
            </Group>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Group>
      <RenderMarcoPrincipal />
      <Group x={jambaMarco} y={umbralYdintelMarco}>
        {renderPorCasos(hojas, marcoHojaW, marcoHojaH)}
      </Group>
    </Group>
  );
};

export default CorredizaLayout;
