"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

const BLOGS_PAGE_KEY = "blogs.page";

type BlogFit = "cover" | "contain";

type BlogItem = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  cat: string;
  img: string;
  readTime: string;
  catColor: string;
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = useMemo(() => {
    try {
      return decodeURIComponent(params.id);
    } catch {
      return params.id;
    }
  }, [params.id]);

  const [fit, setFit] = useState<BlogFit>("cover");
  const [item, setItem] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);

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

      const normalizeUrl = (url: string) => {
        const trimmed = url.trim();
        if (trimmed.length === 0) return "";
        const base = trimmed.split("?")[0];
        if (!base.startsWith("http")) return base;
        return `${base}?v=${encodeURIComponent(version)}`;
      };

      const loadedFit: BlogFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";

      const itemsRaw =
        typeof raw === "object" && raw && Array.isArray((raw as { items?: unknown }).items)
          ? ((raw as { items: unknown[] }).items as unknown[])
          : [];

      const mapped = itemsRaw.map((row, idx) => {
        const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
        const rowId =
          typeof obj?.id === "string"
            ? obj.id.trim()
            : typeof obj?.id === "number"
              ? String(obj.id)
              : `blog-${idx + 1}`;

        const title = typeof obj?.title === "string" ? obj.title.trim() : "";
        const excerpt = typeof obj?.excerpt === "string" ? obj.excerpt.trim() : "";
        const content =
          typeof obj?.content === "string"
            ? obj.content.trim()
            : typeof obj?.body === "string"
              ? obj.body.trim()
              : typeof obj?.desc === "string"
                ? obj.desc.trim()
                : typeof obj?.details === "string"
                  ? obj.details.trim()
                  : excerpt;
        const author = typeof obj?.author === "string" ? obj.author.trim() : "";
        const date = typeof obj?.date === "string" ? obj.date.trim() : "";
        const cat = typeof obj?.cat === "string" ? obj.cat.trim() : "";
        const readTime = typeof obj?.readTime === "string" ? obj.readTime.trim() : "";
        const catColor = typeof obj?.catColor === "string" ? obj.catColor.trim() : "bg-school-green";
        const img =
          typeof obj?.img === "string"
            ? normalizeUrl(obj.img)
            : typeof obj?.image === "string"
              ? normalizeUrl(obj.image)
              : "";

        return { id: rowId, title, excerpt, content, author, date, cat, img, readTime, catColor } satisfies BlogItem;
      });

      const found = mapped.find((x) => x.id === id) ?? null;

      if (cancelled) return;
      setFit(loadedFit);
      setItem(found);
      setLoading(false);
    };

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("value, updated_at")
          .eq("key", BLOGS_PAGE_KEY)
          .maybeSingle();
        if (cancelled) return;
        if (error || !data?.value) {
          setLoading(false);
          setItem(null);
          return;
        }
        const value = data.value as unknown;
        const version = (value as { version?: unknown } | null)?.version ?? data.updated_at ?? Date.now();
        applySetting(value, version);
      } catch {
        if (cancelled) return;
        setLoading(false);
        setItem(null);
      }
    };

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("blogs-detail")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: `key=eq.${BLOGS_PAGE_KEY}` },
        (payload) => {
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
            <span className="inline-block bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4 sm:mb-5">
              School Blog
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-heading font-black mb-4 leading-tight break-words max-w-4xl">
              Blogs
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto">
              Education insights, school news, parenting tips and stories from our vibrant community.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pt-6 pb-16 bg-white pattern-grid">
        <div className="max-w-6xl mx-auto px-4">
          {!loading && !item ? (
            <div className="rounded-3xl border border-black/10 bg-white p-10 text-center">
              <div className="text-school-dark font-heading font-black text-2xl">Blog not found</div>
              <div className="text-sm text-gray-600 mt-2">Please go back to the Blogs page and try another post.</div>
            </div>
          ) : null}

          {item ? (
            <div className="rounded-3xl border border-black/10 bg-white shadow-xl overflow-hidden">
              <div className="relative bg-school-dark aspect-[16/9]">
                <div className="absolute inset-0 pattern-grid opacity-25" aria-hidden />
                {item.img ? (
                  fit === "contain" ? (
                    <>
                      <Image
                        src={item.img}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 1024px, 100vw"
                        className="object-cover scale-110 blur-2xl"
                        aria-hidden
                        priority
                      />
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 1024px, 100vw"
                        className="object-contain"
                        priority
                      />
                      <div className="absolute inset-0 bg-school-dark/65" />
                    </>
                  ) : (
                    <>
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 1024px, 100vw"
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-school-dark/35" />
                    </>
                  )
                ) : (
                  <div className="absolute inset-0 bg-school-dark/60" />
                )}

                <div className="absolute left-5 right-5 bottom-5 md:left-10 md:right-10 md:bottom-10">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className={`${item.catColor} text-white text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full`}
                    >
                      {item.cat || "Blog"}
                    </span>
                    {item.date ? (
                      <span className="bg-white/10 border border-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        {item.date}
                      </span>
                    ) : null}
                    {item.readTime ? (
                      <span className="bg-white/10 border border-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        {item.readTime}
                      </span>
                    ) : null}
                    {item.author ? (
                      <span className="bg-white/10 border border-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        {item.author}
                      </span>
                    ) : null}
                  </div>
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-heading font-black leading-tight text-white max-w-4xl">
                    {item.title}
                  </h1>
                </div>
              </div>

              <div className="p-6 md:p-10">
                <div className="w-full">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px] md:text-base">
                    {item.content || item.excerpt}
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
