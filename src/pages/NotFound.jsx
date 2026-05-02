import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Home } from 'lucide-react'

const floatingHearts = ['💕', '❤️', '💖', '💗', '💓', '💝', '🌹', '✨']

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20
                     bg-[var(--bg)] relative overflow-hidden">

      {/* Background floating hearts */}
      {floatingHearts.map((h, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl pointer-events-none select-none"
          style={{
            left: `${10 + (i * 11) % 80}%`,
            top:  `${5  + (i * 17) % 80}%`,
          }}
          animate={{
            y:       [0, -18, 0],
            opacity: [0.3, 0.7, 0.3],
            rotate:  [-8, 8, -8],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat:   Infinity,
            delay:    i * 0.3,
            ease:     'easeInOut',
          }}
        >
          {h}
        </motion.span>
      ))}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 18 }}
        className="card text-center max-w-md w-full z-10 py-12 px-8"
      >
        {/* Animated heart */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-7xl mb-4 inline-block"
        >
          💔
        </motion.div>

        {/* 404 text */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-heading text-8xl font-bold text-primary leading-none mb-2"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="font-handwriting text-2xl text-[var(--text-main)] mb-2"
        >
          Ôi không, em lạc đường rồi!
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-body text-sm text-[var(--text-sub)] mb-8 leading-relaxed"
        >
          Trang này không tồn tại, nhưng tình yêu của chúng mình thì mãi mãi tồn tại 💕
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/story" className="btn-primary flex items-center justify-center gap-2">
            <Heart size={16} fill="currentColor" />
            Về trang kỷ niệm
          </Link>
          <Link to="/" className="btn-outline flex items-center justify-center gap-2">
            <Home size={16} />
            Trang chủ
          </Link>
        </motion.div>

        {/* Easter note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="font-body text-xs text-[var(--text-sub)] mt-8 italic"
        >
          Dù lạc đâu, anh luôn ở đây dẫn đường cho em ❤️
        </motion.p>
      </motion.div>
    </div>
  )
}
