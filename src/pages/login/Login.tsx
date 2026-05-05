import { Button, Image, Input } from "@heroui/react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient"; // Asegúrate de tener tu cliente de supabase aquí
import photo_login from "@/assets/images/fabrica/fabrica_1.webp";
import NavBar from "@/components/login/NavBar";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Estilo unificado para los Inputs (Dark & Gold)
  const styleInput = {
    label: "text-zinc-400 font-medium",
    inputWrapper: [
      "bg-zinc-900/50",
      "border-zinc-800",
      "hover:border-zinc-700",
    ].join(" "),
    input: "text-white placeholder:text-zinc-500",
  };

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    localStorage.setItem("token", JSON.stringify(data));

    if (error) {
      toast.error("Credenciales inválidas", { theme: "dark" });
      setIsLoading(false);
      console.log(error.code);
      console.log(error.message);
    } else {
      navigate("/inicio");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-yellow-500/30">
      {/* Navbar Minimalista */}
      <NavBar />
      <div className="flex-1 flex overflow-hidden">
        {/* SECCIÓN IZQUIERDA: Imagen con Gradiente Técnico */}
        <div className="hidden lg:flex w-1/2 relative">
          <Image
            src={photo_login}
            alt="Fábrica Lebaux"
            className="absolute inset-0 w-full h-full object-cover z-0 grayscale-[0.3]"
            removeWrapper
          />
          <div className="absolute inset-0 bg-linear-to-tr from-black via-black/50 to-transparent z-10" />

          <div className="absolute bottom-12 left-12 z-20 max-w-md">
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tighter">
              Sistema de Gestión <br />
              <span className="text-yellow-500">Aberturas de Aluminio</span>
            </h1>
            <p className="text-zinc-300 text-lg leading-relaxed">
              Optimiza tus presupuestos, cálculos de corte y gestión de obras en
              una sola plataforma.
            </p>
          </div>
        </div>

        {/* SECCIÓN DERECHA: Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#050505]">
          <div className="w-full max-w-[420px] space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Bienvenido
              </h2>
              <p className="text-zinc-500">
                Ingresa tus credenciales para acceder al panel.
              </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={onSubmit}>
              <Input
                label="Email"
                placeholder="usuario@lebaux.com"
                labelPlacement="outside"
                variant="bordered"
                type="email"
                size="lg"
                classNames={styleInput}
                value={formData.email}
                onValueChange={(v: string) =>
                  setFormData({ ...formData, email: v.toLowerCase() })
                }
              />

              <div className="space-y-1">
                <Input
                  label="Contraseña"
                  placeholder="Ingrese su contraseña"
                  labelPlacement="outside"
                  variant="bordered"
                  type="password"
                  size="lg"
                  classNames={styleInput}
                  value={formData.password}
                  onValueChange={(v: string) =>
                    setFormData({ ...formData, password: v })
                  }
                />
                <div className="flex justify-end">
                  <Link
                    to="/password/reset"
                    className="mt-2 text-xs text-zinc-500 hover:text-yellow-500 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <Button
                isLoading={isLoading}
                color="warning"
                type="submit"
                className="w-full h-14 text-lg font-bold bg-yellow-600 text-black shadow-lg shadow-yellow-900/20"
              >
                Iniciar Sesión
              </Button>
            </form>

            <div className="pt-6 border-t border-zinc-900 text-center">
              <p className="text-sm text-zinc-500">
                ¿No tienes acceso?{" "}
                <Link
                  to="/register"
                  className="text-yellow-600 text-medium font-semibold hover:underline decoration-2 underline-offset-4"
                >
                  Registrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Login;
