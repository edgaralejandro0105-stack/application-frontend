"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    setInitialized(true);
  }, []);
  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [initialized, isAuthenticated, navigate]);
  if (!initialized || !isAuthenticated) {
    return <div className="min-h-screen grid place-items-center bg-background px-4 py-10 text-foreground">
        <div className="rounded-2xl border border-border bg-muted px-8 py-10 text-center shadow-sm">
          <p className="text-base font-medium">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>;
  }
  return <>{children}</>;
}
