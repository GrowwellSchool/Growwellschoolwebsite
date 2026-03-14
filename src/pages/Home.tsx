import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Award, BookOpen, Users, Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import CircularGalleryDemo from '../components/ui/circular-gallery-demo'
import OrbitCarousel from '../components/ui/animated-carousel-demo'

// ─── Hero Carousel ───────────────────────────────────────────────
const heroSlides = [
  {
    img: '/images/activity5.jpg',
    tag: 'Welcome to Growwell School',
    title: 'Where Every Child',
    accent: 'Blooms & Grows',
    sub: 'Purity, Perfection and Beauty — as the Lotus Symbolizes.',
  },
  {
    img: '/images/activity4.jpg',
    tag: 'Holistic Development',
    title: 'Nurturing Young',
    accent: 'Minds & Leaders',
    sub: 'Blending traditional values with modern innovation.',
  },
  {
    img: '/images/activity6.jpg',
    tag: 'Vibrant Campus Life',
    title: 'Learn, Explore &',
    accent: 'Excel Together',
    sub: 'Activities, events and learning beyond textbooks.',
  },
]

function HeroCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setActive((p) => (p + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const go = (idx: number) => {
    setActive(idx)
  }

  const slide = heroSlides[active]

  return (
    <section className="relative h-[92vh] min-h-[600px] overflow-hidden bg-school-dark">
      {/* Background image */}
      <motion.div
        key={active}
        initial={{ scale: 1.08, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        <img src={slide.img} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-school-dark/65" />
      </motion.div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center overflow-hidden">
        <motion.div
          key={active + 'content'}
          initial={{ opacity: 0, x: 200, rotate: 15 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: 'spring', bounce: 0.4 }}
          style={{ transformOrigin: 'left center' }}
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
          <p className="text-gray-200 text-lg mb-10 max-w-xl whitespace-nowrap">
            {slide.sub}
          </p>
          <div className="flex flex-nowrap gap-4">
            <Link to="/admission" className="btn-secondary whitespace-nowrap">
              Apply for Admission <ArrowRight size={18} />
            </Link>
            <Link to="/gallery" className="btn-primary border border-white/30 whitespace-nowrap">
              Explore Gallery <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'bg-school-gold w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => go((active - 1 + heroSlides.length) % heroSlides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-school-gold hover:text-black transition-all"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go((active + 1) % heroSlides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-school-gold hover:text-black transition-all"
      >
        <ChevronRight size={20} />
      </button>

      {/* Scroll cue */}
      <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2 text-white/50 text-xs">
        <div className="w-px h-12 bg-white/30" />
        <span className="rotate-90 tracking-widest text-[10px]">SCROLL</span>
      </div>
    </section>
  )
}

// ─── Ticker ───────────────────────────────────────────────────────
function NewsTicker() {
  const items = [
    'Session 2026-27 Admissions Now Open',
    'Annual Sports Day — March 21, 2026',
    'CBSE Affiliated Co-Educational School',
    'Play Class to Class II | Kharar, Punjab',
    'Day Boarding Available',
    'Holistic Development | Sports | Music | Dance | Yoga',
  ]
  const doubled = [...items, ...items]
  return (
    <div className="bg-school-green text-white py-3 ticker-wrap border-b-4 border-school-gold">
      <div className="ticker flex gap-16 items-center">
        {doubled.map((item, i) => (
          <span key={i} className="text-sm font-medium whitespace-nowrap flex items-center gap-3">
            <span className="w-2 h-2 bg-school-gold rounded-full inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────
const stats = [
  { icon: <Users size={28} />, val: '500+', label: 'Happy Students', color: 'bg-school-green', border: 'border-school-green' },
  { icon: <BookOpen size={28} />, val: '15+', label: 'Years of Excellence', color: 'bg-school-orange', border: 'border-school-orange' },
  { icon: <Award size={28} />, val: '30+', label: 'Qualified Teachers', color: 'bg-school-blue', border: 'border-school-blue' },
  { icon: <Star size={28} />, val: '7+', label: 'Activity Programs', color: 'bg-school-purple', border: 'border-school-purple' },
]

function StatsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <section className="py-12 bg-white pattern-grid relative">
      <div ref={ref} className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className={`bg-white rounded-xl p-6 text-center border-t-4 ${s.border} shadow-md card-hover`}
          >
            <div className={`w-14 h-14 ${s.color} text-white rounded-full flex items-center justify-center mx-auto mb-4`}>
              {s.icon}
            </div>
            <div className="text-3xl font-heading font-black text-gray-800 mb-1">{s.val}</div>
            <div className="text-sm text-gray-500 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── Our Journey ───────────────────────────────────────────────────
function OurJourneySection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  const milestones = [
    { year: '2011', text: 'Growwell School established on April 2 by S. Ishwar Pal Singh and Ms Amrit K. Vohi' },
    { year: '2015', text: 'Recognition as co-educational middle school following CBSE curriculum' },
    { year: '2020', text: 'Adopted NEP 2020 guidelines, expanding holistic development programs' },
    { year: '2024', text: 'Progressive addition of classes, now serving Play Class through Grade 9' },
    { year: '2026', text: 'Continuing to grow — admissions open for Session 2026-27' },
  ]

  return (
    <section id="journey" className="py-20 bg-[#f8f9f6] pattern-grid relative" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-black text-[#0f172a]">
            Our Journey
          </h2>
        </div>

        {/* Timeline Line */}
        <div className="absolute left-1/2 top-32 bottom-0 w-0.5 bg-school-green -translate-x-1/2 hidden md:block" />

        <div className="space-y-12">
          {milestones.map((m, i) => {
            const isLeft = i % 2 === 0
            return (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 30, x: isLeft ? -20 : 20 }}
                animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`relative flex flex-col md:flex-row items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8`}
              >
                {/* Content Box */}
                <div className={`w-full md:w-[45%] flex ${isLeft ? 'justify-end' : 'justify-start'}`}>
                  <div className="bg-[#1b5e43] text-white p-6 md:p-8 rounded-sm shadow-xl w-full max-w-sm">
                    <div className="text-school-gold font-heading font-bold text-2xl md:text-3xl mb-3">
                      {m.year}
                    </div>
                    <p className="text-white/90 text-sm md:text-base leading-relaxed font-medium">
                      {m.text}
                    </p>
                  </div>
                </div>

                {/* Timeline Node */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-[3px] border-[#1b5e43] bg-school-gold z-10" />

                {/* Empty Space for alignment */}
                <div className="hidden md:block w-[45%]" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Programs ─────────────────────────────────────────────────────
const programs = [
  { title: 'Cricket', img: '/images/activity1.jpg', color: 'bg-school-green', desc: 'Develop sportsmanship, teamwork and athletic discipline on the cricket field.' },
  { title: 'Music', img: '/images/activity10.jpg', color: 'bg-school-blue', desc: 'Cultivate musical talent through vocal training and instrument lessons.' },
  { title: 'Dance', img: '/images/activity7.jpg', color: 'bg-school-purple', desc: 'Express creativity through classical and contemporary dance forms.' },
  { title: 'Yoga', img: '/images/activity4.jpg', color: 'bg-school-teal', desc: 'Build mindfulness, flexibility and inner peace with guided yoga sessions.' },
  { title: 'Day Boarding', img: '/images/activity3.jpg', color: 'bg-school-orange', desc: 'Structured afternoon programs with supervised study and activities.' },
  { title: 'Sports', img: '/images/activity9.jpg', color: 'bg-school-red', desc: 'Physical excellence through multi-sport training and competition.' },
]

function ProgramsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
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
          <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900">
            Programs & Activities
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            We believe learning happens everywhere. Our co-curricular programs build confidence, creativity and character.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl overflow-hidden card-hover shadow-sm group"
            >
              <div className="img-zoom h-52 relative">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                <div className={`absolute top-4 left-4 ${p.color} text-white text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded`}>
                  {p.title}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-gray-900 text-lg mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Director & Principal Desks ──────────────────────────────────
function DeskSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <section className="py-20 bg-school-dark text-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="inline-block bg-school-gold/20 text-school-gold text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
            Leadership
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-black">
            From the Desk of Our Leaders
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Director */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-school-green/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-school-gold/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <Quote size={36} className="text-school-gold mb-4" />
            <p className="text-gray-300 text-base leading-relaxed mb-6 italic">
              "At Growwell School, we believe in nurturing young minds and empowering them to reach their full potential. Our dedicated team of educators provides a supportive and inclusive environment, fostering academic excellence, creativity and personal growth. We strive to develop well-rounded individuals equipped to succeed in an ever-changing world."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-school-gold rounded-full flex items-center justify-center text-school-dark font-heading font-black text-xl">
                SJ
              </div>
              <div>
                <div className="font-heading font-bold text-white text-lg">Salmali Joshi</div>
                <div className="text-school-gold text-sm font-medium">Director</div>
              </div>
            </div>
          </motion.div>

          {/* Principal */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-school-purple/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-school-orange/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <Quote size={36} className="text-school-orange mb-4" />
            <div className="bg-school-gold/10 border-l-4 border-school-gold px-4 py-3 rounded-r-lg mb-4 italic text-school-gold text-sm">
              "I alone cannot change the world, but I can cast a stone across the water to create many ripples." — Mother Teresa
            </div>
            <p className="text-gray-300 text-base leading-relaxed mb-6 italic">
              "We at Growwell School are committed to providing a nurturing environment where young minds can flourish. Our lotus logo embodies our philosophy — rising above challenges, blooming in adversity and striving for excellence. We focus on holistic development blending traditional values with modern innovation."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-school-orange rounded-full flex items-center justify-center text-white font-heading font-black text-xl">
                AK
              </div>
              <div>
                <div className="font-heading font-bold text-white text-lg">Amit Kaur</div>
                <div className="text-school-orange text-sm font-medium">Principal</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}



// ─── Academic Highlights ─────────────────────────────────────────
function AcademicSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
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
              Academic Programme<br />& Curriculum
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Growwell School Kharar offers admission from <strong>Play Class to Class II</strong> in the academic session, adding a class each year progressively until Grade 9. We follow the norms of the <strong>New Education Policy 2020</strong>.
            </p>

            <div className="space-y-3 mb-8">
              {[
                { label: 'CBSE Curriculum', sub: 'National standard of education', color: 'text-school-green', bg: 'bg-green-50' },
                { label: 'NEP 2020 Compliant', sub: 'Following Punjab Govt norms', color: 'text-school-blue', bg: 'bg-blue-50' },
                { label: 'English Medium', sub: 'Global communication skills', color: 'text-school-purple', bg: 'bg-purple-50' },
                { label: 'Co-Educational', sub: 'Inclusive learning environment', color: 'text-school-orange', bg: 'bg-orange-50' },
              ].map((item) => (
                <div key={item.label} className={`flex items-center gap-4 ${item.bg} rounded-xl px-4 py-3`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                  <div>
                    <div className={`font-heading font-bold ${item.color} text-sm`}>{item.label}</div>
                    <div className="text-gray-500 text-xs">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Age eligibility table */}
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
                    <th className="px-5 py-3 text-school-lime text-xs font-bold uppercase tracking-wide">Age Criteria</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Play Class', '2 to 3 years'],
                    ['Nursery', '3 to 4 years'],
                    ['K.G.-1', '4 to 5 years'],
                    ['K.G.-2', '5 to 6 years'],
                    ['Class I', '6 to 7 years'],
                    ['Class II', '7 to 8 years'],
                  ].map(([cls, age], i) => (
                    <tr key={cls} className={`border-t border-white/10 ${i % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}>
                      <td className="px-5 py-3 text-white font-medium text-sm">{cls}</td>
                      <td className="px-5 py-3 text-school-gold text-sm font-semibold">{age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-5 bg-school-green/10 border-t border-white/10">
                <Link to="/admission" className="btn-secondary w-full justify-center text-sm">
                  Start Your Application <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Gallery Preview ──────────────────────────────────────────────
function GalleryPreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  
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
            <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900">
              Life at Growwell School
            </h2>
          </div>
          <Link to="/gallery" className="btn-primary self-start">
            View All Photos <ArrowRight size={18} />
          </Link>
        </motion.div>

        <div className="mt-8 relative z-10 w-full overflow-visible rounded-3xl bg-black/5 p-4 shadow-inner">
          <OrbitCarousel />
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-16 bg-school-green relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20" />
      <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 hidden lg:block">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {[0,45,90,135,180,225,270,315].map((r, i) => (
            <ellipse key={i} cx="100" cy="70" rx="20" ry="60" fill="#ffd700" transform={`rotate(${r},100,100)`} opacity="0.6"/>
          ))}
          <circle cx="100" cy="100" r="20" fill="#ffd700"/>
        </svg>
      </div>
      <div className="max-w-4xl mx-auto px-4 text-center relative">
        <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-4">
          Admission Open for 2026-27
        </h2>
        <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
          Secure your child's future at Growwell School. Limited seats available. Apply today for Play Class through Class II.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/admission" className="btn-secondary">
            Apply Now <ArrowRight size={18} />
          </Link>
          <Link to="/contact" className="bg-white/20 text-white border border-white/40 px-7 py-3 rounded-md font-heading font-semibold hover:bg-white/30 transition-colors flex items-center gap-2">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── About Section ──────────────────────────────────────────────────
function AboutSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-20 bg-white overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image Collage */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1 row-span-2">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                  <img src="/images/activity5.jpg" alt="Students in class" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
              <div className="col-span-1">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
                  <img src="/images/activity4.jpg" alt="Students jumping" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
              <div className="col-span-1">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
                  <img src="/images/activity6.jpg" alt="Students playing" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            </div>

            {/* Excellence Badge */}
            <div className="absolute -bottom-6 -right-6 lg:-bottom-8 lg:right-0 bg-school-orange text-white p-6 rounded-xl shadow-xl z-10 w-40 h-40 flex flex-col items-center justify-center transform rotate-3 hover:rotate-0 transition-transform">
              <div className="text-4xl font-black font-heading tracking-tighter mb-1">15+</div>
              <div className="text-xs font-bold uppercase tracking-wider text-center leading-tight">Years of<br />Excellence</div>
            </div>
          </motion.div>

          {/* Right Column - Content */}
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
              Cultivating Excellence<br />Since 2011
            </h2>
            
            <p className="text-gray-600 mb-5 leading-relaxed">
              Cromwell School Kharar was established on April 2, 2011 by <strong>S. Ishwar Pal Singh</strong> and <strong>Ms. Amrit K. Vohi</strong> with the objective of providing quality education to the budding generation. The school is run by <em>Cromwell Education and Sports Welfare Society</em>.
            </p>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              It is a recognised co-educational middle school following the <strong>CBSE curriculum</strong> with English as the medium of instruction. Growwell School is committed to the holistic development of every child.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-green-50 border-l-4 border-school-green rounded-r-xl p-5">
                <div className="font-heading font-bold text-school-green mb-2">Mission</div>
                <div className="text-gray-600 text-sm leading-relaxed">Spiritual, moral, physical and social excellence</div>
              </div>
              <div className="bg-green-50 border-l-4 border-school-green rounded-r-xl p-5">
                <div className="font-heading font-bold text-school-green mb-2">Vision</div>
                <div className="text-gray-600 text-sm leading-relaxed">Sound bodies and trained minds for tomorrow</div>
              </div>
            </div>

            <Link to="/admission" className="btn-primary inline-flex items-center">
              Explore Admission <ArrowRight size={18} className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Page ──────────────────────────────────────────────────────────
export default function Home() {
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
      <GalleryPreview />
      <CTABanner />
    </>
  )
}
