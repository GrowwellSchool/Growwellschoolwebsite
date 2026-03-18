import type { Metadata } from "next";
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";

export const metadata: Metadata = {
  title: "Admin",
};

export default function Page() {
  return <AdminDashboardPage />;
}
