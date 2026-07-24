"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthResult,
  AuthUser,
  getSessionUser,
  loginUser,
  logoutUser,
  signupUser,
  updateUserProfile,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (
    name: string,
    email: string,
    password: string,
    company: string,
  ) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (
    updated: Partial<Omit<AuthUser, "password">> & { password?: string },
  ) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionUser = getSessionUser();
    setUser(sessionUser);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (email: string, password: string) => {
        const result = loginUser(email, password);
        if (result.success && result.user) {
          setUser(result.user);
        }
        return result;
      },
      signup: async (
        name: string,
        email: string,
        password: string,
        company: string,
      ) => {
        const result = signupUser(name, email, password, company);
        if (result.success && result.user) {
          setUser(result.user);
        }
        return result;
      },
      logout: () => {
        logoutUser();
        setUser(null);
      },
      updateProfile: async (
        updated: Partial<Omit<AuthUser, "password">> & { password?: string },
      ) => {
        const result = updateUserProfile(updated);
        if (result.success && result.user) {
          setUser(result.user);
        }
        return result;
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
