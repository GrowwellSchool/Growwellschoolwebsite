import type { Metadata } from "next";
import HomePage from "@/features/site/home/HomePage";

export const metadata: Metadata = {
  title: "Home",
};

export default function Page() {
  return <HomePage />;
}

