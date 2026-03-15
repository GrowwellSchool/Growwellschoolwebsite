import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Calendar, User, ArrowRight, BookOpen, Tag } from 'lucide-react'

const blogCategories = ['All', 'Education', 'Parenting', 'Events', 'Health & Wellness', 'School Life']

const blogs = [
  {
    id: 1,
    title: 'The Importance of Holistic Education in the Early Years',
    excerpt: 'Research shows that the foundation laid in the first 8 years of a child\'s life shapes their learning, behaviour and health outcomes for a lifetime. Holistic education integrates academic, emotional and physical growth.',
    author: 'Amrit Kaur, Principal',
    date: 'January 15, 2026',
    cat: 'Education',
    img: '/images/activity4.jpg',
    featured: true,
    readTime: '5 min read',
    catColor: 'bg-school-green',
  },
  {
    id: 2,
    title: 'How Sports Build Character — Not Just Physical Fitness',
    excerpt: 'When children participate in sports at school, they learn far more than how to run or score. They develop resilience, leadership, teamwork and the ability to handle both success and failure gracefully.',
    author: 'Sports Department',
    date: 'February 10, 2026',
    cat: 'Health & Wellness',
    img: '/images/activity1.jpg',
    featured: false,
    readTime: '4 min read',
    catColor: 'bg-school-orange',
  },
  {
    id: 3,
    title: 'Annual Sports Day 2025 — A Recap of Our Athletic Stars',
    excerpt: 'This year\'s Sports Day was a spectacular celebration of energy, discipline and school spirit. From hurdle races to team relays, every student gave their absolute best on the field.',
    author: 'School Team',
    date: 'March 25, 2025',
    cat: 'Events',
    img: '/images/activity9.jpg',
    featured: false,
    readTime: '3 min read',
    catColor: 'bg-school-blue',
  },
  {
    id: 4,
    title: '5 Tips for Parents — Supporting Your Child\'s Learning at Home',
    excerpt: 'The home environment plays a powerful role in a child\'s academic success. Here are five practical and research-backed strategies every parent can adopt to make learning joyful at home.',
    author: 'Salmali Joshi, Director',
    date: 'December 5, 2025',
    cat: 'Parenting',
    img: '/images/activity2.jpg',
    featured: false,
    readTime: '6 min read',
    catColor: 'bg-school-purple',
  },
  {
    id: 5,
    title: 'Yoga in Schools — Why We Made It a Core Practice',
    excerpt: 'At Growwell School, yoga is not just an extra-curricular activity — it is a core practice. We believe that mindfulness and physical wellness are as important as mathematics and English.',
    author: 'Wellness Team',
    date: 'November 20, 2025',
    cat: 'Health & Wellness',
    img: '/images/activity4.jpg',
    featured: false,
    readTime: '4 min read',
    catColor: 'bg-school-teal',
  },
  {
    id: 6,
    title: 'NEP 2020 — What It Means for Your Child\'s Future',
    excerpt: 'The National Education Policy 2020 is the most comprehensive reform in Indian education in decades. We break down what it means for young learners at the foundational and preparatory stages.',
    author: 'Academic Committee',
    date: 'October 10, 2025',
    cat: 'Education',
    img: '/images/activity10.jpg',
    featured: false,
    readTime: '7 min read',
    catColor: 'bg-school-green',
  },
]

function PageHero() {
  return (
    <section className="relative bg-school-dark text-white py-24 overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block bg-school-gold text-school-dark text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-5">
            School Blog
          </span>
          <h1 className="text-4xl lg:text-6xl font-heading font-black mb-4">Insights & Stories</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Education insights, school news, parenting tips and stories from our vibrant community.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default function Blogs() {
  const [activeCat, setActiveCat] = useState('All')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const featured = blogs.find(b => b.featured)
  const filtered = activeCat === 'All'
    ? blogs.filter(b => !b.featured)
    : blogs.filter(b => b.cat === activeCat && !b.featured)

  return (
    <>
      <PageHero />

      <section className="py-20 bg-white" ref={ref}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Featured post */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="grid lg:grid-cols-2 bg-school-dark rounded-3xl overflow-hidden shadow-2xl mb-16 group"
            >
              <div className="img-zoom h-64 lg:h-auto min-h-[300px]">
                <img src={featured.img} alt={featured.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex gap-2 mb-4">
                  <span className={`${featured.catColor} text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded`}>
                    {featured.cat}
                  </span>
                  <span className="bg-school-gold text-school-dark text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded">
                    Featured
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-heading font-black text-white mb-4 leading-tight">
                  {featured.title}
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6 text-sm">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                  <span className="flex items-center gap-1.5"><User size={13} className="text-school-gold" />{featured.author}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={13} className="text-school-gold" />{featured.date}</span>
                  <span className="flex items-center gap-1.5"><BookOpen size={13} className="text-school-gold" />{featured.readTime}</span>
                </div>
                <button className="btn-secondary self-start text-sm">
                  Read Full Article <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all border
                  ${activeCat === cat ? 'bg-school-green text-white border-school-green' : 'bg-white text-gray-600 border-gray-200 hover:border-school-green hover:text-school-green'}`}
              >
                <Tag size={12} />
                {cat}
              </button>
            ))}
          </div>

          {/* Blog grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((blog, i) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden card-hover shadow-sm group"
              >
                <div className="img-zoom h-48 relative">
                  <img src={blog.img} alt={blog.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-3 left-3 ${blog.catColor} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded`}>
                    {blog.cat}
                  </span>
                  <span className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2.5 py-1 rounded backdrop-blur-sm">
                    {blog.readTime}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-bold text-gray-800 text-base leading-tight mb-3 group-hover:text-school-green transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{blog.excerpt}</p>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="text-xs text-gray-400">
                      <div className="font-medium text-gray-600">{blog.author}</div>
                      <div>{blog.date}</div>
                    </div>
                    <button className="text-school-green hover:text-school-dark transition-colors">
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p>No articles found in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-school-green pattern-dots">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-3xl font-heading font-black text-white mb-3">Stay Updated</h2>
          <p className="text-green-100 mb-6">Get the latest news, event updates and educational insights delivered to your inbox.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 font-medium outline-none focus:ring-2 focus:ring-school-gold"
            />
            <button className="btn-secondary px-5">Subscribe</button>
          </div>
        </div>
      </section>
    </>
  )
}
