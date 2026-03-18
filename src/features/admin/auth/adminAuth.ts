import type { User } from "@supabase/supabase-js";

function parseAdminEmails(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;

  const appMetadata = (user.app_metadata ?? {}) as Record<string, unknown>;
  const userMetadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  const role = appMetadata.role ?? userMetadata.role;
  if (role === "admin") return true;

  const isAdmin = appMetadata.is_admin ?? userMetadata.is_admin;
  if (isAdmin === true) return true;

  const allowedEmailsRaw = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  if (!allowedEmailsRaw) return false;

  const allowedEmails = parseAdminEmails(allowedEmailsRaw);
  if (!user.email) return false;

  return allowedEmails.includes(user.email.toLowerCase());
}
