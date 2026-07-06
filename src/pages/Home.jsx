import React from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { Sidebar } from "@/components/sidebar"
import { DashboardView } from "@/components/views/dashboard-view"
import { EventsView } from "@/components/views/events-view"
import { CRMView } from "@/components/views/crm-view"
import { InventoryView } from "@/components/views/inventory-view"
import { HRView } from "@/components/views/hr-view"
import { AdminView } from "@/components/views/admin-view"
import { TrashView } from "@/components/views/trash-view"
import { SalesList } from "@/components/views/sales-list"
import { CreateSale } from "@/components/views/create-sale"
import { ProvidersView } from "@/components/views/providers-view"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Profile } from "@/components/auth/Profile"
import { useAuth } from "@/context/AuthContext"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBell } from "@/components/NotificationBell"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Trash2 } from "lucide-react"

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background print:bg-white">
        <div className="print:hidden">
          <Sidebar />
        </div>
        <main className="flex min-h-screen flex-col lg:pl-72 print:pl-0">
          <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-end gap-3 border-b border-border/40 bg-background/40 px-4 backdrop-blur-md sm:px-6 lg:px-8 print:hidden">
            <NotificationBell />
            <button 
              onClick={() => navigate("/trash")}
              className="relative p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 outline-none"
              title="Papelera de Reciclaje"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl outline-none hover:bg-accent/20 p-1 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm border border-primary/20">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl border-border/50 bg-popover/95 backdrop-blur-md">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{user?.name || "Usuario"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg focus:bg-primary/20 focus:text-primary"
                  onClick={() => navigate("/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <div className="flex-1 px-4 py-8 lg:px-8 print:p-0 print:m-0">
            <Routes>
              <Route index element={<DashboardView />} />
              <Route path="events" element={<EventsView />} />
              <Route path="crm" element={<CRMView />} />
              <Route path="inventory" element={<InventoryView />} />
              <Route path="hr" element={<HRView />} />
              <Route path="sales" element={<SalesList />} />
              <Route path="sales/new" element={<CreateSale />} />
              <Route path="providers" element={<ProvidersView />} />
              <Route path="admin" element={<AdminView />} />
              <Route path="trash" element={<TrashView />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
