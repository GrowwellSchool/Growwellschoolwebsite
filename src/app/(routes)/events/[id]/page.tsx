"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

// Helper function to convert 24-hour time to 12-hour format with AM/PM
function formatTime12Hour(time24: string): string {
  if (!time24) return "";
  const [hours24, minutes] = time24.split(":").map(Number);
  if (isNaN(hours24) || isNaN(minutes)) return time24;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

type EventsFit = "cover" | "contain";

type CalendarEvent = {
  kind: "calendar";
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
};

type PastMoment = {
  kind: "moment";
  id: string;
  title: string;
  year: string;
  img: string;
  desc: string;
};

type DetailItem = CalendarEvent | PastMoment;

function withImageVersion(url: string | undefined | null, version?: string | number | null): string {
  if (!url || !url.trim()) return "";
  const base = url.trim().split("?")[0];
  if (!base.startsWith("http")) return base;
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

  const [fit] = useState<EventsFit>("contain");
  const [item, setItem] = useState<DetailItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: dbItem } = await supabase.from("events").select("*").eq("id", id).maybeSingle();

        if (cancelled) return;

        if (dbItem) {
          const isPast = dbItem.type === "past";
          const desc = dbItem.description || dbItem.desc || dbItem.details || dbItem.content || "";
          const image = dbItem.img || dbItem.image || "";

          if (isPast) {
            setItem({
              kind: "moment",
              id: dbItem.id,
              title: dbItem.title || "",
              year: dbItem.year || (dbItem.date ? new Date(dbItem.date).getFullYear().toString() : ""),
              img: withImageVersion(image, dbItem.updated_at),
              desc,
            });
          } else {
            setItem({
              kind: "calendar",
              id: dbItem.id,
              title: dbItem.title || "",
              date: dbItem.date || "",
              startTime: dbItem.start_time || "",
              endTime: dbItem.end_time || "",
              venue: dbItem.venue || "",
              img: withImageVersion(image, dbItem.updated_at),
              cat: dbItem.cat || "",
              catColor: dbItem.cat_color || dbItem.catColor || "bg-school-green",
              desc,
            });
          }
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
      .channel("events-detail-item")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events", filter: `id=eq.${id}` },
        () => { if (!cancelled) load(); }
      )
      .subscribe();

    load();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [id]);

  const title = item?.title ?? "Events";

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
              Events & Activities
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-heading font-black mb-4 leading-tight break-words max-w-4xl">
              {title}
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto">
              From sports days to cultural festivals — life at Growwell is always vibrant and full of life.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pt-6 pb-16 bg-white pattern-grid">
        <div className="max-w-6xl mx-auto px-4">
          {!loading && !item ? (
            <div className="rounded-3xl border border-black/10 bg-white p-10 text-center">
              <div className="text-school-dark font-heading font-black text-2xl">Event not found</div>
              <div className="text-sm text-gray-600 mt-2">Please go back to the Events page and try another post.</div>
            </div>
          ) : null}

          {item ? (
            <div className="rounded-3xl border border-black/10 bg-white shadow-xl overflow-hidden">
              <div className="aspect-[3/4] lg:aspect-auto lg:h-[500px] relative bg-school-dark overflow-hidden">
                {item.img ? (
                  fit === "contain" ? (
                    <>
                      <Image
                        src={item.img}
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover scale-110 blur-2xl"
                        aria-hidden
                        priority
                      />
                      <div className="absolute inset-0 bg-school-dark/40" />
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        sizes="100vw"
                        className="object-contain"
                        priority
                      />
                    </>
                  ) : (
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="100vw"
                      className="object-contain"
                      priority
                    />
                  )
                ) : null}

              </div>

              <div className="p-6 md:p-10">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {item.kind === "calendar" ? (
                    <span
                      className={`${item.catColor} text-white text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full`}
                    >
                      {item.cat || "Event"}
                    </span>
                  ) : (
                    <span className="bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                      Past Event
                    </span>
                  )}
                  {item.kind === "calendar" && item.date ? (
                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {item.date}
                    </span>
                  ) : null}
                  {item.kind === "calendar" && (item.startTime || item.endTime) ? (
                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {item.startTime && item.endTime 
                        ? `${formatTime12Hour(item.startTime)} – ${formatTime12Hour(item.endTime)}`
                        : item.startTime 
                          ? formatTime12Hour(item.startTime)
                          : formatTime12Hour(item.endTime)}
                    </span>
                  ) : null}
                  {item.kind === "calendar" && item.venue ? (
                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {item.venue}
                    </span>
                  ) : null}
                  {item.kind === "moment" && item.year ? (
                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {item.year}
                    </span>
                  ) : null}
                </div>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-black leading-tight text-gray-900 max-w-4xl mb-6">
                  {item.title}
                </h2>
                {item.kind === "calendar" ? (
                  <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
                    <div className="w-full">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px] md:text-base">
                        {item.desc}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-gray-50 p-6">
                      <div className="font-heading font-black text-lg text-school-dark mb-4">Event Details</div>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-school-green" />
                          <span>{item.date || "—"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-school-green" />
                          <span>
                            {item.startTime && item.endTime 
                              ? `${formatTime12Hour(item.startTime)} – ${formatTime12Hour(item.endTime)}`
                              : item.startTime 
                                ? formatTime12Hour(item.startTime)
                                : item.endTime
                                  ? formatTime12Hour(item.endTime)
                                  : "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-school-green" />
                          <span>{item.venue || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px] md:text-base">
                      {item.desc}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
