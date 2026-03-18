"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

const HOME_NEWS_KEY = "home.news";

type NewsItem = {
  id: string;
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  href: string;
  image: string;
};

function PageHero() {
  return (
    <section className="relative bg-school-dark text-white py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20" />
      <div
        className="absolute bottom-0 left-0 right-0 h-20 bg-white"
        style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
      />
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex flex-col items-center text-center"
        >
          <span className="inline-block bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
            Updates
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-heading font-black mb-3 leading-tight break-words max-w-4xl">
            News & Announcements
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto">
            Stay updated with school notices, key dates and highlights from Growwell School.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedSection({ featured }: { featured?: NewsItem }) {
  if (!featured) return null;

  return (
    <section className="pt-2 pb-12 md:pt-3 md:pb-14 bg-white pattern-grid">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6"
        >
          <div>
            <span className="inline-block bg-school-green/10 text-school-green text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
              Featured
            </span>
            <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900">Latest Update</h2>
            <p className="text-gray-500 mt-3 max-w-xl">Quick access to the most important notice right now.</p>
          </div>
          <Link href="/admission" className="btn-primary self-start">
            Apply Now <ArrowRight size={18} />
          </Link>
        </motion.div>

        <div className="rounded-3xl border border-black/10 bg-white shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[260px] lg:min-h-[360px] bg-school-dark">
              <div className="absolute inset-0 pattern-grid opacity-25" aria-hidden />
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-school-dark/40" />
            </div>
            <div className="p-8 lg:p-10">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                  {featured.tag || "Update"}
                </div>
                <div className="text-xs text-gray-500 font-semibold">{featured.date}</div>
              </div>
              <h3 className="mt-4 text-2xl lg:text-3xl font-heading font-black text-gray-900 leading-tight">
                {featured.title}
              </h3>
              <p className="text-gray-600 mt-3 leading-relaxed line-clamp-6">{featured.excerpt}</p>
              <div className="mt-7">
                <Link href={featured.href} className="btn-secondary">
                  Read More <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsListSection({ items }: { items: NewsItem[] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="news" className="pt-0 pb-20 md:py-20 bg-gray-50 pattern-zigzag" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-8 md:mb-12"
        >
          <span className="inline-block bg-purple-100 text-school-purple text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
            All Posts
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900">Recent News</h2>
        </motion.div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-sm text-gray-600">
            No news posted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((it, i) => (
              <motion.article
                key={it.id}
                id={it.id}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-black/10 shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="relative aspect-[16/10] bg-gray-100">
                  {it.image ? (
                    <Image
                      src={it.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="text-xs font-bold tracking-widest uppercase text-gray-500">{it.tag}</div>
                    <div className="text-xs text-gray-400">{it.date}</div>
                  </div>
                  <h3 className="font-heading font-black text-lg text-gray-900 mb-2 leading-snug">{it.title}</h3>
                  <p className="text-gray-600 mt-2 leading-relaxed line-clamp-3">{it.excerpt}</p>
                  <div className="mt-5">
                    <Link
                      href={it.href}
                      className="inline-flex items-center gap-2 text-school-green font-heading font-bold"
                    >
                      Read More <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);

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

      const candidate = Array.isArray(raw)
        ? raw
        : typeof raw === "object" && raw && Array.isArray((raw as { items?: unknown }).items)
          ? ((raw as { items: unknown[] }).items as unknown[])
          : [];

      const normalizeUrl = (url: string) => {
        const trimmed = url.trim();
        if (trimmed.length === 0) return "";
        const base = trimmed.split("?")[0];
        return `${base}?v=${encodeURIComponent(version)}`;
      };

      const mapped = candidate
        .map((row, i) => {
          const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
          const id = typeof obj?.id === "string" && obj.id.trim().length > 0 ? obj.id.trim() : `news-${i + 1}`;
          const tag = typeof obj?.tag === "string" && obj.tag.trim().length > 0 ? obj.tag.trim() : "Update";
          const date = typeof obj?.date === "string" && obj.date.trim().length > 0 ? obj.date.trim() : "—";
          const title = typeof obj?.title === "string" ? obj.title.trim() : "";
          const excerpt =
            typeof obj?.desc === "string"
              ? obj.desc.trim()
              : typeof obj?.summary === "string"
                ? obj.summary.trim()
                : typeof obj?.details === "string"
                  ? obj.details.trim()
                  : "";
          const detailHref = `/news/${encodeURIComponent(id)}`;
          const rawHref =
            typeof obj?.href === "string" && obj.href.trim().length > 0
              ? obj.href.trim()
              : typeof obj?.url === "string" && obj.url.trim().length > 0
                ? obj.url.trim()
                : "";
          const href =
            rawHref.length === 0 || rawHref === "/news" || rawHref === "news"
              ? detailHref
              : /^https?:\/\//i.test(rawHref) || rawHref.startsWith("/")
                ? rawHref
                : `/${rawHref}`;
          const image =
            typeof obj?.image === "string"
              ? normalizeUrl(obj.image)
              : typeof obj?.img === "string"
                ? normalizeUrl(obj.img)
                : typeof obj?.photo === "object" &&
                    obj.photo &&
                    typeof (obj.photo as { url?: unknown }).url === "string"
                  ? normalizeUrl(String((obj.photo as { url: string }).url))
                  : "";

          return { id, tag, date, title, excerpt, href, image };
        })
        .filter((it) => it.title.length > 0 && it.image.length > 0);

      if (cancelled) return;
      setItems(mapped);
    };

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("value, updated_at")
          .eq("key", HOME_NEWS_KEY)
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
      .channel("news-page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: `key=eq.${HOME_NEWS_KEY}` },
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

  return (
    <>
      <PageHero />
      <FeaturedSection featured={items[0]} />
      <NewsListSection items={items} />
    </>
  );
}
