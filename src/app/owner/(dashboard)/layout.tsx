"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Building2,
    UserPlus,
    CreditCard,
    Banknote,
    FileText,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    Megaphone,
} from "lucide-react";
import { ToastContainer } from "@/components/ui/Toast";

const menuItems = [
    { href: "/owner", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/owner/tenants", icon: Building2, label: "Tenants" },
    { href: "/owner/registrations", icon: UserPlus, label: "Registrations" },
    { href: "/owner/transactions", icon: CreditCard, label: "Transactions" },
    { href: "/owner/disbursements", icon: Banknote, label: "Disbursements" },
    { href: "/owner/content", icon: FileText, label: "Content" },
    { href: "/owner/announcements", icon: Megaphone, label: "Announcements" },
    { href: "/owner/notifications", icon: Bell, label: "Notifications" },
    { href: "/owner/settings/whatsapp", icon: Shield, label: "WhatsApp" },
    { href: "/owner/settings/templates", icon: FileText, label: "Templates" },
    { href: "/owner/settings", icon: Settings, label: "Settings" },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const ownerFlag = localStorage.getItem("is_owner");
            const token = localStorage.getItem("access_token");

            if (!token || ownerFlag !== "true") {
                router.push("/owner/login");
            } else {
                setIsOwner(true);
            }
            setLoading(false);
        }
    }, [router]);

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("is_owner");
            localStorage.removeItem("user");
        }
        router.push("/owner/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!isOwner) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
                        <Link href="/owner" className="flex items-center gap-2">
                            <Shield className="w-6 h-6 text-emerald-500" />
                            <span className="font-bold text-white">
                                Edu<span className="text-emerald-500">Vera</span>
                            </span>
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                                Owner
                            </span>
                        </Link>
                        <button
                            className="lg:hidden text-slate-400 hover:text-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-slate-800 shrink-0">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-40 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center px-4 lg:px-6">
                    <button
                        className="lg:hidden text-slate-400 hover:text-white mr-4"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-white">Owner Dashboard</h1>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>
            <ToastContainer />
        </div>
    );
}
