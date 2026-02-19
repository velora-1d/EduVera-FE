"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

import { About } from "@/components/landing/About";
import { CTA } from "@/components/landing/CTA";
import { Docs } from "@/components/landing/Docs";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Pricing } from "@/components/landing/Pricing";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
      const hostname = window.location.hostname;
      const mainDomains = ["eduvera.ve-lora.my.id", "www.eduvera.ve-lora.my.id", "localhost"];
      const isMainDomain = mainDomains.includes(hostname);

      if (!isMainDomain) {
        // Visitor is on a tenant subdomain -> Redirect them!
        if (isAuthenticated) {
          // If logged in, go to dashboard (defaulting to pesantren for now, or determining from auth)
          // ideally we rely on the login page's redirect logic or a smarter router, 
          // but redirecting to /pesantren is a safe bet for most users in this context, 
          // or /owner/login if we were smarter. 
          // Let's just send to /login which will handle the "logged in" state? 
          // No, /login page just shows login form usually unless we add logic there too.
          // Let's send to /pesantren for now.
          router.replace("/pesantren");
        } else {
          router.replace("/login");
        }
      }
    }
  }, [isAuthenticated, isLoading, router]);

  const navLinks = [
    { href: "#produk", label: "Produk" },
    { href: "#features", label: "Fitur" },
    { href: "#harga", label: "Harga" },
    { href: "#testimoni", label: "Testimoni" },
    { href: "#docs", label: "Dokumentasi" },
    { href: "#about", label: "Tentang" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-2xl tracking-tighter text-white group"
          >
            <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
              Edu
              <span className="text-emerald-500 group-hover:text-emerald-400 transition-colors">
                Vera
              </span>
            </motion.span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.3 }}
                whileHover={{ y: -2 }}
                className="relative text-sm font-medium text-slate-400 hover:text-white transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full" />
              </motion.a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/register"
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
              >
                Daftar Sekarang
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 border-b border-white/5 overflow-hidden"
            >
              <div className="px-4 py-8 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-lg font-medium text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4">
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center bg-emerald-600 text-white py-3 rounded-xl font-bold"
                  >
                    Daftar Sekarang
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="relative z-10 pt-20">
        <Hero />
        <Stats />
        <div id="features">
          <Features />
        </div>
        <Pricing />
        <Testimonials />
        <Docs />
        <About />
        <CTA />
      </main>

      <footer className="relative z-10 bg-slate-950 border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <h2 className="font-bold text-xl text-white mb-2">
              EduVera
            </h2>
            <p className="text-slate-500 text-sm max-w-xs">
              Platform manajemen pendidikan nomor satu untuk Sekolah dan
              Pesantren modern.
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-sm">
              &copy; 2026 EduVera SaaS Platform. <br />
              All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
