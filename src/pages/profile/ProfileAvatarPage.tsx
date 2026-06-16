import { useState, useEffect } from "react";
import { Avatar, Button, Card, CardBody, Chip } from "@heroui/react";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import clsx from "clsx";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabaseClient";

/* ── Avatar groups ────────────────────────────────────────────────────────── */
const URL_BASE_STORAGE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets`;

const generateAvatars = (
  path: string,
  prefix: string,
  count: number,
  extension: string,
) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    url: `${URL_BASE_STORAGE}/avatars/${path}/${prefix}-${i + 1}.${extension}`,
  }));

const AVATAR_GROUPS = [
  {
    title: "Originales Lebaux",
    avatars: generateAvatars("FormalAvatars", "formal", 11, "webp"),
    featured: true,
  },
  {
    title: "Abstract",
    avatars: generateAvatars("DiceBears", "DB", 6, "svg"),
  },
  {
    title: "GTA V",
    avatars: generateAvatars("GtaV", "gtav", 9, "jpg"),
  },
  {
    title: "Cartoons",
    avatars: generateAvatars("Cartoons", "cartoon", 8, "webp"),
  },
  {
    title: "Dreams World",
    avatars: generateAvatars("DreamsWorld", "DW", 7, "webp"),
  },
  {
    title: "Stranger Things",
    avatars: generateAvatars("StrangerThings", "ST", 9, "webp"),
  },
];

/* ── Component ────────────────────────────────────────────────────────────── */
export default function ProfileAvatarPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: supabaseUser, setSession } = useAuthStore();

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  /* Pre-select the current avatar */
  useEffect(() => {
    const current = supabaseUser?.user_metadata?.avatar_url;
    if (current) setSelectedAvatar(current);
  }, [supabaseUser?.user_metadata?.avatar_url]);

  const handleSave = async () => {
    if (!selectedAvatar) {
      toast.error("Seleccioná un avatar primero");
      return;
    }
    try {
      setIsSaving(true);
      const { data, error } = await supabase.auth.updateUser({
        data: { avatar_url: selectedAvatar },
      });
      if (error) throw error;

      /* Sync the store so the sidebar avatar updates immediately */
      if (data.user) setSession(data.user);

      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Avatar actualizado");
      setTimeout(() => navigate("/perfil", { replace: true }), 400);
    } catch {
      toast.error("Error al actualizar el avatar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 relative">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 shrink-0 transition-all shadow-sm shadow-zinc-900/5">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="flat"
            radius="full"
            size="sm"
            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:scale-105 transition-transform shrink-0"
            onPress={() => navigate("/perfil")}
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">
              Elegí un Personaje
            </h2>
            <p className="hidden sm:block text-zinc-500 dark:text-zinc-400 text-xs font-medium mt-0.5">
              Seleccioná un avatar de nuestras colecciones disponibles
            </p>
          </div>
        </div>

        {/* Botón de Guardar en el Header */}
        <Button
          size="md"
          className="font-black uppercase text-black bg-lebaux-amber hover:bg-lebaux-amber/90 rounded-xl px-6 sm:px-8 text-xs shadow-md shadow-lebaux-amber/20 transition-all shrink-0 ml-4 "
          isLoading={isSaving}
          isDisabled={!selectedAvatar}
          onPress={handleSave}
        >
          Guardar
        </Button>
      </header>

      {/* ── Avatar grid ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pb-10">
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {AVATAR_GROUPS.map((group) => (
            <Card
              key={group.title}
              className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white/50 dark:bg-zinc-900/30 rounded-3xl overflow-hidden"
            >
              <CardBody className="p-6 md:p-8">
                {/* Group label */}
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-100">
                    {group.title}
                  </h3>
                  {group.featured && (
                    <Chip
                      size="sm"
                      color="warning"
                      variant="flat"
                      className="font-bold text-[10px] uppercase h-6 px-1"
                      startContent={<Sparkles size={12} />}
                    >
                      Destacado
                    </Chip>
                  )}
                  <div className="flex-1 h-px bg-gradient-to-r from-zinc-200 dark:from-zinc-800 to-transparent" />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
                  {group.avatars.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.url;
                    return (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatar(avatar.url)}
                        // Se eliminó el fondo (bg) en el hover para no generar cuadrados detrás del círculo
                        className="relative group outline-none flex items-center justify-center p-2 transition-all duration-300"
                      >
                        <div
                          className={clsx(
                            "relative rounded-full transition-all duration-300 ease-out",
                            isSelected
                              ? "scale-110 shadow-xl shadow-amber-500/30 ring-4 ring-lebaux-amber ring-offset-4 ring-offset-white dark:ring-offset-zinc-900 opacity-100"
                              : // Aumentamos la opacidad base (opacity-95) y le dimos más "pop" al hover (scale-110, elevación y sombra)
                                "opacity-95 group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-zinc-500/20 dark:group-hover:shadow-black/40",
                          )}
                        >
                          <Avatar
                            src={avatar.url}
                            className="w-16 h-16 sm:w-20 sm:h-20"
                            radius="full"
                            isBordered={false}
                          />

                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full z-20 animate-in zoom-in-75 duration-300 shadow-sm">
                              <CheckCircle2
                                size={22}
                                className="text-lebaux-amber"
                                strokeWidth={3}
                              />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
