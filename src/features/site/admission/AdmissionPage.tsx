"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle, FileText, Phone, Calendar, Users, BookOpen } from "lucide-react";

function PageHero() {
  return (
    <section className="relative bg-school-dark text-white py-24 overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20" />
      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-white"
        style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
      />
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-5">
            Admissions 2026-27
          </span>
          <h1 className="text-4xl lg:text-6xl font-heading font-black mb-4">Begin Your Child&apos;s Journey</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join the Growwell family. Secure your child&apos;s seat in one of Punjab&apos;s most nurturing schools.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

const steps = [
  {
    step: "01",
    icon: <FileText size={28} />,
    title: "Fill Application Form",
    desc: "Download or collect the application form from school office or apply online.",
    color: "bg-school-green",
    border: "border-school-green",
  },
  {
    step: "02",
    icon: <FileText size={28} />,
    title: "Submit Documents",
    desc: "Submit birth certificate, address proof, photographs and previous report card.",
    color: "bg-school-blue",
    border: "border-school-blue",
  },
  {
    step: "03",
    icon: <Calendar size={28} />,
    title: "Interaction Session",
    desc: "Attend a short interaction session for the child and parents with our educators.",
    color: "bg-school-orange",
    border: "border-school-orange",
  },
  {
    step: "04",
    icon: <CheckCircle size={28} />,
    title: "Confirmation & Fee",
    desc: "Receive confirmation letter and complete fee payment to secure the seat.",
    color: "bg-school-purple",
    border: "border-school-purple",
  },
];

function ProcessSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="inline-block bg-green-100 text-school-green text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
            How to Apply
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900">Admission Process</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 z-0" />

          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`relative bg-white border-t-4 ${s.border} rounded-xl p-6 shadow-md text-center card-hover z-10`}
            >
              <div
                className={`w-16 h-16 ${s.color} text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
              >
                {s.icon}
              </div>
              <div className="text-xs font-bold text-gray-400 mb-2 tracking-widest">STEP {s.step}</div>
              <h3 className="font-heading font-bold text-gray-800 text-base mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EligibilitySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section className="py-20 bg-gray-50 pattern-grid" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-blue-100 text-school-blue text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
              Age Criteria
            </span>
            <h2 className="text-2xl lg:text-3xl font-heading font-black text-gray-900 mb-6">
              Age Eligibility
              <br />
              Session 2026-27
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Age as on 31st March 2026 | As per NEP 2020 & Punjab Govt. norms
            </p>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <div className="bg-school-green px-6 py-3 flex justify-between text-white text-xs font-bold uppercase tracking-wide">
                <span>Class</span>
                <span>Age as on 31.03.2026</span>
              </div>
              {[
                ["Play Class", "2 to 3 years", "bg-orange-50"],
                ["Nursery", "3 to 4 years", "bg-yellow-50"],
                ["K.G.-1", "4 to 5 years", "bg-green-50"],
                ["K.G.-2", "5 to 6 years", "bg-blue-50"],
                ["Class I", "6 to 7 years", "bg-purple-50"],
                ["Class II", "7 to 8 years", "bg-pink-50"],
              ].map(([cls, age, bg]) => (
                <div
                  key={cls}
                  className={`flex justify-between items-center px-6 py-4 ${bg} border-b border-gray-100 last:border-0`}
                >
                  <span className="font-heading font-semibold text-gray-800">{cls}</span>
                  <span className="font-bold text-school-green bg-white px-3 py-1 rounded-full text-sm shadow-sm">
                    {age}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-block bg-orange-100 text-school-orange text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
              Documents Required
            </span>
            <h2 className="text-2xl lg:text-3xl font-heading font-black text-gray-900 mb-6">What to Bring</h2>
            <div className="space-y-3 mb-8">
              {[
                "Birth Certificate (Original + Copy)",
                "Address Proof (Aadhaar / Utility Bill)",
                "Passport-size Photographs (4)",
                "Previous Class Report Card (if applicable)",
                "Parent/Guardian Aadhaar Copy",
                "Transfer Certificate (if from another school)",
              ].map((doc) => (
                <div
                  key={doc}
                  className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
                >
                  <CheckCircle size={18} className="text-school-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{doc}</span>
                </div>
              ))}
            </div>

            <div className="bg-school-dark rounded-2xl p-6 text-white">
              <h3 className="font-heading font-bold text-lg mb-2">Have Questions?</h3>
              <p className="text-gray-400 text-sm mb-5">Our admissions team is here to help you through every step.</p>
              <a
                href="tel:+918196051999"
                className="flex items-center gap-3 bg-school-gold text-school-dark px-5 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
              >
                <Phone size={18} />
                Call 81960-51999
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reasons = [
    {
      icon: <BookOpen size={24} />,
      title: "CBSE Curriculum",
      desc: "Nationally recognized curriculum ensuring quality education.",
      color: "bg-school-green",
    },
    {
      icon: <Users size={24} />,
      title: "Expert Faculty",
      desc: "30+ qualified teachers dedicated to your child's growth.",
      color: "bg-school-blue",
    },
    {
      icon: <CheckCircle size={24} />,
      title: "Holistic Development",
      desc: "Sports, arts, music and academics in perfect balance.",
      color: "bg-school-orange",
    },
    {
      icon: <Calendar size={24} />,
      title: "Safe Environment",
      desc: "Secure, inclusive campus with trained staff.",
      color: "bg-school-purple",
    },
  ];
  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="inline-block bg-purple-100 text-school-purple text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
            Why Growwell?
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900">The Growwell Difference</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 bg-gray-50 rounded-2xl card-hover"
            >
              <div
                className={`w-14 h-14 ${r.color} text-white rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                {r.icon}
              </div>
              <h3 className="font-heading font-bold text-gray-800 mb-2">{r.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/contact" className="btn-primary">
            Schedule a School Visit <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function AdmissionPage() {
  return (
    <>
      <PageHero />
      <ProcessSection />
      <EligibilitySection />
      <WhySection />
    </>
  );
}
