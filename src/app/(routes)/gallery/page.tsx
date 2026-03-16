import type { Metadata } from "next";
import GalleryPage from "@/features/site/gallery/GalleryPage";

export const metadata: Metadata = {
  title: "Gallery",
};

export default function Page() {
  return <GalleryPage />;
}

