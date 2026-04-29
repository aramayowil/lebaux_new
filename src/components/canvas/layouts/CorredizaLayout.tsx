import { Group, Rect, Arrow } from "react-konva";
import { ObraTipologia } from "@/types";
import { TipologiaConfig } from "@/store/obrasStore";
import { RenderFoco } from "../components/FocoRender";
import RenderCruces from "../components/RenderCruces";
import { RenderContravidrio } from "../components/RenderContravidrios";

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

  // --- CONFIGURACIÓN DE+ PERFILES TÉCNICOS ---

  // --- PERFILES DE MARCO
  const jambaMarco = (36 - 6) * scale;
  const umbralYdintelMarco = 49.1 * scale;

  //--PERFILES DE HOJA
  const paranteHoja = 53.5 * scale;
  const zocaloYcabezalHoja = 52.4 * scale;

  //PERFIL DE CRUCE
  const perfilDeCruce = 55 * scale;

  //GROSOR DE CONTRAVIDRIO
  const contravidrioThick = 17 * scale;

  // El espacio interno es el ancho total menos las jambas del marco
  const marcoHojaW = drawW - jambaMarco * 2;
  const marcoHojaH = drawH - umbralYdintelMarco * 2; // Menos dintel y umbral del marco

  //Accesorios
  const cierreLateralW = 20 * scale;
  const cierreLateralH = 80 * scale;

  const colorCierreLateral = "#595959";

  const RenderMarcoPrincipal = () => (
    <Group>
      {/* Jamba izquierda */}
      <Rect
        width={jambaMarco}
        height={drawH}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Jamba Derecha */}
      <Rect
        x={drawW - jambaMarco}
        width={jambaMarco}
        height={drawH}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Dintel (Superior) */}
      <Rect
        x={jambaMarco}
        y={0}
        width={drawW - jambaMarco * 2}
        height={umbralYdintelMarco}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Umbral (Inferior) */}
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
    // Posición X: Cada hoja se desplaza su ancho menos el solape (jamba de hoja)
    const xPos = index * (hojaW - paranteHoja);

    return (
      <Group x={xPos}>
        {/* CABEZAL DE HOJA */}
        <Rect
          x={paranteHoja}
          width={hojaW - paranteHoja * 2}
          height={zocaloYcabezalHoja}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/* PARANTE LATERAL  */}
        <Rect
          width={paranteHoja}
          height={hojaH}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        {/* PARANTE CENTRAL DE HOJA */}
        <Rect
          x={hojaW - paranteHoja}
          width={paranteHoja}
          height={hojaH}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        {/* ZÓCALO DE HOJA */}
        <Rect
          x={paranteHoja}
          y={hojaH - zocaloYcabezalHoja}
          width={hojaW - paranteHoja * 2}
          height={zocaloYcabezalHoja}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/* ÁREA DE VIDRIO E INTERACCIÓN */}
        <Group x={paranteHoja} y={zocaloYcabezalHoja}>
          {RenderInteriorHoja(
            hojaW - paranteHoja * 2,
            hojaH - zocaloYcabezalHoja * 2,
            id,
            direction,
          )}
        </Group>

        {/*CIERRRE LATERAL*/}
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

    // Definimos los puntos de inicio y fin para que la flecha esté centrada
    // Usamos un 40% del ancho del vidrio (del 30% al 70%)
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

        {/* FOCO DE SELECCIÓN */}
        {estaEnFoco && <RenderFoco width={interiorW} height={interiorH} />}

        {/* CONTRAVIDRIO */}
        <RenderContravidrio
          hojaW={interiorW}
          hojaH={interiorH}
          contravidrioThick={contravidrioThick}
          colors={colors}
        />

        {/* DIVISIONES DINÁMICAS */}
        <RenderCruces
          width={interiorW}
          height={interiorH}
          config={config}
          espesoPerfilCruce={perfilDeCruce}
          contravidrioThick={contravidrioThick}
          colors={colors}
        />

        {/* Flechas de Apertura */}
        <Arrow
          points={
            direction === "right"
              ? [xEnd, centerY, xStart, centerY] // De derecha a izquierda
              : [xStart, centerY, xEnd, centerY] // De izquierda a derecha (usado para right y center)
          }
          // El truco: si es center, dibuja punta al inicio Y al final
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

  const renderPorCasos = (hojas: number, width: number, height: number) => {
    const hojaW = (width + (hojas - 1) * paranteHoja) / hojas;
    const hojaWpara4 = width / 2;
    const widthHoja4 = (hojaWpara4 + paranteHoja) / 2;

    const hojasWpara3 = width / 2;
    const widthHoja3 = (hojasWpara3 + 2 * paranteHoja) / 3;
    switch (hojas) {
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
            </Group>
          </>
        );
      case 6:
        return (
          <>
            <Group>
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
      {/* Mapeo de hojas */}
      <Group x={jambaMarco} y={umbralYdintelMarco}>
        {renderPorCasos(hojas, marcoHojaW, marcoHojaH)}
      </Group>
    </Group>
  );
};

export default CorredizaLayout;
