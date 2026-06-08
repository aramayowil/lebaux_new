export const intToHexBGR = (colorNumber: number): string => {
  const r = colorNumber & 0xff;
  const g = (colorNumber >> 8) & 0xff;
  const b = (colorNumber >> 16) & 0xff;

  const toHex = (val: number) => val.toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
