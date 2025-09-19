import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PomodoroProvider } from "./providers/PomodoroProvider";
import { FloatingPomodoroWidget } from "./components/pomodoro/FloatingPomodoroWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AllRole Hub",
  description: "Landing utama untuk mengelola seluruh halaman dan eksperimen berbasis Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <PomodoroProvider>
          {children}
          <FloatingPomodoroWidget />
        </PomodoroProvider>
      </body>
    </html>
  );
}
