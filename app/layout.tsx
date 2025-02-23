import { Inter } from "next/font/google";
import "./globals.css";
import "@/lib/db";
import "@/types";
import { SettingsProvider } from "@/lib/providers/SettingsProvider";

import type React from "react";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} h-full overflow-hidden flex flex-col`}
      >
        <SettingsProvider>
          <Header />
          <main className="flex-1 overflow-hidden">{children}</main>
        </SettingsProvider>
      </body>
    </html>
  );
}

import "./globals.css";
