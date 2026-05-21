const invertirColor = (hex: string, opacity = 0.5) => {
  // 1. Limpiar el hex
  let color = hex.replace("#", "");
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }

  // 2. Extraer los canales originales (R, G, B)
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // 3. Invertir cada canal (255 - valor)
  const rInv = 255 - r;
  const gInv = 255 - g;
  const bInv = 255 - b;

  // 4. Retornar en formato RGBA
  return `rgba(${rInv}, ${gInv}, ${bInv}, ${opacity})`;
};

export default invertirColor;
