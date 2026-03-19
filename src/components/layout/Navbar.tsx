"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Admission", path: "/admission" },
  { name: "News & Announcements", path: "/news" },
  { name: "Gallery", path: "/gallery" },
  { name: "Events", path: "/events" },
  { name: "Blogs", path: "/blogs" },
  { name: "Contact Us", path: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-school-dark text-white py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+918196051999" className="flex items-center gap-2 hover:text-school-yellow transition-colors">
              <Phone size={14} />
              <span>81960-51999</span>
            </a>
            <a
              href="mailto:info@growwellschool.in"
              className="flex items-center gap-2 hover:text-school-yellow transition-colors"
            >
              <Mail size={14} />
              <span>info@growwellschool.in</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
 <span className="text-school-yellow font-medium">Paving the way to a brighter future</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-school-yellow font-medium">Session 2026-27 Admissions Open</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-lg border-b-4 border-school-gold" : "bg-white border-b-4 border-school-gold"}`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Growwell School Logo"
                width={64}
                height={64}
                className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-md"
                priority
              />
              <div>
                <div className="text-school-green font-heading font-black text-xl leading-tight tracking-wide">
                  GROWWELL
                </div>
                <div className="text-school-gold font-heading font-semibold text-xs tracking-widest uppercase">
                  School, Kharar
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-4 py-2 rounded-md font-medium text-sm font-heading transition-all duration-200 relative group
                    ${
                      pathname === link.path
                        ? "text-white bg-school-green"
                        : "text-gray-700 hover:text-school-green hover:bg-green-50"
                    }`}
                >
                  {link.name}
                  {pathname !== link.path && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-school-gold group-hover:w-4/5 transition-all duration-300 rounded-full" />
                  )}
                </Link>
              ))}
              <Link href="/admission" className="ml-3 btn-secondary text-sm py-2 px-5 rounded-md">
                Apply Now
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-md text-school-green border border-school-green"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden bg-white border-t-2 border-school-gold"
            >
              <div className="px-4 py-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-md font-heading font-medium text-base
                      ${
                        pathname === link.path
                          ? "bg-school-green text-white"
                          : "text-gray-700 bg-gray-50 hover:bg-green-50 hover:text-school-green"
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  href="/admission"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary text-center justify-center mt-2"
                >
                  Apply Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
