import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  UserCog,
  Settings,
  Menu,
  X,
  Receipt,
  Truck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
const navItems = [
  { id: "dashboard", path: "/", label: "Panel", icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: "sales", path: "/sales", label: "Ventas", icon: <Receipt className="h-5 w-5" /> },
  { id: "events", path: "/events", label: "Eventos", icon: <Calendar className="h-5 w-5" /> },
  { id: "crm", path: "/crm", label: "Clientes (CRM)", icon: <Users className="h-5 w-5" /> },
  { id: "inventory", path: "/inventory", label: "Inventario", icon: <Package className="h-5 w-5" /> },
  { id: "providers", path: "/providers", label: "Proveedores", icon: <Truck className="h-5 w-5" /> },
  { id: "hr", path: "/hr", label: "Recursos Humanos", icon: <UserCog className="h-5 w-5" /> },
  { id: "admin", path: "/admin", label: "Administración", icon: <Settings className="h-5 w-5" /> }
];
export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return <>
      <button
    onClick={() => setMobileOpen(true)}
    className="fixed left-4 top-4 z-50 rounded-2xl bg-sidebar p-3 text-sidebar-foreground shadow-lg lg:hidden"
    aria-label="Open menu"
  >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && <div
    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
    onClick={() => setMobileOpen(false)}
  />}

      <aside
    className={cn(
      "fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
      mobileOpen ? "translate-x-0" : "-translate-x-full"
    )}
  >
        <button
    onClick={() => setMobileOpen(false)}
    className="absolute right-4 top-4 rounded-lg p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
    aria-label="Close menu"
  >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-6">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
            <img src="/logo2.png" alt="Logo La Casona" className="h-full w-full object-contain dark:invert-0 invert" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">La Casona</h1>
            <p className="text-xs text-sidebar-foreground/60">Event Agency</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => <button
    key={item.id}
    onClick={() => {
      navigate(item.path);
      setMobileOpen(false);
    }}
    className={cn(
      "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200",
      isActive(item.path) ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    )}
  >
              {item.icon}
              {item.label}
            </button>)}
        </nav>

        <div className="border-t border-sidebar-border p-4 space-y-3">
              <div className="rounded-xl bg-sidebar-accent/50 p-4">
            <p className="text-xs text-sidebar-foreground/60">
              La Casona Events
            </p>
            <p className="text-xs text-sidebar-foreground/40">Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </>;
}
