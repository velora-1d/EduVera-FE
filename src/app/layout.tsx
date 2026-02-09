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
  title: "EduVera - Sistem Manajemen Pendidikan",
  description: "Platform digital untuk manajemen sekolah dan pesantren modern",
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

