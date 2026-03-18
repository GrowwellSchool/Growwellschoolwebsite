"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

type GateState = { status: "checking" } | { status: "allowed"; session: Session } | { status: "blocked" };

export default function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<GateState>({ status: "checking" });

  const isLoginRoute = useMemo(() => pathname === "/admin/login", [pathname]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    const isAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) return false;
      return profile?.role === "admin";
    };

    const check = async () => {
      const { data, error } = await supabase.auth.getSession();
      const session = data.session ?? null;

      if (cancelled) return;

      if (error || !session) {
        setState({ status: "blocked" });
        if (!isLoginRoute) router.replace("/admin/login");
        return;
      }

      const authorized = await isAdmin();

      if (!authorized) {
        await supabase.auth.signOut();

        setState({ status: "blocked" });
        if (!isLoginRoute) router.replace("/admin/login");
        return;
      }

      setState({ status: "allowed", session });
      if (isLoginRoute) router.replace("/admin");
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [isLoginRoute, router]);

  if (isLoginRoute) return children;

  if (state.status !== "allowed") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 text-center shadow-xl">
          <div className="text-school-gold font-heading font-black text-2xl mb-2">Checking access…</div>
          <div className="text-gray-600 text-sm">Please wait.</div>
        </div>
      </div>
    );
  }

  return children;
}
