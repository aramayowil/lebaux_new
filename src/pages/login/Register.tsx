import { Button, Input, Card, CardBody } from "@heroui/react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import NavBar from "@/components/login/NavBar";
import { BadgeCheck, Eye, EyeClosed, MailCheck } from "lucide-react";

// Importación de validaciones (asumiendo que mantienen la lógica actual)
import validateName from "@/utils/regex/name_lastname";
import validatePassword from "@/utils/regex/passwordRegex";
import validateEmail from "@/utils/regex/emailRegex";

const Register = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [isVisiblePassword2, setIsVisiblePassword2] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    lastName: "",
    password: "",
    password2: "",
  });

  const [error, setError] = useState<{
    status: number;
    message: string;
  } | null>(null);

  // --- VALIDACIONES ---
  const isInvalidName = useMemo(
    () => formData.name !== "" && !validateName(formData.name),
    [formData.name],
  );
  const isInvalidLastName = useMemo(
    () => formData.lastName !== "" && !validateName(formData.lastName),
    [formData.lastName],
  );
  const isInvalidEmail = useMemo(
    () => formData.email !== "" && !validateEmail(formData.email),
    [formData.email],
  );
  const isInvalidPassword = useMemo(
    () => validatePassword(formData.password),
    [formData.password],
  );
  const passwordsMatch = useMemo(
    () => formData.password2 === "" || formData.password === formData.password2,
    [formData.password, formData.password2],
  );

  const isFormValid = useMemo(
    () =>
      validateName(formData.name) &&
      validateName(formData.lastName) &&
      validateEmail(formData.email) &&
      isInvalidPassword.isValid &&
      formData.password === formData.password2 &&
      formData.password2 !== "",
    [formData, isInvalidPassword.isValid],
  );

  // --- ESTILOS TÉCNICOS ---
  const styleInput = {
    label: "text-zinc-300! font-medium text-sm mb-1",
    inputWrapper: "h-14 bg-zinc-900/40 border-zinc-800",
    input: "text-base placeholder:text-zinc-600 text-white",
    errorMessage: "text-xs mt-1 font-medium text-red-500",
  };

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.name,
            last_name: formData.lastName,
          },
        },
      });

      if (signupError) throw signupError;

      setIsSuccess(true);
      toast.success("Enlace de verificación enviado", { theme: "dark" });
    } catch (err: any) {
      const msg = err.message || "Error al intentar registrarse";
      setError({ status: err.status || 500, message: msg });
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-yellow-500/30">
      <NavBar />

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-[440px] w-full">
          {!isSuccess ? (
            <div className="space-y-8 animate-appearance-in">
              <header className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-yellow-600 rounded-full" />
                  <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic">
                    Nueva Cuenta
                  </h2>
                </div>
                <p className="text-zinc-500 text-sm">
                  Crea tu perfil de acceso para la plataforma de Lebaux.
                </p>
              </header>

              <Card
                className="bg-transparent border-none shadow-none"
                radius="none"
              >
                <CardBody className="p-0 flex flex-col gap-6">
                  <form className="flex flex-col gap-5" onSubmit={onSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        isRequired
                        label="Nombre"
                        labelPlacement="outside"
                        placeholder="David"
                        variant="bordered"
                        size="lg"
                        isInvalid={isInvalidName}
                        value={formData.name}
                        onValueChange={(val: string) =>
                          setFormData({ ...formData, name: val })
                        }
                        classNames={styleInput}
                      />
                      <Input
                        isRequired
                        label="Apellido"
                        labelPlacement="outside"
                        placeholder="Aramayo"
                        variant="bordered"
                        size="lg"
                        isInvalid={isInvalidLastName}
                        value={formData.lastName}
                        onValueChange={(val: string) =>
                          setFormData({ ...formData, lastName: val })
                        }
                        classNames={styleInput}
                      />
                    </div>

                    <Input
                      isRequired
                      label="Correo Electronico"
                      labelPlacement="outside"
                      placeholder="usuario@lebaux.com"
                      variant="bordered"
                      type="email"
                      size="lg"
                      isInvalid={isInvalidEmail || error?.status === 409}
                      errorMessage={
                        isInvalidEmail ? "Formato de correo inválido" : ""
                      }
                      value={formData.email}
                      onValueChange={(val: string) =>
                        setFormData({ ...formData, email: val })
                      }
                      classNames={styleInput}
                    />

                    <Input
                      isRequired
                      type={isVisiblePassword ? "text" : "password"}
                      label="Contraseña"
                      labelPlacement="outside"
                      placeholder="Ingresa una contraseña segura "
                      variant="bordered"
                      size="lg"
                      isInvalid={
                        formData.password !== "" && !isInvalidPassword.isValid
                      }
                      errorMessage={() => (
                        <div className="flex flex-col gap-1 mt-1">
                          {isInvalidPassword.errors.map((err, i) => (
                            <span
                              key={i}
                              className="text-zinc-400 text-sm flex items-center gap-1"
                            >
                              <div className="w-1 h-1 bg-zinc-700 rounded-full" />{" "}
                              {err}
                            </span>
                          ))}
                        </div>
                      )}
                      value={formData.password}
                      onValueChange={(val: string) =>
                        setFormData({ ...formData, password: val })
                      }
                      endContent={
                        <button
                          type="button"
                          onClick={() =>
                            setIsVisiblePassword(!isVisiblePassword)
                          }
                          className="focus:outline-none"
                        >
                          {isVisiblePassword ? (
                            <Eye size={18} className="text-zinc-600" />
                          ) : (
                            <EyeClosed size={18} className="text-zinc-600" />
                          )}
                        </button>
                      }
                      classNames={styleInput}
                    />

                    <Input
                      isRequired
                      type={isVisiblePassword2 ? "text" : "password"}
                      label="Confirmar Contraseña"
                      labelPlacement="outside"
                      placeholder="Confirma tu contraseña"
                      variant="bordered"
                      size="lg"
                      isInvalid={!passwordsMatch}
                      errorMessage={
                        !passwordsMatch ? "Las contraseñas no coinciden" : ""
                      }
                      value={formData.password2}
                      onValueChange={(val: string) =>
                        setFormData({ ...formData, password2: val })
                      }
                      endContent={
                        <button
                          type="button"
                          onClick={() =>
                            setIsVisiblePassword2(!isVisiblePassword2)
                          }
                          className="focus:outline-none"
                        >
                          {isVisiblePassword2 ? (
                            <Eye size={18} className="text-zinc-600" />
                          ) : (
                            <EyeClosed size={18} className="text-zinc-600" />
                          )}
                        </button>
                      }
                      classNames={styleInput}
                    />

                    <Button
                      isDisabled={!isFormValid}
                      isLoading={isLoading}
                      type="submit"
                      className="w-full font-bold text-medium h-14 bg-yellow-600 text-black shadow-lg shadow-yellow-900/10 mt-4"
                    >
                      Crear Cuenta
                    </Button>
                  </form>

                  <div className="w-full py-6 text-center border-t border-zinc-900 mt-4">
                    <p className="text-sm text-zinc-500">
                      ¿Ya eres parte del equipo?
                      <Link
                        to="/login"
                        className="text-yellow-600 text-medium font-bold ml-2 hover:underline decoration-2 underline-offset-4"
                      >
                        Inicia sesión
                      </Link>
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : (
            /* VISTA DE ÉXITO */
            <div className="flex flex-col items-center text-center gap-8 py-10 animate-appearance-in">
              <div className="relative">
                <div className="bg-zinc-900/40 p-8 rounded-2xl border border-zinc-800">
                  <MailCheck size={50} className="text-yellow-600" />
                </div>
                <BadgeCheck
                  size={28}
                  className="absolute -top-2 -right-2 text-emerald-500 bg-black rounded-full"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tighter uppercase italic">
                  ¡Casi listo!
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-[300px] mx-auto">
                  Enviamos un enlace de activación a: <br />
                  <span className="text-zinc-100 font-mono text-xs">
                    {formData.email}
                  </span>
                </p>
                <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                  <p className="text-zinc-500 text-xs italic">
                    Revisa tu bandeja de entrada y spam para finalizar el alta.
                  </p>
                </div>
              </div>

              <Button
                onPress={() => navigate("/login")}
                variant="bordered"
                className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 font-bold h-14 w-full"
              >
                Volver al acceso
              </Button>
            </div>
          )}
        </div>
      </main>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
};

export default Register;
