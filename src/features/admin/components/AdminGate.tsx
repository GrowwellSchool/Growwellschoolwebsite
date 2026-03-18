"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { isAdminUser } from "@/features/admin/auth/adminAuth";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

type GateState = { status: "checking" } | { status: "allowed"; session: Session } | { status: "blocked" };

let adminAuthorizationCache: { userId: string; authorized: boolean } | null = null;
let adminAuthorizationInFlight: { userId: string; promise: Promise<boolean> } | null = null;

async function getAdminAuthorization(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  user: User,
): Promise<boolean> {
  if (adminAuthorizationCache?.userId === user.id) return adminAuthorizationCache.authorized;
  if (adminAuthorizationInFlight?.userId === user.id) return adminAuthorizationInFlight.promise;

  const promise = (async () => {
    if (isAdminUser(user)) return true;

    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (error) return false;
    return profile?.role === "admin";
  })()
    .then((authorized) => {
      adminAuthorizationCache = { userId: user.id, authorized };
      if (adminAuthorizationInFlight?.userId === user.id) adminAuthorizationInFlight = null;
      return authorized;
    })
    .catch(() => {
      adminAuthorizationCache = { userId: user.id, authorized: false };
      if (adminAuthorizationInFlight?.userId === user.id) adminAuthorizationInFlight = null;
      return false;
    });

  adminAuthorizationInFlight = { userId: user.id, promise };
  return promise;
}

export default function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<GateState>({ status: "checking" });
  const checkSeq = useRef(0);

  const isLoginRoute = useMemo(() => pathname === "/admin/login", [pathname]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    const check = async (sessionOverride?: Session | null) => {
      const seq = ++checkSeq.current;

      const { data, error } =
        sessionOverride === undefined ? await supabase.auth.getSession() : { data: null, error: null };
      const session = sessionOverride === undefined ? (data?.session ?? null) : sessionOverride;

      if (cancelled || seq !== checkSeq.current) return;

      if (error || !session) {
        adminAuthorizationCache = null;
        adminAuthorizationInFlight = null;
        setState({ status: "blocked" });
        if (!isLoginRoute) router.replace("/admin/login");
        return;
      }

      if (adminAuthorizationCache?.userId !== session.user.id) {
        adminAuthorizationCache = null;
        adminAuthorizationInFlight = null;
      }

      const authorized = await getAdminAuthorization(supabase, session.user);

      if (cancelled || seq !== checkSeq.current) return;

      if (!authorized) {
        await supabase.auth.signOut();
        if (cancelled || seq !== checkSeq.current) return;

        adminAuthorizationCache = null;
        adminAuthorizationInFlight = null;
        setState({ status: "blocked" });
        if (!isLoginRoute) router.replace("/admin/login");
        return;
      }

      setState({ status: "allowed", session });
      if (isLoginRoute) router.replace("/admin");
    };

    supabase.auth.getSession().then(({ data }) => {
      check(data.session ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session ?? null);
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
