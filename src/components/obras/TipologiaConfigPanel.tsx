import { Select, SelectItem, Input, Divider, Button } from "@heroui/react";
import { Box, Grid2X2, Palette, Plus, Proportions, Trash2 } from "lucide-react";
import { useProductosStore } from "@/store/productosStore";
import { useCatalogosStore } from "@/store/catalogosStore";
import { useObrasStore, type TipologiaConfig } from "@/store/obrasStore";
import clsx from "clsx";

const TW = {
  trigger:
    "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
};
const IW = {
  inputWrapper:
    "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
};

interface Props {
  idTipologia: number;
  ancho: number;
  alto: number;
}

export default function TipologiaConfigPanel({
  idTipologia,
  ancho,
  alto,
}: Props) {
  const { getConfig, patchConfig, patchModulo, getModulo } = useObrasStore();
  const {
    interiores,
    contravidrios,
    contravidriosExt,
    vidRepartidos,
    getDespieceVRByVR,
  } = useProductosStore();
  const { tratamientos, vidrios, tiposInterior } = useCatalogosStore();

  const cfg = getConfig(idTipologia);
  const upd = (data: Partial<TipologiaConfig>) =>
    patchConfig(idTipologia, data);

  const interioresDeHoja = interiores.filter((i) => i.idHoja === cfg.idHoja);
  const cvDeInterior = contravidrios.filter(
    (c) => c.idInterior === cfg.idInterior,
  );
  const cveDeInterior = contravidriosExt.filter(
    (c) => c.idInterior === cfg.idInterior,
  );
  const vrDeInterior = vidRepartidos.filter(
    (v) => v.idInterior === cfg.idInterior,
  );
  const tratamiento = tratamientos.find((t) => t.id === cfg.idTratamiento);

  // Posiciones de cruces variables
  const posH = cfg.posH ?? [];
  const posV = cfg.posV ?? [];

  // Paños resultantes de cruces variables
  function segmentos(total: number, pos: number[]) {
    const sorted = [...pos].sort((a, b) => a - b);
    const pts = [0, ...sorted, total];
    return pts.slice(1).map((v, i) => v - pts[i]!);
  }

  const filasAltos = posH.length > 0 ? segmentos(alto, posH) : [alto];
  const colsAnchos = posV.length > 0 ? segmentos(ancho, posV) : [ancho];
  const nFilas = filasAltos.length;
  const nCols = colsAnchos.length;
  const tieneModulos =
    cfg.tipoCruce === 2 && (posH.length > 0 || posV.length > 0);

  function addPosH() {
    const sugerido =
      posH.length === 0
        ? Math.round(alto / 2)
        : Math.min(
            posH[posH.length - 1]! + Math.round(alto / (posH.length + 2)),
            alto - 50,
          );
    const next = [...posH, sugerido].sort((a, b) => a - b);
    upd({ posH: next, crucesH: next.length });
  }
  function addPosV() {
    const sugerido =
      posV.length === 0
        ? Math.round(ancho / 2)
        : Math.min(
            posV[posV.length - 1]! + Math.round(ancho / (posV.length + 2)),
            ancho - 50,
          );
    const next = [...posV, sugerido].sort((a, b) => a - b);
    upd({ posV: next, crucesV: next.length });
  }
  function setPosH(i: number, val: number) {
    const next = [...posH];
    next[i] = val;
    upd({ posH: next, crucesH: next.length });
  }
  function setPosV(i: number, val: number) {
    const next = [...posV];
    next[i] = val;
    upd({ posV: next, crucesV: next.length });
  }
  function delPosH(i: number) {
    const next = posH.filter((_, idx) => idx !== i);
    upd({
      posH: next,
      crucesH: next.length,
      tipoCruce: next.length + posV.length > 0 ? 2 : 0,
    });
  }
  function delPosV(i: number) {
    const next = posV.filter((_, idx) => idx !== i);
    upd({
      posV: next,
      crucesV: next.length,
      tipoCruce: posH.length + next.length > 0 ? 2 : 0,
    });
  }

  return (
    <div className="space-y-4 py-1">
      {/* ── ACABADO ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-400 mb-2">
          <Palette className="w-4.5 h-4.5" />
          <p className="font-sans uppercase tracking-widest text-xs font-bold text-zinc-500 dark:text-zinc-400">
            Acabado del Perfil
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tratamiento && (
            <div
              className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-600 shrink-0"
              style={{ background: tratamiento.color }}
            />
          )}
          <Select
            label="Tratamiento"
            size="sm"
            selectedKeys={[String(cfg.idTratamiento)]}
            onSelectionChange={(k: any) =>
              upd({ idTratamiento: parseInt([...k][0] as string) || 1 })
            }
            classNames={TW}
          >
            {tratamientos.map((t) => (
              <SelectItem key={String(t.id)} textValue={t.descripcion}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-zinc-200 shrink-0"
                    style={{ background: t.color }}
                  />
                  {t.descripcion}
                </div>
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <Divider />

      {/* ── VIDRIO Y REVESTIMIENTOS ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-400 mb-2">
          <Box className="w-4.5 h-4.5" />
          <p className="font-sans uppercase tracking-widest text-xs font-bold text-zinc-500 dark:text-zinc-400">
            Vidrio y Rellenos
          </p>
        </div>

        {/* Sin cruces: configuración global */}
        {cfg.tipoCruce === 0 && (
          <div className="space-y-3">
            {/* Separar vidrios por tipo para mostrar agrupados */}
            {(() => {
              const vidrosCrudos = vidrios.filter((v) => {
                const t = tiposInterior.find((x) => x.id === v.tipoRev);
                return !t || t.descripcion.toLowerCase().includes("vidrio");
              });
              const revestimientos = vidrios.filter((v) => {
                const t = tiposInterior.find((x) => x.id === v.tipoRev);
                return (
                  t &&
                  !t.descripcion.toLowerCase().includes("vidrio") &&
                  !t.descripcion.toLowerCase().includes("mosquit")
                );
              });
              const telas = vidrios.filter((v) => {
                const t = tiposInterior.find((x) => x.id === v.tipoRev);
                return t && t.descripcion.toLowerCase().includes("mosquit");
              });

              return (
                <>
                  {/* Vidrio principal */}
                  <Select
                    label="Vidrio / material de relleno"
                    placeholder="Sin asignar"
                    size="sm"
                    selectedKeys={cfg.idVidrio ? [cfg.idVidrio] : []}
                    onSelectionChange={(k: any) =>
                      upd({ idVidrio: ([...k][0] as string) || null })
                    }
                    classNames={TW}
                  >
                    {vidrosCrudos.length > 0 && (
                      <SelectItem key="__grp_vidrios" isReadOnly textValue="">
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                          Vidrios
                        </span>
                      </SelectItem>
                    )}
                    {vidrosCrudos.map((v) => (
                      <SelectItem key={v.codigo} textValue={v.descri}>
                        <span>{v.descri}</span>
                        <span className="text-xs text-zinc-400 ml-2">
                          {v.espesor}mm
                        </span>
                      </SelectItem>
                    ))}
                    {revestimientos.length > 0 && (
                      <SelectItem key="__grp_rev" isReadOnly textValue="">
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                          Revestimientos
                        </span>
                      </SelectItem>
                    )}
                    {revestimientos.map((v) => {
                      const tipo = tiposInterior.find(
                        (t) => t.id === v.tipoRev,
                      );
                      return (
                        <SelectItem key={v.codigo} textValue={v.descri}>
                          <span>{v.descri}</span>
                          <span className="text-xs text-zinc-400 ml-2">
                            {tipo?.descripcion ?? ""}
                          </span>
                        </SelectItem>
                      );
                    })}
                    {telas.length > 0 && (
                      <SelectItem key="__grp_tela" isReadOnly textValue="">
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                          Telas / Mosquitero
                        </span>
                      </SelectItem>
                    )}
                    {telas.map((v) => (
                      <SelectItem key={v.codigo} textValue={v.descri}>
                        <span>{v.descri}</span>
                      </SelectItem>
                    ))}
                  </Select>

                  {/* Revestimiento interior (vidrio secundario por tipo) */}
                  {revestimientos.length > 0 && (
                    <Select
                      label="Revestimiento interior"
                      placeholder="Sin revestimiento"
                      size="sm"
                      selectedKeys={
                        cfg.idRevestimiento ? [cfg.idRevestimiento] : []
                      }
                      onSelectionChange={(k: any) =>
                        upd({ idRevestimiento: ([...k][0] as string) || null })
                      }
                      classNames={TW}
                    >
                      <SelectItem key="" textValue="Sin revestimiento">
                        <span className="text-zinc-400 italic text-xs">
                          Sin revestimiento
                        </span>
                      </SelectItem>
                      {revestimientos.map((v) => {
                        const tipo = tiposInterior.find(
                          (t) => t.id === v.tipoRev,
                        );
                        return (
                          <SelectItem key={v.codigo} textValue={v.descri}>
                            <span>{v.descri}</span>
                            <span className="text-xs text-zinc-400 ml-2">
                              {tipo?.descripcion ?? ""}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </Select>
                  )}
                </>
              );
            })()}

            {/* Contravidrio interior */}
            {cfg.idInterior && cvDeInterior.length > 0 && (
              <Select
                label="Contravidrio interior"
                placeholder="Sin asignar"
                size="sm"
                selectedKeys={
                  cfg.idContravidrio ? [String(cfg.idContravidrio)] : []
                }
                onSelectionChange={(k: any) =>
                  upd({ idContravidrio: parseInt([...k][0] as string) || null })
                }
                classNames={TW}
              >
                {cvDeInterior.map((cv) => (
                  <SelectItem key={String(cv.id)} textValue={cv.descripcion}>
                    {cv.descripcion}
                    {cv.predeterminado && (
                      <span className="text-xs text-zinc-400 ml-1">
                        (pred.)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </Select>
            )}

            {/* Contravidrio exterior */}
            {cfg.idInterior && cveDeInterior.length > 0 && (
              <Select
                label="Contravidrio exterior"
                placeholder="Sin asignar"
                size="sm"
                selectedKeys={
                  cfg.idContravidrioExt ? [String(cfg.idContravidrioExt)] : []
                }
                onSelectionChange={(k: any) =>
                  upd({
                    idContravidrioExt: parseInt([...k][0] as string) || null,
                  })
                }
                classNames={TW}
              >
                {cveDeInterior.map((cv) => (
                  <SelectItem key={String(cv.id)} textValue={cv.descripcion}>
                    {cv.descripcion}
                    {cv.predeterminado && (
                      <span className="text-xs text-zinc-400 ml-1">
                        (pred.)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </Select>
            )}

            {/* Vidrio repartido — las fórmulas están en DespieceVR (tabla separada) */}
            {cfg.idInterior && vrDeInterior.length > 0 && (
              <Select
                label="Vidrio repartido"
                placeholder="Sin vidrio repartido"
                size="sm"
                selectedKeys={
                  cfg.idVidRepartido ? [String(cfg.idVidRepartido)] : []
                }
                onSelectionChange={(k: any) =>
                  upd({ idVidRepartido: parseInt([...k][0] as string) || null })
                }
                classNames={TW}
              >
                {vrDeInterior.map((vr) => {
                  const despVR = getDespieceVRByVR(vr.id);
                  return (
                    <SelectItem key={String(vr.id)} textValue={vr.descripcion}>
                      <div className="flex flex-col">
                        <span>{vr.descripcion}</span>
                        {despVR && (
                          <span className="text-xs text-zinc-400">
                            {despVR.formulaAnchoInterior} ×{" "}
                            {despVR.formulaAltoInterior}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </Select>
            )}
          </div>
        )}

        {/* Con cruces: aviso de configuración por módulo */}
        {cfg.tipoCruce > 0 && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg px-3 py-2 leading-relaxed">
            El vidrio y revestimiento se configura por paño ↓ en la grilla de la
            sección Cruces.
          </p>
        )}
      </div>

      <Divider />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-400 mb-2">
          <Proportions className="w-4.5 h-4.5" />
          <p className="font-sans uppercase tracking-widest text-xs font-bold text-zinc-500 dark:text-zinc-400">
            Opciones
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant={cfg.conPremarco ? "solid" : "flat"}
            color={cfg.conPremarco ? "primary" : "default"}
            onPress={() => upd({ conPremarco: !cfg.conPremarco })}
            className="text-[10px] h-8"
          >
            {cfg.conPremarco ? "Con Premarco" : "Sin Premarco"}
          </Button>
          <Button
            size="sm"
            variant={cfg.conTapajuntas ? "solid" : "flat"}
            color={cfg.conTapajuntas ? "primary" : "default"}
            onPress={() => upd({ conTapajuntas: !cfg.conTapajuntas })}
            className="text-[10px] h-8"
          >
            {cfg.conTapajuntas ? "Con Tapajuntas" : "Sin Tapajuntas"}
          </Button>
        </div>
      </div>

      <Divider />

      {/* ── CRUCES ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-400 mb-2">
          <Grid2X2 className="w-4.5 h-4.5" />
          <p className="font-sans uppercase tracking-widest text-xs font-bold text-zinc-500 dark:text-zinc-400">
            Cruces y Divisiones
          </p>
        </div>
        <Select
          label="Tipo de cruces"
          size="sm"
          selectedKeys={[String(cfg.tipoCruce)]}
          onSelectionChange={(k: any) => {
            const tipo = parseInt([...k][0] as string) as 0 | 1 | 2;
            if (tipo === 0)
              upd({
                tipoCruce: 0,
                crucesH: 0,
                crucesV: 0,
                posH: [],
                posV: [],
                modulosConfig: [],
              });
            else if (tipo === 1)
              upd({ tipoCruce: 1, posH: [], posV: [], modulosConfig: [] });
            else upd({ tipoCruce: 2, crucesH: 0, crucesV: 0 });
          }}
          classNames={TW}
        >
          <SelectItem key="0">Sin cruces</SelectItem>
          <SelectItem key="1">Centrados (equidistantes)</SelectItem>
          <SelectItem key="2">Posición variable (mm)</SelectItem>
        </Select>

        {/* ── Centrados ── */}
        {cfg.tipoCruce === 1 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Horiz. (crucesH)"
                type="number"
                min={0}
                max={10}
                value={String(cfg.crucesH)}
                onValueChange={(v: any) => upd({ crucesH: parseInt(v) || 0 })}
                size="sm"
                description="Variable 'crucesH'"
                classNames={IW}
              />
              <Input
                label="Vert. (crucesV)"
                type="number"
                min={0}
                max={10}
                value={String(cfg.crucesV)}
                onValueChange={(v: any) => upd({ crucesV: parseInt(v) || 0 })}
                size="sm"
                description="Variable 'crucesV'"
                classNames={IW}
              />
            </div>

            {/* Grilla de paños — centrados */}
            {(cfg.crucesH > 0 || cfg.crucesV > 0) && cfg.idHoja && (
              <GrillaModulos
                nFilas={cfg.crucesH + 1}
                nCols={cfg.crucesV + 1}
                filasAltos={Array.from({ length: cfg.crucesH + 1 }, () =>
                  Math.round(alto / (cfg.crucesH + 1)),
                )}
                colsAnchos={Array.from({ length: cfg.crucesV + 1 }, () =>
                  Math.round(ancho / (cfg.crucesV + 1)),
                )}
                idTipologia={idTipologia}
                interioresDeHoja={interioresDeHoja}
                interiorDefault={cfg.idInterior}
                vidrios={vidrios}
                tiposInterior={tiposInterior}
                vidrioDefault={cfg.idVidrio}
                cvInteriores={cvDeInterior}
                cvExteriores={cveDeInterior}
                cvIntDefault={cfg.idContravidrio}
                cvExtDefault={cfg.idContravidrioExt}
                getModulo={getModulo}
                patchModulo={patchModulo}
              />
            )}
          </div>
        )}

        {/* ── Variables ── */}
        {cfg.tipoCruce === 2 && (
          <div className="space-y-3">
            {/* Horizontales */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  Horizontales ({posH.length})
                  <span className="font-normal text-zinc-400 ml-1 text-[10px]">
                    desde abajo
                  </span>
                </p>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Plus className="w-3 h-3" />}
                  onPress={addPosH}
                  isDisabled={posH.length >= 5}
                  className="h-6 text-[10px] px-2"
                >
                  Agregar
                </Button>
              </div>
              {posH.length === 0 && (
                <p className="text-[10px] text-zinc-400 italic">
                  Sin cruces horizontales
                </p>
              )}
              {posH.map((pos, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 w-4 text-right">
                    {i + 1}.
                  </span>
                  <Input
                    size="sm"
                    type="number"
                    min={1}
                    max={alto - 1}
                    value={String(pos)}
                    onValueChange={(v: any) => setPosH(i, parseInt(v) || 0)}
                    endContent={
                      <span className="text-[10px] text-zinc-400">mm</span>
                    }
                    classNames={{
                      base: "flex-1",
                      inputWrapper:
                        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 h-8",
                    }}
                  />
                  <span className="text-[10px] text-zinc-400 w-9">
                    ({((pos / alto) * 100).toFixed(0)}%)
                  </span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => delPosH(i)}
                    className="h-8 w-8 min-w-8"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Verticales */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  Verticales ({posV.length})
                  <span className="font-normal text-zinc-400 ml-1 text-[10px]">
                    desde izquierda
                  </span>
                </p>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Plus className="w-3 h-3" />}
                  onPress={addPosV}
                  isDisabled={posV.length >= 5}
                  className="h-6 text-[10px] px-2"
                >
                  Agregar
                </Button>
              </div>
              {posV.length === 0 && (
                <p className="text-[10px] text-zinc-400 italic">
                  Sin cruces verticales
                </p>
              )}
              {posV.map((pos, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 w-4 text-right">
                    {i + 1}.
                  </span>
                  <Input
                    size="sm"
                    type="number"
                    min={1}
                    max={ancho - 1}
                    value={String(pos)}
                    onValueChange={(v: any) => setPosV(i, parseInt(v) || 0)}
                    endContent={
                      <span className="text-[10px] text-zinc-400">mm</span>
                    }
                    classNames={{
                      base: "flex-1",
                      inputWrapper:
                        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 h-8",
                    }}
                  />
                  <span className="text-[10px] text-zinc-400 w-9">
                    ({((pos / ancho) * 100).toFixed(0)}%)
                  </span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => delPosV(i)}
                    className="h-8 w-8 min-w-8"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Grilla de paños — variables */}
            {tieneModulos && cfg.idHoja && (
              <GrillaModulos
                nFilas={nFilas}
                nCols={nCols}
                filasAltos={filasAltos}
                colsAnchos={colsAnchos}
                idTipologia={idTipologia}
                interioresDeHoja={interioresDeHoja}
                interiorDefault={cfg.idInterior}
                vidrios={vidrios}
                tiposInterior={tiposInterior}
                vidrioDefault={cfg.idVidrio}
                cvInteriores={cvDeInterior}
                cvExteriores={cveDeInterior}
                cvIntDefault={cfg.idContravidrio}
                cvExtDefault={cfg.idContravidrioExt}
                getModulo={getModulo}
                patchModulo={patchModulo}
              />
            )}
          </div>
        )}
      </div>

      {/* ── NOTAS ── */}
      <Input
        label="Notas"
        value={cfg.notas}
        onValueChange={(v: string) => upd({ notas: v })}
        size="sm"
        placeholder="Observaciones..."
        classNames={IW}
      />
    </div>
  );
}

// ── GrillaModulos — grilla unificada de paños con interior + vidrio por celda ─

interface Vidrio2 {
  codigo: string;
  descri: string;
  espesor: number;
  tipoRev: number;
}
interface CV2 {
  id: number;
  descripcion: string;
  predeterminado: boolean;
}
interface TipoInt2 {
  id: number;
  descripcion: string;
}

function GrillaModulos({
  nFilas,
  nCols,
  filasAltos,
  colsAnchos,
  idTipologia,
  interioresDeHoja,
  interiorDefault,
  vidrios,
  tiposInterior,
  vidrioDefault,
  cvInteriores,
  cvExteriores,
  cvIntDefault,
  cvExtDefault,
  getModulo,
  patchModulo,
}: {
  nFilas: number;
  nCols: number;
  filasAltos: number[];
  colsAnchos: number[];
  idTipologia: number;
  interioresDeHoja: { id: number; descripcion: string }[];
  interiorDefault: number | null;
  vidrios: Vidrio2[];
  tiposInterior: TipoInt2[];
  vidrioDefault: string | null;
  cvInteriores: CV2[];
  cvExteriores: CV2[];
  cvIntDefault: number | null;
  cvExtDefault: number | null;
  getModulo: (id: number, f: number, c: number) => any;
  patchModulo: (id: number, f: number, c: number, data: any) => void;
}) {
  const soloUnInterior = interioresDeHoja.length <= 1;
  const tieneCV = cvInteriores.length > 0;
  const tieneCVE = cvExteriores.length > 0;

  // Separar vidrios por tipo para los selectores de celda
  const vidrosCrudos = vidrios.filter((v) => {
    const t = tiposInterior.find((x) => x.id === v.tipoRev);
    return !t || t.descripcion.toLowerCase().includes("vidrio");
  });
  const revestimientos = vidrios.filter((v) => {
    const t = tiposInterior.find((x) => x.id === v.tipoRev);
    return (
      t &&
      !t.descripcion.toLowerCase().includes("vidrio") &&
      !t.descripcion.toLowerCase().includes("mosquit")
    );
  });

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
          Vidrio y revestimiento por paño
          <span className="font-normal ml-1 text-zinc-400">
            — {nFilas} fila{nFilas !== 1 ? "s" : ""} × {nCols} col
            {nCols !== 1 ? "umnas" : "umna"}
          </span>
        </p>
        <button
          className="text-[10px] text-zinc-400 hover:text-zinc-600 underline"
          onClick={() => {
            for (let f = 0; f < nFilas; f++)
              for (let c = 0; c < nCols; c++)
                patchModulo(idTipologia, f, c, {
                  idInterior: interiorDefault,
                  idVidrio: vidrioDefault,
                  idContravidrio: cvIntDefault,
                  idContravidrioExt: cvExtDefault,
                });
          }}
        >
          Aplicar globales a todos
        </button>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
        {Array.from({ length: nFilas }, (_, displayRow) => {
          const fila = nFilas - 1 - displayRow;
          return (
            <div
              key={fila}
              className={clsx(
                "flex divide-x divide-zinc-200 dark:divide-zinc-700",
                displayRow > 0 &&
                  "border-t border-zinc-200 dark:border-zinc-700",
              )}
            >
              {/* Etiqueta de fila */}
              <div className="w-11 shrink-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 px-1 py-2 gap-0.5">
                <span className="text-[9px] text-zinc-400 font-mono leading-none">
                  {Math.round(filasAltos[fila]!)}mm
                </span>
                {nFilas > 1 && (
                  <span className="text-[8px] text-zinc-300 dark:text-zinc-600 leading-none mt-0.5">
                    F{fila + 1}
                  </span>
                )}
              </div>

              {/* Celdas */}
              {Array.from({ length: nCols }, (_, col) => {
                const mod = getModulo(idTipologia, fila, col);
                const diffInterior =
                  mod.idInterior && mod.idInterior !== interiorDefault;
                const diffVidrio =
                  mod.idVidrio && mod.idVidrio !== vidrioDefault;
                const diffCV =
                  mod.idContravidrio && mod.idContravidrio !== cvIntDefault;
                const diffCVE =
                  mod.idContravidrioExt &&
                  mod.idContravidrioExt !== cvExtDefault;
                const hasDiff = diffInterior || diffVidrio || diffCV || diffCVE;

                return (
                  <div
                    key={col}
                    className={clsx(
                      "flex-1 min-w-0 p-1.5 space-y-1",
                      hasDiff && "bg-amber-50/50 dark:bg-amber-900/10",
                    )}
                  >
                    {/* Header de celda */}
                    {(nFilas > 1 || nCols > 1) && (
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-zinc-400 font-mono">
                          {nCols > 1 ? `C${col + 1}` : ""}
                          {nCols > 1 && nFilas > 1 ? "·" : ""}
                          {nFilas > 1 ? `F${fila + 1}` : ""}
                        </span>
                        <span className="text-[9px] text-zinc-300 dark:text-zinc-600 font-mono">
                          {Math.round(colsAnchos[col]!)}mm
                        </span>
                      </div>
                    )}

                    {/* Interior */}
                    {!soloUnInterior && interioresDeHoja.length > 0 && (
                      <Select
                        size="sm"
                        placeholder="= interior global"
                        selectedKeys={
                          mod.idInterior ? [String(mod.idInterior)] : []
                        }
                        onSelectionChange={(k: any) => {
                          const id = parseInt([...k][0] as string) || null;
                          patchModulo(idTipologia, fila, col, {
                            idInterior: id,
                          });
                        }}
                        classNames={{
                          trigger: clsx(
                            "h-7 min-h-unit-7 text-[10px] border",
                            diffInterior
                              ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
                              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
                          ),
                        }}
                      >
                        <SelectItem key="" textValue="= interior global">
                          <span className="text-zinc-400 italic text-[10px]">
                            = interior global
                          </span>
                        </SelectItem>
                        {interioresDeHoja.map((i) => (
                          <SelectItem
                            key={String(i.id)}
                            textValue={i.descripcion}
                          >
                            {i.descripcion}
                            {i.id === interiorDefault && (
                              <span className="text-[9px] text-zinc-400 ml-1">
                                (pred.)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </Select>
                    )}

                    {/* Vidrio */}
                    <Select
                      size="sm"
                      placeholder="= vidrio global"
                      selectedKeys={mod.idVidrio ? [mod.idVidrio] : []}
                      onSelectionChange={(k: any) => {
                        const val = ([...k][0] as string) || null;
                        patchModulo(idTipologia, fila, col, { idVidrio: val });
                      }}
                      classNames={{
                        trigger: clsx(
                          "h-7 min-h-unit-7 text-[10px] border",
                          diffVidrio
                            ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
                        ),
                      }}
                    >
                      <SelectItem key="" textValue="= vidrio global">
                        <span className="text-zinc-400 italic text-[10px]">
                          = vidrio global
                        </span>
                      </SelectItem>
                      {vidrosCrudos.map((v) => (
                        <SelectItem key={v.codigo} textValue={v.descri}>
                          <span className="text-[10px]">{v.descri}</span>
                          <span className="text-[9px] text-zinc-400 ml-1">
                            {v.espesor}mm
                          </span>
                        </SelectItem>
                      ))}
                    </Select>

                    {/* Revestimiento por paño */}
                    {revestimientos.length > 0 && (
                      <Select
                        size="sm"
                        placeholder="Sin revestimiento"
                        selectedKeys={
                          mod.idRevestimiento ? [mod.idRevestimiento] : []
                        }
                        onSelectionChange={(k: any) => {
                          const val = ([...k][0] as string) || null;
                          patchModulo(idTipologia, fila, col, {
                            idRevestimiento: val,
                          });
                        }}
                        classNames={{
                          trigger:
                            "h-7 min-h-unit-7 text-[10px] border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
                        }}
                      >
                        <SelectItem key="" textValue="Sin revestimiento">
                          <span className="text-zinc-400 italic text-[10px]">
                            Sin revestimiento
                          </span>
                        </SelectItem>
                        {revestimientos.map((v) => {
                          const tipo = tiposInterior.find(
                            (t) => t.id === v.tipoRev,
                          );
                          return (
                            <SelectItem key={v.codigo} textValue={v.descri}>
                              <span className="text-[10px]">{v.descri}</span>
                              <span className="text-[9px] text-zinc-400 ml-1">
                                {tipo?.descripcion ?? ""}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </Select>
                    )}

                    {/* CV Interior */}
                    {tieneCV && (
                      <Select
                        size="sm"
                        placeholder="= CV global"
                        selectedKeys={
                          mod.idContravidrio ? [String(mod.idContravidrio)] : []
                        }
                        onSelectionChange={(k: any) => {
                          const id = parseInt([...k][0] as string) || null;
                          patchModulo(idTipologia, fila, col, {
                            idContravidrio: id,
                          });
                        }}
                        classNames={{
                          trigger: clsx(
                            "h-7 min-h-unit-7 text-[10px] border",
                            diffCV
                              ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
                              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
                          ),
                        }}
                      >
                        <SelectItem key="" textValue="= CV global">
                          <span className="text-zinc-400 italic text-[10px]">
                            = CV Int. global
                          </span>
                        </SelectItem>
                        {cvInteriores.map((cv) => (
                          <SelectItem
                            key={String(cv.id)}
                            textValue={cv.descripcion}
                          >
                            <span className="text-[10px]">
                              {cv.descripcion}
                            </span>
                            {cv.predeterminado && (
                              <span className="text-[9px] text-zinc-400 ml-1">
                                (pred.)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </Select>
                    )}

                    {/* CV Exterior */}
                    {tieneCVE && (
                      <Select
                        size="sm"
                        placeholder="= CVE global"
                        selectedKeys={
                          mod.idContravidrioExt
                            ? [String(mod.idContravidrioExt)]
                            : []
                        }
                        onSelectionChange={(k: any) => {
                          const id = parseInt([...k][0] as string) || null;
                          patchModulo(idTipologia, fila, col, {
                            idContravidrioExt: id,
                          });
                        }}
                        classNames={{
                          trigger: clsx(
                            "h-7 min-h-unit-7 text-[10px] border",
                            diffCVE
                              ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
                              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
                          ),
                        }}
                      >
                        <SelectItem key="" textValue="= CVE global">
                          <span className="text-zinc-400 italic text-[10px]">
                            = CV Ext. global
                          </span>
                        </SelectItem>
                        {cvExteriores.map((cv) => (
                          <SelectItem
                            key={String(cv.id)}
                            textValue={cv.descripcion}
                          >
                            <span className="text-[10px]">
                              {cv.descripcion}
                            </span>
                            {cv.predeterminado && (
                              <span className="text-[9px] text-zinc-400 ml-1">
                                (pred.)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Footer anchos */}
        <div className="flex divide-x divide-zinc-200 dark:divide-zinc-700 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40">
          <div className="w-11 shrink-0" />
          {colsAnchos.map((w, col) => (
            <div key={col} className="flex-1 text-center py-1">
              <span className="text-[9px] text-zinc-400 font-mono">
                {Math.round(w)}mm
              </span>
            </div>
          ))}
        </div>
      </div>

      {soloUnInterior && interioresDeHoja.length > 0 && (
        <p className="text-[10px] text-zinc-400 italic">
          Interior: todos los paños usarán «{interioresDeHoja[0]?.descripcion}».
          Agregá más interiores en Productos para poder diferenciarlos.
        </p>
      )}
    </div>
  );
}
