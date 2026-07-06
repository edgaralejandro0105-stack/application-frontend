import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/context/ClientAuthContext";
import { clientPortalService } from "@/lib/services/client-portal.service";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PortalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useClientAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor ingresa tu correo y contraseña");
      return;
    }
    setIsLoading(true);
    try {
      const res = await clientPortalService.login(email, password);
      if (res.error) {
        toast.error(res.error || "Credenciales inválidas");
        return;
      }
      login(res.data.token || res.data.accessToken, res.data.client || res.data.user);
      toast.success("Inicio de sesión exitoso");
      navigate("/portal");
    } catch (err) {
      toast.error("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-xl border-border/50 bg-card/95 backdrop-blur-md">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="flex justify-center mb-4">
            <img src="/logo2.png" alt="La Casona" className="h-16 w-16 object-contain dark:invert-0 invert" />
          </div>
          <CardTitle className="text-2xl font-bold">Portal del Cliente</CardTitle>
          <CardDescription>Ingresa para ver tus eventos y más</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl h-11"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
