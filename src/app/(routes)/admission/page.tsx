import type { Metadata } from "next";
import AdmissionPage from "@/features/site/admission/AdmissionPage";

export const metadata: Metadata = {
  title: "Admission",
};

export default function Page() {
  return <AdmissionPage />;
}

