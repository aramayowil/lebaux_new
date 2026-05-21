import { Line } from "react-konva";

interface Props {
  hojaW: number;
  hojaH: number;
  contravidrioThick: number;
  colors: {
    colorDeAluminio: string;
    vidrio: string;
    contorno: string;
    lineasCotas: string;
  };
}

export const RenderContravidrio = ({
  hojaW,
  hojaH,
  contravidrioThick,
  colors,
}: Props) => {
  return (
    <>
      {/* CONTRAVIDRIO */}
      {/* PERFIL SUPERIOR*/}
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
        closed={true}
        fill={colors.colorDeAluminio}
        stroke={colors.contorno}
        strokeWidth={1}
      />

      {/*  PERFIL IZQUIERDO*/}
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
        closed={true}
        fill={colors.colorDeAluminio}
        stroke={colors.contorno}
        strokeWidth={1}
      />

      {/*  PERFIL  DERECHO*/}
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
        closed={true}
        fill={colors.colorDeAluminio}
        stroke={colors.contorno}
        strokeWidth={1}
      />

      {/*  PERFIL INFERIOR*/}
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
        closed={true}
        fill={colors.colorDeAluminio}
        stroke={colors.contorno}
        strokeWidth={1}
      />
    </>
  );
};
