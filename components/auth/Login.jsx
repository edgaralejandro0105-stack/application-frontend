import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { authService } from "@/lib/services/auth.service";
import { useAuth } from "@/context/AuthContext";

/**
 * Esquema de validación usando Zod.
 * Zod nos permite definir la forma exacta que deben tener nuestros datos.
 * Aquí aseguramos que el email tenga un formato válido y que la contraseña no esté vacía.
 * Si las reglas no se cumplen, los mensajes de error personalizados se mostrarán automáticamente.
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Formato de correo electrónico inválido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
});

/**
 * Componente Login (Enterprise UI/UX)
 * 
 * Este componente implementa un diseño de pantalla dividida (Split Screen) e integra:
 * - react-hook-form: Para manejar el estado de los inputs eficientemente.
 * - zodResolver: Para conectar nuestro esquema de Zod con react-hook-form.
 * - Tailwind CSS: Para el diseño responsive y los estados interactivos.
 */
export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Estado local para alternar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);
  // Estado para capturar errores que devuelve la API (ej. credenciales inválidas)
  const [apiError, setApiError] = useState(null);

  /**
   * Inicializamos react-hook-form.
   * register: Función para conectar cada input HTML con el estado del formulario.
   * handleSubmit: Función que procesa el formulario solo si pasa las validaciones.
   * formState: Contiene los errores de validación y si se está cargando (isSubmitting).
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Efecto que redirige al usuario al inicio (/) si ya tiene una sesión activa
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * Función que se ejecuta cuando el formulario es válido y se envía.
   * @param {Object} data - Los datos extraídos del formulario.
   */
  const onSubmit = async (data) => {
    // Limpiamos cualquier error previo antes de hacer la petición
    setApiError(null);
    try {
      // Llamada al backend para autenticar
      const response = await authService.login(data);

      // Si la API retorna un error (ej. credenciales incorrectas)
      if (response.error || !response.data) {
        setApiError(response.error ?? "Credenciales inválidas. Intenta nuevamente.");
        return;
      }

      // Extraemos el token y los datos del usuario
      const authResponse = response.data;
      if (!authResponse.token || !authResponse.user) {
        setApiError("Hubo un problema al iniciar sesión.");
        return;
      }

      // Guardamos la sesión en el Contexto Global
      login(authResponse.token, authResponse.user);

      // Redirigimos al panel principal
      navigate("/");
    } catch (error) {
      // Capturamos fallos de red o caídas del servidor
      setApiError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* 
        Panel Izquierdo - Decorativo (Split Screen) 
        Este panel se oculta en móviles (hidden) y se muestra a partir de pantallas grandes (lg:flex).
      */}
      <div className="relative hidden w-1/2 flex-col justify-end overflow-hidden bg-zinc-900 lg:flex">
        {/* Imagen de fondo solicitada */}
        <div className="absolute inset-0">
          <img
            src="/image1.png"
            alt="La Casona Eventos"
            className="h-full w-full object-cover opacity-80"
          />
        </div>

        {/* Gradiente oscuro inferior para asegurar que el texto sea legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Logo centrado sobre la imagen */}
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <img src="/logo.png" alt="La Casona Logo" className="h-72 w-auto object-contain drop-shadow-2xl" />
        </div>
      </div>

      {/* 
        Panel Derecho - Formulario
        Ocupa todo el ancho en móviles, y la mitad en pantallas grandes.
      */}
      <div className="flex w-full items-center justify-center lg:w-1/2 p-4 sm:p-8 md:p-12">
        <div className="mx-auto w-full max-w-md space-y-8">

          {/* Encabezado del Formulario */}
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Bienvenido de nuevo
            </h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder al panel.
            </p>
          </div>

          {/* Alerta de Error de API: Solo se muestra si apiError tiene un valor */}
          {apiError && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{apiError}</p>
            </div>
          )}

          {/* Formulario conectado a handleSubmit de react-hook-form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">

            {/* Campo: Correo Electrónico */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none text-foreground">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="off"
                placeholder="nombre@ejemplo.com"
                /* Si hay error en 'email', cambiamos el borde a rojo, de lo contrario usamos el normal */
                className={`flex h-12 w-full rounded-xl border bg-transparent px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-input"
                  }`}
                {...register("email")} /* Conectamos el input con react-hook-form */
              />
              {/* Mostramos el mensaje de error de Zod si existe */}
              {errors.email && (
                <p className="text-xs font-medium text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo: Contraseña */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium leading-none text-foreground">
                  Contraseña
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary hover:text-primary/80 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  /* Alternamos dinámicamente entre 'text' y 'password' */
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  /* pr-12 para dejar espacio al ícono del ojo a la derecha */
                  className={`flex h-12 w-full rounded-xl border bg-transparent px-4 py-2 pr-12 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-input"
                    }`}
                  {...register("password")}
                />

                {/* Botón para alternar visibilidad */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  tabIndex={-1} /* tabIndex -1 para que no interfiera en la navegación por teclado normal del form */
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Botón Principal */}
            <button
              type="submit"
              disabled={isSubmitting} /* Se deshabilita automáticamente durante la petición */
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Entrar al sistema"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} La Casona Eventos. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </div>
  );
}
