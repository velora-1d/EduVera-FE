"use client";

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi, type User, type Tenant } from "@/lib/api";

interface AuthContextType {
    user: User | null;
    tenant: Tenant | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    planType: string | null;
    tenantId: string | null;
    subscriptionTier: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
    setUser: (user: User | null) => void;
    setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const setTokenAndStore = (token: string) => {
        // No-op: Token is now handling via HttpOnly Cookie
        // We keep this function signature to avoid breaking other components
    };

    const refresh = async () => {
        try {
            if (typeof window === "undefined") return;

            // Check if this is an owner session
            const isOwner = localStorage.getItem("is_owner") === "true";
            const storedUser = localStorage.getItem("auth_user");

            if (isOwner && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    if (parsedUser.tenant) {
                        setTenant(parsedUser.tenant as Tenant);
                    }
                } catch (e) {
                    localStorage.removeItem("is_owner");
                    localStorage.removeItem("auth_user");
                }
            } else {
                try {
                    const response = await authApi.me();
                    if (response.user) {
                        setUser(response.user);
                        if (response.user.tenant) {
                            setTenant(response.user.tenant as Tenant);
                        }
                    }
                } catch (e) {
                    setUser(null);
                    setTenant(null);
                }
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        await authApi.login({ email, password });
        // Token is set by backend in HttpOnly cookie
        await refresh();
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Continue logout even if API call fails
        }
        if (typeof window !== "undefined") {
            // Cookie is cleared by backend, we just clear client state
            // localStorage.removeItem("access_token"); 
            localStorage.removeItem("owner_token");
            localStorage.removeItem("is_owner");
            localStorage.removeItem("auth_user");
        }
        setUser(null);
        setTenant(null);
        router.push("/login");
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                tenant,
                isAuthenticated: !!user,
                isLoading,
                planType: tenant?.plan_type || null,
                tenantId: tenant?.id || user?.tenant_id || null,
                subscriptionTier: tenant?.subscription_tier || "basic",
                login,
                logout,
                refresh,
                setUser,
                setToken: setTokenAndStore,
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

/**
 * Hook to check if current plan has access to specified plan types
 */
export function usePlanAccess(requiredPlans: ("sekolah" | "pesantren" | "hybrid")[]) {
    const { planType } = useAuth();
    if (!planType) return false;
    return requiredPlans.includes(planType as "sekolah" | "pesantren" | "hybrid");
}

/**
 * Hook for protected routes - redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo = "/login") {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Save current URL to redirect back after login
            if (typeof window !== "undefined") {
                sessionStorage.setItem("redirectAfterLogin", pathname || "");
            }
            router.push(redirectTo);
        }
    }, [isLoading, isAuthenticated, router, pathname, redirectTo]);

    return { isLoading, isAuthenticated };
}
