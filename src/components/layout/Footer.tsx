import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-school-dark text-white">
      {/* Colorful stripe */}
      <div className="h-2 flex">
        <div className="flex-1 bg-school-green" />
        <div className="flex-1 bg-school-gold" />
        <div className="flex-1 bg-school-orange" />
        <div className="flex-1 bg-school-blue" />
        <div className="flex-1 bg-school-purple" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-school-green flex items-center justify-center">
                <svg viewBox="0 0 50 50" className="w-9 h-9" fill="none">
                  <circle cx="25" cy="28" r="5" fill="#ffd700"/>
                  <ellipse cx="25" cy="20" rx="4" ry="9" fill="#ff8c69" transform="rotate(0,25,28)"/>
                  <ellipse cx="25" cy="20" rx="4" ry="9" fill="#ffb347" transform="rotate(40,25,28)"/>
                  <ellipse cx="25" cy="20" rx="4" ry="9" fill="#ff8c69" transform="rotate(-40,25,28)"/>
                  <ellipse cx="25" cy="20" rx="4" ry="9" fill="#ffb347" transform="rotate(80,25,28)"/>
                  <ellipse cx="25" cy="20" rx="4" ry="9" fill="#ff8c69" transform="rotate(-80,25,28)"/>
                  <circle cx="25" cy="28" r="4" fill="#ffd700"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-heading font-black text-lg">GROWWELL</div>
                <div className="text-school-gold text-xs tracking-widest">SCHOOL</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Purity, perfection and beauty as the flower lotus symbolizes. Continuous process driven improvement of a student's skills, knowledge and intellectual capabilities.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-5 text-school-gold border-b border-school-gold/30 pb-2">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/#about' },
                { name: 'Admission', path: '/admission' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'Events', path: '/events' },
                { name: 'Blogs', path: '/blogs' },
                { name: 'Contact Us', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                    <ArrowRight size={13} className="text-school-gold" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-5 text-school-gold border-b border-school-gold/30 pb-2">Programs</h4>
            <ul className="space-y-3">
              {['Play Class', 'Nursery', 'K.G.-1 & K.G.-2', 'Class I', 'Class II', 'Cricket', 'Music & Dance', 'Yoga', 'Day Boarding'].map((p) => (
                <li key={p} className="text-gray-400 flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-school-lime flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-5 text-school-gold border-b border-school-gold/30 pb-2">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin size={16} className="text-school-gold flex-shrink-0 mt-0.5" />
                <span>Growwell School, Kharar, Punjab, India</span>
              </li>
              <li>
                <a href="tel:+918196051999" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                  <Phone size={16} className="text-school-gold" />
                  81960-51999
                </a>
              </li>
              <li>
                <a href="mailto:info@growwellschool.in" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                  <Mail size={16} className="text-school-gold" />
                  info@growwellschool.in
                </a>
              </li>
              <li>
                <a href="https://www.growwellschool.in" className="text-school-gold text-sm hover:underline">
                  www.growwellschool.in
                </a>
              </li>
            </ul>

            {/* CBSE badge */}
            <div className="mt-6 inline-block bg-school-green/20 border border-school-green/40 rounded-lg px-4 py-2">
              <div className="text-xs text-school-lime font-semibold">CBSE Affiliated</div>
              <div className="text-xs text-gray-400">Co-Educational Middle School</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-500">
          <p>© 2026 Growwell School, Kharar. All rights reserved.</p>
          <p>Established April 2, 2011 | By S. Ishwar Pal Singh & Ms. Amrit K. Vohi</p>
        </div>
      </div>
    </footer>
  )
}
