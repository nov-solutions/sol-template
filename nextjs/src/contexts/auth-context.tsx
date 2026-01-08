"use client";

import { axiosClient } from "@/lib/axiosClient";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
  id: number;
  email: string;
  email_verified: boolean;
  email_verified_at: string | null;
  created_at: string;
  days_until_deletion: number | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    passwordConfirm: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const response = await axiosClient.get("/auth/user/");
      setUser(response.data);
      setError(null);
    } catch {
      setUser(null);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosClient.post("/auth/login/", {
          email,
          password,
        });
        setUser(response.data.user);
        router.push("/dashboard");
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || "Login failed. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const register = useCallback(
    async (email: string, password: string, passwordConfirm: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosClient.post("/auth/register/", {
          email,
          password,
          password_confirm: passwordConfirm,
        });
        setUser(response.data.user);
        router.push("/dashboard");
      } catch (err: unknown) {
        const errorData = (
          err as {
            response?: {
              data?: { error?: string; email?: string[]; password?: string[] };
            };
          }
        )?.response?.data;
        const errorMessage =
          errorData?.error ||
          errorData?.email?.[0] ||
          errorData?.password?.[0] ||
          "Registration failed. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await axiosClient.post("/auth/logout/");
      setUser(null);
      router.push("/");
    } catch {
      // Even if logout fails on the server, clear local state
      setUser(null);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    };
    checkAuth();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
