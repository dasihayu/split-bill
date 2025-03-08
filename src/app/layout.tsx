// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Split Bill App",
  description: "Aplikasi Split Bill seperti Line",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
          <Toaster position="top-center" richColors />
        </main>
      </body>
    </html>
  );
}