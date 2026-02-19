"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isMainDomain, setIsMainDomain] = useState(false);
    const [subdomain, setSubdomain] = useState<string | null>(null);
    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    // Check if accessing from main domain or subdomain
    useEffect(() => {
        if (typeof window !== "undefined") {
            const hostname = window.location.hostname;
            // Main domains that should NOT allow tenant login
            const mainDomains = ["eduvera.ve-lora.my.id", "www.eduvera.ve-lora.my.id", "localhost"];

            if (mainDomains.includes(hostname)) {
                setIsMainDomain(true);
            } else {
                // Extract subdomain from hostname like "riyadlulhuda.eduvera.ve-lora.my.id"
                const parts = hostname.split(".");
                if (parts.length > 4) { // subdomain.eduvera.ve-lora.my.id
                    setSubdomain(parts[0]);
                }
            }
        }
    }, []);

    // Redirect to dashboard if already authenticated and on subdomain
    useEffect(() => {
        if (!loading && isAuthenticated && !isMainDomain && subdomain) {
            router.replace("/pesantren"); // Default dashboard
        }
    }, [isAuthenticated, isMainDomain, subdomain, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);

            const redirectTo =
                typeof window !== "undefined"
                    ? sessionStorage.getItem("redirectAfterLogin")
                    : null;

            if (redirectTo) {
                sessionStorage.removeItem("redirectAfterLogin");
                router.push(redirectTo);
            } else {
                // Default redirect - will be based on user's tenant type
                router.push("/pesantren");
            }
        } catch (err: any) {
            const message =
                err.response?.data?.error ||
                err.userMessage ||
                "Email atau password salah. Silakan coba lagi.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Show message if accessing from main domain
    if (isMainDomain) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Edu<span className="text-emerald-500">Vera</span>
                        </h1>
                    </div>
                    <div className="bg-slate-900 border border-amber-500/50 rounded-xl p-8 space-y-6">
                        <div className="flex items-center gap-3 text-amber-400">
                            <AlertCircle className="w-6 h-6" />
                            <h2 className="text-lg font-semibold">Akses via Subdomain</h2>
                        </div>
                        <p className="text-slate-300">
                            Halaman login ini hanya dapat diakses melalui subdomain institusi Anda.
                        </p>
                        <p className="text-slate-400 text-sm">
                            Contoh: <code className="bg-slate-800 px-2 py-1 rounded">riyadlulhuda.eduvera.ve-lora.my.id/login</code>
                        </p>
                        <div className="border-t border-slate-700 pt-6 space-y-4">
                            <p className="text-slate-400 text-sm">
                                Belum punya akun institusi?
                            </p>
                            <Link href="/register">
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                    Daftar Sekarang
                                </Button>
                            </Link>
                            <Link href="/owner/login">
                                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                                    Login sebagai Owner
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Edu<span className="text-emerald-500">Vera</span>
                    </h1>
                    <p className="text-slate-400">Masuk ke dashboard Anda</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6"
                >
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            required
                            className="bg-slate-800 border-slate-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="bg-slate-800 border-slate-700 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Memuat...
                            </>
                        ) : (
                            "Masuk"
                        )}
                    </Button>

                    <p className="text-center text-sm text-slate-400">
                        Belum punya akun?{" "}
                        <Link href="/register" className="text-emerald-500 hover:underline">
                            Daftar di sini
                        </Link>
                    </p>

                    <p className="text-center text-sm">
                        <Link href="/forgot-password" className="text-slate-400 hover:text-white">
                            Lupa Password?
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

