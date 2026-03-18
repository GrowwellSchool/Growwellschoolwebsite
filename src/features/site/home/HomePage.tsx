"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Award, BookOpen, Users, Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import CircularGalleryDemo from "@/components/ui/circular-gallery-demo";
import OrbitCarousel from "@/components/ui/animated-carousel-demo";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

const HOME_HERO_IMAGES_KEY = "home.heroImages";
const HOME_NOTIFICATIONS_KEY = "home.notifications";
const HOME_PROGRAMS_KEY = "home.programs";
const HOME_ABOUT_KEY = "home.about";
const HOME_LIFE_KEY = "home.life";
const HOME_NEWS_KEY = "home.news";
const HOME_DESK_KEY = "home.desk";

const heroSlides = [
  {
    img: "",
    tag: "Welcome to Growwell School",
    title: "Where Every Child",
    accent: "Blooms & Grows",
    sub: "Purity, Perfection and Beauty — as the Lotus Symbolizes.",
  },
  {
    img: "",
    tag: "Holistic Development",
    title: "Nurturing Young",
    accent: "Minds & Leaders",
    sub: "Blending traditional values with modern innovation.",
  },
  {
    img: "",
    tag: "Vibrant Campus Life",
    title: "Learn, Explore &",
    accent: "Excel Together",
    sub: "Activities, events and learning beyond textbooks.",
  },
];

function HeroCarousel() {
  const [slides, setSlides] = useState(heroSlides);
  const [active, setActive] = useState(0);
  const [fit, setFit] = useState<"cover" | "contain">("cover");

  useEffect(() => {
    const t = setInterval(() => {
      setActive((p) => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [slides.length]);

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
        : typeof raw === "object" && raw && Array.isArray((raw as { images?: unknown }).images)
          ? (raw as { images: unknown[] }).images
          : null;

      const urls = [0, 1, 2].map((i) => {
        const value = candidate?.[i];
        if (typeof value !== "string") return "";
        const trimmed = value.trim();
        if (trimmed.length === 0) return "";
        const base = trimmed.split("?")[0];
        return `${base}?v=${encodeURIComponent(version)}`;
      });

      const nextFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";

      const merged = heroSlides.map((s, i) => ({
        ...s,
        img: urls[i] || "",
      }));

      setSlides(merged);
      setFit(nextFit);
    };

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("value, updated_at")
          .eq("key", HOME_HERO_IMAGES_KEY)
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
      .channel("home-hero-images")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: `key=eq.${HOME_HERO_IMAGES_KEY}` },
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

  const go = (idx: number) => {
    setActive(idx);
  };

  const slide = slides[active];

  return (
    <section className="relative h-[92vh] min-h-[600px] overflow-hidden bg-school-dark">
      <motion.div
        key={active}
        initial={{ scale: 1.08, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        <div className="relative w-full h-full">
          {slide.img ? (
            fit === "contain" ? (
              <>
                <Image
                  src={slide.img}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover scale-110 blur-2xl"
                  aria-hidden
                />
                <Image src={slide.img} alt={slide.tag} fill sizes="100vw" className="object-contain" priority />
              </>
            ) : (
              <Image src={slide.img} alt={slide.tag} fill sizes="100vw" className="object-cover" priority />
            )
          ) : null}
          <div className="absolute inset-0 bg-school-dark/65" />
        </div>
      </motion.div>

      <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center overflow-hidden">
        <motion.div
          key={active + "content"}
          initial={{ opacity: 0, x: 200, rotate: 15 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 }}
          style={{ transformOrigin: "left center" }}
          className="max-w-max"
        >
          <span className="inline-block bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-6 whitespace-nowrap">
            {slide.tag}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-black text-white leading-tight mb-2 whitespace-nowrap">
            {slide.title}
          </h1>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-black text-school-gold leading-tight mb-6 whitespace-nowrap">
            {slide.accent}
          </h1>
          <p className="text-gray-200 text-lg mb-10 max-w-xl whitespace-nowrap">{slide.sub}</p>
          <div className="flex flex-nowrap gap-4">
            <Link href="/admission" className="btn-secondary whitespace-nowrap">
              Apply for Admission <ArrowRight size={18} />
            </Link>
            <Link href="/gallery" className="btn-primary border border-white/30 whitespace-nowrap">
              Explore Gallery <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((s, i) => (
          <button
            key={`${i}-${s.img}`}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${i === active ? "bg-school-gold w-8" : "bg-white/40 w-2 hover:bg-white/60"}`}
          />
        ))}
      </div>

      <button
        onClick={() => go((active - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-school-gold hover:text-black transition-all"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go((active + 1) % slides.length)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-school-gold hover:text-black transition-all"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2 text-white/50 text-xs">
        <div className="w-px h-12 bg-white/30" />
        <span className="rotate-90 tracking-widest text-[10px]">SCROLL</span>
      </div>
    </section>
  );
}

function NewsTicker() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const applySetting = (raw: unknown) => {
      const candidate = Array.isArray(raw)
        ? raw
        : typeof raw === "object" && raw && Array.isArray((raw as { items?: unknown }).items)
          ? (raw as { items: unknown[] }).items
          : null;

      const next = (candidate ?? []).map((v) => (typeof v === "string" ? v.trim() : "")).filter((v) => v.length > 0);

      setItems(next);
    };

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", HOME_NOTIFICATIONS_KEY)
          .maybeSingle();

        if (cancelled || error) return;
        applySetting(data?.value as unknown);
      } catch {
        return;
      }
    };

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("home-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: `key=eq.${HOME_NOTIFICATIONS_KEY}` },
        (payload) => {
          if (cancelled) return;
          const row = (payload as { new?: { value?: unknown } }).new;
          applySetting(row?.value);
        },
      )
      .subscribe();

    load();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];
  return (
    <div
      className="bg-school-green text-white py-3 ticker-wrap border-b-4 border-school-gold"
      aria-label="School announcements"
    >
      <div className="ticker flex gap-16 items-center">
        {doubled.map((item, i) => (
          <span key={i} className="text-sm font-medium whitespace-nowrap flex items-center gap-3">
            <span className="w-2 h-2 bg-school-gold rounded-full inline-block" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

const stats = [
  {
    icon: <Users size={28} />,
    val: "500+",
    label: "Happy Students",
    color: "bg-school-green",
    border: "border-school-green",
  },
  {
    icon: <BookOpen size={28} />,
    val: "15+",
    label: "Years of Excellence",
    color: "bg-school-orange",
    border: "border-school-orange",
  },
  {
    icon: <Award size={28} />,
    val: "30+",
    label: "Qualified Teachers",
    color: "bg-school-blue",
    border: "border-school-blue",
  },
  {
    icon: <Star size={28} />,
    val: "7+",
    label: "Activity Programs",
    color: "bg-school-purple",
    border: "border-school-purple",
  },
];

function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section className="py-12 bg-school-green/5 pattern-grid relative">
      <div ref={ref} className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className={`bg-white rounded-xl p-6 text-center border-t-4 ${s.border} shadow-md card-hover`}
          >
            <div
              className={`w-14 h-14 ${s.color} text-white rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              {s.icon}
            </div>
            <div className="text-3xl font-heading font-black text-gray-800 mb-1">{s.val}</div>
            <div className="text-sm text-gray-500 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function OurJourneySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const milestones = [
    { year: "2011", text: "Growwell School established on April 2 by S. Ishwar Pal Singh and Ms Amrit K. Vohi" },
    { year: "2015", text: "Recognition as co-educational middle school following CBSE curriculum" },
    { year: "2020", text: "Adopted NEP 2020 guidelines, expanding holistic development programs" },
    { year: "2024", text: "Progressive addition of classes, now serving Play Class through Grade 9" },
    { year: "2026", text: "Continuing to grow — admissions open for Session 2026-27" },
  ];

  return (
    <section id="journey" className="py-20 bg-[#f8f9f6] pattern-grid relative" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-black text-[#0f172a]">Our Journey</h2>
        </div>

        <div className="absolute left-1/2 top-32 bottom-0 w-0.5 bg-school-green -translate-x-1/2 hidden md:block" />

        <div className="space-y-12">
          {milestones.map((m, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 30, x: isLeft ? -20 : 20 }}
                animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`relative flex flex-col md:flex-row items-center ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} gap-8`}
              >
                <div className={`w-full md:w-[45%] flex ${isLeft ? "justify-end" : "justify-start"}`}>
                  <div className="bg-[#1b5e43] text-white p-6 md:p-8 rounded-sm shadow-xl w-full max-w-sm">
                    <div className="text-school-gold font-heading font-bold text-2xl md:text-3xl mb-3">{m.year}</div>
                    <p className="text-white/90 text-sm md:text-base leading-relaxed font-medium">{m.text}</p>
                  </div>
                </div>

                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-[3px] border-[#1b5e43] bg-school-gold z-10" />
                <div className="hidden md:block w-[45%]" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const PROGRAM_COLORS = [
  "bg-school-green",
  "bg-school-blue",
  "bg-school-purple",
  "bg-school-teal",
  "bg-school-orange",
  "bg-school-red",
];

function ProgramsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [programs, setPrograms] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      title: "",
      img: "",
      color: PROGRAM_COLORS[i] ?? "bg-school-green",
      desc: "",
    })),
  );
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fit, setFit] = useState<"cover" | "contain">("cover");

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

      const candidate = Array.isArray(raw)
        ? raw
        : typeof raw === "object" && raw && Array.isArray((raw as { items?: unknown }).items)
          ? ((raw as { items: unknown[] }).items as unknown[])
          : [];

      const normalized = candidate.slice(0, 6).map((row) => {
        const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
        const title = typeof obj?.title === "string" ? obj.title.trim() : "";
        const desc =
          typeof obj?.details === "string" ? obj.details.trim() : typeof obj?.desc === "string" ? obj.desc.trim() : "";
        const img =
          typeof obj?.image === "string" ? obj.image.trim() : typeof obj?.img === "string" ? obj.img.trim() : "";
        return { title, desc, img };
      });

      const next = Array.from({ length: 6 }, (_, i) => {
        const row = normalized[i] ?? null;
        return {
          title: row?.title ?? "",
          desc: row?.desc ?? "",
          img: row?.img ? addVersion(row.img) : "",
          color: PROGRAM_COLORS[i] ?? "bg-school-green",
        };
      });

      setPrograms(next);
      setFit(typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover");
      setLoadState("ready");
      setLoadError(null);
    };

    const load = async () => {
      setLoadState("loading");
      setLoadError(null);
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("value, updated_at")
          .eq("key", HOME_PROGRAMS_KEY)
          .maybeSingle();

        if (cancelled) return;
        if (error) {
          setLoadState("error");
          setLoadError(error.message);
          return;
        }

        const value = (data?.value ?? null) as unknown;
        const version = (value as { version?: unknown } | null)?.version ?? data?.updated_at ?? Date.now();
        applySetting(value, version);
      } catch (err) {
        if (cancelled) return;
        setLoadState("error");
        setLoadError(err instanceof Error ? err.message : "Failed to load programs");
      }
    };

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("home-programs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: `key=eq.${HOME_PROGRAMS_KEY}` },
        (payload) => {
          if (cancelled) return;
          const row = (payload as { new?: { value?: unknown; updated_at?: unknown } }).new;
          const commitTimestamp = (payload as { commit_timestamp?: unknown }).commit_timestamp;
          const version =
            (row?.value as { version?: unknown } | null)?.version ?? commitTimestamp ?? row?.updated_at ?? Date.now();
          applySetting(row?.value ?? null, version);
        },
      )
      .subscribe();

    load();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const visiblePrograms = programs.filter(
    (p) => p.title.trim().length > 0 || p.desc.trim().length > 0 || p.img.trim().length > 0,
  );
  const showEmptyState = loadState === "ready" && visiblePrograms.length === 0;

  return (
    <section className="py-20 pattern-diagonal bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-orange-100 text-school-orange text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
            Beyond the Classroom
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900">Programs & Activities</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            We believe learning happens everywhere. Our co-curricular programs build confidence, creativity and
            character.
          </p>
        </motion.div>

        {loadState === "error" ? (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
            {loadError ?? "Failed to load Programs & Activities"}
          </div>
        ) : null}

        {loadState === "loading" && visiblePrograms.length === 0 ? (
          <div className="text-center text-sm text-gray-500 mb-8">Loading…</div>
        ) : null}

        {showEmptyState ? <div className="text-center text-sm text-gray-500 mb-8">No programs added yet.</div> : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePrograms.map((p, i) => (
            <motion.div
              key={`${i}-${p.title}`}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl overflow-hidden card-hover shadow-sm group"
            >
              <div className="img-zoom h-52 relative">
                {p.img ? (
                  fit === "contain" ? (
                    <>
                      <Image
                        src={p.img}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover scale-110 blur-2xl"
                        aria-hidden
                      />
                      <Image
                        src={p.img}
                        alt={p.title || `Program ${i + 1}`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-contain"
                      />
                    </>
                  ) : (
                    <Image
                      src={p.img}
                      alt={p.title || `Program ${i + 1}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  )
                ) : null}
                {p.title ? (
                  <div
                    className={`absolute top-4 left-4 ${p.color} text-white text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded`}
                  >
                    {p.title}
                  </div>
                ) : null}
              </div>
              <div className="p-5">
                {p.title ? <h3 className="font-heading font-bold text-gray-900 text-lg mb-2">{p.title}</h3> : null}
                {p.desc ? <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p> : null}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeskSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [displayVersion, setDisplayVersion] = useState(() => Date.now());
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const [directorMessage, setDirectorMessage] = useState("");
  const [directorMotto, setDirectorMotto] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [directorRole, setDirectorRole] = useState("");
  const [directorImage, setDirectorImage] = useState("");

  const [principalQuote, setPrincipalQuote] = useState("");
  const [principalMessage, setPrincipalMessage] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [principalRole, setPrincipalRole] = useState("");
  const [principalImage, setPrincipalImage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const getBaseUrl = (value: unknown) => {
      if (typeof value !== "string") return "";
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed.split("?")[0] : "";
    };

    const applySetting = (raw: unknown, versionFromRow: unknown) => {
      const versionFromValue = typeof raw === "object" && raw ? (raw as { version?: unknown }).version : undefined;
      const version =
        typeof versionFromValue === "string" || typeof versionFromValue === "number"
          ? String(versionFromValue)
          : typeof versionFromRow === "string" || typeof versionFromRow === "number"
            ? String(versionFromRow)
            : String(Date.now());

      const nextDirector =
        typeof raw === "object" && raw && typeof (raw as { director?: unknown }).director === "object"
          ? ((raw as { director?: unknown }).director as Record<string, unknown>)
          : null;
      const nextPrincipal =
        typeof raw === "object" && raw && typeof (raw as { principal?: unknown }).principal === "object"
          ? ((raw as { principal?: unknown }).principal as Record<string, unknown>)
          : null;

      const loadedFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";
      setFit(loadedFit);

      if (nextDirector) {
        setDirectorMessage(typeof nextDirector.message === "string" ? nextDirector.message.trim() : "");
        setDirectorMotto(typeof nextDirector.motto === "string" ? nextDirector.motto.trim() : "");
        setDirectorName(typeof nextDirector.name === "string" ? nextDirector.name.trim() : "");
        setDirectorRole(typeof nextDirector.role === "string" ? nextDirector.role.trim() : "");
        const img = getBaseUrl(nextDirector.image);
        setDirectorImage(img ? `${img}?v=${encodeURIComponent(version)}` : "");
      }

      if (nextPrincipal) {
        setPrincipalQuote(typeof nextPrincipal.quote === "string" ? nextPrincipal.quote.trim() : "");
        setPrincipalMessage(typeof nextPrincipal.message === "string" ? nextPrincipal.message.trim() : "");
        setPrincipalName(typeof nextPrincipal.name === "string" ? nextPrincipal.name.trim() : "");
        setPrincipalRole(typeof nextPrincipal.role === "string" ? nextPrincipal.role.trim() : "");
        const img = getBaseUrl(nextPrincipal.image);
        setPrincipalImage(img ? `${img}?v=${encodeURIComponent(version)}` : "");
      }

      setDisplayVersion(Number.isNaN(Number(version)) ? Date.now() : Number(version));
    };

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("value, updated_at")
          .eq("key", HOME_DESK_KEY)
          .maybeSingle();
        if (cancelled || error || !data?.value) return;
        const version = (data.value as { version?: unknown } | null)?.version ?? data.updated_at ?? Date.now();
        applySetting(data.value as unknown, version);
      } catch {
        return;
      }
    };

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("home-desk")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: `key=eq.${HOME_DESK_KEY}` },
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

  const initials = (name: string) =>
    name
      .split(/\s+/g)
      .map((w) => w.trim())
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

  return (
    <section className="pt-20 pb-32 bg-school-dark text-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <span className="inline-block bg-school-gold/20 text-school-gold text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
            Leadership
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-black">From The Desk of Our Leaders</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 pt-40 relative overflow-visible"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-school-green/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-school-gold/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-white/10 z-10">
              {directorImage ? (
                fit === "contain" ? (
                  <>
                    <Image
                      src={directorImage}
                      alt=""
                      fill
                      sizes="224px"
                      className="object-cover scale-110 blur-2xl"
                      aria-hidden
                      key={`${directorImage}-bg-${displayVersion}`}
                    />
                    <Image
                      src={directorImage}
                      alt={directorName ? `${directorName} photo` : "Director photo"}
                      fill
                      sizes="224px"
                      className="object-contain"
                      key={`${directorImage}-fg-${displayVersion}`}
                    />
                  </>
                ) : (
                  <Image
                    src={directorImage}
                    alt={directorName ? `${directorName} photo` : "Director photo"}
                    fill
                    sizes="224px"
                    className="object-cover"
                    key={`${directorImage}-${displayVersion}`}
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-school-gold text-school-dark font-heading font-black text-4xl">
                  {initials(directorName || "Director")}
                </div>
              )}
            </div>
            <Quote size={36} className="text-school-gold mb-4" />
            {directorMessage.trim().length > 0 ? (
              <p className="text-gray-300 text-base leading-relaxed mb-4 italic">{directorMessage}</p>
            ) : null}
            {directorMotto.trim().length > 0 ? (
              <div className="bg-school-gold/10 border-l-4 border-school-gold px-4 py-3 rounded-r-lg mb-6">
                <div className="text-school-gold text-sm md:text-base font-heading font-black tracking-widest uppercase mb-1">
                  Our Motto
                </div>
                <div className="text-gray-200 text-sm italic">{directorMotto}</div>
              </div>
            ) : null}
            <div className="flex items-center gap-4">
              <div>
                <div className="font-heading font-bold text-white text-lg">{directorName || "Director"}</div>
                {directorRole.trim().length > 0 ? (
                  <div className="text-school-gold text-sm font-medium">{directorRole}</div>
                ) : null}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 pt-40 relative overflow-visible mt-14 lg:mt-0"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-school-purple/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-school-orange/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-white/10 z-10">
              {principalImage ? (
                fit === "contain" ? (
                  <>
                    <Image
                      src={principalImage}
                      alt=""
                      fill
                      sizes="224px"
                      className="object-cover scale-110 blur-2xl"
                      aria-hidden
                      key={`${principalImage}-bg-${displayVersion}`}
                    />
                    <Image
                      src={principalImage}
                      alt={principalName ? `${principalName} photo` : "Principal photo"}
                      fill
                      sizes="224px"
                      className="object-contain"
                      key={`${principalImage}-fg-${displayVersion}`}
                    />
                  </>
                ) : (
                  <Image
                    src={principalImage}
                    alt={principalName ? `${principalName} photo` : "Principal photo"}
                    fill
                    sizes="224px"
                    className="object-cover"
                    key={`${principalImage}-${displayVersion}`}
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-school-orange text-white font-heading font-black text-4xl">
                  {initials(principalName || "Principal")}
                </div>
              )}
            </div>
            <Quote size={36} className="text-school-orange mb-4" />
            {principalQuote.trim().length > 0 ? (
              <div className="bg-school-gold/10 border-l-4 border-school-gold px-4 py-3 rounded-r-lg mb-4 italic text-school-gold text-sm">
                {principalQuote}
              </div>
            ) : null}
            {principalMessage.trim().length > 0 ? (
              <p className="text-gray-300 text-base leading-relaxed mb-6 italic">{principalMessage}</p>
            ) : null}
            <div className="flex items-center gap-4">
              <div>
                <div className="font-heading font-bold text-white text-lg">{principalName || "Principal"}</div>
                {principalRole.trim().length > 0 ? (
                  <div className="text-school-orange text-sm font-medium">{principalRole}</div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AcademicSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-blue-100 text-school-blue text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
              Academics
            </span>
            <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900 mb-4 leading-tight">
              Academic Programme
              <br />& Curriculum
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Growwell School Kharar offers admission from <strong>Play Class to Class II</strong> in the academic
              session, adding a class each year progressively until Grade 9. We follow the norms of the{" "}
              <strong>New Education Policy 2020</strong>.
            </p>

            <div className="space-y-3 mb-8">
              {[
                {
                  label: "CBSE Curriculum",
                  sub: "National standard of education",
                  color: "text-school-green",
                  bg: "bg-green-50",
                },
                {
                  label: "NEP 2020 Compliant",
                  sub: "Following Punjab Govt norms",
                  color: "text-school-blue",
                  bg: "bg-blue-50",
                },
                {
                  label: "English Medium",
                  sub: "Global communication skills",
                  color: "text-school-purple",
                  bg: "bg-purple-50",
                },
                {
                  label: "Co-Educational",
                  sub: "Inclusive learning environment",
                  color: "text-school-orange",
                  bg: "bg-orange-50",
                },
              ].map((item) => (
                <div key={item.label} className={`flex items-center gap-4 ${item.bg} rounded-xl px-4 py-3`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color.replace("text-", "bg-")}`} />
                  <div>
                    <div className={`font-heading font-bold ${item.color} text-sm`}>{item.label}</div>
                    <div className="text-gray-500 text-xs">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-school-dark rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-school-gold px-6 py-4">
                <h3 className="font-heading font-black text-school-dark text-lg">Age Eligibility — Session 2026-27</h3>
                <p className="text-school-dark/70 text-xs mt-1">Age as on 31.03.2026</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-school-green/20 text-left">
                    <th className="px-5 py-3 text-school-lime text-xs font-bold uppercase tracking-wide">Class</th>
                    <th className="px-5 py-3 text-school-lime text-xs font-bold uppercase tracking-wide">
                      Age Criteria
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Play Class", "2 to 3 years"],
                    ["Nursery", "3 to 4 years"],
                    ["K.G.-1", "4 to 5 years"],
                    ["K.G.-2", "5 to 6 years"],
                    ["Class I", "6 to 7 years"],
                    ["Class II", "7 to 8 years"],
                  ].map(([cls, age], i) => (
                    <tr
                      key={cls}
                      className={`border-t border-white/10 ${i % 2 === 0 ? "bg-white/5" : "bg-transparent"}`}
                    >
                      <td className="px-5 py-3 text-white font-medium text-sm">{cls}</td>
                      <td className="px-5 py-3 text-school-gold text-sm font-semibold">{age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-5 bg-school-green/10 border-t border-white/10">
                <Link href="/admission" className="btn-secondary w-full justify-center text-sm">
                  Start Your Application <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

type HomeNewsSlide = {
  id: string;
  tag: string;
  date: string;
  title: string;
  desc: string;
  href: string;
  image: string;
};

type HomeNewsFit = "cover" | "contain";

function NewsAnnouncementsSlider() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const [slides, setSlides] = useState<HomeNewsSlide[]>([]);
  const [active, setActive] = useState(0);
  const [fit, setFit] = useState<HomeNewsFit>("cover");

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
          const desc =
            typeof obj?.desc === "string"
              ? obj.desc.trim()
              : typeof obj?.summary === "string"
                ? obj.summary.trim()
                : typeof obj?.details === "string"
                  ? obj.details.trim()
                  : "";
          const href = `/news/${encodeURIComponent(id)}`;
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

          return { id, tag, date, title, desc, href, image };
        })
        .filter((it) => it.title.length > 0 && it.image.length > 0)
        .slice(0, 4);

      if (cancelled) return;
      const loadedFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";
      setSlides(mapped);
      setActive((prev) => (mapped.length === 0 ? 0 : Math.min(prev, mapped.length - 1)));
      setFit(loadedFit);
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
      .channel("home-news")
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

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setActive((p) => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const go = (idx: number) => setActive(idx);
  const slide = slides[active];

  return (
    <section className="pt-12 pb-16 bg-school-dark text-white relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 pattern-grid opacity-20" />
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-school-gold/15 blur-3xl" aria-hidden />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-school-green/15 blur-3xl" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        >
          <div>
            <span className="inline-block bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
              Updates
            </span>
            <h2 className="text-3xl lg:text-4xl font-heading font-black">News & Announcements</h2>
            <p className="text-gray-300 mt-3 max-w-xl">
              Latest notices, key dates and highlights from around the campus.
            </p>
          </div>

          <Link href="/news" className="btn-secondary self-start">
            View All
          </Link>
        </motion.div>

        {slides.length > 0 && slide ? (
          <>
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 160, rotate: 10 }}
              animate={inView ? { opacity: 1, x: 0, rotate: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.05, type: "spring", bounce: 0.35 }}
              className="relative overflow-hidden rounded-3xl border border-school-gold/20 bg-white/5 backdrop-blur shadow-2xl"
            >
              <div className="absolute inset-0 pattern-grid opacity-20" aria-hidden />

              <div className="relative p-8 md:p-10 grid md:grid-cols-[1fr_240px] gap-10 items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <span className="inline-flex items-center gap-2 bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                      {slide.tag}
                    </span>
                    <span className="text-xs text-gray-200/80 font-semibold tracking-wide">{slide.date}</span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-heading font-black leading-tight">{slide.title}</h3>
                  <p className="text-gray-200 mt-3 leading-relaxed max-w-2xl line-clamp-2">{slide.desc}</p>

                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <Link href={slide.href} className="btn-primary border border-white/20">
                      Read More
                    </Link>
                    <Link href="/admission" className="btn-secondary">
                      Apply Now
                    </Link>
                  </div>
                </div>

                <div className="hidden md:block">
                  <div className="relative w-full aspect-square rounded-3xl border border-white/15 bg-white/5 overflow-hidden">
                    <div className="absolute inset-0 pattern-grid opacity-20" aria-hidden />
                    {slide.image ? (
                      fit === "contain" ? (
                        <>
                          <Image
                            src={slide.image}
                            alt=""
                            fill
                            sizes="240px"
                            className="object-cover blur-2xl scale-110 opacity-40"
                          />
                          <Image src={slide.image} alt={slide.title} fill sizes="240px" className="object-contain" />
                        </>
                      ) : (
                        <Image src={slide.image} alt={slide.title} fill sizes="240px" className="object-cover" />
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-8 flex justify-center gap-3">
              {slides.map((it, i) => (
                <button
                  key={it.id}
                  onClick={() => go(i)}
                  aria-label={`Go to update ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? "bg-school-gold w-8" : "bg-white/30 w-2 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl p-10 text-center">
            <div className="text-school-gold font-heading font-black text-xl mb-2">No announcements yet</div>
            <div className="text-gray-200/80 text-sm">
              Updates will appear here once they are added from the admin panel.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function GalleryPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [items, setItems] = useState<{ id: number; url: string; label?: string }[]>([]);
  const [fit, setFit] = useState<"cover" | "contain">("cover");

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

      const nextFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";

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
          const url =
            typeof obj?.url === "string"
              ? normalizeUrl(obj.url)
              : typeof obj?.image === "string"
                ? normalizeUrl(obj.image)
                : typeof obj?.photo === "object" &&
                    obj.photo &&
                    typeof (obj.photo as { url?: unknown }).url === "string"
                  ? normalizeUrl(String((obj.photo as { url: string }).url))
                  : "";
          const label =
            typeof obj?.label === "string" ? obj.label.trim() : typeof obj?.title === "string" ? obj.title.trim() : "";
          return { id: i + 1, url, label };
        })
        .filter((it) => it.url.trim().length > 0);

      if (cancelled) return;
      setFit(nextFit);
      setItems(mapped);
    };

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("value, updated_at")
          .eq("key", HOME_LIFE_KEY)
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
      .channel("home-life")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: `key=eq.${HOME_LIFE_KEY}` },
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
    <section className="py-20 pattern-zigzag bg-gray-50 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        >
          <div>
            <span className="inline-block bg-purple-100 text-school-purple text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
              Gallery
            </span>
            <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900">Life at Growwell School</h2>
          </div>
          <Link href="/gallery" className="btn-primary self-start">
            View All Photos <ArrowRight size={18} />
          </Link>
        </motion.div>

        {items.length > 0 ? (
          <div className="mt-8 relative z-10 w-full overflow-visible rounded-3xl bg-black/5 p-4 shadow-inner">
            <OrbitCarousel images={items} fit={fit} />
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-black/10 bg-white p-8 text-center text-sm text-gray-500">
            Photos will appear here soon.
          </div>
        )}
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="py-16 bg-school-green relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20" />
      <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 hidden lg:block">
        <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((r, i) => (
            <ellipse
              key={i}
              cx="100"
              cy="70"
              rx="20"
              ry="60"
              fill="#ffd700"
              transform={`rotate(${r},100,100)`}
              opacity="0.6"
            />
          ))}
          <circle cx="100" cy="100" r="20" fill="#ffd700" />
        </svg>
      </div>
      <div className="max-w-4xl mx-auto px-4 text-center relative">
        <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-4">Admission Open for 2026-27</h2>
        <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
          Secure your child's future at Growwell School. Limited seats available. Apply today for Play Class through
          Class II.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/admission" className="btn-secondary">
            Apply Now <ArrowRight size={18} />
          </Link>
          <Link
            href="/contact"
            className="bg-white/20 text-white border border-white/40 px-7 py-3 rounded-md font-heading font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const [images, setImages] = useState<string[]>(["", "", ""]);
  const [details, setDetails] = useState("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");

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
        : typeof raw === "object" && raw && Array.isArray((raw as { images?: unknown }).images)
          ? (raw as { images: unknown[] }).images
          : null;

      const urls = [0, 1, 2].map((i) => {
        const value = candidate?.[i];
        if (typeof value !== "string") return "";
        const trimmed = value.trim();
        if (trimmed.length === 0) return "";
        const base = trimmed.split("?")[0];
        return `${base}?v=${encodeURIComponent(version)}`;
      });

      const nextFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";
      const nextDetails =
        typeof raw === "object" && raw && typeof (raw as { details?: unknown }).details === "string"
          ? String((raw as { details: string }).details)
          : null;
      const nextMission =
        typeof raw === "object" && raw && typeof (raw as { mission?: unknown }).mission === "string"
          ? String((raw as { mission: string }).mission)
          : null;
      const nextVision =
        typeof raw === "object" && raw && typeof (raw as { vision?: unknown }).vision === "string"
          ? String((raw as { vision: string }).vision)
          : null;

      setFit(nextFit);
      setImages([urls[0] ?? "", urls[1] ?? "", urls[2] ?? ""]);
      setDetails(nextDetails ?? "");
      setMission(nextMission ?? "");
      setVision(nextVision ?? "");
      setLoadState("ready");
    };

    const load = async () => {
      setLoadState("loading");
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("value, updated_at")
          .eq("key", HOME_ABOUT_KEY)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          setLoadState("error");
          return;
        }
        if (!data?.value) {
          setLoadState("ready");
          return;
        }
        applySetting(data.value as unknown, String(data.updated_at ?? Date.now()));
      } catch {
        if (cancelled) return;
        setLoadState("error");
      }
    };

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("home-about")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: `key=eq.${HOME_ABOUT_KEY}` },
        (payload) => {
          if (cancelled) return;
          const row = (payload as { new?: { value?: unknown; updated_at?: unknown } }).new;
          const commitTimestamp = (payload as { commit_timestamp?: unknown }).commit_timestamp;
          applySetting(
            row?.value,
            (row?.value as { version?: unknown } | null)?.version ?? commitTimestamp ?? row?.updated_at ?? Date.now(),
          );
        },
      )
      .subscribe();

    load();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const hasContent =
    images.some((v) => v.trim().length > 0) ||
    details.trim().length > 0 ||
    mission.trim().length > 0 ||
    vision.trim().length > 0;
  if (loadState === "ready" && !hasContent) return null;

  const detailBlocks = details
    .split(/\n\s*\n/g)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section id="about" className="py-20 bg-white overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1 row-span-2">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg relative">
                  {images[0] ? (
                    fit === "contain" ? (
                      <>
                        <Image
                          src={images[0]}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 25vw, 45vw"
                          className="object-cover scale-110 blur-2xl"
                          aria-hidden
                        />
                        <Image
                          src={images[0]}
                          alt="Students learning on campus"
                          fill
                          sizes="(min-width: 1024px) 25vw, 45vw"
                          className="object-contain"
                        />
                      </>
                    ) : (
                      <Image
                        src={images[0]}
                        alt="Students learning on campus"
                        fill
                        sizes="(min-width: 1024px) 25vw, 45vw"
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    )
                  ) : null}
                </div>
              </div>
              <div className="col-span-1">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-lg relative">
                  {images[1] ? (
                    fit === "contain" ? (
                      <>
                        <Image
                          src={images[1]}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 25vw, 45vw"
                          className="object-cover scale-110 blur-2xl"
                          aria-hidden
                        />
                        <Image
                          src={images[1]}
                          alt="Students participating in activities"
                          fill
                          sizes="(min-width: 1024px) 25vw, 45vw"
                          className="object-contain"
                        />
                      </>
                    ) : (
                      <Image
                        src={images[1]}
                        alt="Students participating in activities"
                        fill
                        sizes="(min-width: 1024px) 25vw, 45vw"
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    )
                  ) : null}
                </div>
              </div>
              <div className="col-span-1">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-lg relative">
                  {images[2] ? (
                    fit === "contain" ? (
                      <>
                        <Image
                          src={images[2]}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 25vw, 45vw"
                          className="object-cover scale-110 blur-2xl"
                          aria-hidden
                        />
                        <Image
                          src={images[2]}
                          alt="Students playing on the school grounds"
                          fill
                          sizes="(min-width: 1024px) 25vw, 45vw"
                          className="object-contain"
                        />
                      </>
                    ) : (
                      <Image
                        src={images[2]}
                        alt="Students playing on the school grounds"
                        fill
                        sizes="(min-width: 1024px) 25vw, 45vw"
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    )
                  ) : null}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 lg:-bottom-8 lg:right-0 bg-school-orange text-white p-6 rounded-xl shadow-xl z-10 w-40 h-40 flex flex-col items-center justify-center transform rotate-3 hover:rotate-0 transition-transform">
              <div className="text-4xl font-black font-heading tracking-tighter mb-1">15+</div>
              <div className="text-xs font-bold uppercase tracking-wider text-center leading-tight">
                Years of
                <br />
                Excellence
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:pl-8"
          >
            <span className="inline-block bg-green-100 text-school-green text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
              About Growwell
            </span>
            <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900 mb-6 leading-tight">
              Cultivating Excellence
              <br />
              Since 2011
            </h2>

            {detailBlocks.map((block, idx) => (
              <p
                key={idx}
                className={`text-gray-600 leading-relaxed ${idx === detailBlocks.length - 1 ? "mb-8" : "mb-5"}`}
              >
                {block}
              </p>
            ))}

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-green-50 border-l-4 border-school-green rounded-r-xl p-5">
                <div className="font-heading font-bold text-school-green mb-2">Mission</div>
                <div className="text-gray-600 text-sm leading-relaxed">{mission}</div>
              </div>
              <div className="bg-green-50 border-l-4 border-school-green rounded-r-xl p-5">
                <div className="font-heading font-bold text-school-green mb-2">Vision</div>
                <div className="text-gray-600 text-sm leading-relaxed">{vision}</div>
              </div>
            </div>

            <Link href="/admission" className="btn-primary inline-flex items-center">
              Explore Admission <ArrowRight size={18} className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <NewsTicker />
      <AboutSection />
      <StatsSection />
      <OurJourneySection />
      <ProgramsSection />
      <CircularGalleryDemo />
      <DeskSection />
      <AcademicSection />
      <NewsAnnouncementsSlider />
      <GalleryPreview />
      <CTABanner />
    </>
  );
}
