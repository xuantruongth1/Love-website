import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'
import MusicPlayer from '@/components/ui/MusicPlayer'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export default function Layout({ children }) {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <main className={`relative ${isLanding ? '' : 'z-10 lg:ml-20 pt-16 lg:pt-0'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <MusicPlayer />
    </div>
  )
}
