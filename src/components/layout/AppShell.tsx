"use client";

import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SiteSettingsProvider } from "@/lib/supabase/SiteSettingsContext";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <SiteSettingsProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SiteSettingsProvider>
  );
}
