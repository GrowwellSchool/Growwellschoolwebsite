"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Calendar, User, ArrowRight, BookOpen, Tag } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

const BLOGS_PAGE_KEY = "blogs.page";
const PAGE_SIZE = 9;

type BlogFit = "cover" | "contain";
type BlogItem = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  cat: string;
  img: string;
  featured: boolean;
  readTime: string;
  catColor: string;
};

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
            School Blog
          </span>
          <h1 className="text-4xl lg:text-6xl font-heading font-black mb-4">Insights &amp; Stories</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Education insights, school news, parenting tips and stories from our vibrant community.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default function BlogsPage() {
  const [activeCat, setActiveCat] = useState("All");
  const [fit, setFit] = useState<BlogFit>("contain");
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [featured, setFeatured] = useState<BlogItem | null>(null);
  const [blogCategories, setBlogCategories] = useState<string[]>(["All"]);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  // Guard against duplicate in-flight requests
  const fetchingRef = useRef(false);
  // Keep refs in sync so the observer always has the latest values
  const fetchingMetaRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const activeCatRef = useRef(activeCat);

  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { activeCatRef.current = activeCat; }, [activeCat]);

  // Ref for the "Load More" sentinel
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Fetch fit setting, featured post, and categories on mount
  useEffect(() => {
    let cancelled = false;
    const loadMeta = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const [{ data: fitData }, { data: fData }, { data: cData }] = await Promise.all([
          supabase.from("site_settings").select("value").eq("key", BLOGS_PAGE_KEY).maybeSingle(),
          supabase
            .from("blogs")
            .select("*")
            .eq("featured", true)
            .order("created_at", { ascending: false })
            .limit(1),
          supabase.from("blogs").select("cat"),
        ]);

        if (cancelled) return;

        if (fitData?.value) {
          const raw = fitData.value as any;
          setFit(raw.fit === "contain" ? "contain" : "cover");
        }

        if (fData && fData.length > 0) {
          const d = fData[0];
          setFeatured({
            id: d.id,
            title: d.title,
            excerpt: d.excerpt,
            author: d.author,
            date: d.date,
            cat: d.cat,
            img: d.img,
            featured: d.featured,
            readTime: d.read_time,
            catColor: d.cat_color,
          });
        }

        if (cData) {
          const unique = Array.from(
            new Set(cData.map((c) => c.cat as string).filter((c) => c && c.trim().length > 0))
          );
          setBlogCategories(["All", ...unique]);
        }
      } finally {
        fetchingMetaRef.current = false;
      }
    };

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  // Core paginated fetch — receives category as parameter to avoid stale closure
  const fetchBlogs = useCallback(
    async (currentPage: number, isAppending: boolean, catOverride: string) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();
        let query = supabase
          .from("blogs")
          .select("*", { count: "exact" })
          .eq("featured", false);

        if (catOverride !== "All") {
          query = query.eq("cat", catOverride);
        }

        query = query.order("created_at", { ascending: false });

        const from = currentPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (!error && data) {
          const mapped: BlogItem[] = data.map((d: any) => ({
            id: d.id, title: d.title, excerpt: d.excerpt, author: d.author, date: d.date,
            cat: d.cat, img: d.img, featured: d.featured, readTime: d.read_time, catColor: d.cat_color,
          }));
          if (isAppending) setBlogs((prev) => [...prev, ...mapped]);
          else setBlogs(mapped);
          setHasMore(count !== null && from + data.length < count);
        }
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    []
  );

  // Reset & refetch whenever category changes
  useEffect(() => {
    setBlogs([]);
    setPage(0);
    pageRef.current = 0;
    setHasMore(true);
    hasMoreRef.current = true;
    fetchingRef.current = false;
    fetchBlogs(0, false, activeCat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat]);

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
        fetchBlogs(nextPage, true, activeCatRef.current);
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

      <section className="py-20 bg-white pattern-grid" ref={ref}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Featured Blog */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="grid lg:grid-cols-2 bg-white rounded-3xl overflow-hidden border border-black/10 shadow-2xl mb-16 group"
            >
              <div className="aspect-[3/4] lg:aspect-auto lg:h-[550px] relative bg-school-dark overflow-hidden">
                {fit === "contain" ? (
                  <>
                    <Image
                      src={featured.img}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover scale-110 blur-2xl"
                      aria-hidden
                    />
                    <div className="absolute inset-0 bg-school-dark/40" />
                    <Image
                      src={featured.img}
                      alt={featured.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-contain"
                    />
                  </>
                ) : (
                  <Image
                    src={featured.img}
                    alt={featured.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain"
                  />
                )}
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex gap-2 mb-4">
                  <span
                    className={`${featured.catColor} text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded`}
                  >
                    {featured.cat}
                  </span>
                  <span className="bg-school-gold text-school-dark text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded">
                    Featured
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-heading font-black text-gray-900 mb-4 leading-tight">
                  {featured.title}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm line-clamp-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                  <span className="flex items-center gap-1.5">
                    <User size={13} className="text-school-green" />
                    {featured.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-school-green" />
                    {featured.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} className="text-school-green" />
                    {featured.readTime}
                  </span>
                </div>
                <Link href={`/blogs/${encodeURIComponent(featured.id)}`} className="btn-secondary self-start text-sm">
                  Read Full Article <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all border
                  ${activeCat === cat
                    ? "bg-school-green text-white border-school-green"
                    : "bg-white text-gray-600 border-gray-200 hover:border-school-green hover:text-school-green"
                  }`}
              >
                <Tag size={12} />
                {cat}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <section className="bg-gray-50 border-t border-black/5 -mx-4 px-4 py-20 pattern-zigzag">
            <div className="max-w-7xl mx-auto">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {blogs.map((blog, i) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: Math.min(i, 6) * 0.1, duration: 0.5 }}
                className="bg-white border border-black/10 rounded-2xl overflow-hidden card-hover shadow-md group"
              >
                <div className="aspect-[2/3] relative overflow-hidden bg-gray-50">
                  {fit === "contain" ? (
                    <>
                      <Image
                        src={blog.img}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover scale-110 blur-2xl"
                        aria-hidden
                      />
                      <Image
                        src={blog.img}
                        alt={blog.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-contain"
                      />
                      <div className="absolute inset-0 bg-school-dark/10" />
                    </>
                  ) : (
                    <Image
                      src={blog.img}
                      alt={blog.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  )}
                  <span
                    className={`absolute top-3 left-3 ${blog.catColor} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded`}
                  >
                    {blog.cat}
                  </span>
                  <span className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2.5 py-1 rounded backdrop-blur-sm">
                    {blog.readTime}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-bold text-gray-800 text-base leading-tight mb-3 group-hover:text-school-green transition-colors line-clamp-2">
                    <Link href={`/blogs/${encodeURIComponent(blog.id)}`}>{blog.title}</Link>
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{blog.excerpt}</p>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="text-xs text-gray-400">
                      <div className="font-medium text-gray-600">{blog.author}</div>
                      <div>{blog.date}</div>
                    </div>
                    <Link
                      href={`/blogs/${encodeURIComponent(blog.id)}`}
                      className="text-school-green hover:text-school-dark transition-colors"
                      aria-label="Read article"
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
              </div>
            </div>
          </section>

          {/* Empty state */}
          {blogs.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p>No articles found in this category yet.</p>
            </div>
          )}

          {/* Infinite Scroll Sentinel */}
          <div ref={loadMoreRef} className="mt-16 flex justify-center min-h-[40px]">
            {loading && (
              <div className="w-8 h-8 rounded-full border-4 border-school-green border-t-transparent animate-spin" />
            )}
            {!hasMore && blogs.length > 0 && (
              <p className="text-sm text-gray-400">No more articles to show.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
