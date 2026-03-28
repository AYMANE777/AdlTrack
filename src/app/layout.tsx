import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import ErrorReporter from "@/components/ErrorReporter";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "نظام تتبع للعقوبة البديلة و طلبات رد الاعتبار",
  description: "نظام تتبع للعقوبة البديلة و طلبات رد الاعتبار",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={`${cairo.className} antialiased`}>
    
        <ErrorReporter />
      
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
        </body>
    </html>
  );
}
