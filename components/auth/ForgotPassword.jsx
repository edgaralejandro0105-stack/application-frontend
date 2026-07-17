"use client";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { authService } from "@/lib/services/auth.service";
import { emailService } from "@/lib/services/email.service";

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Formato de correo electrónico inválido"),
});

export function ForgotPassword() {
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" }
  });

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const response = await authService.generateResetToken(data.email);
      if (response.error) {
        setApiError(response.error ?? "No se pudo procesar la solicitud. Intenta nuevamente.");
        return;
      }

      const { token, nombre_usuario } = response.data.data;
      const enlace_recuperacion = `${window.location.origin}/reset-password?token=${token}`;

      await emailService.sendPasswordResetEmail({
        user_email: data.email,
        nombre_usuario,
        enlace_recuperacion,
      });

      setSuccess(true);
    } catch (error) {
      setApiError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-card p-8 shadow-lg shadow-black/5">
        
        {/* Encabezado */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Recuperar Contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            {success 
              ? "Revisa tu bandeja de entrada" 
              : "Ingresa tu correo y te enviaremos las instrucciones"}
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-center text-sm font-medium text-emerald-700 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              ¡Correo enviado! Hemos enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada.
            </p>
            <Link
              to="/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Volver al Login
            </Link>
          </div>
        ) : (
          <>
            {apiError && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none text-foreground">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@ejemplo.com"
                  className={`flex h-12 w-full rounded-xl border bg-transparent px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-input"
                  }`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando enlace...
                  </>
                ) : (
                  "Enviar instrucciones"
                )}
              </button>
            </form>

            <div className="text-center text-sm">
              <Link to="/login" className="font-medium text-primary hover:underline">
                Volver al Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
