"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Quote,  Award, BookOpen, Users } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

const HOME_DESK_KEY = "home.desk";

export default function LeadershipPage() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [displayVersion, setDisplayVersion] = useState(() => Date.now());
  const [fit, setFit] = useState<"cover" | "contain">("cover");

  // Director state
  const [directorMessage, setDirectorMessage] = useState("");
  const [directorMotto, setDirectorMotto] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [directorRole, setDirectorRole] = useState("");
  const [directorImage, setDirectorImage] = useState("");
  const [directorQualifications, setDirectorQualifications] = useState("");
  const [directorExperience, setDirectorExperience] = useState("");

  // Principal state
  const [principalQuote, setPrincipalQuote] = useState("");
  const [principalMessage, setPrincipalMessage] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [principalRole, setPrincipalRole] = useState("");
  const [principalImage, setPrincipalImage] = useState("");
  const [principalQualifications, setPrincipalQualifications] = useState("");
  const [principalExperience, setPrincipalExperience] = useState("");

  // School info
  const [schoolMission, setSchoolMission] = useState("");
  const [schoolVision, setSchoolVision] = useState("");
  const [schoolValues, setSchoolValues] = useState<string[]>([]);

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

      const rawFit = typeof raw === "object" && raw ? (raw as { fit?: unknown }).fit : undefined;
      const normalizedFit = typeof rawFit === "string" ? rawFit.toLowerCase().trim() : "";
      const loadedFit = normalizedFit === "contain" ? "contain" : "cover";
      setFit(loadedFit);

      if (nextDirector) {
        setDirectorMessage(typeof nextDirector.message === "string" ? nextDirector.message.trim() : "");
        setDirectorMotto(typeof nextDirector.motto === "string" ? nextDirector.motto.trim() : "");
        setDirectorName(typeof nextDirector.name === "string" ? nextDirector.name.trim() : "");
        setDirectorRole(typeof nextDirector.role === "string" ? nextDirector.role.trim() : "");
        setDirectorQualifications(typeof nextDirector.qualifications === "string" ? nextDirector.qualifications.trim() : "");
        setDirectorExperience(typeof nextDirector.experience === "string" ? nextDirector.experience.trim() : "");
        const img = getBaseUrl(nextDirector.image);
        setDirectorImage(img ? `${img}?v=${encodeURIComponent(version)}` : "");
      }

      if (nextPrincipal) {
        setPrincipalQuote(typeof nextPrincipal.quote === "string" ? nextPrincipal.quote.trim() : "");
        setPrincipalMessage(typeof nextPrincipal.message === "string" ? nextPrincipal.message.trim() : "");
        setPrincipalName(typeof nextPrincipal.name === "string" ? nextPrincipal.name.trim() : "");
        setPrincipalRole(typeof nextPrincipal.role === "string" ? nextPrincipal.role.trim() : "");
        setPrincipalQualifications(typeof nextPrincipal.qualifications === "string" ? nextPrincipal.qualifications.trim() : "");
        setPrincipalExperience(typeof nextPrincipal.experience === "string" ? nextPrincipal.experience.trim() : "");
        const img = getBaseUrl(nextPrincipal.image);
        setPrincipalImage(img ? `${img}?v=${encodeURIComponent(version)}` : "");
      }

      // School info
      setSchoolMission(typeof (raw as { mission?: unknown })?.mission === "string" ? (raw as { mission: string }).mission.trim() : "");
      setSchoolVision(typeof (raw as { vision?: unknown })?.vision === "string" ? (raw as { vision: string }).vision.trim() : "");
      const rawValues = (raw as { values?: unknown })?.values;
      if (Array.isArray(rawValues)) {
        setSchoolValues(rawValues.filter((v): v is string => typeof v === "string").map(v => v.trim()).filter(Boolean));
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
      .channel("leadership-page")
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
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-school-dark text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pattern-grid opacity-10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-school-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-school-green/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block bg-school-gold/20 text-school-gold text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4 md:mb-6">
              Leadership
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-heading font-black mb-4">
              From The Desk of Our Leaders
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
              Meet the visionaries guiding Growwell School towards excellence in education and holistic development.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Director Section */}
      <section className="py-12 md:py-20" ref={ref}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Image Side */}
              <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[650px] bg-gradient-to-br from-school-green to-school-green/80">
                <div className="absolute inset-0 pattern-grid opacity-10" />
                <div className="absolute inset-4 sm:inset-6 md:inset-8 flex items-center justify-center">
                  <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white/20 shadow-2xl">
                    {directorImage ? (
                      fit === "contain" ? (
                        <>
                          <Image
                            src={directorImage}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 384px, 80vw"
                            className="object-cover scale-110 blur-2xl"
                            aria-hidden
                            key={`${directorImage}-bg-${displayVersion}`}
                          />
                          <Image
                            src={directorImage}
                            alt={directorName || "Director"}
                            fill
                            sizes="(min-width: 1024px) 384px, 80vw"
                            className="object-contain"
                            key={`${directorImage}-fg-${displayVersion}`}
                          />
                        </>
                      ) : (
                        <Image
                          src={directorImage}
                          alt={directorName || "Director"}
                          fill
                          sizes="(min-width: 1024px) 384px, 80vw"
                          className="object-cover"
                          key={`${directorImage}-${displayVersion}`}
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-school-gold text-school-dark font-heading font-black text-3xl sm:text-4xl md:text-5xl">
                        {initials(directorName || "Director")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 left-4 sm:top-8 sm:left-8 w-12 h-12 sm:w-20 sm:h-20 border-2 border-white/20 rounded-xl sm:rounded-2xl" />
                <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-16 h-16 sm:w-32 sm:h-32 border-2 border-school-gold/30 rounded-xl sm:rounded-2xl" />
              </div>

              {/* Content Side */}
              <div className="p-6 sm:p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-school-gold/10 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-school-gold" />
                  </div>
                  <span className="text-school-gold text-xs sm:text-sm font-bold tracking-widest uppercase">
                    {directorRole || "Director"}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-gray-900 mb-4 md:mb-6">
                  {directorName || "Director"}
                </h2>

                {directorMotto.trim().length > 0 && (
                  <div className="bg-school-gold/10 border-l-4 border-school-gold px-3 sm:px-4 py-2 sm:py-3 rounded-r-lg mb-4 md:mb-6">
                    <div className="text-school-gold text-xs sm:text-sm font-heading font-bold tracking-widest uppercase mb-1">
                      Our Motto
                    </div>
                    <div className="text-gray-700 text-sm sm:text-base italic">{directorMotto}</div>
                  </div>
                )}

                <Quote size={28} className="sm:w-8 sm:h-8 text-school-green/30 mb-3 sm:mb-4" />

                {directorMessage.trim().length > 0 && (
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 md:mb-6 italic">
                    &ldquo;{directorMessage}&rdquo;
                  </p>
                )}

                {directorQualifications.trim().length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <h4 className="font-heading font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Qualifications</h4>
                    <p className="text-gray-600 text-sm sm:text-base">{directorQualifications}</p>
                  </div>
                )}

                {directorExperience.trim().length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <h4 className="font-heading font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Experience</h4>
                    <p className="text-gray-600 text-sm sm:text-base">{directorExperience}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Principal Section */}
      <section className="py-12 md:py-20 bg-school-dark text-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur"
          >
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Content Side */}
              <div className="p-6 sm:p-8 lg:p-12 order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-school-orange/20 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-school-orange" />
                  </div>
                  <span className="text-school-orange text-xs sm:text-sm font-bold tracking-widest uppercase">
                    {principalRole || "Principal"}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-white mb-4 md:mb-6">
                  {principalName || "Principal"}
                </h2>

                {principalQuote.trim().length > 0 && (
                  <div className="bg-school-gold/10 border-l-4 border-school-gold px-3 sm:px-4 py-2 sm:py-3 rounded-r-lg mb-4 md:mb-6">
                    <div className="text-school-gold text-xs sm:text-sm font-heading font-bold tracking-widest uppercase mb-1">
                      Quote
                    </div>
                    <div className="text-gray-200 text-sm sm:text-base italic">{principalQuote}</div>
                  </div>
                )}

                <Quote size={28} className="sm:w-8 sm:h-8 text-school-orange/30 mb-3 sm:mb-4" />

                {principalMessage.trim().length > 0 && (
                  <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4 md:mb-6 italic">
                    &ldquo;{principalMessage}&rdquo;
                  </p>
                )}

                {principalQualifications.trim().length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <h4 className="font-heading font-bold text-white mb-1 sm:mb-2 text-sm sm:text-base">Qualifications</h4>
                    <p className="text-gray-300 text-sm sm:text-base">{principalQualifications}</p>
                  </div>
                )}

                {principalExperience.trim().length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <h4 className="font-heading font-bold text-white mb-1 sm:mb-2 text-sm sm:text-base">Experience</h4>
                    <p className="text-gray-300 text-sm sm:text-base">{principalExperience}</p>
                  </div>
                )}
              </div>

              {/* Image Side */}
              <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[650px] bg-gradient-to-br from-school-orange to-school-orange/80 order-1 lg:order-2">
                <div className="absolute inset-0 pattern-grid opacity-10" />
                <div className="absolute inset-4 sm:inset-6 md:inset-8 flex items-center justify-center">
                  <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white/20 shadow-2xl">
                    {principalImage ? (
                      fit === "contain" ? (
                        <>
                          <Image
                            src={principalImage}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 384px, 80vw"
                            className="object-cover scale-110 blur-2xl"
                            aria-hidden
                            key={`${principalImage}-bg-${displayVersion}`}
                          />
                          <Image
                            src={principalImage}
                            alt={principalName || "Principal"}
                            fill
                            sizes="(min-width: 1024px) 384px, 80vw"
                            className="object-contain"
                            key={`${principalImage}-fg-${displayVersion}`}
                          />
                        </>
                      ) : (
                        <Image
                          src={principalImage}
                          alt={principalName || "Principal"}
                          fill
                          sizes="(min-width: 1024px) 384px, 80vw"
                          className="object-cover"
                          key={`${principalImage}-${displayVersion}`}
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-school-orange text-white font-heading font-black text-3xl sm:text-4xl md:text-5xl">
                        {initials(principalName || "Principal")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 sm:w-20 sm:h-20 border-2 border-white/20 rounded-xl sm:rounded-2xl" />
                <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 w-16 h-16 sm:w-32 sm:h-32 border-2 border-school-gold/30 rounded-xl sm:rounded-2xl" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      {(schoolMission || schoolVision) && (
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mb-8 md:mb-12"
            >
              <span className="inline-block bg-school-green/10 text-school-green text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-3 md:mb-4">
                Our Foundation
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-gray-900">
                Mission & Vision
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {schoolMission && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-school-green/5 border border-school-green/20 rounded-2xl p-6 sm:p-8"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-school-green rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-school-green mb-3 sm:mb-4">Our Mission</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{schoolMission}</p>
                </motion.div>
              )}

              {schoolVision && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-school-gold/5 border border-school-gold/20 rounded-2xl p-6 sm:p-8"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-school-gold rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <Award className="w-6 h-6 sm:w-7 sm:h-7 text-school-dark" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-school-gold mb-3 sm:mb-4">Our Vision</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{schoolVision}</p>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      {schoolValues.length > 0 && (
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-8 md:mb-12"
            >
              <span className="inline-block bg-school-purple/10 text-school-purple text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-3 md:mb-4">
                Core Values
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-gray-900">
                What We Stand For
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {schoolValues.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-md card-hover"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-school-gold/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-school-gold font-heading font-black text-base sm:text-lg">
                      {index + 1}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-gray-900 text-sm sm:text-base">{value}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
