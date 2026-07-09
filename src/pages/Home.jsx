import React, { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardView } from "@/components/views/dashboard-view"
import { EventsView } from "@/components/views/events-view"
import { CRMView } from "@/components/views/crm-view"
import { InventoryView } from "@/components/views/inventory-view"
import { HRView } from "@/components/views/hr-view"
import { AdminView } from "@/components/views/admin-view"
import { SalesList } from "@/components/views/sales-list"
import { CreateSale } from "@/components/views/create-sale"
import { ProvidersView } from "@/components/views/providers-view"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Profile } from "@/components/auth/Profile"
import { useAuth } from "@/context/AuthContext"
import { ThemeToggle } from "@/components/theme-toggle"
// trigger HMR
import { NotificationBell } from "@/components/NotificationBell"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const [activeSection, setActiveSection] = useState("dashboard")
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

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardView />
      case "events":
        return <EventsView />
      case "crm":
        return <CRMView />
      case "inventory":
        return <InventoryView />
      case "hr":
        return <HRView />
      case "sales":
        return <SalesList onNavigate={setActiveSection} />
      case "create-sale":
        return <CreateSale onNavigate={setActiveSection} />
      case "providers":
        return <ProvidersView />
      case "admin":
        return <AdminView />
      case "profile":
        return <Profile />
      default:
        return <DashboardView />
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background print:bg-white">
        <div className="print:hidden">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>
        <main className="flex min-h-screen flex-col lg:pl-72 print:pl-0">
          {/* HEADER / TOPBAR */}
          <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-end gap-2 border-b border-border/40 bg-background/40 px-4 backdrop-blur-md sm:px-6 lg:px-8 print:hidden">
            <NotificationBell onNavigate={setActiveSection} />
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
                  onClick={() => setActiveSection("profile")}
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

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 px-4 py-8 lg:px-8 print:p-0 print:m-0">{renderContent()}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
