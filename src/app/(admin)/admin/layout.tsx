"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import AdminGate from "@/features/admin/components/AdminGate";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const [isAuthed, setIsAuthed] = useState(false);
  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    const sync = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setIsAuthed(Boolean(data.session));
    };

    sync();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      sync();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const linkClass = (isActive: boolean) =>
    `px-4 py-2 rounded-md font-medium text-sm font-heading transition-all duration-200 relative group ${
      isActive ? "text-white bg-school-green" : "text-gray-700 hover:text-school-green hover:bg-green-50"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 text-school-dark pattern-grid flex flex-col">
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-lg border-b-4 border-school-gold" : "bg-white border-b-4 border-school-gold"}`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Growwell School Logo"
                width={64}
                height={64}
                className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-md"
                priority
              />
              <div>
                <div className="text-school-green font-heading font-black text-xl leading-tight tracking-wide">
                  GROWWELL
                </div>
                <div className="text-school-gold font-heading font-semibold text-xs tracking-widest uppercase">
                  Admin Panel
                </div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {!isLoginRoute && isAuthed ? (
                <Link href="/admin" className={linkClass(pathname === "/admin")}>
                  Dashboard
                  {pathname !== "/admin" && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-school-gold group-hover:w-4/5 transition-all duration-300 rounded-full" />
                  )}
                </Link>
              ) : null}

              {!isAuthed ? (
                <Link href="/admin/login" className={linkClass(pathname === "/admin/login")}>
                  Login
                  {pathname !== "/admin/login" && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-school-gold group-hover:w-4/5 transition-all duration-300 rounded-full" />
                  )}
                </Link>
              ) : null}

              <Link href="/" className="ml-3 btn-secondary text-sm py-2 px-5 rounded-md">
                Back to Website
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-md text-school-green border border-school-green"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isOpen ? (
          <div className="md:hidden overflow-hidden bg-white border-t-2 border-school-gold">
            <div className="px-4 py-4 flex flex-col gap-2">
              {!isLoginRoute && isAuthed ? (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-md font-heading font-medium text-base ${
                    pathname === "/admin"
                      ? "bg-school-green text-white"
                      : "text-gray-700 bg-gray-50 hover:bg-green-50 hover:text-school-green"
                  }`}
                >
                  Dashboard
                </Link>
              ) : null}

              {!isAuthed ? (
                <Link
                  href="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-md font-heading font-medium text-base ${
                    pathname === "/admin/login"
                      ? "bg-school-green text-white"
                      : "text-gray-700 bg-gray-50 hover:bg-green-50 hover:text-school-green"
                  }`}
                >
                  Login
                </Link>
              ) : null}

              <Link href="/" onClick={() => setIsOpen(false)} className="btn-secondary text-center justify-center mt-2">
                Back to Website
              </Link>
            </div>
          </div>
        ) : null}
      </nav>

      <div className="w-full px-4 py-6 flex-1">
        <AdminGate>{children}</AdminGate>
      </div>
    </div>
  );
}
