"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoginDialog } from "@/components/login-dialog";
import { authApi } from "@/lib/auth-client";
import { safeAuthRedirect } from "@/lib/auth-redirect";
import {
  AUTH_GUARD_COOKIE_NAME,
  AUTH_STORAGE_KEY,
} from "@/lib/auth-constants";
import type { AuthSession, AuthUser } from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  showLogin: () => void;
  hideLogin: () => void;
  user: AuthUser | null;
  completeLogin: (session: AuthSession) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as unknown;
    if (
      typeof value !== "object" ||
      value === null ||
      !("accessToken" in value) ||
      typeof value.accessToken !== "string" ||
      !("user" in value) ||
      typeof value.user !== "object" ||
      value.user === null
    ) {
      return null;
    }
    const session = value as AuthSession;
    if (session.expiresAt && session.expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

function writeStoredSession(session: AuthSession | null): void {
  try {
    if (session) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Cookie session still keeps the current tab authenticated when storage is unavailable.
  }
  if (!session) {
    document.cookie = `${AUTH_GUARD_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loginOpen, setLoginOpen] = useState(false);
  const showLogin = useCallback(() => setLoginOpen(true), []);
  const hideLogin = useCallback(() => {
    setLoginOpen(false);
    const url = new URL(window.location.href);
    if (url.searchParams.has("login")) {
      url.searchParams.delete("login");
      url.searchParams.delete("next");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active && new URLSearchParams(window.location.search).get("login") === "1") {
        showLogin();
      }
    });
    return () => { active = false; };
  }, [pathname, showLogin]);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const clearLocalSession = useCallback(() => {
    setSession(null);
    setStatus("unauthenticated");
    writeStoredSession(null);
  }, []);

  const verifySession = useCallback(async (stored: AuthSession | null) => {
    if (!stored) {
      try {
        const user = await authApi.getCurrentUser();
        setSession({ accessToken: "", expiresAt: null, user });
        setStatus("authenticated");
      } catch {
        clearLocalSession();
      }
      return;
    }
    setSession(stored);
    try {
      const user = await authApi.getCurrentUser();
      const nextSession = { ...stored, user };
      setSession(nextSession);
      setStatus("authenticated");
      writeStoredSession(nextSession);
    } catch {
      clearLocalSession();
    }
  }, [clearLocalSession]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void verifySession(readStoredSession());
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_KEY) void verifySession(readStoredSession());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
    };
  }, [verifySession]);

  const completeLogin = useCallback((nextSession: AuthSession) => {
    setSession(nextSession);
    setStatus("authenticated");
    writeStoredSession(nextSession);
    setLoginOpen(false);
    const next = new URLSearchParams(window.location.search).get("next");
    const target = safeAuthRedirect(next, window.location.origin);
    if (target) router.replace(target);
    router.refresh();
  }, [router]);

  const logout = useCallback(async () => {
    clearLocalSession();
    try {
      await authApi.logout();
    } catch {
      // Local session is already cleared; the cookie endpoint will be retried on next login.
    } finally {
      router.replace("/home");
      router.refresh();
    }
  }, [clearLocalSession, router]);

  const refreshUser = useCallback(async () => {
    if (!session) return;
    const user = await authApi.getCurrentUser();
    const nextSession = { ...session, user };
    setSession(nextSession);
    writeStoredSession(nextSession);
  }, [session]);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    isAuthenticated: status === "authenticated",
    isAnonymous: status !== "authenticated",
    showLogin,
    hideLogin,
    user: session?.user ?? null,
    completeLogin,
    logout,
    refreshUser,
  }), [completeLogin, hideLogin, logout, refreshUser, session?.user, showLogin, status]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginDialog open={loginOpen} onClose={hideLogin} />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
