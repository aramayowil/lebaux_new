import { Line } from "react-konva";

interface Props {
  hojaW: number;
  hojaH: number;
  scale: number;
  colors: {
    aluminio: string;
    contorno: string;
  };
}

export const RenderProfundidad = ({ hojaW, hojaH, scale, colors }: Props) => {
  const contravidrioThick = 15 * scale;
  return (
    <>
      {/* PERFIL SUPERIOR */}
      <Line
        points={[
          0,
          0,
          hojaW,
          0,
          hojaW - contravidrioThick,
          contravidrioThick,
          contravidrioThick,
          contravidrioThick,
        ]}
        closed
        fill={colors.aluminio}
        stroke={colors.contorno}
        strokeWidth={1}
      />

      {/* PERFIL IZQUIERDO */}
      <Line
        points={[
          0,
          0,
          contravidrioThick,
          contravidrioThick,
          contravidrioThick,
          hojaH - contravidrioThick,
          0,
          hojaH,
        ]}
        closed
        fill={colors.aluminio}
        stroke={colors.contorno}
        strokeWidth={1}
      />

      {/* PERFIL DERECHO */}
      <Line
        points={[
          hojaW - contravidrioThick,
          contravidrioThick,
          hojaW,
          0,
          hojaW,
          hojaH,
          hojaW - contravidrioThick,
          hojaH - contravidrioThick,
        ]}
        closed
        fill={colors.aluminio}
        stroke={colors.contorno}
        strokeWidth={1}
      />

      {/* PERFIL INFERIOR */}
      <Line
        points={[
          0,
          hojaH,
          contravidrioThick,
          hojaH - contravidrioThick,
          hojaW - contravidrioThick,
          hojaH - contravidrioThick,
          hojaW,
          hojaH,
        ]}
        closed
        fill={colors.aluminio}
        stroke={colors.contorno}
        strokeWidth={1}
      />
    </>
  );
};
