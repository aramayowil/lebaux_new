import { Group, Rect, Arrow } from "react-konva";
import { ObraTipologia } from "@/types";
import { TipologiaConfig } from "@/store/obrasStore";
import { RenderFoco } from "../FocoRender";
import RenderCruces from "../components/RenderCruces";

import { RenderContravidrio } from "../components/RenderContravidrios";

interface LayoutProps {
  drawW: number;
  drawH: number;
  espesoPerfil: number;
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
  espesoPerfil,
  config,
  hojas,
  isFocused,
  focusedHoja,
  colors,
  onContextMenu,
}: LayoutProps) => {
  const { colorDeAluminio, vidrio, contorno, lineasCotas } = colors;

  // --- CONFIGURACIÓN DE PERFILES TÉCNICOS ---
  const jambaDeHojaThick = espesoPerfil * 1.7;
  const dintelDeHojaThick = espesoPerfil * 1.7;
  const umbralDeHojaThick = espesoPerfil * 2.5;
  const contravidrioThick = espesoPerfil * 0.85;

  // --- CÁLCULOS DE ESPACIO ---
  // El espacio interno es el ancho total menos las jambas del marco
  const marcoHojaW = drawW - espesoPerfil * 2;
  const marcoHojaH = drawH - espesoPerfil * 3; // Menos dintel y umbral del marco

  const RenderMarcoPrincipal = () => (
    <Group>
      {/* Jamba izquierda */}
      <Rect
        width={espesoPerfil}
        height={drawH}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Jamba Derecha */}
      <Rect
        x={drawW - espesoPerfil}
        width={espesoPerfil}
        height={drawH}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Dintel (Superior) */}
      <Rect
        x={espesoPerfil}
        y={0}
        width={drawW - espesoPerfil * 2}
        height={espesoPerfil}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Umbral (Inferior) */}
      <Rect
        x={espesoPerfil}
        y={drawH - espesoPerfil * 2}
        width={drawW - espesoPerfil * 2}
        height={espesoPerfil * 2}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
    </Group>
  );

  const RenderHojaIndividual = ({
    index,
    hojaW,
    hojaH,
    direction,
  }: {
    index: number;
    hojaW: number;
    hojaH: number;
    direction: "left" | "right" | "center";
  }) => {
    const isThisHojaFocused = isFocused && focusedHoja === index;

    // Posición X: Cada hoja se desplaza su ancho menos el solape (jamba de hoja)
    const xPos = index * (hojaW - jambaDeHojaThick);

    const glassW = hojaW - jambaDeHojaThick * 2;
    const glassH = hojaH - dintelDeHojaThick - umbralDeHojaThick;
    const midY = glassH / 2;
    return (
      <Group x={xPos} y={0}>
        {/* ESTRUCTURA DE LA HOJA (Perfiles) */}
        <Rect
          width={hojaW}
          height={hojaH}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/* JAMBAS INTERNAS (Visualización de los dos parantes de la hoja) */}
        <Rect
          width={jambaDeHojaThick}
          height={hojaH}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        <Rect
          x={hojaW - jambaDeHojaThick}
          width={jambaDeHojaThick}
          height={hojaH}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/*CIERRRE LATERAL*/}
        {direction === "left" && (
          <Rect
            x={espesoPerfil * 0.7}
            width={espesoPerfil}
            y={hojaH / 2 - espesoPerfil * 2}
            height={espesoPerfil * 4}
            fill={colorDeAluminio}
            stroke={contorno}
            strokeWidth={1}
          />
        )}

        {direction === "right" && (
          <Rect
            x={hojaW - espesoPerfil * 1.7}
            width={espesoPerfil}
            y={hojaH / 2 - espesoPerfil * 2}
            height={espesoPerfil * 4}
            fill={colorDeAluminio}
            stroke={contorno}
            strokeWidth={1}
          />
        )}
        {/* DINTEL Y UMBRAL DE HOJA */}
        <Rect
          x={jambaDeHojaThick}
          y={0}
          width={hojaW - jambaDeHojaThick * 2}
          height={dintelDeHojaThick}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        <Rect
          x={jambaDeHojaThick}
          y={hojaH - umbralDeHojaThick}
          width={hojaW - jambaDeHojaThick * 2}
          height={umbralDeHojaThick}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/* ÁREA DE VIDRIO E INTERACCIÓN */}
        <Group
          x={jambaDeHojaThick}
          y={dintelDeHojaThick}
          onContextMenu={(e) => onContextMenu?.(e, index)}
        >
          <Rect
            width={hojaW - jambaDeHojaThick * 2}
            height={hojaH - dintelDeHojaThick - umbralDeHojaThick}
            fill={vidrio}
            stroke={contorno}
            strokeWidth={1}
          />

          {/* CONTRAVIDRIO */}
          <RenderContravidrio
            hojaW={hojaW - jambaDeHojaThick * 2}
            hojaH={hojaH - dintelDeHojaThick - umbralDeHojaThick}
            contravidrioThick={contravidrioThick}
            colors={colors}
          />

          {/* DIVISIONES DINÁMICAS (Travesaños/Parantes) */}
          <RenderCruces
            width={hojaW - jambaDeHojaThick * 2}
            height={hojaH - dintelDeHojaThick - umbralDeHojaThick}
            config={config}
            espesoPerfil={espesoPerfil}
            contravidrioThick={contravidrioThick}
            colors={colors}
          />

          {/* INDICADOR DE APERTURA (Flecha) */}
          <Group opacity={0.4}>
            {direction === "center" ? (
              <>
                <Arrow
                  points={[glassW * 0.2, midY, glassW * 0.8, midY]}
                  fill={lineasCotas}
                  stroke={lineasCotas}
                  pointerLength={8}
                  pointerWidth={6}
                />
                <Arrow
                  points={[glassW * 0.8, midY, glassW * 0.2, midY]}
                  fill={lineasCotas}
                  stroke={lineasCotas}
                  pointerLength={8}
                  pointerWidth={6}
                />
              </>
            ) : (
              <Arrow
                points={
                  direction === "left"
                    ? [glassW * 0.2, midY, glassW * 0.8, midY]
                    : [glassW * 0.8, midY, glassW * 0.2, midY]
                }
                fill={lineasCotas}
                stroke={lineasCotas}
                pointerLength={8}
                pointerWidth={6}
              />
            )}
          </Group>

          {/* FOCO DE SELECCIÓN */}
          {isThisHojaFocused && (
            <RenderFoco
              width={hojaW - jambaDeHojaThick * 2}
              height={hojaH - dintelDeHojaThick - umbralDeHojaThick}
            />
          )}
        </Group>
      </Group>
    );
  };

  const renderPorCasos = (hojas: number, width: number, height: number) => {
    const hojaW = (width + (hojas - 1) * jambaDeHojaThick) / hojas;
    const hojaWpara4 = width / 2;
    const widthHoja4 = (hojaWpara4 + jambaDeHojaThick) / 2;

    const hojasWpara3 = width / 2;
    const widthHoja3 = (hojasWpara3 + 2 * jambaDeHojaThick) / 3;
    switch (hojas) {
      case 2:
        return (
          <>
            <RenderHojaIndividual
              key={0}
              index={0}
              hojaW={hojaW}
              hojaH={height}
              direction="left"
            />
            <RenderHojaIndividual
              key={1}
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
              index={0}
              hojaW={hojaW}
              hojaH={height}
              direction="left"
            />
            <RenderHojaIndividual
              key={1}
              index={1}
              hojaW={hojaW}
              hojaH={height}
              direction="center"
            />
            <RenderHojaIndividual
              key={2}
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
                  index={0}
                  hojaW={widthHoja4}
                  hojaH={height}
                  direction="left"
                />
                <RenderHojaIndividual
                  key={1}
                  index={1}
                  hojaW={widthHoja4}
                  hojaH={height}
                  direction="right"
                />
              </Group>
              <Group x={width / 2}>
                <RenderHojaIndividual
                  key={0}
                  index={0}
                  hojaW={widthHoja4}
                  hojaH={height}
                  direction="left"
                />
                <RenderHojaIndividual
                  key={1}
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
                  index={0}
                  hojaW={widthHoja3}
                  hojaH={height}
                  direction="left"
                />
                <RenderHojaIndividual
                  key={1}
                  index={1}
                  hojaW={widthHoja3}
                  hojaH={height}
                  direction="center"
                />
                <RenderHojaIndividual
                  key={2}
                  index={2}
                  hojaW={widthHoja3}
                  hojaH={height}
                  direction="right"
                />
              </Group>
              <Group x={width / 2}>
                <RenderHojaIndividual
                  key={0}
                  index={0}
                  hojaW={widthHoja3}
                  hojaH={height}
                  direction="left"
                />
                <RenderHojaIndividual
                  key={1}
                  index={1}
                  hojaW={widthHoja3}
                  hojaH={height}
                  direction="center"
                />
                <RenderHojaIndividual
                  key={2}
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
      <Group
        x={espesoPerfil}
        y={espesoPerfil}
        width={marcoHojaW}
        height={marcoHojaH}
      >
        {renderPorCasos(hojas, marcoHojaW, marcoHojaH)}
      </Group>
    </Group>
  );
};

export default CorredizaLayout;
