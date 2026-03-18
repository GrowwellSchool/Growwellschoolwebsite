'use client'

import Component from "./animated-carousel";

export default function OrbitCarousel({
  images,
  fit,
}: {
  images: { id: number; url: string; label?: string }[];
  fit?: "cover" | "contain";
}) {
  return <Component images={images} fit={fit} />;
}
