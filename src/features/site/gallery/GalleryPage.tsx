"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

type GalleryFit = "cover" | "contain";
type GalleryItem = {
  id: string;
  src: string;
  cat: string;
  title: string;
  desc: string;
  fit: GalleryFit;
};
type GalleryCategory = { id: string; label: string };

const BADGE_COLORS: { bg: string; text: string }[] = [
  { bg: "bg-school-green", text: "text-white" },
  { bg: "bg-school-gold", text: "text-school-dark" },
  { bg: "bg-school-orange", text: "text-white" },
  { bg: "bg-school-blue", text: "text-white" },
  { bg: "bg-school-purple", text: "text-white" },
  { bg: "bg-school-teal", text: "text-white" },
  { bg: "bg-school-red", text: "text-white" },
];

function PageHero() {
  return (
    <section className="relative bg-school-dark text-white py-24 overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20" />
      <div
        className="absolute bottom-0 left-0 right-0 h-20 bg-white"
        style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
      />
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-5">
            Our Gallery
          </span>
          <h1 className="text-4xl lg:text-6xl font-heading font-black mb-4">Life at Growwell School</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Moments that capture the spirit, joy and learning of our vibrant school community.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

const PAGE_SIZE = 12;

export default function GalleryPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>([
    { id: "all", label: "All Activities" },
  ]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [activecat, setActivecat] = useState("all");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);

  // Refs so IntersectionObserver always sees the latest values (no stale closures)
  const fetchingRef = useRef(false);
  const fetchingCatsRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const activecatRef = useRef(activecat);

  // Keep refs in sync with state
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { activecatRef.current = activecat; }, [activecat]);

  // Ref for the "Load More" sentinel
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // ─── Fetch categories from the galleries table ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const loadCats = async () => {
      setCatLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();
        // Fetch cat and cat_label from the galleries table
        const { data, error } = await supabase
          .from("galleries")
          .select("cat, cat_label")
          .order("cat", { ascending: true });

        if (cancelled || error || !data) return;

        // Build a label map: pick the first non-empty cat_label for each cat
        const labelMap: Record<string, string> = {};
        for (const row of data) {
          const cat = row.cat as string;
          if (!cat) continue;
          if (!labelMap[cat] && row.cat_label && (row.cat_label as string).trim()) {
            labelMap[cat] = (row.cat_label as string).trim();
          }
        }

        const uniqueCats = Array.from(new Set(data.map((d) => d.cat as string))).filter(Boolean);
        const mapped: GalleryCategory[] = [
          { id: "all", label: "All Activities" },
          ...uniqueCats.map((cat) => ({
            id: cat,
            label: labelMap[cat] || cat.charAt(0).toUpperCase() + cat.slice(1).replace(/[-_]/g, " "),
          })),
        ];

        if (!cancelled) setCategories(mapped);
      } finally {
        fetchingCatsRef.current = false;
        if (!cancelled) setCatLoading(false);
      }
    };
    loadCats();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Core fetch function ────────────────────────────────────────────────────
  const fetchItems = useCallback(
    async (currentPage: number, catOverride: string, isAppending: boolean) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();
        let query = supabase.from("galleries").select("*", { count: "exact" });

        if (catOverride !== "all") {
          query = query.eq("cat", catOverride);
        }

        query = query.order("created_at", { ascending: false });

        const from = currentPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (!error && data) {
          const mapped: GalleryItem[] = data.map((d: any) => ({
            id: d.id,
            src: d.src,
            cat: d.cat,
            title: d.title || "",
            desc: d.description || "",
            fit: (d.fit as GalleryFit) || "cover",
          }));
          if (isAppending) {
            setGalleryItems((prev) => [...prev, ...mapped]);
          } else {
            setGalleryItems(mapped);
          }
          setHasMore(count !== null && from + data.length < count);
        }
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    []
  );

  // ─── Reset & initial fetch when category changes ───────────────────────────
  useEffect(() => {
    setGalleryItems([]);
    setPage(0);
    pageRef.current = 0;
    setHasMore(true);
    hasMoreRef.current = true;
    fetchItems(0, activecat, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activecat]);

  // ─── Intersection Observer for infinite scroll ─────────────────────────────
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (!hasMoreRef.current || fetchingRef.current) return;
        const nextPage = pageRef.current + 1;
        pageRef.current = nextPage;
        setPage(nextPage);
        fetchItems(nextPage, activecatRef.current, true);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mounted once — reads fresh values from refs every time

  const badgeClassByCategory = useMemo(() => {
    const ids = categories.map((c) => c.id).filter((id) => id !== "all");
    const map = new Map<string, { bg: string; text: string }>();
    ids.forEach((id, idx) => {
      map.set(id, BADGE_COLORS[idx % BADGE_COLORS.length] ?? BADGE_COLORS[0]!);
    });
    return map;
  }, [categories]);

  return (
    <>
      <PageHero />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {catLoading ? (
              <div className="h-10 w-48 bg-gray-100 rounded-full animate-pulse" />
            ) : (
              categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActivecat(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-heading font-semibold text-sm transition-all duration-200 border-2
                    ${
                      activecat === cat.id
                        ? "bg-school-green text-white border-school-green shadow-lg scale-105"
                        : "bg-white text-gray-600 border-gray-200 hover:border-school-green hover:text-school-green"
                    }`}
                >
                  {cat.label}
                </button>
              ))
            )}
          </div>

          {/* Gallery Grid */}
          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            <AnimatePresence>
              {galleryItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ delay: Math.min(i, 8) * 0.05, duration: 0.4 }}
                  className="break-inside-avoid mb-5 bg-white rounded-2xl overflow-hidden shadow-md card-hover group cursor-pointer"
                  onClick={() => setLightbox(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setLightbox(item);
                  }}
                  aria-label={`Open ${item.title}`}
                >
                  <div className="img-zoom relative">
                    {item.fit === "contain" ? (
                      <>
                        <div
                          className="absolute inset-0 scale-110 blur-2xl"
                          aria-hidden
                          style={{
                            backgroundImage: `url(${item.src})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        <Image
                          src={item.src}
                          alt={item.title}
                          width={1200}
                          height={800}
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="relative w-full h-auto object-contain"
                        />
                      </>
                    ) : (
                      <Image
                        src={item.src}
                        alt={item.title}
                        width={1200}
                        height={800}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="w-full h-auto object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-school-dark/0 group-hover:bg-school-dark/40 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn
                        size={32}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span
                        className={`${badgeClassByCategory.get(item.cat)?.bg ?? "bg-school-green"} ${
                          badgeClassByCategory.get(item.cat)?.text ?? "text-white"
                        } text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded`}
                      >
                        {categories.find((c) => c.id === item.cat)?.label ?? item.cat}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-gray-800 text-sm">{item.title}</h3>
                    <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {!loading && galleryItems.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-heading">No images found in this category.</p>
            </div>
          )}

          {/* Infinite Scroll Sentinel */}
          <div ref={loadMoreRef} className="py-10 flex justify-center">
            {loading && (
              <div className="w-8 h-8 rounded-full border-4 border-school-green border-t-transparent animate-spin" />
            )}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${lightbox.title} preview`}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-3xl w-full bg-school-dark rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.src}
                alt={lightbox.title}
                width={1600}
                height={1000}
                sizes="90vw"
                className="w-full max-h-[70vh] object-contain"
              />
              <div className="p-5 flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-bold text-white text-lg">{lightbox.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{lightbox.desc}</p>
                </div>
                <button
                  onClick={() => setLightbox(null)}
                  className="ml-4 w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
