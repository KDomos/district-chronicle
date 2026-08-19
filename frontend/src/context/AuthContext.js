import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [checked, setChecked] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const me = await api.get("/auth/me");
      setUsername(me.username);
    } catch {
      setUsername(null);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (u, p) => {
    const res = await api.post("/auth/login", { username: u, password: p });
    setUsername(res.username);
    return res;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ username, isAuthed: !!username, checked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
