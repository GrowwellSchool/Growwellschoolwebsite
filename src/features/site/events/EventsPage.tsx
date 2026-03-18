"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

const EVENTS_PAGE_KEY = "events.page";

type UpcomingEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  img: string;
  cat: string;
  catColor: string;
  desc: string;
  highlight: boolean;
};

type PastHighlight = { id: string; img: string; title: string; year: string; desc: string };
type EventsFit = "cover" | "contain";

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
            Events & Activities
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

function UpcomingSection({ upcomingEvents, fit }: { upcomingEvents: UpcomingEvent[]; fit: EventsFit }) {
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

        {upcomingEvents
          .filter((e) => e.highlight)
          .map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl mb-8 grid lg:grid-cols-2"
            >
              <div className="img-zoom h-64 lg:h-auto relative bg-school-dark">
                {fit === "contain" ? (
                  <>
                    <Image
                      src={event.img}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover scale-110 blur-2xl"
                      aria-hidden
                    />
                    <Image
                      src={event.img}
                      alt={event.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-contain"
                    />
                  </>
                ) : (
                  <Image
                    src={event.img}
                    alt={event.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
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
                    <Clock size={16} className="text-school-green" /> {event.time}
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
          {upcomingEvents
            .filter((e) => !e.highlight)
            .map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl overflow-hidden shadow-md card-hover"
              >
                <div className="img-zoom h-48 relative bg-school-dark">
                  {fit === "contain" ? (
                    <>
                      <Image
                        src={event.img}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover scale-110 blur-2xl"
                        aria-hidden
                      />
                      <div className="absolute inset-0 bg-school-dark/10" />
                      <Image
                        src={event.img}
                        alt={event.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-contain"
                      />
                    </>
                  ) : (
                    <Image
                      src={event.img}
                      alt={event.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-5">
                  <span
                    className={`${event.catColor} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded`}
                  >
                    {event.cat}
                  </span>
                  <h3 className="font-heading font-bold text-gray-800 text-lg mt-3 mb-2">
                    <Link href={`/events/${encodeURIComponent(event.id)}`}>{event.title}</Link>
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-4">{event.desc}</p>
                  <Link
                    href={`/events/${encodeURIComponent(event.id)}`}
                    className="inline-flex items-center gap-2 text-school-green font-heading font-bold text-sm"
                  >
                    View Details <ArrowRight size={16} />
                  </Link>
                  <div className="space-y-1.5 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Calendar size={13} className="text-school-green" /> {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <MapPin size={13} className="text-school-green" /> {event.venue}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}

function PastHighlightsSection({ pastHighlights, fit }: { pastHighlights: PastHighlight[]; fit: EventsFit }) {
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
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden card-hover group"
            >
              <div className="img-zoom h-44 relative bg-school-dark">
                {fit === "contain" ? (
                  <>
                    <Image
                      src={item.img}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover scale-110 blur-2xl"
                      aria-hidden
                    />
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
                <div className="text-school-gold text-xs font-bold mb-1">{item.year}</div>
                <h3 className="font-heading font-bold text-white text-sm mb-1">
                  <Link href={`/events/${encodeURIComponent(item.id)}`}>{item.title}</Link>
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-4">{item.desc}</p>
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
      </div>
    </section>
  );
}

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [pastHighlights, setPastHighlights] = useState<PastHighlight[]>([]);
  const [fit, setFit] = useState<EventsFit>("cover");

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
      const loadedFit =
        typeof raw === "object" && raw && (raw as { fit?: unknown }).fit === "contain" ? "contain" : "cover";

      const calendarRaw =
        typeof raw === "object" && raw && Array.isArray((raw as { calendar?: unknown }).calendar)
          ? ((raw as { calendar: unknown[] }).calendar as unknown[])
          : [];
      const momentsRaw =
        typeof raw === "object" && raw && Array.isArray((raw as { moments?: unknown }).moments)
          ? ((raw as { moments: unknown[] }).moments as unknown[])
          : [];

      const nextUpcoming = calendarRaw
        .map((row, idx) => {
          const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
          const id =
            typeof obj?.id === "string"
              ? obj.id.trim()
              : typeof obj?.id === "number"
                ? String(obj.id)
                : `event-${idx + 1}`;
          const title = typeof obj?.title === "string" ? obj.title : "";
          const date = typeof obj?.date === "string" ? obj.date : "";
          const time = typeof obj?.time === "string" ? obj.time : "";
          const venue = typeof obj?.venue === "string" ? obj.venue : "";
          const img = typeof obj?.img === "string" ? addVersion(obj.img, version) : "";
          const cat = typeof obj?.cat === "string" ? obj.cat : "";
          const catColor = typeof obj?.catColor === "string" ? obj.catColor : "bg-school-green";
          const desc = typeof obj?.desc === "string" ? obj.desc : "";
          const highlight = Boolean(obj?.highlight);
          return { id, title, date, time, venue, img, cat, catColor, desc, highlight } satisfies UpcomingEvent;
        })
        .filter((e) => e.title.trim().length > 0);

      const nextMoments = momentsRaw
        .map((row, idx) => {
          const obj = typeof row === "object" && row ? (row as Record<string, unknown>) : null;
          const id =
            typeof obj?.id === "string"
              ? obj.id.trim()
              : typeof obj?.id === "number"
                ? String(obj.id)
                : `moment-${idx + 1}`;
          const img = typeof obj?.img === "string" ? addVersion(obj.img, version) : "";
          const title = typeof obj?.title === "string" ? obj.title : "";
          const year = typeof obj?.year === "string" ? obj.year : "";
          const desc = typeof obj?.desc === "string" ? obj.desc : "";
          return { id, img, title, year, desc } satisfies PastHighlight;
        })
        .filter((m) => m.title.trim().length > 0);

      if (cancelled) return;
      setUpcomingEvents(nextUpcoming);
      setPastHighlights(nextMoments);
      setFit(loadedFit);
    };

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("value, updated_at")
          .eq("key", EVENTS_PAGE_KEY)
          .maybeSingle();
        if (cancelled || error) return;
        if (!data?.value) {
          setUpcomingEvents([]);
          setPastHighlights([]);
          return;
        }
        applySetting(data.value as unknown, String(data.updated_at ?? Date.now()));
      } catch {
        return;
      }
    };

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("events-page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: `key=eq.${EVENTS_PAGE_KEY}` },
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

  return (
    <>
      <PageHero />
      <UpcomingSection upcomingEvents={upcomingEvents} fit={fit} />
      <PastHighlightsSection pastHighlights={pastHighlights} fit={fit} />
    </>
  );
}
