import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { useClientAuth } from "@/context/ClientAuthContext";
import { LogOut, Calendar, User } from "lucide-react";

export function PortalLayout({ children }) {
  const { client, logout } = useClientAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/portal/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button onClick={() => navigate("/portal")} className="flex items-center gap-3">
            <img src="/logo2.png" alt="La Casona" className="h-8 w-8 object-contain dark:invert-0 invert" />
            <span className="text-lg font-semibold">La Casona</span>
          </button>
          {client && (
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground hidden sm:block">{client.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        La Casona Event Agency &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
