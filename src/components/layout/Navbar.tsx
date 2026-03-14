import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Admission', path: '/admission' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Events', path: '/events' },
  { name: 'Blogs', path: '/blogs' },
  { name: 'Contact Us', path: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

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
            <a href="mailto:info@growwellschool.in" className="flex items-center gap-2 hover:text-school-yellow transition-colors">
              <Mail size={14} />
              <span>info@growwellschool.in</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-school-yellow font-medium">Session 2026-27 Admissions Open</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg border-b-4 border-school-gold' : 'bg-white border-b-4 border-school-gold'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-school-green flex items-center justify-center shadow-md">
                  <svg viewBox="0 0 50 50" className="w-9 h-9" fill="none">
                    {/* Lotus SVG */}
                    <circle cx="25" cy="28" r="5" fill="#ffd700"/>
                    <ellipse cx="25" cy="20" rx="4" ry="9" fill="#ff8c69" transform="rotate(0,25,28)"/>
                    <ellipse cx="25" cy="20" rx="4" ry="9" fill="#ffb347" transform="rotate(40,25,28)"/>
                    <ellipse cx="25" cy="20" rx="4" ry="9" fill="#ff8c69" transform="rotate(-40,25,28)"/>
                    <ellipse cx="25" cy="20" rx="4" ry="9" fill="#ffb347" transform="rotate(80,25,28)"/>
                    <ellipse cx="25" cy="20" rx="4" ry="9" fill="#ff8c69" transform="rotate(-80,25,28)"/>
                    <ellipse cx="25" cy="22" rx="3" ry="7" fill="#ff6b6b" transform="rotate(20,25,28)"/>
                    <ellipse cx="25" cy="22" rx="3" ry="7" fill="#ff6b6b" transform="rotate(-20,25,28)"/>
                    <ellipse cx="25" cy="22" rx="3" ry="7" fill="#ff6b6b" transform="rotate(60,25,28)"/>
                    <ellipse cx="25" cy="22" rx="3" ry="7" fill="#ff6b6b" transform="rotate(-60,25,28)"/>
                    <circle cx="25" cy="28" r="4" fill="#ffd700"/>
                    <path d="M15 34 Q25 32 35 34" stroke="#5cb85c" strokeWidth="2" fill="none"/>
                    <path d="M18 36 Q25 33 32 36" stroke="#5cb85c" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </div>
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
                  to={link.path}
                  className={`px-4 py-2 rounded-md font-medium text-sm font-heading transition-all duration-200 relative group
                    ${location.pathname === link.path
                      ? 'text-white bg-school-green'
                      : 'text-gray-700 hover:text-school-green hover:bg-green-50'
                    }`}
                >
                  {link.name}
                  {location.pathname !== link.path && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-school-gold group-hover:w-4/5 transition-all duration-300 rounded-full" />
                  )}
                </Link>
              ))}
              <Link to="/admission" className="ml-3 btn-secondary text-sm py-2 px-5 rounded-md">
                Apply Now
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-md text-school-green border border-school-green"
              onClick={() => setIsOpen(!isOpen)}
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
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden bg-white border-t-2 border-school-gold"
            >
              <div className="px-4 py-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-3 rounded-md font-heading font-medium text-base
                      ${location.pathname === link.path
                        ? 'bg-school-green text-white'
                        : 'text-gray-700 bg-gray-50 hover:bg-green-50 hover:text-school-green'
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link to="/admission" className="btn-secondary text-center justify-center mt-2">
                  Apply Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
