"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shield, Mail, Phone, User, Lock, Eye, EyeOff, Loader2, LogOut, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { authService } from "@/lib/services/auth.service";
import { useAuth } from "@/context/AuthContext";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
});

const securitySchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export function Profile() {
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
        return;
      }
      const response = await authService.getProfile();
      if (response.error || !response.data) {
        toast.error(response.error ?? "No se pudo cargar el perfil.");
        setLoading(false);
        return;
      }
      setProfile(response.data);
      updateUser(response.data);
      setLoading(false);
    };
    loadProfile();
  }, [isAuthenticated, navigate, updateUser]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] grid place-items-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name = "") => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name[0] || "U").toUpperCase();
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Perfil de Usuario</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu información personal y configuración de seguridad.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Columna Izquierda: Identidad */}
          <Card className="rounded-xl shadow-lg border-border bg-card/80 backdrop-blur-md">
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
              <div className="h-24 w-24 bg-primary/20 border border-primary/30 text-primary flex items-center justify-center rounded-xl text-2xl font-bold mb-4 shadow-inner">
                {getInitials(profile?.name)}
              </div>
              <h2 className="text-lg font-semibold text-foreground">{profile?.name}</h2>
              <Badge variant="secondary" className="mt-2 rounded-lg bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30">
                <Shield className="mr-1.5 h-3 w-3" />
                {profile?.role || "Usuario"}
              </Badge>
              
              <div className="w-full h-px bg-border/50 my-6" />
              
              <Button 
                variant="outline" 
                className="w-full rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                {loggingOut ? "Cerrando..." : "Cerrar Sesión"}
              </Button>
            </CardContent>
          </Card>

          {/* Columna Derecha: Formularios (Tabs) */}
          <div className="flex flex-col space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
                <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-sm transition-all">
                  <User className="mr-2 h-4 w-4" />
                  Información Personal
                </TabsTrigger>
                <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-sm transition-all">
                  <Lock className="mr-2 h-4 w-4" />
                  Seguridad
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="personal" className="m-0 focus-visible:outline-none">
                  <ProfileInfoForm profile={profile} updateUser={updateUser} setProfile={setProfile} />
                </TabsContent>
                <TabsContent value="security" className="m-0 focus-visible:outline-none">
                  <ProfileSecurityForm profile={profile} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileInfoForm({ profile, updateUser, setProfile }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const nameParts = (profile?.name || "").split(" ");
  const initialFirstName = nameParts[0] || "";
  const initialLastName = nameParts.slice(1).join(" ") || "";

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialFirstName,
      lastName: initialLastName,
      phone: profile?.phone || "",
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        phone: data.phone?.trim()
      };
      
      const response = await apiClient.put(`/users/${profile.user_id}`, payload);
      
      if (response.error || !response.data) {
        toast.error(response.error ?? "Error al actualizar perfil");
      } else {
        const userData = response.data.data || response.data;
        setProfile(userData);
        updateUser(userData);
        toast.success("Perfil actualizado correctamente");
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-xl shadow-lg border-border bg-card/80 backdrop-blur-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Información Personal</CardTitle>
        <CardDescription className="text-muted-foreground">Actualiza tus datos de contacto básicos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="profile-info-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                value={profile?.email || ""} 
                disabled 
                className="rounded-lg pl-9 bg-muted/50 border-border text-muted-foreground cursor-not-allowed opacity-100" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-foreground">Nombre</Label>
              <Input 
                id="firstName" 
                {...register("firstName")}
                className={`rounded-lg border-border bg-background/50 focus-visible:ring-primary focus-visible:border-primary ${errors.firstName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {errors.firstName && <span className="text-xs text-destructive font-medium">{errors.firstName.message}</span>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Apellido</Label>
              <Input 
                id="lastName" 
                {...register("lastName")}
                className={`rounded-lg border-border bg-background/50 focus-visible:ring-primary focus-visible:border-primary ${errors.lastName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {errors.lastName && <span className="text-xs text-destructive font-medium">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="phone" 
                type="tel"
                {...register("phone")}
                className={`rounded-lg pl-9 border-border bg-background/50 focus-visible:ring-primary focus-visible:border-primary ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
            </div>
            {errors.phone && <span className="text-xs text-destructive font-medium">{errors.phone.message}</span>}
          </div>
        </form>
      </CardContent>
      <CardFooter className="pt-4 pb-6 px-6 border-t border-border/50 mt-6 bg-muted/30 flex justify-end rounded-b-xl">
        <Button 
          type="submit" 
          form="profile-info-form"
          disabled={isSubmitting}
          className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProfileSecurityForm({ profile }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.put(`/users/${profile.user_id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      if (response.error) {
        toast.error(response.error ?? "No se pudo actualizar la contraseña.");
      } else {
        toast.success("Contraseña actualizada con éxito.");
        reset();
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado al actualizar la contraseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-xl shadow-lg border-border bg-card/80 backdrop-blur-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Seguridad de la Cuenta</CardTitle>
        <CardDescription className="text-muted-foreground">Actualiza tu contraseña para mantener tu cuenta segura.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="profile-security-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">Contraseña Actual</Label>
            <div className="relative">
              <Input 
                id="currentPassword" 
                type={showCurrent ? "text" : "password"}
                {...register("currentPassword")}
                className={`rounded-lg pr-10 border-border bg-background/50 focus-visible:ring-primary focus-visible:border-primary ${errors.currentPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              <button 
                type="button" 
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && <span className="text-xs text-destructive font-medium">{errors.currentPassword.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">Nueva Contraseña</Label>
            <div className="relative">
              <Input 
                id="newPassword" 
                type={showNew ? "text" : "password"}
                {...register("newPassword")}
                className={`rounded-lg pr-10 border-border bg-background/50 focus-visible:ring-primary focus-visible:border-primary ${errors.newPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              <button 
                type="button" 
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <span className="text-xs text-destructive font-medium">{errors.newPassword.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirmar Nueva Contraseña</Label>
            <div className="relative">
              <Input 
                id="confirmPassword" 
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword")}
                className={`rounded-lg pr-10 border-border bg-background/50 focus-visible:ring-primary focus-visible:border-primary ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              <button 
                type="button" 
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <span className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</span>}
          </div>
        </form>
      </CardContent>
      <CardFooter className="pt-4 pb-6 px-6 border-t border-border/50 mt-6 bg-muted/30 flex justify-end rounded-b-xl">
        <Button 
          type="submit" 
          form="profile-security-form"
          disabled={isSubmitting}
          className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Actualizar Contraseña
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
