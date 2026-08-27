"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { LoginDialog } from "@/components/login-dialog";

interface AuthContextValue {
  isAuthenticated: boolean;
  isAnonymous: boolean;
  showLogin: () => void;
  hideLogin: () => void;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

interface AuthProviderProps {
  children: ReactNode;
  /** 初始是否已登录，默认 false（匿名用户） */
  initialAuthenticated?: boolean;
}

export function AuthProvider({
  children,
  initialAuthenticated = false,
}: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [loginOpen, setLoginOpen] = useState(false);

  const showLogin = useCallback(() => setLoginOpen(true), []);
  const hideLogin = useCallback(() => setLoginOpen(false), []);

  const login = useCallback(() => {
    setIsAuthenticated(true);
    setLoginOpen(false);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAnonymous: !isAuthenticated,
        showLogin,
        hideLogin,
        login,
        logout,
      }}
    >
      {children}
      <LoginDialog open={loginOpen} onClose={hideLogin} onLogin={login} />
    </AuthContext.Provider>
  );
}
