"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

const GALLERY_PAGE_KEY = "gallery.page";

type GalleryFit = "cover" | "contain";
type GalleryItem = { id: string; src: string; cat: string; title: string; desc: string; fit: GalleryFit };
type GalleryCategory = { id: string; label: string; fit: GalleryFit };

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

export default function GalleryPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>([
    { id: "all", label: "All Activities", fit: "cover" },
  ]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [activecat, setActivecat] = useState("all");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const ref = useRef(null);
  useInView(ref, { once: true });

  useEffect(() => {
    let cancelled = false;

    const applySetting = (raw: unknown, versionFromRow: unknown) => {
      const versionFromValue = typeof raw === "object" && raw ? (raw as { version?: unknown }).version : undefined;
      const version =
        typeof versionFromValue === "string" || typeof versionFromValue === "number"
          ? String(versionFromValue)
          : typeof versionFromRow === "string" || typeof versionFromRow === "number"
            ? String(versionFromRow)
            : String(Date.now());

      const addVersion = (url: string) => {
        const trimmed = url.trim();
        if (trimmed.length === 0) return "";
        const base = trimmed.split("?")[0];
        if (!base.startsWith("http")) return base;
        return `${base}?v=${encodeURIComponent(version)}`;
      };

      const sections =
        typeof raw === "object" && raw && Array.isArray((raw as { sections?: unknown }).sections)
          ? ((raw as { sections: unknown[] }).sections as unknown[])
          : [];

      const mappedCats: GalleryCategory[] = [{ id: "all", label: "All Activities", fit: "cover" }];
      const mappedItems: GalleryItem[] = [];

      sections.forEach((s) => {
        const obj = typeof s === "object" && s ? (s as Record<string, unknown>) : null;
        const id = typeof obj?.id === "string" ? obj.id.trim() : "";
        if (id.length === 0) return;
        const label =
          typeof obj?.label === "string" ? obj.label.trim() : typeof obj?.title === "string" ? obj.title.trim() : "";
        const fit: GalleryFit = obj?.fit === "contain" ? "contain" : "cover";
        mappedCats.push({ id, label: label.length > 0 ? label : "Section", fit });

        const itemsRaw = Array.isArray(obj?.items)
          ? (obj?.items as unknown[])
          : Array.isArray(obj?.images)
            ? (obj?.images as unknown[])
            : [];
        itemsRaw.forEach((it, idx) => {
          const io = typeof it === "object" && it ? (it as Record<string, unknown>) : null;
          const iid = typeof io?.id === "string" ? io.id.trim() : `${id}-${idx + 1}`;
          const srcRaw =
            typeof io?.src === "string"
              ? io.src
              : typeof io?.url === "string"
                ? io.url
                : typeof io?.image === "string"
                  ? io.image
                  : "";
          const src = addVersion(String(srcRaw));
          if (src.trim().length === 0) return;
          const title = typeof io?.title === "string" ? io.title : typeof io?.common === "string" ? io.common : "";
          const desc = typeof io?.desc === "string" ? io.desc : typeof io?.details === "string" ? io.details : "";
          mappedItems.push({ id: iid, src, cat: id, title: String(title), desc: String(desc), fit });
        });
      });

      if (cancelled) return;
      setCategories(mappedCats);
      setGalleryItems(mappedItems);
      setActivecat((prev) => (prev !== "all" && !mappedCats.some((c) => c.id === prev) ? "all" : prev));
      setLightbox((prev) => (prev && !mappedItems.some((i) => i.id === prev.id) ? null : prev));
    };

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("value, updated_at")
          .eq("key", GALLERY_PAGE_KEY)
          .maybeSingle();
        if (cancelled || error || !data?.value) return;
        const value = data.value as unknown;
        const version = (value as { version?: unknown } | null)?.version ?? data.updated_at ?? Date.now();
        applySetting(value, version);
      } catch {
        return;
      }
    };

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("gallery-page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: `key=eq.${GALLERY_PAGE_KEY}` },
        (payload) => {
          if (cancelled) return;
          const row = (payload as { new?: { value?: unknown; updated_at?: unknown } }).new;
          const commitTimestamp = (payload as { commit_timestamp?: unknown }).commit_timestamp;
          const version =
            (row?.value as { version?: unknown } | null)?.version ?? commitTimestamp ?? row?.updated_at ?? Date.now();
          applySetting(row?.value, version);
        },
      )
      .subscribe();

    load();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = activecat === "all" ? galleryItems : galleryItems.filter((g) => g.cat === activecat);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: galleryItems.length };
    galleryItems.forEach((g) => {
      counts[g.cat] = (counts[g.cat] || 0) + 1;
    });
    return counts;
  }, [galleryItems]);

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

      <section className="py-16 bg-white" ref={ref}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
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
                <span
                  className={`text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold
                  ${activecat === cat.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  {catCounts[cat.id] || 0}
                </span>
              </button>
            ))}
          </div>

          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
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
                        {categories.find((c) => c.id === item.cat)?.label}
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
        </div>
      </section>

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
