"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

type NewsFit = "cover" | "contain";

type NewsItem = {
  id: string;
  tag: string;
  date: string;
  title: string;
  desc: string;
  image: string;
};

function withImageVersion(url: string | undefined | null, version?: string | number | null): string {
  if (!url || !url.trim()) return "";
  const base = url.trim().split("?")[0];
  const v = version ?? Date.now();
  return `${base}?v=${encodeURIComponent(String(v))}`;
}

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = useMemo(() => {
    try {
      return decodeURIComponent(params.id);
    } catch {
      return params.id;
    }
  }, [params.id]);

  const [fit] = useState<NewsFit>("contain");
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: dbItem } = await supabase.from("news").select("*").eq("id", id).maybeSingle();

        if (cancelled) return;

        if (dbItem) {
          setItem({
            id: dbItem.id,
            tag: dbItem.tag || "Update",
            date: dbItem.date || "—",
            title: dbItem.title || "",
            desc: dbItem.excerpt || "",
            image: withImageVersion(dbItem.image, dbItem.updated_at),
          });
        } else {
          setItem(null);
        }
      } catch {
        if (cancelled) return;
        setItem(null);
      }
      setLoading(false);
    };

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("news-detail-item")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "news", filter: `id=eq.${id}` },
        () => { if (!cancelled) load(); }
      )
      .subscribe();

    load();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [id]);

  return (
    <main className="bg-white">
      <section className="relative bg-school-dark text-white py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <div
          className="absolute bottom-0 left-0 right-0 h-20 bg-white pointer-events-none"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto flex flex-col items-center text-center"
          >
            <span className="inline-block bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-5">
              Updates
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-heading font-black mb-4 leading-tight break-words max-w-4xl">
              News & Announcements
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto font-medium">
              Stay updated with school notices, key dates and highlights from Growwell School.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pt-6 pb-16 bg-white pattern-grid">
        <div className="max-w-6xl mx-auto px-4">
          {!loading && !item ? (
            <div className="rounded-3xl border border-black/10 bg-white p-10 text-center">
              <div className="text-school-dark font-heading font-black text-2xl">Announcement not found</div>
              <div className="text-sm text-gray-600 mt-2">Please go back to the News page and try another post.</div>
            </div>
          ) : null}

          {item ? (
            <div className="rounded-3xl border border-black/10 bg-white shadow-xl overflow-hidden">
              <div className="relative bg-school-dark h-[250px] sm:h-[350px] lg:h-[500px] overflow-hidden">
                {item.image ? (
                  fit === "contain" ? (
                    <>
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover scale-110 blur-2xl"
                        aria-hidden
                        priority
                      />
                      <div className="absolute inset-0 bg-school-dark/40" />
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="100vw"
                        className="object-contain"
                        priority
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="100vw"
                        className="object-contain"
                        priority
                      />
                      <div className="absolute inset-0 bg-school-dark/35" />
                    </>
                  )
                ) : null}

              </div>

              <div className="p-6 md:p-10">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                    {item.tag}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {item.date}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-heading font-black leading-tight text-gray-900 max-w-4xl mb-6 break-words">
                  {item.title}
                </h1>
                <div className="w-full overflow-hidden">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px] md:text-base break-words overflow-hidden">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
