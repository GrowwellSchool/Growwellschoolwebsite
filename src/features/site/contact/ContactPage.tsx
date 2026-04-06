"use client";

import type React from "react";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

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
            Get in Touch
          </span>
          <h1 className="text-4xl lg:text-6xl font-heading font-black mb-4">Contact Us</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            We&apos;d love to hear from you. Reach out for admissions, enquiries or just to say hello.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const validateForm = (): string | null => {
    const nameTrimmed = form.name.trim();
    const emailTrimmed = form.email.trim();
    const phoneTrimmed = form.phone.trim();
    const subjectTrimmed = form.subject.trim();
    const messageTrimmed = form.message.trim();

    // Name validation
    if (nameTrimmed.length < 2) {
      return "Name must be at least 2 characters long.";
    }
    if (!/^[a-zA-Z\s'-]+$/.test(nameTrimmed)) {
      return "Name can only contain letters, spaces, hyphens and apostrophes.";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return "Please enter a valid email address.";
    }

    // Phone validation (if provided)
    if (phoneTrimmed) {
      const digits = phoneTrimmed.replace(/\D/g, "");
      const isValidIndian = digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
      if (!isValidIndian) {
        return "Please enter a valid phone number (10 digits, optional +91).";
      }
    }

    // Subject validation
    if (!subjectTrimmed) {
      return "Please select a subject.";
    }

    // Message validation
    if (messageTrimmed.length < 10) {
      return "Message must be at least 10 characters long.";
    }
    if (messageTrimmed.length > 1000) {
      return "Message must not exceed 1000 characters.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSending(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.subject.trim(),
        message: form.message.trim(),
      };

      // Save to Supabase
      const supabase = getSupabaseBrowserClient();
      const { error: insertError } = await supabase.from("contact_messages").insert(payload);
      if (insertError) {
        setError(insertError.message);
        return;
      }

      // Send email notification
      const emailResponse = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!emailResponse.ok) {
        const emailError = await emailResponse.json();
        console.error("Failed to send email:", emailError);
        // Don't block the user - the message was saved to database
      }

      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="py-20 bg-gray-50 pattern-diagonal" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-green-100 text-school-green text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
              Our Details
            </span>
            <h2 className="text-2xl lg:text-3xl font-heading font-black text-gray-900 mb-6">
              We&apos;re Right Here
              <br />
              in Kharar, Punjab
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Visit us at our school or get in touch through any of the channels below. Our admissions team is available
              Monday to Saturday during school hours.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: <MapPin size={22} />,
                  label: "Address",
                  value: "Growwell School, Kharar, Punjab, India",
                  sub: "Growwell Education and Sports Welfare Society",
                  color: "bg-school-green",
                },
                {
                  icon: <Phone size={22} />,
                  label: "Phone",
                  value: "83604-44258",
                  sub: "Monday – Saturday, 8AM – 4PM",
                  color: "bg-school-blue",
                  href: "tel:+918360444258",
                },
                {
                  icon: <Mail size={22} />,
                  label: "Email",
                  value: "growwellschool19@gmail.com",
                  sub: "We reply within 24 hours",
                  color: "bg-school-orange",
                  href: "mailto:growwellschool19@gmail.com",
                },
                {
                  icon: <Clock size={22} />,
                  label: "School Hours",
                  value: "Monday to Saturday",
                  sub: "8:00 AM – 3:00 PM",
                  color: "bg-school-purple",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 card-hover"
                >
                  <div
                    className={`w-12 h-12 ${item.color} text-white rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{item.label}</div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="font-heading font-bold text-gray-800 hover:text-school-green transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div className="font-heading font-bold text-gray-800">{item.value}</div>
                    )}
                    <div className="text-gray-500 text-sm">{item.sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-school-green rounded-xl flex items-center justify-center">
                  <MessageSquare size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-gray-900 text-xl">Send Us a Message</h3>
                  <p className="text-gray-500 text-sm">We&apos;ll get back to you shortly</p>
                </div>
              </div>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={24} className="text-school-green" />
                  </div>
                  <h3 className="font-heading font-black text-gray-900 text-xl mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm">
                    Thank you for reaching out. We&apos;ll contact you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-6 text-school-green font-medium text-sm hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5"
                      >
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-school-green transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5"
                      >
                        Phone Number
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        inputMode="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-school-green transition-colors"
                        placeholder="10-digit number or +91 XXXXX XXXXX"
                        pattern="^[0-9+()\s-]{10,20}$"
                        title="Enter a valid phone number (10 digits, optional +91)."
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5"
                    >
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-school-green transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5"
                    >
                      Subject *
                    </label>
                    <select
                      id="contact-subject"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-school-green transition-colors bg-white"
                    >
                      <option value="">Select a subject</option>
                      <option value="admission">Admission Enquiry</option>
                      <option value="fees">Fee Structure</option>
                      <option value="events">Events & Activities</option>
                      <option value="general">General Enquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5"
                    >
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-school-green transition-colors resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center" disabled={sending}>
                    {sending ? "Sending..." : "Send Message"} <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MapSection() {
  return (
    <section className="py-0 bg-white">
      <div className="bg-school-dark h-2 flex">
        <div className="flex-1 bg-school-green" />
        <div className="flex-1 bg-school-gold" />
        <div className="flex-1 bg-school-orange" />
        <div className="flex-1 bg-school-blue" />
        <div className="flex-1 bg-school-purple" />
      </div>
      <div className="grid md:grid-cols-2">
        <div className="flex items-center justify-center bg-school-dark text-white text-center p-12 min-h-[400px]">
          <div>
            <MapPin size={48} className="text-school-gold mx-auto mb-4" />
            <h3 className="font-heading font-black text-3xl mb-2">Growwell School, Kharar</h3>
            <p className="text-gray-300 mb-6">Punjab, India — Near Mohali</p>
            <a
              href="https://maps.google.com/?q=Growwell+School+Kharar"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
        <div className="min-h-[400px] w-full bg-gray-200">
          <iframe
            src="https://maps.google.com/maps?q=Growwell%20School%20Kharar&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Growwell School Map"
          />
        </div>
      </div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero />
      <ContactSection />
      <MapSection />
    </>
  );
}
