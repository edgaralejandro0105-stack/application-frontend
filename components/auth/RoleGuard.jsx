import { ShieldX } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function RoleGuard({ children, allowedRoles }) {
  const { user } = useAuth();
  const roleName = user?.Role?.role_name;
  const accessLevel = user?.Role?.access || 0;

  if (accessLevel >= 3) return children;

  if (allowedRoles && allowedRoles.includes(roleName)) return children;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-8 max-w-md">
        <ShieldX className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Acceso Denegado</h2>
        <p className="text-sm text-muted-foreground">
          No tienes los permisos necesarios para acceder a este módulo.
        </p>
      </div>
    </div>
  );
}
