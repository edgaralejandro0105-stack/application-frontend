"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
const AuthContext = createContext(void 0);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = window.localStorage.getItem("authToken");
    const storedUser = window.localStorage.getItem("authUser");
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        window.localStorage.removeItem("authUser");
      }
    }
    setReady(true);
  }, []);
  const login = (newToken, userData) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("authToken", newToken);
    window.localStorage.setItem("authUser", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };
  const logout = async () => {
    if (typeof window === "undefined") return;
    try {
      const authService = (await import("@/lib/services/auth.service")).authService;
      await authService.logout();
    } catch (error) {
      console.error("Error durante logout:", error);
    } finally {
      window.localStorage.removeItem("authToken");
      window.localStorage.removeItem("authUser");
      window.localStorage.removeItem("refreshToken");
      setToken(null);
      setUser(null);
    }
  };
  const updateUser = (userData) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const updated = { ...currentUser, ...userData };
      if (typeof window !== "undefined") {
        window.localStorage.setItem("authUser", JSON.stringify(updated));
      }
      return updated;
    });
  };
  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      updateUser
    }),
    [user, token]
  );
  if (!ready) {
    return <div className="min-h-screen grid place-items-center bg-background text-foreground">
        <div className="rounded-xl border border-border bg-muted px-6 py-8 text-center shadow-sm">
          <p className="text-sm font-medium">Inicializando sesión...</p>
        </div>
      </div>;
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
