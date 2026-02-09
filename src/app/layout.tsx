import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastContainer } from "@/components/ui/Toast";
import OfflineIndicator from "@/components/OfflineIndicator";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "EduVera - Sistem Manajemen Pendidikan Sekolah & Pesantren #1",
  description: "Platform SaaS all-in-one untuk manajemen akademik, keuangan SPP, e-rapor digital, dan administrasi sekolah & pesantren. Mulai dari Rp 8.000/hari. Pembayaran online otomatis via GoPay, OVO, DANA, QRIS.",
  keywords: [
    "sistem manajemen sekolah",
    "aplikasi pesantren",
    "software pendidikan",
    "e-rapor digital",
    "pembayaran SPP online",
    "manajemen santri",
    "administrasi sekolah",
    "SaaS pendidikan Indonesia"
  ],
  authors: [{ name: "EduVera" }],
  creator: "EduVera",
  publisher: "VeLora",
  metadataBase: new URL("https://eduvera.ve-lora.my.id"),
  alternates: {
    canonical: "https://eduvera.ve-lora.my.id",
  },
  openGraph: {
    title: "EduVera - Sistem Manajemen Pendidikan Terpadu",
    description: "Platform digital #1 untuk sekolah & pesantren modern. Manajemen akademik, keuangan, dan administrasi dalam satu platform.",
    url: "https://eduvera.ve-lora.my.id",
    siteName: "EduVera",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EduVera - Sistem Manajemen Pendidikan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduVera - Sistem Manajemen Pendidikan",
    description: "Platform all-in-one untuk sekolah & pesantren. Mulai dari Rp 8.000/hari.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`antialiased min-h-screen bg-slate-950 text-slate-100`}
        suppressHydrationWarning
      >
        {/* Background decoration */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-emerald-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-sky-500/5 rounded-full blur-[120px]"></div>
        </div>
        <AuthProvider>
          <div className="relative z-10">
            {children}
          </div>
          <ToastContainer />
          <OfflineIndicator />
        </AuthProvider>
      </body>
    </html>
  );
}

