import type { Metadata } from "next";
import BlogsPage from "@/features/site/blogs/BlogsPage";

export const metadata: Metadata = {
  title: "Blogs",
};

export default function Page() {
  return <BlogsPage />;
}

