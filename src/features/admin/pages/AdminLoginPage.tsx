"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0 && !submitting,
    [email, password, submitting],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const user = data.user ?? null;

      if (!user) {
        await supabase.auth.signOut();
        setErrorMessage("Not authorized");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        setErrorMessage("Not authorized");
        return;
      }

      router.replace("/admin");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-school-gold/30 rounded-3xl overflow-hidden shadow-2xl">
        <div className="h-2 flex">
          <div className="flex-1 bg-school-green" />
          <div className="flex-1 bg-school-gold" />
          <div className="flex-1 bg-school-orange" />
          <div className="flex-1 bg-school-blue" />
          <div className="flex-1 bg-school-purple" />
        </div>
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-school-green/10 border border-school-green/20 flex items-center justify-center overflow-hidden">
              <Image src="/images/logo.png" alt="Growwell School" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <div className="text-school-dark font-heading font-black text-xl leading-none">Admin Panel</div>
              <div className="text-school-green text-xs tracking-widest mt-1">GROWWELL SCHOOL</div>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4">Login with your admin email and password.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8">
          <label htmlFor="admin-email" className="block text-sm text-gray-700 mb-2">
            Email
          </label>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5 focus-within:border-school-green/60">
            <Mail size={18} className="text-school-green" />
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              className="w-full bg-transparent outline-none text-school-dark placeholder:text-gray-400 text-sm"
              required
            />
          </div>

          <label htmlFor="admin-password" className="block text-sm text-gray-700 mb-2">
            Password
          </label>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 focus-within:border-school-green/60">
            <Lock size={18} className="text-school-gold" />
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full bg-transparent outline-none text-school-dark placeholder:text-gray-400 text-sm"
              required
            />
          </div>

          {errorMessage ? (
            <div className="mb-5 bg-school-red/10 border border-school-red/30 text-school-dark text-sm rounded-xl px-4 py-3">
              {errorMessage}
            </div>
          ) : null}

          <button type="submit" className="btn-primary w-full justify-center" disabled={!canSubmit}>
            {submitting ? "Signing in…" : "Sign In"}
          </button>

          <div className="text-gray-500 text-xs mt-5 text-center">
            Protected area. Unauthorized accounts will be signed out automatically.
          </div>
        </form>
      </div>
    </div>
  );
}
