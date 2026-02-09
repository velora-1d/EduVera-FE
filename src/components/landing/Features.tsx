"use client";

import { useState, useEffect } from "react";
import { landingApi } from "@/services/landingApi";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

// Helper component to render icon by name
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const Icon = (LucideIcons as any)[name];
  return Icon ? <Icon className={className} /> : <LucideIcons.HelpCircle className={className} />;
};

const DEFAULT_SCHOOL_FEATURES = [
  { title: "Dashboard Akademik", desc: "Ringkasan data & status progres.", icon: "LayoutDashboard" },
  { title: "Data Akademik", desc: "Profil lengkap & pemetaan Mapel.", icon: "Users" },
  { title: "Pembelajaran", desc: "Penugasan guru & jadwal harian.", icon: "School" },
  { title: "Kurikulum Nasional", desc: "Support K13 & Merdeka.", icon: "BookMarked" },
  { title: "E-Rapor Nasional", desc: "Otomasi generate PDF rapor.", icon: "ClipboardCheck" },
  { title: "SDM & HR", desc: "Struktur & absensi pegawai.", icon: "UserCheck" },
  { title: "ERP Keuangan", desc: "SPP, BOS & Penggajian.", icon: "Wallet" },
  { title: "Kalender", desc: "Reminder kegiatan otomatis.", icon: "Calendar" },
  { title: "Pusat Laporan", desc: "Rekap data komprehensif.", icon: "BarChart3" },
  { title: "Config", desc: "Role & fitur management.", icon: "Settings" },
];

const DEFAULT_PESANTREN_FEATURES = [
  { title: "Dashboard Pondok", desc: "Monitor santri & kas harian.", icon: "LayoutDashboard" },
  { title: "Database Santri", desc: "Profil & riwayat mukim.", icon: "Users" },
  { title: "Asrama", desc: "Plotting & absensi asrama.", icon: "Bed" },
  { title: "Kedisiplinan", desc: "Poin & perizinan terpadu.", icon: "Scale" },
  { title: "Tahfidz", desc: "Target & setoran harian.", icon: "GraduationCap" },
  { title: "Kitab", desc: "Halaqah & pemahaman kitab.", icon: "BookOpen" },
  { title: "E-Rapor Pondok", desc: "Rapor gabungan PDF.", icon: "ClipboardCheck" },
  { title: "SDM Ustadz", desc: "Honor & insentif ustadz.", icon: "UserCheck" },
  { title: "Keuangan ERP", desc: "Pemasukan & pengeluaran.", icon: "Wallet" },
  { title: "Hijriah", desc: "Kalender & kegiatan haflah.", icon: "Calendar" },
  { title: "Audit Report", desc: "Laporan kepesantrenan.", icon: "FileText" },
];

export const Features = () => {
  const [schoolFeatures, setSchoolFeatures] = useState(DEFAULT_SCHOOL_FEATURES);
  const [pesantrenFeatures, setPesantrenFeatures] = useState(DEFAULT_PESANTREN_FEATURES);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const schoolData = await landingApi.get("features_school");
        if (schoolData && schoolData.value && Array.isArray(schoolData.value)) {
          setSchoolFeatures(schoolData.value);
        }

        const pesantrenData = await landingApi.get("features_pesantren");
        if (pesantrenData && pesantrenData.value && Array.isArray(pesantrenData.value)) {
          setPesantrenFeatures(pesantrenData.value);
        }
      } catch (error) {
        console.error("Failed to load features content", error);
      }
    };
    loadContent();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
        duration: 0.6,
      },
    },
  };

  return (
    <section
      id="produk"
      className="py-24 bg-slate-900/50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="text-3xl sm:text-5xl font-bold text-white mb-6 font-display"
          >
            Solusi Terpadu 21+ Modul
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto italic"
          >
            "Satu platform, melayani kebutuhan kurikulum nasional maupun
            ekosistem pesantren."
          </motion.p>
        </div>

        <div className="space-y-20">
          {/* Sekolah Section */}
          <div>
            <div className="flex items-center space-x-3 mb-10 border-b border-emerald-500/20 pb-4">
              <LucideIcons.School className="w-8 h-8 text-emerald-400" />
              <h3 className="text-2xl font-bold">10 Modul Sekolah Formal</h3>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
            >
              {schoolFeatures.map((f, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="p-7 rounded-2xl bg-slate-950/50 border border-white/5 hover:border-emerald-500/30 transition-all group"
                >
                  <DynamicIcon name={f.icon} className="w-7 h-7 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-base font-bold mb-2 text-white">
                    {f.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Pesantren Section */}
          <div>
            <div className="flex items-center space-x-3 mb-10 border-b border-sky-500/20 pb-4">
              <LucideIcons.Building2 className="w-8 h-8 text-sky-400" />
              <h3 className="text-2xl font-bold">11 Modul Pondok Pesantren</h3>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {pesantrenFeatures.map((f, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="p-7 rounded-2xl bg-slate-950/50 border border-white/5 hover:border-sky-500/30 transition-all group"
                >
                  <DynamicIcon name={f.icon} className="w-7 h-7 text-sky-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-base font-bold mb-2 text-white">
                    {f.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
