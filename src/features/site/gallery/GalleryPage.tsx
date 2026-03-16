'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'

const categories = [
  { id: 'all', label: 'All Activities' },
  { id: 'sports', label: 'Sports & Fitness' },
  { id: 'cultural', label: 'Cultural Events' },
  { id: 'classroom', label: 'Classroom Life' },
  { id: 'celebrations', label: 'Celebrations' },
]

const galleryItems = [
  { id: 1, src: '/images/activity1.jpg', cat: 'sports', title: 'Hurdle Jumping', desc: 'Students showcasing athletic skills at sports day 2025' },
  { id: 2, src: '/images/activity2.jpg', cat: 'cultural', title: 'Peace March', desc: 'Young student leading with a message of peace' },
  { id: 3, src: '/images/activity3.jpg', cat: 'celebrations', title: 'Winter Wonderland', desc: 'Students enjoying artificial snow on Christmas' },
  { id: 4, src: '/images/activity4.jpg', cat: 'classroom', title: 'Yoga Session', desc: 'Mindfulness and yoga practice in the courtyard' },
  { id: 5, src: '/images/activity5.jpg', cat: 'sports', title: 'Rope Way Activity', desc: 'Building confidence with rope climbing — May 2024' },
  { id: 6, src: '/images/activity6.jpg', cat: 'cultural', title: 'Independence Day', desc: 'Students celebrating Independence Day with patriotic artwork' },
  { id: 7, src: '/images/activity7.jpg', cat: 'cultural', title: 'Janmashtami', desc: 'Students dressed as Krishna and Radha for Janmashtami' },
  { id: 8, src: '/images/activity8.jpg', cat: 'celebrations', title: 'Birthday Celebration', desc: 'School birthday celebrations with the whole class' },
  { id: 9, src: '/images/activity9.jpg', cat: 'sports', title: 'Agility Training', desc: 'Building athletic skills with hurdle training' },
  { id: 10, src: '/images/activity10.jpg', cat: 'cultural', title: 'Annual Function', desc: 'Student delivering speech at the annual function' },
]

function PageHero() {
  return (
    <section className="relative bg-school-dark text-white py-24 overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-5">
            Our Gallery
          </span>
          <h1 className="text-4xl lg:text-6xl font-heading font-black mb-4">Life at Growwell School</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Moments that capture the spirit, joy and learning of our vibrant school community.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default function GalleryPage() {
  const [activecat, setActivecat] = useState('all')
  const [lightbox, setLightbox] = useState<(typeof galleryItems)[number] | null>(null)
  const ref = useRef(null)
  useInView(ref, { once: true })

  const filtered = activecat === 'all' ? galleryItems : galleryItems.filter((g) => g.cat === activecat)

  const catCounts: Record<string, number> = { all: galleryItems.length }
  galleryItems.forEach((g) => {
    catCounts[g.cat] = (catCounts[g.cat] || 0) + 1
  })

  return (
    <>
      <PageHero />

      <section className="py-16 bg-white" ref={ref}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActivecat(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-heading font-semibold text-sm transition-all duration-200 border-2
                  ${activecat === cat.id
                    ? 'bg-school-green text-white border-school-green shadow-lg scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-school-green hover:text-school-green'
                  }`}
              >
                {cat.label}
                <span className={`text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold
                  ${activecat === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  {catCounts[cat.id] || 0}
                </span>
              </button>
            ))}
          </div>

          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="break-inside-avoid mb-5 bg-white rounded-2xl overflow-hidden shadow-md card-hover group cursor-pointer"
                  onClick={() => setLightbox(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setLightbox(item)
                  }}
                  aria-label={`Open ${item.title}`}
                >
                  <div className="img-zoom relative">
                    <Image
                      src={item.src}
                      alt={item.title}
                      width={1200}
                      height={800}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-school-dark/0 group-hover:bg-school-dark/40 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-school-green text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                        {categories.find((c) => c.id === item.cat)?.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-gray-800 text-sm">{item.title}</h3>
                    <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${lightbox.title} preview`}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-3xl w-full bg-school-dark rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.src}
                alt={lightbox.title}
                width={1600}
                height={1000}
                sizes="90vw"
                className="w-full max-h-[70vh] object-contain"
              />
              <div className="p-5 flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-bold text-white text-lg">{lightbox.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{lightbox.desc}</p>
                </div>
                <button
                  onClick={() => setLightbox(null)}
                  className="ml-4 w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

