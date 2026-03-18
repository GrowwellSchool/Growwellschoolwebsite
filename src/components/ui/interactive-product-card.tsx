"use client";

import React from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

type StarRatingProps = {
  rating: number;
  reviewCount: number;
};

function StarRating({ rating, reviewCount }: StarRatingProps) {
  return (
    <div role="img" aria-label={`${rating} out of 5 stars`} className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={cn("h-4 w-4", i < rating ? "text-school-gold fill-school-gold" : "text-gray-600")} />
      ))}
      <span className="text-xs text-slate-400 ml-2">({reviewCount} reviews)</span>
    </div>
  );
}

export type InteractiveProductCardProduct = {
  imageUrl: string;
  altText: string;
  title: string;
  category: string;
  rating: number;
  reviewCount: number;
  price?: number;
};

type InteractiveProductCardProps = {
  product: InteractiveProductCardProduct;
  actionLabel?: string;
};

export default function InteractiveProductCard({ product, actionLabel = "Read more" }: InteractiveProductCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30, bounce: 0.2 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30, bounce: 0.2 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const spotlight = useTransform([mouseXSpring, mouseYSpring], (latest) => {
    const px = Number((latest as unknown[])[0] ?? 0);
    const py = Number((latest as unknown[])[1] ?? 0);
    return `radial-gradient(400px circle at ${px * 175 + 175}px ${py * 225 + 225}px, rgba(255, 215, 0, 0.18), transparent 80%)`;
  });

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative w-full max-w-xs h-[480px] rounded-2xl bg-gradient-to-br from-school-dark to-[#0b1220]"
    >
      <div
        style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
        className="absolute inset-5 flex flex-col justify-between p-6 rounded-xl bg-black/35 backdrop-blur-md border border-white/10"
      >
        <motion.div style={{ transform: "translateZ(50px)" }} className="relative h-48">
          <img
            src={product.imageUrl}
            alt={product.altText}
            className="w-full h-full object-contain drop-shadow-2xl"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/400x200/0b1220/ffffff?text=Image";
            }}
          />
        </motion.div>

        <div style={{ transform: "translateZ(40px)" }}>
          <h2 className="text-2xl font-bold text-white">{product.title}</h2>
          <p className="text-sm text-slate-300 mb-2">{product.category}</p>
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>

        <div style={{ transform: "translateZ(30px)" }} className="flex items-center justify-between gap-4">
          {typeof product.price === "number" ? (
            <p className="text-3xl font-bold text-white">₹{product.price.toFixed(2)}</p>
          ) : (
            <div className="text-sm text-slate-300 font-semibold">{actionLabel}</div>
          )}
          <motion.button
            aria-label={actionLabel}
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-school-green text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-school-gold focus:ring-offset-2 focus:ring-offset-school-dark"
          >
            <ArrowRight className="h-6 w-6" />
          </motion.button>
        </div>
      </div>

      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
    </motion.div>
  );
}
