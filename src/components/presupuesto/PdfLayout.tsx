import { Obra, ObraTipologia } from "@/types";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    margin: 0,
  },
  section: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  textEncabezado: {
    fontSize: 10.5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  imageContainer: {
    width: "45%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 10,
  },
  condicionesContainer: {
    marginTop: 30,
    fontSize: 10.5,
    color: "#444",
    paddingTop: 15,
    lineHeight: 1.5,
    paddingHorizontal: 30,
  },
  observacionesFinales: {
    marginTop: 15,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eba434",
    borderTopStyle: "dashed",
    marginHorizontal: 30,
  },
  observacionesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#eba434",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  observacionesText: {
    fontSize: 10,
    color: "#444",
    lineHeight: 1.3,
    fontStyle: "italic",
  },
});

const formatCurrency = (valor: number) => {
  return valor.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function obtenerFechaHoy() {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const año = hoy.getFullYear();
  return `${dia}/${mes}/${año}`;
}

interface PDFProps {
  idPresupuesto: string;
  obra: Obra;
  tipologias: ObraTipologia[];
  detalleCompra: {
    total: number;
    descuento: number;
    saldoPendiente: number;
    iva: number;
    importeFinal: number;
  };
  nameCliente: string;
  observaciones: string;
  images?: Record<number, string>;
}

function PDF({
  idPresupuesto,
  obra,
  tipologias,
  detalleCompra,
  nameCliente = "",
  observaciones,
  images,
}: PDFProps) {
  const IvaPorcentaje = 10.5;

  return (
    <Document>
      <Page wrap={true} size="A4" style={styles.page}>
        {/* LOGO Y TITULO */}
        <View style={styles.section}>
          <Image
            src="/images/logos/LEBAUX-LOGO.png"
            style={{ width: 160, height: 40 }}
          />
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#eba434" }}>
            PRESUPUESTO
          </Text>
        </View>

        {/* INFO CLIENTE */}
        <View style={styles.textEncabezado}>
          <View>
            <Text style={{ fontSize: 11 }}>
              Sres. {nameCliente.toUpperCase()}
            </Text>
            <Text style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
              Obra: {obra.direccion || "S/D"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 2 }}>
            <Text>LEBAUX SRL</Text>
            <Text>Av. Alem 1930 - San Miguel de Tucumán</Text>
            <Text>Fecha: {obtenerFechaHoy()}</Text>
            <Text>{idPresupuesto}</Text>
          </View>
        </View>

        {/* CABECERA TABLA */}
        <View
          style={{
            flexDirection: "row",
            padding: 8,
            fontSize: 10,
            borderBottomWidth: 2,
            borderBottomColor: "#eba434",
            borderBottomStyle: "solid",
            backgroundColor: "#f8f8f8",
          }}
        >
          <Text style={{ width: "45%" }}>Diseño / Abertura</Text>
          <Text style={{ width: "35%" }}>Especificaciones</Text>
          <Text style={{ width: "20%", textAlign: "right" }}>Total</Text>
        </View>

        {/* --- ITEMS TIPOLOGIAS --- */}
        <View>
          {tipologias.map((tipologia, index) => {
            // Mantenemos tus cálculos de negocio para precio en el código nuevo
            const areaM2 = ((tipologia.ancho ?? 0) / 1000) * ((tipologia.alto ?? 0) / 1000);
            const precioUnitario = areaM2 * 100000;
            const precioTotal = precioUnitario * (tipologia.cantidad ?? 0);

            // Algoritmo original de escalado y renderizado proporcional de imágenes
            const AREA_MAX_W = 230;
            const AREA_MAX_H = 180;
            const umbral = 500;
            const escalaBase = 0.25;

            let widthCalculado: number;
            if ((tipologia.ancho ?? 0) <= umbral) {
              widthCalculado = (tipologia.ancho ?? 0) * escalaBase;
            } else {
              const excedente = (tipologia.ancho ?? 0) - umbral;
              widthCalculado = umbral * escalaBase + excedente * 0.03;
            }

            const aspect = (tipologia.alto ?? 0) / (tipologia.ancho ?? 1);
            let finalWidth = widthCalculado;
            let finalHeight = widthCalculado * aspect;

            if (finalWidth > AREA_MAX_W) {
              const ratio = AREA_MAX_W / finalWidth;
              finalWidth *= ratio;
              finalHeight *= ratio;
            }
            if (finalHeight > AREA_MAX_H) {
              const ratio = AREA_MAX_H / finalHeight;
              finalWidth *= ratio;
              finalHeight *= ratio;
            }

            return (
              <View
                key={index}
                wrap={false}
                style={{
                  borderBottomWidth: 1.5,
                  borderBottomColor: "#eba434",
                  borderBottomStyle: "solid",
                  flexDirection: "row",
                  alignItems: "stretch",
                  marginTop: 5,
                  paddingTop: 15,
                  paddingBottom: 10,
                  paddingHorizontal: 8,
                }}
              >
                {/* COLUMNA IZQUIERDA: IMAGEN (Estilo viejo de Lebaux) */}
                <View style={styles.imageContainer}>
                  {/* <Text
                    style={{
                      marginBottom: 2,
                      fontSize: 10,
                      color: "#333",
                      marginTop: -10,
                    }}
                  >
                    T-{tipologia.id}
                  </Text> */}
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {images && images[tipologia.id] && (
                      <Image
                        src={images[tipologia.id]}
                        style={{ width: finalWidth, height: finalHeight }}
                      />
                    )}
                  </View>
                </View>

                {/* COLUMNA DERECHA: TEXTO (Distribución 55% asimétrica) */}
                <View
                  style={{
                    width: "55%",
                    paddingLeft: 10,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "#333",
                      marginBottom: 2,
                    }}
                  >
                    {tipologia.descripcion}
                  </Text>

                  <View style={{ gap: 2, marginTop: 4 }}>
                    <Text style={{ fontSize: 10 }}>
                      Medidas:{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        {tipologia.ancho} x {tipologia.alto} mm
                      </Text>
                    </Text>
                    {tipologia.hor_1 && tipologia.hor_1 > 0 ? (
                      <Text style={{ fontSize: 10, color: "#555" }}>
                        Cruce Horizontal: {tipologia.hor_1} mm
                      </Text>
                    ) : null}
                    <Text style={{ fontSize: 10 }}>
                      Cantidad: {tipologia.cantidad ?? 0}
                    </Text>
                  </View>

                  <View
                    style={{
                      marginTop: "auto",
                      paddingTop: 10,
                      alignItems: "flex-end",
                    }}
                  >
                    <Text style={{ fontSize: 10, color: "#666" }}>
                      P. Unitario: ${formatCurrency(precioUnitario)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#eba434",
                      }}
                    >
                      Importe: ${formatCurrency(precioTotal)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* TOTALES FINALES */}
        <View
          wrap={false}
          style={{
            marginTop: 20,
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            paddingHorizontal: 8,
          }}
        >
          <View style={{ minWidth: 220, gap: 4 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 6,
                backgroundColor: "#eba434",
                gap: 10,
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 14 }}
              >
                TOTAL FINAL:
              </Text>
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 14 }}
              >
                ${formatCurrency(detalleCompra.importeFinal)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                fontSize: 10,
                marginBottom: 2,
              }}
            >
              <Text>Total neto:</Text>
              <Text>${formatCurrency(detalleCompra.total)}</Text>
            </View>
            {detalleCompra.descuento > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: "red",
                  marginBottom: 2,
                }}
              >
                <Text>Bonificación:</Text>
                <Text>- ${formatCurrency(detalleCompra.descuento)}</Text>
              </View>
            )}
            {detalleCompra.iva > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontSize: 10,
                }}
              >
                <Text>IVA ({IvaPorcentaje}%):</Text>
                <Text>${formatCurrency(detalleCompra.iva)}</Text>
              </View>
            )}
            {detalleCompra.saldoPendiente > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: "green",
                  marginBottom: 2,
                }}
              >
                <Text>Saldo pendiente:</Text>
                <Text>${formatCurrency(detalleCompra.saldoPendiente)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* --- OBSERVACIONES AL FINAL --- */}
        {observaciones && observaciones.trim().length > 0 && (
          <View style={styles.observacionesFinales}>
            <Text style={styles.observacionesTitle}>Notas adicionales:</Text>
            <Text style={styles.observacionesText}>{observaciones}</Text>
          </View>
        )}

        {/* TEXTO LEGAL Y CONDICIONES (Recuperados de la versión original) */}
        <View wrap={false} style={styles.condicionesContainer}>
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
            Para realizar la cotización y/o el presupuesto, debe tener sus vanos
            terminados con revoque fino.
          </Text>
          <Text style={{ marginBottom: 4 }}>
            NO NOS HACEMOS CARGO DE VANOS EN FALSA ESCUADRA. Se realizan
            colocaciones en seco, mampostería no realizamos. Se realiza
            colocación a pedido del cliente, el servicio de colocación incluye:
            Materiales, Mano de obra, sellado y garantía del mismo (la garantía
            no contempla rotura del vidrio).
          </Text>
          <Text style={{ marginBottom: 4 }}>
            El costo de la colocación se evalúa al momento de ser visitado en la
            obra por fábrica.
          </Text>
          <Text style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: "bold" }}>FORMA DE PAGO: </Text>
            El trabajo se realiza con un 80% de seña que debe ser abonado en
            nuestra oficina, y el saldo restante al momento de entregar la obra.
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: "#eba434",
              textAlign: "center",
              marginTop: 35,
            }}
          >
            Aberturas Lebaux En Todos Tus Proyectos, Gracias por elegirnos.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default PDF;
