import type { Metadata } from "next";
import NewsPage from "@/features/site/news/NewsPage";

export const metadata: Metadata = {
  title: "News & Announcements",
};

export default function Page() {
  return <NewsPage />;
}
