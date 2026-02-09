"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, TrendingUp, Zap, Star, School, BookOpen, Building2, Gem, Coffee, Shield, Users } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { landingApi } from "@/services/landingApi";
import { pricing, planMetadata, PlanType, TierType } from "@/lib/pricing";

export const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedTier, setSelectedTier] = useState<TierType>("basic");
  const [dynamicPricing, setDynamicPricing] = useState(pricing);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const data = await landingApi.get("pricing_plans");
        if (data && data.value) {
          // Validate structure roughly
          if (data.value.sekolah && data.value.pesantren) {
            setDynamicPricing(data.value);
          }
        }
      } catch (error) {
        console.error("Failed to load pricing", error);
      }
    };
    loadPricing();
  }, []);

  const iconMap: Record<string, any> = {
    TrendingUp, Sparkles, Zap, Star, School, BookOpen, Building2,
  };

  const plans: PlanType[] = ["sekolah", "pesantren", "hybrid"];
  const billing = isAnnual ? "annual" : "monthly";

  // Local helper to use dynamic data
  const getPrice = (plan: PlanType, tier: TierType, bill: "monthly" | "annual") => {
    return dynamicPricing[plan][tier][bill];
  };

  const getOriginalPrice = (plan: PlanType, tier: TierType, bill: "monthly" | "annual") => {
    // Logic mark-up original price (same as lib/pricing.ts)
    // Sekolah/Pesantren: Basic +200k (monthly), +2jt (annual). Premium +300k, +3jt
    // For simplicity and consistency with lib, we can just use a multiplier or static offset if we want dynamic original price too.
    // Or, we can assume original price is also dynamic? Currently migration doesn't have original price.
    // Let's use a simple multiplier logic: 
    // Monthly: Price / 0.6 (40% discount)
    // Annual: (Price / 12) * 12 / 0.5 (50% discount)

    // Better approach: Use the static originalPricing from lib as BASE, 
    // but if dynamic price changes significantly, original price looks weird.
    // Let's calculate 'Original' as Dynamic Price * 1.6 (approx 40% discount shown)

    const current = getPrice(plan, tier, bill);
    if (bill === "annual") return Math.round(current * 1.5); // 33% off shown (actually 50%) -> wait, 1.5 * price -> savings = 0.5 * price = 33%
    return Math.round(current * 1.4); // 30% off (approx)
  };

  const formattedPrice = (p: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(p);
  }

  return (
    <section id="harga" className="py-24 bg-slate-900/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4 font-display"
          >
            Investasi Pendidikan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 mb-8"
          >
            Pilih paket yang sesuai dengan skala lembaga Anda.
          </motion.p>

          {/* Tier Toggle */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setSelectedTier("basic")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTier === "basic"
                ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400"
                : "bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
            >
              <Star className="w-4 h-4" />
              <span className="font-medium">Basic</span>
              <span className="text-xs opacity-70">Manual</span>
            </button>
            <button
              onClick={() => setSelectedTier("premium")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTier === "premium"
                ? "bg-amber-500/20 border border-amber-500 text-amber-400"
                : "bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
            >
              <Zap className="w-4 h-4" />
              <span className="font-medium">Premium</span>
              <span className="text-xs opacity-70">Bayar Otomatis</span>
            </button>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className={`text-sm ${!isAnnual ? "text-white font-bold" : "text-slate-500"}`}>
              Bulanan
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 h-8 bg-slate-800 rounded-full p-1 transition-colors hover:bg-slate-700 border border-slate-700"
            >
              <motion.div
                animate={{ x: isAnnual ? 32 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-lg"
              />
            </button>
            <span className={`text-sm ${isAnnual ? "text-white font-bold" : "text-slate-500"}`}>
              Tahunan
            </span>
          </div>

          {/* Savings Highlight */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedTier}-${isAnnual}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${selectedTier === "premium"
                ? "bg-amber-500/10 border border-amber-500/30"
                : "bg-emerald-500/10 border border-emerald-500/30"
                }`}
            >
              {selectedTier === "premium" ? (
                <Zap className="w-4 h-4 text-amber-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-400" />
              )}
              <span className={`text-sm font-medium ${selectedTier === "premium" ? "text-amber-400" : "text-emerald-400"}`}>
                {selectedTier === "premium"
                  ? <><Sparkles className="w-4 h-4 inline mr-1" /> Premium: Pembayaran SPP/Syahriah otomatis via GoPay, OVO, DANA!</>
                  : isAnnual
                    ? "Hemat hingga 48% dengan bayar Tahunan!"
                    : "Mulai dari Rp 16.600/hari saja!"
                }
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pricing Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch"
        >
          {plans.map((planId, i) => {
            const meta = planMetadata[planId];
            const price = getPrice(planId, selectedTier, billing);
            const originalPrice = getOriginalPrice(planId, selectedTier, billing);

            // Daily calc
            const daily = Math.round(billing === "annual" ? price / 365 : price / 30);

            const savings = originalPrice - price;
            const savingsPercent = Math.round((savings / originalPrice) * 100);
            const PlanIcon = iconMap[meta.icon] || TrendingUp;
            const isHybrid = planId === "hybrid";

            return (
              <motion.div
                key={planId}
                variants={{
                  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { type: "spring", stiffness: 80, damping: 20 },
                  },
                }}
                className={`relative bg-slate-950 p-8 rounded-2xl border h-full ${isHybrid
                  ? selectedTier === "premium"
                    ? "border-amber-500 ring-4 ring-amber-500/10"
                    : "border-purple-500 ring-4 ring-purple-500/10"
                  : "border-slate-800"
                  } flex flex-col`}
              >
                {/* Badge */}
                {isHybrid && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg ${selectedTier === "premium"
                    ? "bg-gradient-to-r from-amber-500 to-amber-400 shadow-amber-500/30"
                    : "bg-gradient-to-r from-purple-500 to-purple-400 shadow-purple-500/30"
                    }`}>
                    <Gem className="w-4 h-4 inline mr-1" /> BEST VALUE
                  </div>
                )}
                {selectedTier === "premium" && !isHybrid && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/30">
                    <Zap className="w-4 h-4 inline mr-1" /> AUTO PG
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${isHybrid
                    ? selectedTier === "premium" ? "bg-amber-500/10" : "bg-purple-500/10"
                    : selectedTier === "premium" ? "bg-amber-500/10" : "bg-emerald-500/10"
                    }`}>
                    <PlanIcon className={`w-5 h-5 ${isHybrid
                      ? selectedTier === "premium" ? "text-amber-400" : "text-purple-400"
                      : selectedTier === "premium" ? "text-amber-400" : "text-emerald-400"
                      }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-display">
                      EduVera {meta.title}
                    </h3>
                    <p className="text-xs text-slate-500 capitalize">{selectedTier}</p>
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-6">{meta.description}</p>

                {/* Pricing Block */}
                <div className="mb-6 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                  {/* Savings badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium animate-pulse">
                      Hemat {savingsPercent}%
                    </span>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                      {formattedPrice(savings)}
                    </span>
                  </div>

                  {/* Original price (strikethrough) */}
                  <div className="text-slate-500 text-sm mb-1">
                    <span className="line-through">{(originalPrice / 1000).toLocaleString("id-ID")}K</span>
                    <span className="ml-2 text-red-400 font-medium">-{savingsPercent}%</span>
                  </div>

                  {/* Current price */}
                  <div className="flex items-baseline gap-1">
                    <span className={`text-sm font-bold ${selectedTier === "premium" ? "text-amber-400" : "text-emerald-400"}`}>Rp</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${planId}-${selectedTier}-${billing}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-4xl font-bold text-white font-display"
                      >
                        {(price / 1000).toLocaleString("id-ID")}K
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-slate-500 text-sm">/{isAnnual ? "tahun" : "bulan"}</span>
                  </div>

                  {/* Daily price breakdown */}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className={`font-bold text-base ${selectedTier === "premium" ? "text-amber-400" : "text-emerald-400"}`}>
                        Rp {daily.toLocaleString("id-ID")}
                      </span>
                      <span>/hari</span>
                    </span>
                    <span className="text-slate-500">—</span>
                    <span className="italic flex items-center gap-1"><Coffee className="w-3 h-3" /> Harga secangkir kopi</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {meta.features[selectedTier].map((feature, j) => (
                    <li key={j} className="flex items-center text-sm text-slate-300">
                      <Check className={`w-4 h-4 mr-2 flex-shrink-0 ${selectedTier === "premium" ? "text-amber-400" : "text-emerald-400"
                        }`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href={`/register?plan=${planId}&tier=${selectedTier}&billing=${billing}`} className="w-full">
                  <Button
                    variant="default"
                    className={`w-full font-bold py-6 rounded-xl transition-all ${isHybrid
                      ? selectedTier === "premium"
                        ? "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 shadow-lg shadow-amber-500/20"
                        : "bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 shadow-lg shadow-purple-500/20"
                      : selectedTier === "premium"
                        ? "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 shadow-lg shadow-amber-500/20"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 shadow-lg shadow-emerald-500/20"
                      } text-white`}
                  >
                    Pilih {meta.title} {selectedTier === "premium" ? "Premium" : "Basic"}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tier Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="mt-12 text-center"
        >
          <p className="text-slate-400 text-sm mb-4">
            <Star className="w-4 h-4 inline mr-1 text-emerald-400" />
            <strong>Basic:</strong> Pembayaran {selectedTier === "basic" && isAnnual ? "SPP/Syahriah" : "SPP/Syahriah"} manual, approve oleh admin
          </p>
          <p className="text-slate-400 text-sm">
            <Zap className="w-4 h-4 inline mr-1 text-amber-400" />
            <strong>Premium:</strong> Pembayaran otomatis via GoPay, OVO, DANA, Transfer Bank, QRIS
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="mt-12 flex flex-wrap justify-center gap-6 lg:gap-12"
        >
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-5 h-5 text-emerald-400" />
            <span className="text-sm"><strong className="text-white">500+</strong> Lembaga Terdaftar</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-sm"><strong className="text-white">99.9%</strong> Uptime Terjamin</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-sm"><strong className="text-white">24/7</strong> Support Premium</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
