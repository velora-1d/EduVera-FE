"use client";

import { useState, useEffect } from "react";
import { contentApi } from "@/lib/api";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import Link from "next/link";

// Helper component to render icon by name
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const Icon = (LucideIcons as any)[name];
  return Icon ? <Icon className={className} /> : <LucideIcons.HelpCircle className={className} />;
};


const DEFAULT_DOCS = [
  {
    icon: "Rocket",
    title: "Panduan Memulai",
    description: "Langkah-langkah awal untuk setup dan konfigurasi EduVera di lembaga Anda.",
    color: "emerald",
    articles: ["Pendaftaran Akun", "Setup Subdomain", "Import Data Awal"],
  },
  {
    icon: "BookOpen",
    title: "Panduan Pengguna",
    description: "Tutorial lengkap penggunaan setiap modul dan fitur EduVera.",
    color: "sky",
    articles: ["Modul Akademik", "E-Rapor", "Keuangan & SPP"],
  },
  {
    icon: "Video",
    title: "Video Tutorial",
    description: "Koleksi video panduan step-by-step untuk berbagai fitur.",
    color: "rose",
    articles: ["Setup PPDB Online", "Cetak Rapor", "Rekap Pembayaran"],
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  sky: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/30" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/30" },
};

export const Docs = () => {
  const [docCategories, setDocCategories] = useState<any[]>(DEFAULT_DOCS);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await contentApi.get("landing_docs");
        if (data && data.value && Array.isArray(data.value)) {
          setDocCategories(data.value);
        }
      } catch (error) {
        console.error("Failed to load docs content", error);
      }
    };
    loadContent();
  }, []);

  return (
    <section id="docs" className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/30 rounded-full mb-6">
            <LucideIcons.FileText className="w-4 h-4 text-sky-400" />
            <span className="text-sky-400 text-sm font-medium">
              Knowledge Base
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-display">
            Dokumentasi & Panduan
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk memaksimalkan penggunaan EduVera,
            dari panduan dasar hingga integrasi lanjutan.
          </p>
        </motion.div>

        {/* Quick Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Cari dokumentasi..."
              className="w-full h-14 px-6 pr-12 rounded-2xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none transition-colors"
            />
            <LucideIcons.Zap className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          </div>
        </motion.div>

        {/* Doc Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docCategories.map((category, index) => {
            const style = colorMap[category.color] || colorMap.emerald;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group cursor-pointer"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <DynamicIcon name={category.icon} className={`w-6 h-6 ${style.text}`} />
                </div>

                {/* Title & Description */}
                <h3 className="text-white font-semibold mb-2">
                  {category.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {category.description}
                </p>

                {/* Articles Preview */}
                <div className="space-y-2">
                  {category.articles.slice(0, 3).map((article: string) => (
                    <Link
                      key={article}
                      href="#"
                      className={`block text-sm ${style.text} hover:underline`}
                    >
                      → {article}
                    </Link>
                  ))}
                  {category.articles.length > 3 && (
                    <span className="text-slate-500 text-xs">
                      +{category.articles.length - 3} artikel lainnya
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>


        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="mt-16 text-center"
        >
          <p className="text-slate-400 mb-4">
            Butuh bantuan lebih lanjut? Tim support kami siap membantu Anda.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
            >
              <LucideIcons.MessageCircle className="w-5 h-5" /> Chat WhatsApp
            </a>
            <a
              href="mailto:support@eduvera.id"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-white/10 transition-colors"
            >
              <LucideIcons.Mail className="w-5 h-5" /> Email Support
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
