"use client";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Truck,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
const navItems = [
  { path: "/", label: "Panel", icon: <LayoutDashboard className="h-5 w-5" /> },
  { path: "/sales", label: "Ventas", icon: <Receipt className="h-5 w-5" /> },
  { path: "/payments", label: "Pagos", icon: <Wallet className="h-5 w-5" /> },
  { path: "/events", label: "Eventos", icon: <Calendar className="h-5 w-5" /> },
  { path: "/crm", label: "Clientes (CRM)", icon: <Users className="h-5 w-5" /> },
  { path: "/inventory", label: "Inventario", icon: <Package className="h-5 w-5" /> },
  { path: "/providers", label: "Proveedores", icon: <Truck className="h-5 w-5" /> },
  { path: "/hr", label: "Recursos Humanos", icon: <UserCog className="h-5 w-5" /> },
  { path: "/admin", label: "Administraci\xF3n", icon: <Settings className="h-5 w-5" /> }
];
export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  return <>
      {
    /* 
      BOTÓN DE HAMBURGUESA - Solo visible en dispositivos pequeños (lg breakpoint)
      Al clickear: abre el menú en móvil
      z-50: Asegura que esté por encima de otros elementos
    */
  }
      <button
    onClick={() => setMobileOpen(true)}
    className="fixed left-4 top-4 z-50 rounded-2xl bg-gradient-to-b from-sidebar to-sidebar/70 p-3 text-sidebar-foreground shadow-lg lg:hidden"
    aria-label="Open menu"
  >
        <Menu className="h-5 w-5" />
      </button>

      {
    /* 
      OVERLAY MÓVIL
      - Fondo oscuro semi-transparente que aparece detrás del menú
      - Clickear aquí cierra el menú
      - Solo visible en móvil (lg:hidden)
    */
  }
      {mobileOpen && <div
    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
    onClick={() => setMobileOpen(false)}
  />}

      {
    /* 
      SIDEBAR - Contenedor principal de la navegación
      
      CLASES CSS:
      - fixed: Posición fija (no se mueve con scroll)
      - left-0 top-0: Anclado arriba a la izquierda
      - z-50: Por encima de otros elementos
      - h-full w-72: Alto 100%, ancho 288px
      - flex flex-col: Layout vertical
      - transition-transform: Animación suave al abrir/cerrar
      
      RESPONSIVE:
      - En móvil: -translate-x-full (fuera de pantalla) → translate-x-0 (visible)
      - En desktop: Siempre visible (lg:translate-x-0)
    */
  }
      <aside
    className={cn(
      "fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-gradient-to-b from-sidebar to-sidebar/70 text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
      mobileOpen ? "translate-x-0" : "-translate-x-full"
    )}
  >
        {
    /* 
      BOTÓN CERRAR - Solo visible en móvil
      Permite cerrar el menú
    */
  }
        <button
    onClick={() => setMobileOpen(false)}
    className="absolute right-4 top-4 rounded-lg p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
    aria-label="Close menu"
  >
          <X className="h-5 w-5" />
        </button>

        {
    /* 
      LOGO Y BRANDING
      - Logo de La Casona
      - Nombre de la empresa
      - Subtítulo "Event Agency"
      - Separado del menú con un borde inferior
    */
  }
        <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-6">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
            <img src="/logo2.png" alt="Logo La Casona" className="h-full w-full object-contain dark:invert-0 invert" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">La Casona</h1>
            <p className="text-xs text-sidebar-foreground/60">Event Agency</p>
          </div>
        </div>

        {
    /* 
      NAVEGACIÓN PRINCIPAL
      - flex-1: Ocupa todo el espacio disponible entre logo y footer
      - space-y-1: Pequeño espacio entre items
      - Mapear el array navItems y crear un botón para cada uno
      
      LÓGICA DE CADA BOTÓN:
      1. onClick: Llamar onSectionChange() para notificar al padre
      2. Cerrar menú móvil después de hacer click
      3. Aplicar estilos condicionales según si está activo o no
      4. Mostrar icono + label
    */
  }
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                  // Estilos condicionales
                  isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  // Inactivo: efecto hover
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        {
    /* 
      PIE DEL SIDEBAR
      - border-t: Separador visual
      - space-y-3: Espacio entre la caja de info y el botón de logout
      
      CONTENIDO:
      1. Caja de información de la app (nombre, versión)
      2. BOTÓN DE LOGOUT (NUEVO) - Cierra la sesión
    */
  }
        <div className="border-t border-sidebar-border p-4 space-y-3">
        {
          /* Información de la app */
        }      <div className="rounded-xl bg-sidebar-accent/50 p-4">
            <p className="text-xs text-sidebar-foreground/60">
              La Casona Events
            </p>
            <p className="text-xs text-sidebar-foreground/40">Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </>;
}
