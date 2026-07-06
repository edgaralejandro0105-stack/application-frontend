import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ClientAuthContext = createContext(void 0);

export function ClientAuthProvider({ children }) {
  const [client, setClient] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("clientToken");
    const storedClient = localStorage.getItem("clientUser");
    if (storedToken) setToken(storedToken);
    if (storedClient) {
      try { setClient(JSON.parse(storedClient)); } catch { localStorage.removeItem("clientUser"); }
    }
    setReady(true);
  }, []);

  const login = (newToken, clientData) => {
    localStorage.setItem("clientToken", newToken);
    localStorage.setItem("clientUser", JSON.stringify(clientData));
    setToken(newToken);
    setClient(clientData);
  };

  const logout = () => {
    localStorage.removeItem("clientToken");
    localStorage.removeItem("clientUser");
    setToken(null);
    setClient(null);
  };

  const value = useMemo(() => ({
    client, token, isAuthenticated: Boolean(client && token), login, logout
  }), [client, token]);

  if (!ready) return null;

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (!context) throw new Error("useClientAuth must be used within a ClientAuthProvider");
  return context;
}
