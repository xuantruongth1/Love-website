import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { Heart, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useConfig } from '@/context/ConfigContext'

export default function Landing() {
  const cfg = useConfig()
  const [password, setPassword] = useState('')
  const [shake, setShake]       = useState(false)
  const [error, setError]       = useState('')
  const [showForm, setShowForm] = useState(false)
  const { login, isLoggedIn }   = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) navigate('/story')
  }, [isLoggedIn])

  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 2800)
    return () => clearTimeout(timer)
  }, [])

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await login(password)
      // Trigger autoplay nhạc ngay sau khi đăng nhập (đã có user gesture)
      window.dispatchEvent(new Event('music:autoplay'))
      setWelcome({ name: data.name, emoji: data.emoji })
      setTimeout(() => navigate('/story'), 1200)
    } catch {
      setShake(true)
      setError('Hình như em nhầm rồi 🥺 Thử lại nhé...')
      setPassword('')
      setTimeout(() => { setShake(false); setError('') }, 2000)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #FFF5F7 0%, #FFE8EE 40%, #FFC8D8 100%)' }}>

      {/* Dark mode gradient */}
      <div className="dark:block hidden absolute inset-0"
           style={{ background: 'linear-gradient(135deg, #1a0a0f 0%, #2d0f1a 40%, #3d1525 100%)' }} />

      {/* Particles */}
      <Particles
        id="landing-particles"
        init={particlesInit}
        options={{
          fullScreen: false,
          background: { color: { value: 'transparent' } },
          fpsLimit: 60,
          particles: {
            number: { value: 30, density: { enable: true, value_area: 800 } },
            color: { value: ['#FF6B9D', '#FF3366', '#FFB3C6'] },
            shape: { type: 'char', character: { value: '❤', font: 'Arial', style: '', weight: '400', fill: true } },
            opacity: { value: 0.6, random: true, anim: { enable: true, speed: 0.5, opacity_min: 0.2 } },
            size: { value: 14, random: true, anim: { enable: true, speed: 2, size_min: 6 } },
            move: {
              enable: true, speed: 1.2, direction: 'top', random: true,
              straight: false, out_mode: 'out', bounce: false,
            },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-md w-full">

        {/* Heart icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <Heart
            size={64}
            className="text-primary animate-pulse-heart drop-shadow-lg"
            fill="currentColor"
          />
        </motion.div>

        {/* Tên người yêu — đợi config load xong mới render để tránh hiện sai tên */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {cfg.configLoaded && (
            <TypeAnimation
              key={cfg.girlName}
              sequence={[500, `Dành cho ${cfg.girlName}`]}
              wrapper="h1"
              cursor={false}
              className="font-handwriting text-[#4A1028] dark:text-[#FFE4EE] drop-shadow-sm whitespace-nowrap"
              style={{ fontSize: 'clamp(2rem, 6vw, 3.75rem)' }}
            />
          )}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="font-heading italic text-lg md:text-xl text-[#8B3A52] dark:text-[#FFB3C6] mt-3"
        >
          {cfg.landingTagline}
        </motion.p>

        {/* Password form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 150 }}
              className="mt-10 space-y-4"
            >
              <p className="font-body text-sm text-[#8B3A52] dark:text-[#FFB3C6]">
                {cfg.landingSubtitle}
              </p>

              <motion.div
                animate={shake ? {
                  x: [0, -10, 10, -10, 10, -5, 5, 0],
                  transition: { duration: 0.4 }
                } : {}}
                className="relative"
              >
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B3A52] dark:text-[#FFB3C6]"
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập chìa khóa của em..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-4 rounded-2xl text-center font-body text-lg
                             bg-white/80 dark:bg-[#2d0f1a]/80 backdrop-blur-sm
                             border-2 border-[#FFB3C6] dark:border-[#5c1f33]
                             text-[#4A1028] dark:text-[#FFE4EE]
                             placeholder:text-[#FFB3C6] dark:placeholder:text-[#5c1f33]
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                             shadow-pink transition-all duration-200"
                />
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="font-body text-sm text-accent"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button type="submit" className="btn-primary w-full py-4 text-lg">
                Bước vào thế giới của chúng ta 💕
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="absolute bottom-6 font-handwriting text-[#8B3A52] dark:text-[#FFB3C6] text-sm z-10"
      >
        Made with ❤️ chỉ dành cho em
      </motion.p>
    </div>
  )
}
