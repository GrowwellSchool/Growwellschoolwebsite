"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Calendar, User, ArrowRight, BookOpen, Tag } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

const BLOGS_PAGE_KEY = "blogs.page";

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
          <h1 className="text-4xl lg:text-6xl font-heading font-black mb-4">Insights & Stories</h1>
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
  const [fit, setFit] = useState<BlogFit>("cover");
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const addVersion = useMemo(() => {
    return (url: string, version: string) => {
      const trimmed = url.trim();
      if (trimmed.length === 0) return "";
      const base = trimmed.split("?")[0];
      if (!base.startsWith("http")) return base;
      return `${base}?v=${encodeURIComponent(version)}`;
    };
  }, []);

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

      const nextFit: BlogFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";
      const itemsRaw =
        typeof raw === "object" && raw && Array.isArray((raw as { items?: unknown }).items)
          ? ((raw as { items: unknown[] }).items as unknown[])
          : [];

      const nextBlogs = itemsRaw
        .map((row, idx) => {
          const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
          const id =
            typeof obj?.id === "string"
              ? obj.id.trim()
              : typeof obj?.id === "number"
                ? String(obj.id)
                : `blog-${idx + 1}`;
          const title = typeof obj?.title === "string" ? obj.title : "";
          const excerpt = typeof obj?.excerpt === "string" ? obj.excerpt : "";
          const author = typeof obj?.author === "string" ? obj.author : "";
          const date = typeof obj?.date === "string" ? obj.date : "";
          const cat = typeof obj?.cat === "string" ? obj.cat : "";
          const img = typeof obj?.img === "string" ? addVersion(obj.img, version) : "";
          const featured = Boolean(obj?.featured);
          const readTime = typeof obj?.readTime === "string" ? obj.readTime : "";
          const catColor = typeof obj?.catColor === "string" ? obj.catColor : "bg-school-green";
          return { id, title, excerpt, author, date, cat, img, featured, readTime, catColor } satisfies BlogItem;
        })
        .filter((b) => b.title.trim().length > 0);

      if (cancelled) return;
      setFit(nextFit);
      setBlogs(nextBlogs);
    };

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("value, updated_at")
          .eq("key", BLOGS_PAGE_KEY)
          .maybeSingle();
        if (cancelled || error) return;
        if (!data?.value) {
          setBlogs([]);
          return;
        }
        applySetting(data.value as unknown, String(data.updated_at ?? Date.now()));
      } catch {
        return;
      }
    };

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("blogs-page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: `key=eq.${BLOGS_PAGE_KEY}` },
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
  }, [addVersion]);

  const blogCategories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      const c = b.cat.trim();
      if (c.length > 0) set.add(c);
    });
    return ["All", ...Array.from(set)];
  }, [blogs]);

  const selectedCat = blogCategories.includes(activeCat) ? activeCat : "All";

  const featured = blogs.find((b) => b.featured);
  const filtered =
    selectedCat === "All"
      ? blogs.filter((b) => !b.featured)
      : blogs.filter((b) => b.cat === selectedCat && !b.featured);

  return (
    <>
      <PageHero />

      <section className="py-20 bg-white" ref={ref}>
        <div className="max-w-7xl mx-auto px-4">
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="grid lg:grid-cols-2 bg-school-dark rounded-3xl overflow-hidden shadow-2xl mb-16 group"
            >
              <div className="img-zoom h-64 lg:h-auto min-h-[300px] relative bg-school-dark">
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
                    <Image
                      src={featured.img}
                      alt={featured.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-school-dark/60" />
                  </>
                ) : (
                  <Image
                    src={featured.img}
                    alt={featured.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
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
                <h2 className="text-2xl lg:text-3xl font-heading font-black text-white mb-4 leading-tight">
                  {featured.title}
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6 text-sm line-clamp-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                  <span className="flex items-center gap-1.5">
                    <User size={13} className="text-school-gold" />
                    {featured.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-school-gold" />
                    {featured.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} className="text-school-gold" />
                    {featured.readTime}
                  </span>
                </div>
                <Link href={`/blogs/${encodeURIComponent(featured.id)}`} className="btn-secondary self-start text-sm">
                  Read Full Article <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}

          <div className="flex flex-wrap gap-2 mb-10">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all border
                  ${selectedCat === cat ? "bg-school-green text-white border-school-green" : "bg-white text-gray-600 border-gray-200 hover:border-school-green hover:text-school-green"}`}
              >
                <Tag size={12} />
                {cat}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((blog, i) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden card-hover shadow-sm group"
              >
                <div className="img-zoom h-48 relative">
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

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p>No articles found in this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
