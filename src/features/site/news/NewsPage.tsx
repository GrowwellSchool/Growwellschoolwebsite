"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { useSiteSetting } from "@/lib/supabase/SiteSettingsContext";

type NewsItem = {
  id: string;
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  href: string;
  image: string;
  updatedAt?: string;
};

type NewsFit = "cover" | "contain";

type SiteSettingsValue = { fit?: "cover" | "contain"; version?: string | number };

type NewsRow = {
  id: string;
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  href: string;
  image: string;
  updated_at?: string;
};

// Helper to add cache-busting version to image URLs
function withImageVersion(url: string | undefined | null, version?: string | number | null): string {
  if (!url || !url.trim()) return "";
  const trimmed = url.trim();
  const base = trimmed.split("?")[0];
  const v = version ?? Date.now();
  return `${base}?v=${encodeURIComponent(String(v))}`;
}

const PAGE_SIZE = 9;
const INITIAL_FETCH_LIMIT = PAGE_SIZE + 1; // +1 for featured item

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
            News &amp; Announcements
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto">
            Stay updated with school notices, key dates and highlights from Growwell School.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedSection({ featured, fit }: { featured?: NewsItem; fit: NewsFit }) {
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
            <div className="aspect-[3/4] lg:aspect-auto lg:h-[550px] relative bg-school-dark overflow-hidden">
              {fit === "contain" ? (
                <>
                  <Image
                    src={featured.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover scale-110 blur-2xl"
                    aria-hidden
                    priority
                  />
                  <div className="absolute inset-0 bg-school-dark/40" />
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain"
                    priority
                  />
                </>
              ) : (
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-contain"
                  priority
                />
              )}
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
                <Link
                  href={`/news/${encodeURIComponent(featured.id)}`}
                  className="btn-secondary"
                >
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

function NewsListSection({
  items,
  hasMore,
  loading,
  loadMoreRef,
  fit,
}: {
  items: NewsItem[];
  hasMore: boolean;
  loading: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  fit: NewsFit;
}) {
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

        {items.length === 0 && !loading ? (
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
                transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.1 }}
                className="bg-white rounded-2xl border border-black/10 shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="aspect-[2/3] relative bg-school-dark overflow-hidden">
                  {it.image ? (
                    fit === "contain" ? (
                      <>
                        <Image
                          src={it.image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover scale-110 blur-2xl"
                          aria-hidden
                        />
                        <div className="absolute inset-0 bg-school-dark/40" />
                        <Image
                          src={it.image}
                          alt={it.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-contain"
                        />
                      </>
                    ) : (
                      <Image
                        src={it.image}
                        alt={it.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    )
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
                      href={`/news/${encodeURIComponent(it.id)}`}
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

        {/* Infinite Scroll Sentinel */}
        <div ref={loadMoreRef} className="mt-12 flex justify-center min-h-[40px]">
          {loading && (
            <div className="w-8 h-8 rounded-full border-4 border-school-green border-t-transparent animate-spin" />
          )}
          {!hasMore && items.length > 0 && (
            <p className="text-sm text-gray-400">You've reached the end.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [featured, setFeatured] = useState<NewsItem | null>(null);
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [fit, setFit] = useState<NewsFit>("contain");

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Guard against duplicate in-flight fetches
  const fetchingRef = useRef(false);
  const featuredFetchingRef = useRef(false);

  // Keep refs in sync so the observer always has the latest values
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const featuredIdRef = useRef<string | null>(null);

  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { featuredIdRef.current = featuredId; }, [featuredId]);

  // Ref for the "Load More" sentinel
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Fetch the single featured (latest) news item
  useEffect(() => {
    let cancelled = false;
    const fetchFeatured = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase
          .from("news")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);
        if (!cancelled && data && data.length > 0) {
          const d = data[0];
          setFeaturedId(d.id);
          setFeatured({
            id: d.id, tag: d.tag, date: d.date, title: d.title,
            excerpt: d.excerpt, href: d.href || "#", image: withImageVersion(d.image, d.updated_at),
            updatedAt: d.updated_at,
          });
        }
      } finally {
        featuredFetchingRef.current = false;
      }
    };

    // Fetch fit setting
    const fetchFit = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "home.news")
          .maybeSingle();
        if (data?.value) {
          const val = data.value as SiteSettingsValue;
          setFit(val.fit === "contain" ? "contain" : "cover");
        }
      } catch {
        // ignore
      }
    };

    fetchFeatured();
    fetchFit();
    return () => { cancelled = true; };
  }, []);

  // Core paginated fetch — excludes the featured item by ID so there's no duplicate
  const fetchNews = useCallback(
    async (currentPage: number, isAppending: boolean, excludeId: string | null) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();
        let query = supabase
          .from("news")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });

        // Exclude the featured item so it doesn't repeat in the list
        if (excludeId) {
          query = query.neq("id", excludeId);
        }

        const from = currentPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (!error && data) {
          const mapped: NewsItem[] = data.map((d: NewsRow) => ({
            id: d.id, tag: d.tag, date: d.date, title: d.title,
            excerpt: d.excerpt, href: d.href || "#", image: withImageVersion(d.image, d.updated_at),
            updatedAt: d.updated_at,
          }));
          if (isAppending) setItems((prev) => [...prev, ...mapped]);
          else setItems(mapped);
          setHasMore(count !== null && from + data.length < count);
        }
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    []
  );

  // Trigger initial fetch once featuredId is known (or confirmed as none)
  useEffect(() => {
    setItems([]);
    setPage(0);
    pageRef.current = 0;
    setHasMore(true);
    hasMoreRef.current = true;
    fetchingRef.current = false;
    fetchNews(0, false, featuredId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredId]);

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
        fetchNews(nextPage, true, featuredIdRef.current);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHero />
      <FeaturedSection featured={featured || undefined} fit={fit} />
      <NewsListSection
        items={items}
        hasMore={hasMore}
        loading={loading}
        loadMoreRef={loadMoreRef}
        fit={fit}
      />
    </>
  );
}
