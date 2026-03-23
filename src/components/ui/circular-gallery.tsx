"use client";

import React, { useState, useEffect, useRef, type HTMLAttributes } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// A simple utility for conditional class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Define the type for a single gallery item
export interface GalleryItem {
  common: string;
  binomial: string;
  photo: {
    url: string;
    text: string;
    pos?: string;
    by: string;
  };
}

// Define the props for the CircularGallery component
interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Controls how far the items are from the center. */
  radius?: number;
  /** Controls the speed of auto-rotation when not scrolling. */
  autoRotateSpeed?: number;
  fit?: "cover" | "contain";
  /** External rotation offset for manual control */
  manualRotation?: number;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 600, autoRotateSpeed = 0.02, fit = "cover", manualRotation = 0, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const animationFrameRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastXRef = useRef(0);
    const velocityRef = useRef(0);

    // Effect for auto-rotation when not dragging
    useEffect(() => {
      const autoRotate = () => {
        if (!isDragging) {
          // Apply velocity with friction
          if (Math.abs(velocityRef.current) > 0.1) {
            setRotation((prev) => prev + velocityRef.current);
            velocityRef.current *= 0.95; // Friction
          } else {
            setRotation((prev) => prev + autoRotateSpeed);
          }
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isDragging, autoRotateSpeed]);

    // Mouse drag handlers
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        lastXRef.current = e.clientX;
        velocityRef.current = 0;
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastXRef.current;
        velocityRef.current = deltaX * 0.3;
        setRotation((prev) => prev + deltaX * 0.3);
        lastXRef.current = e.clientX;
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      // Touch handlers
      const handleTouchStart = (e: TouchEvent) => {
        setIsDragging(true);
        lastXRef.current = e.touches[0].clientX;
        velocityRef.current = 0;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - lastXRef.current;
        velocityRef.current = deltaX * 0.3;
        setRotation((prev) => prev + deltaX * 0.3);
        lastXRef.current = e.touches[0].clientX;
      };

      const handleTouchEnd = () => {
        setIsDragging(false);
      };

      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }, [isDragging]);

    const anglePerItem = 360 / items.length;

    const rotateLeft = () => {
      setRotation((prev) => prev - anglePerItem);
    };

    const rotateRight = () => {
      setRotation((prev) => prev + anglePerItem);
    };

    return (
      <div className="relative w-full h-full">
        <div
          ref={(node) => {
            // Handle both refs
            (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          role="region"
          aria-label="Circular 3D Gallery - drag to rotate"
          className={cn(
            "relative w-full h-full flex items-center justify-center select-none touch-none",
            isDragging ? "cursor-grabbing" : "cursor-grab",
            className
          )}
          style={{ perspective: "2000px", pointerEvents: "auto" as const }}
          {...props}
        >
          {/* Left rotation button - desktop */}
          <button
            onClick={rotateLeft}
            aria-label="Rotate left"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full items-center justify-center text-white hover:bg-school-gold hover:text-black transition-all pointer-events-auto"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Right rotation button - desktop */}
          <button
            onClick={rotateRight}
            aria-label="Rotate right"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full items-center justify-center text-white hover:bg-school-gold hover:text-black transition-all pointer-events-auto"
          >
            <ChevronRight size={24} />
          </button>
          <div
            className="relative w-full h-full pointer-events-none"
            style={{
              transform: `rotateY(${rotation + manualRotation}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {items.map((item, i) => {
              const itemAngle = i * anglePerItem;
              const totalRotation = rotation % 360;
              const relativeAngle = (itemAngle + totalRotation + 360) % 360;
              const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
              const opacity = Math.max(0.3, 1 - normalizedAngle / 180);

              return (
              <div
                key={item.photo.url}
                role="group"
                aria-label={item.common}
                className="absolute w-[180px] h-[240px] md:w-[300px] md:h-[400px] ml-[-90px] mt-[-120px] md:ml-[-150px] md:mt-[-200px]"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: "50%",
                  top: "50%",
                  opacity: opacity,
                  transition: "opacity 0.3s linear",
                }}
              >
                <div className="relative w-full h-full rounded-lg shadow-2xl overflow-hidden group border border-border bg-card/70 dark:bg-card/30 backdrop-blur-lg">
                  {item.photo.url ? (
                    fit === "contain" ? (
                      <>
                        <Image
                          src={item.photo.url}
                          alt=""
                          fill
                          sizes="300px"
                          quality={100}
                          className="object-cover scale-110 blur-2xl"
                          style={{ objectPosition: item.photo.pos || "center" }}
                          aria-hidden
                        />
                        <Image
                          src={item.photo.url}
                          alt={item.photo.text}
                          fill
                          sizes="300px"
                          quality={100}
                          className="object-contain"
                          style={{ objectPosition: item.photo.pos || "center" }}
                        />
                      </>
                    ) : (
                      <Image
                        src={item.photo.url}
                        alt={item.photo.text}
                        fill
                        sizes="300px"
                        quality={100}
                        className="object-cover"
                        style={{ objectPosition: item.photo.pos || "center" }}
                      />
                    )
                  ) : null}
                  {/* Replaced text-primary-foreground with text-white for consistent color */}
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <h2 className="text-xl font-bold">{item.common}</h2>
                    <em className="text-sm italic opacity-80">{item.binomial}</em>
                    <p className="text-xs mt-2 opacity-70">Photo by: {item.photo.by}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
  },
);

CircularGallery.displayName = "CircularGallery";

export { CircularGallery };
