import type { Metadata } from "next";
import AdminLoginPage from "@/features/admin/pages/AdminLoginPage";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function Page() {
  return <AdminLoginPage />;
}
