'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react'

const upcomingEvents = [
  {
    id: 1,
    title: 'Annual Sports Day 2026',
    date: 'March 21, 2026',
    time: '9:00 AM – 3:00 PM',
    venue: 'School Ground, Kharar',
    img: '/images/activity1.jpg',
    cat: 'Sports',
    catColor: 'bg-school-green',
    desc: 'A day of athletic excellence featuring track events, team sports, hurdle races, relay and more. All students from Play Class to Class II participate.',
    highlight: true,
  },
  {
    id: 2,
    title: 'Annual Prize Distribution',
    date: 'April 5, 2026',
    time: '10:00 AM – 1:00 PM',
    venue: 'School Auditorium',
    img: '/images/activity10.jpg',
    cat: 'Academic',
    catColor: 'bg-school-blue',
    desc: 'Celebrating academic excellence and co-curricular achievements of the session 2025-26. Parents are cordially invited.',
    highlight: false,
  },
  {
    id: 3,
    title: 'Yoga & Wellness Day',
    date: 'June 21, 2026',
    time: '7:00 AM – 10:00 AM',
    venue: 'School Courtyard',
    img: '/images/activity4.jpg',
    cat: 'Wellness',
    catColor: 'bg-school-teal',
    desc: 'International Yoga Day special program with guided sessions, meditation and breathwork for students, staff and parents.',
    highlight: false,
  },
  {
    id: 4,
    title: 'Independence Day Celebration',
    date: 'August 15, 2026',
    time: '8:00 AM – 11:00 AM',
    venue: 'School Ground',
    img: '/images/activity6.jpg',
    cat: 'Patriotic',
    catColor: 'bg-school-orange',
    desc: 'Flag hoisting, patriotic songs, artwork display and cultural programs to celebrate the spirit of independence.',
    highlight: false,
  },
  {
    id: 5,
    title: 'Janmashtami Celebration',
    date: 'August 2026',
    time: '11:00 AM – 2:00 PM',
    venue: 'School Hall',
    img: '/images/activity7.jpg',
    cat: 'Cultural',
    catColor: 'bg-school-purple',
    desc: "Students dress as Krishna and Radha, perform devotional songs and skits celebrating Lord Krishna's birth.",
    highlight: false,
  },
  {
    id: 6,
    title: 'Christmas Winter Festival',
    date: 'December 24, 2026',
    time: '10:00 AM – 1:00 PM',
    venue: 'School Premises',
    img: '/images/activity3.jpg',
    cat: 'Cultural',
    catColor: 'bg-school-red',
    desc: 'The beloved winter festival with artificial snow, carols, craft activities and much more festive fun for all students.',
    highlight: false,
  },
]

const pastHighlights = [
  { img: '/images/activity5.jpg', title: 'Rope Way Activity', year: 'May 2024', desc: 'Students built confidence and motor skills on the rope climbing challenge.' },
  { img: '/images/activity8.jpg', title: 'Birthday Celebrations', year: '2025', desc: "A warm tradition of celebrating each child's birthday with the school family." },
  { img: '/images/activity9.jpg', title: 'Agility Training Day', year: '2025', desc: 'Physical fitness training with hurdle obstacles for all age groups.' },
  { img: '/images/activity2.jpg', title: 'Peace Day March', year: '2025', desc: 'Students led a peace march promoting values of harmony and friendship.' },
]

function PageHero() {
  return (
    <section className="relative bg-school-dark text-white py-24 overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-50" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
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
  )
}

function UpcomingSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section className="py-20 bg-gray-50 pattern-diagonal" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-12">
          <span className="inline-block bg-green-100 text-school-green text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
            Upcoming
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900">Events Calendar 2026</h2>
        </motion.div>

        {upcomingEvents.filter((e) => e.highlight).map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl overflow-hidden shadow-xl mb-8 grid lg:grid-cols-2"
          >
            <div className="img-zoom h-64 lg:h-auto relative">
              <Image src={event.img} alt={event.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex gap-3 mb-4">
                <span className={`${event.catColor} text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded`}>{event.cat}</span>
                <span className="bg-school-gold text-school-dark text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded">Featured</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-heading font-black text-gray-900 mb-3">{event.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{event.desc}</p>
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
              <Link href="/contact" className="btn-primary self-start">
                Register / Enquire <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        ))}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {upcomingEvents.filter((e) => !e.highlight).map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-md card-hover"
            >
              <div className="img-zoom h-48 relative">
                <Image src={event.img} alt={event.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="p-5">
                <span className={`${event.catColor} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded`}>{event.cat}</span>
                <h3 className="font-heading font-bold text-gray-800 text-lg mt-3 mb-2">{event.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{event.desc}</p>
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
  )
}

function PastHighlightsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
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
              <div className="img-zoom h-44 relative">
                <Image src={item.img} alt={item.title} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
              </div>
              <div className="p-4">
                <div className="text-school-gold text-xs font-bold mb-1">{item.year}</div>
                <h3 className="font-heading font-bold text-white text-sm mb-1">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function EventsPage() {
  return (
    <>
      <PageHero />
      <UpcomingSection />
      <PastHighlightsSection />
    </>
  )
}

