"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";


const PAGE_SIZE = 6;

type UpcomingEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  img: string;
  cat: string;
  catColor: string;
  desc: string;
  highlight: boolean;
  fit: "cover" | "contain";
  updatedAt?: string;
};

// Helper function to convert 24-hour time to 12-hour format with AM/PM
function formatTime12Hour(time24: string): string {
  if (!time24) return "";
  const [hours24, minutes] = time24.split(":").map(Number);
  if (isNaN(hours24) || isNaN(minutes)) return time24;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

type PastHighlight = { id: string; img: string; title: string; year: string; desc: string; fit: "cover" | "contain"; updatedAt?: string };
type EventsFit = "cover" | "contain";



// Helper to add cache-busting version to image URLs
function withImageVersion(url: string | undefined | null, version?: string | number | null): string {
  if (!url || !url.trim()) return "";
  const trimmed = url.trim();
  const base = trimmed.split("?")[0];
  const v = version ?? "1";
  return `${base}?v=${encodeURIComponent(String(v))}`;
}

function PageHero() {
  return (
    <section className="relative bg-school-dark text-white py-24 overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20" />
      <div
        className="absolute bottom-0 left-0 right-0 h-20 bg-gray-50"
        style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
      />
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-5">
            Events &amp; Activities
          </span>
          <h1 className="text-4xl lg:text-6xl font-heading font-black mb-4">School Events</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            From sports days to cultural festivals — life at Growwell is always vibrant and full of life.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function UpcomingSection({
  highlights,
  events,
  hasMore,
  loading,
  loadMoreRef, // Received ref for sentinel
}: {
  highlights: UpcomingEvent[];
  events: UpcomingEvent[];
  hasMore: boolean;
  loading: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section className="py-20 bg-gray-50 pattern-diagonal" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-12">
          <span className="inline-block bg-green-100 text-school-green text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
            Upcoming
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900">Events Calendar 2026</h2>
        </motion.div>

        {highlights.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl overflow-hidden shadow-xl mb-8 grid lg:grid-cols-2"
          >
            <div className="aspect-[3/4] lg:aspect-auto lg:h-[550px] relative bg-school-dark overflow-hidden">
              {event.fit === "contain" ? (
                <>
                  <Image
                    src={withImageVersion(event.img, event.updatedAt)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover scale-110 blur-2xl"
                    aria-hidden
                    priority={true}
                  />
                  <div className="absolute inset-0 bg-school-dark/40" />
                  <Image
                    src={withImageVersion(event.img, event.updatedAt)}
                    alt={event.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain"
                    priority={true}
                  />
                </>
              ) : (
                <Image
                  src={withImageVersion(event.img, event.updatedAt)}
                  alt={event.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  priority={true}
                />
              )}
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex gap-3 mb-4">
                <span
                  className={`${event.catColor} text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded`}
                >
                  {event.cat}
                </span>
                <span className="bg-school-gold text-school-dark text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded">
                  Featured
                </span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-heading font-black text-gray-900 mb-3">
                <Link href={`/events/${encodeURIComponent(event.id)}`}>{event.title}</Link>
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6 line-clamp-4">{event.desc}</p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <Calendar size={16} className="text-school-green" /> {event.date}
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <Clock size={16} className="text-school-green" /> 
                  {event.startTime && event.endTime 
                    ? `${formatTime12Hour(event.startTime)} – ${formatTime12Hour(event.endTime)}`
                    : event.startTime 
                      ? formatTime12Hour(event.startTime)
                      : event.endTime
                        ? formatTime12Hour(event.endTime)
                        : "—"}
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <MapPin size={16} className="text-school-green" /> {event.venue}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/events/${encodeURIComponent(event.id)}`} className="btn-secondary self-start">
                  View Details <ArrowRight size={16} />
                </Link>
                <Link href="/contact" className="btn-primary self-start">
                  Register / Enquire <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: Math.min(i, 5) * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-md card-hover"
            >
              <div className="aspect-[4/3] relative bg-school-dark overflow-hidden">
                {event.fit === "contain" ? (
                  <>
                    <Image
                      src={withImageVersion(event.img, event.updatedAt)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover scale-110 blur-2xl"
                      aria-hidden
                      priority={i < 2}
                    />
                    <div className="absolute inset-0 bg-school-dark/40" />
                    <Image
                      src={withImageVersion(event.img, event.updatedAt)}
                      alt={event.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-contain"
                      priority={i < 2}
                    />
                  </>
                ) : (
                  <Image
                    src={withImageVersion(event.img, event.updatedAt)}
                    alt={event.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    priority={i < 2}
                  />
                )}
              </div>
              <div className="p-5">
                <div className="flex gap-2 mb-2">
                  <span
                    className={`${event.catColor} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded`}
                  >
                    {event.cat}
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded">
                    {event.date}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-gray-800 text-lg mt-3 mb-2">
                  <Link href={`/events/${encodeURIComponent(event.id)}`}>{event.title}</Link>
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2 font-medium">{event.desc}</p>
                <Link
                  href={`/events/${encodeURIComponent(event.id)}`}
                  className="inline-flex items-center gap-2 text-school-green font-heading font-bold text-sm"
                >
                  View Details <ArrowRight size={16} />
                </Link>
                <div className="space-y-1.5 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-gray-700 text-xs">
                    <Calendar size={13} className="text-school-green" /> {event.date}
                  </div>
                  {(event.startTime || event.endTime) && (
                    <div className="flex items-center gap-2 text-gray-700 text-xs">
                      <Clock size={13} className="text-school-green" /> 
                      {event.startTime && event.endTime 
                        ? `${formatTime12Hour(event.startTime)} – ${formatTime12Hour(event.endTime)}`
                        : event.startTime 
                          ? formatTime12Hour(event.startTime)
                          : formatTime12Hour(event.endTime)}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-700 text-xs">
                    <MapPin size={13} className="text-school-green" /> {event.venue}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {events.length === 0 && !loading && highlights.length === 0 && (
          <div className="text-center py-16 text-gray-500">No upcoming events at this time.</div>
        )}

        {/* Infinite Scroll Sentinel */}
        <div ref={loadMoreRef} className="mt-12 flex justify-center min-h-[40px]">
          {loading && (
            <div className="w-8 h-8 rounded-full border-4 border-school-green border-t-transparent animate-spin" />
          )}
          {!hasMore && (events.length > 0 || highlights.length > 0) && (
            <p className="text-sm text-gray-400 font-medium">No more upcoming events to show.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function PastHighlightsSection({
  pastHighlights,
  hasMore,
  loading,
  loadMoreRef, // Received ref for sentinel
}: {
  pastHighlights: PastHighlight[];
  hasMore: boolean;
  loading: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section className="py-20 bg-school-dark text-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-12">
          <span className="inline-block bg-school-gold/20 text-school-gold text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
            Past Events
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-black">Memorable Moments</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pastHighlights.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: Math.min(i, 5) * 0.1, duration: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden card-hover group"
            >
              <div className="aspect-[4/3] relative bg-school-dark overflow-hidden">
                {item.fit === "contain" ? (
                  <>
                    <Image
                      src={item.img}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover scale-110 blur-2xl"
                      aria-hidden
                    />
                    <div className="absolute inset-0 bg-school-dark/40" />
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-contain"
                    />
                  </>
                ) : (
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-1">
                  <div className="text-[10px] font-black tracking-widest uppercase text-school-gold">{item.year}</div>
                </div>
                <h3 className="font-heading font-bold text-white text-sm mb-1">
                  <Link href={`/events/${encodeURIComponent(item.id)}`}>{item.title}</Link>
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed line-clamp-4 font-medium">{item.desc}</p>
                <Link
                  href={`/events/${encodeURIComponent(item.id)}`}
                  className="inline-flex items-center gap-2 text-school-gold font-heading font-bold text-xs mt-3"
                >
                  View Details <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {pastHighlights.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">No past events yet.</div>
        )}

        {/* Infinite Scroll Sentinel */}
        <div ref={loadMoreRef} className="mt-12 flex justify-center min-h-[40px]">
          {loading && (
            <div className="w-8 h-8 rounded-full border-4 border-school-gold border-t-transparent animate-spin" />
          )}
          {!hasMore && pastHighlights.length > 0 && (
            <p className="text-sm text-gray-400">No more past events to show.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function EventsPage() {
  const [highlights, setHighlights] = useState<UpcomingEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [pastHighlights, setPastHighlights] = useState<PastHighlight[]>([]);

  const [upcomingPage, setUpcomingPage] = useState(0);
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);

  const [pastPage, setPastPage] = useState(0);
  const [hasMorePast, setHasMorePast] = useState(true);
  const [loadingPast, setLoadingPast] = useState(false);

  // Guards and refs for accurate tracking in observers
  const fetchingMetaRef = useRef(false);
  const fetchingUpcomingRef = useRef(false);
  const fetchingPastRef = useRef(false);
  const upcomingPageRef = useRef(0);
  const pastPageRef = useRef(0);
  const hasMoreUpcomingRef = useRef(true);
  const hasMorePastRef = useRef(true);

  useEffect(() => { upcomingPageRef.current = upcomingPage; }, [upcomingPage]);
  useEffect(() => { pastPageRef.current = pastPage; }, [pastPage]);
  useEffect(() => { hasMoreUpcomingRef.current = hasMoreUpcoming; }, [hasMoreUpcoming]);
  useEffect(() => { hasMorePastRef.current = hasMorePast; }, [hasMorePast]);

  // Sentinel refs
  const upcomingSentinelRef = useRef<HTMLDivElement | null>(null);
  const pastSentinelRef = useRef<HTMLDivElement | null>(null);

  // On mount: fetch fit setting and highlight events
  useEffect(() => {
    let cancelled = false;
    const loadMeta = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: hData } = await supabase
            .from("events")
            .select("*")
            .eq("type", "upcoming")
            .eq("highlight", true)
            .order("created_at", { ascending: false });

        if (cancelled) return;

        if (hData) {
          setHighlights(
            hData.map((d) => ({
              id: d.id, title: d.title, date: d.date, startTime: d.start_time, endTime: d.end_time,
              venue: d.venue, img: withImageVersion(d.img, d.updated_at), cat: d.cat, catColor: d.cat_color,
              desc: d.description, highlight: d.highlight, fit: d.fit === "cover" ? "cover" : "contain", updatedAt: d.updated_at,
            }))
          );
        }
      } finally {
        fetchingMetaRef.current = false;
      }
    };

    loadMeta();
    return () => { cancelled = true; };
  }, []);

  // Upcoming events (non-highlights) with pagination
  const fetchUpcoming = useCallback(async (currentPage: number, isAppending: boolean) => {
    if (fetchingUpcomingRef.current) return;
    fetchingUpcomingRef.current = true;
    setLoadingUpcoming(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, count, error } = await supabase
        .from("events")
        .select("*", { count: "exact" })
        .eq("type", "upcoming")
        .eq("highlight", false)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!error && data) {
        const mapped: UpcomingEvent[] = data.map((d) => ({
          id: d.id, title: d.title, date: d.date, startTime: d.start_time, endTime: d.end_time,
          venue: d.venue, img: withImageVersion(d.img, d.updated_at), cat: d.cat, catColor: d.cat_color,
          desc: d.description, highlight: d.highlight, fit: d.fit === "cover" ? "cover" : "contain",
          updatedAt: d.updated_at,
        }));
        if (isAppending) setUpcomingEvents((prev) => [...prev, ...mapped]);
        else setUpcomingEvents(mapped);
        setHasMoreUpcoming(count !== null && from + data.length < count);
      }
    } finally {
      setLoadingUpcoming(false);
      fetchingUpcomingRef.current = false;
    }
  }, []);

  // Past events with pagination
  const fetchPast = useCallback(async (currentPage: number, isAppending: boolean) => {
    if (fetchingPastRef.current) return;
    fetchingPastRef.current = true;
    setLoadingPast(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, count, error } = await supabase
        .from("events")
        .select("*", { count: "exact" })
        .eq("type", "past")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!error && data) {
        const mapped: PastHighlight[] = data.map((d) => ({
          id: d.id, img: withImageVersion(d.img, d.updated_at), title: d.title, year: d.year, desc: d.description,
          fit: d.fit === "cover" ? "cover" : "contain", updatedAt: d.updated_at,
        }));
        if (isAppending) setPastHighlights((prev) => [...prev, ...mapped]);
        else setPastHighlights(mapped);
        setHasMorePast(count !== null && from + data.length < count);
      }
    } finally {
      setLoadingPast(false);
      fetchingPastRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    setUpcomingEvents([]);
    setPastHighlights([]);
    setUpcomingPage(0);
    setPastPage(0);
    upcomingPageRef.current = 0;
    pastPageRef.current = 0;
    fetchUpcoming(0, false);
    fetchPast(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Observer for upcoming
  useEffect(() => {
    const el = upcomingSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreUpcomingRef.current && !fetchingUpcomingRef.current) {
        const nextPage = upcomingPageRef.current + 1;
        upcomingPageRef.current = nextPage;
        setUpcomingPage(nextPage);
        fetchUpcoming(nextPage, true);
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Observer for past
  useEffect(() => {
    const el = pastSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMorePastRef.current && !fetchingPastRef.current) {
        const nextPage = pastPageRef.current + 1;
        pastPageRef.current = nextPage;
        setPastPage(nextPage);
        fetchPast(nextPage, true);
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHero />
      <UpcomingSection
        highlights={highlights}
        events={upcomingEvents}
        hasMore={hasMoreUpcoming}
        loading={loadingUpcoming}
        loadMoreRef={upcomingSentinelRef}
      />
      <PastHighlightsSection
        pastHighlights={pastHighlights}
        hasMore={hasMorePast}
        loading={loadingPast}
        loadMoreRef={pastSentinelRef}
      />
    </>
  );
}
