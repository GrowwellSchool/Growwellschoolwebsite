import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Admission from './pages/Admission'
import Gallery from './pages/Gallery'
import Events from './pages/Events'
import Blogs from './pages/Blogs'
import Contact from './pages/Contact'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/events" element={<Events />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen bg-school-dark flex items-center justify-center text-white pattern-dots">
      <div className="text-center">
        <div className="text-9xl font-heading font-black text-school-gold mb-4">404</div>
        <h2 className="text-2xl font-heading font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-secondary">Go Back Home</a>
      </div>
    </div>
  )
}

export default App
