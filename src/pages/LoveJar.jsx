import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/services/api'

const TYPE_META = {
  love:      { icon: '💕', label: 'Tình yêu',    bg: 'bg-pink-50   dark:bg-pink-900/20'   },
  reason:    { icon: '🌹', label: 'Lý do',        bg: 'bg-rose-50   dark:bg-rose-900/20'   },
  memory:    { icon: '✨', label: 'Kỷ niệm',      bg: 'bg-purple-50 dark:bg-purple-900/20' },
  wish:      { icon: '🌙', label: 'Ước muốn',     bg: 'bg-blue-50   dark:bg-blue-900/20'   },
  challenge: { icon: '🎯', label: 'Thử thách',    bg: 'bg-amber-50  dark:bg-amber-900/20'  },
}

function todayKey() { return new Date().toISOString().split('T')[0] }

function midnightCountdown() {
  const now  = new Date()
  const next = new Date(now); next.setHours(24, 0, 0, 0)
  const diff = next - now
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function LoveJar() {
  const { role: myRole } = useAuth()
  const [messages,  setMessages]  = useState([])
  const [revealed,  setRevealed]  = useState(null)
  const [history,   setHistory]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('jar_history') || '[]') } catch { return [] }
  })
  const [countdown, setCountdown] = useState('')
  const [shaking,   setShaking]   = useState(false)
  const [loading,   setLoading]   = useState(true)

  const todayStr   = todayKey()
  const todayEntry = history.find(h => h.date === todayStr)
  const canOpen    = !todayEntry

  // Load messages from backend + check today's history
  useEffect(() => {
    const init = async () => {
      try {
        const [msgs, hist] = await Promise.all([
          api.getJar(),
          api.getJarHistory(myRole, todayStr),
        ])
        if (Array.isArray(msgs)) setMessages(msgs)

        if (hist && hist.message_id != null) {
          const msg = msgs.find(m => m.id === hist.message_id)
          if (msg) {
            setRevealed(msg)
            setHistory(prev => {
              if (prev.some(h => h.date === todayStr)) return prev
              const next = [{ date: todayStr, index: msg.id, message: msg }, ...prev]
              localStorage.setItem('jar_history', JSON.stringify(next))
              return next
            })
          }
        }
      } catch { /* offline — rely on localStorage history */ } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Countdown timer
  useEffect(() => {
    if (canOpen) return
    setCountdown(midnightCountdown())
    const id = setInterval(() => setCountdown(midnightCountdown()), 1000)
    return () => clearInterval(id)
  }, [canOpen])

  const openJar = async () => {
    if (!canOpen || loading) return
    setShaking(true)

    setTimeout(async () => {
      setShaking(false)

      const usedIds = history.map(h => h.index)
      const pool = messages.filter(m => !usedIds.includes(m.id))
      const source = pool.length > 0 ? pool : messages
      if (source.length === 0) return
      const msg = source[Math.floor(Math.random() * source.length)]

      const entry = { date: todayStr, index: msg.id, message: msg }
      const newHistory = [entry, ...history]
      setHistory(newHistory)
      setRevealed(msg)
      localStorage.setItem('jar_history', JSON.stringify(newHistory))

      await api.saveJarHistory(myRole, todayStr, msg.id).catch(() => {})
    }, 700)
  }

  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="section-title">Hũ Tình Yêu</h1>
          <p className="section-subtitle">Mỗi ngày một lời nhắn nhỏ từ anh đến em 💌</p>
        </motion.div>

        {/* Jar animation */}
        <motion.div
          animate={shaking ? { rotate: [0, -12, 12, -12, 12, -6, 6, 0] } : {}}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-10"
        >
          <div
            onClick={canOpen && !loading ? openJar : undefined}
            className={`relative w-44 h-52 select-none transition-transform duration-200
                         ${canOpen && !loading ? 'cursor-pointer hover:scale-105' : 'cursor-default opacity-60'}`}
          >
            <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-2xl">
              <defs>
                <linearGradient id="jarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#FFB3C6" stopOpacity="0.85"/>
                  <stop offset="50%"  stopColor="#FFF5F7" stopOpacity="0.95"/>
                  <stop offset="100%" stopColor="#FFB3C6" stopOpacity="0.85"/>
                </linearGradient>
                <linearGradient id="lidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF8FC6"/>
                  <stop offset="100%" stopColor="#FF6B9D"/>
                </linearGradient>
              </defs>
              <rect x="28" y="4" width="44" height="16" rx="5" fill="url(#lidGrad)" />
              <rect x="32" y="7" width="36" height="3" rx="1.5" fill="white" fillOpacity="0.3"/>
              <path d="M20 20 Q13 32 13 65 Q13 118 50 118 Q87 118 87 65 Q87 32 80 20 Z"
                    fill="url(#jarGrad)" stroke="#FFB3C6" strokeWidth="1.2"/>
              <path d="M25 28 Q22 50 24 75" stroke="white" strokeWidth="3" strokeLinecap="round" fillOpacity="0"/>
              {['❤','💕','💌','❤','💕','💌','❤'].map((h, i) => (
                <text key={i}
                  x={22 + (i % 3) * 22}
                  y={52 + Math.floor(i / 3) * 26}
                  fontSize="13" textAnchor="middle" opacity="0.8"
                >
                  {h}
                </text>
              ))}
            </svg>

            {canOpen && !loading && (
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
                className="absolute -bottom-7 left-0 right-0 text-center text-xs font-body text-primary"
              >
                ✨ Click để mở hũ!
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Today's message */}
        <AnimatePresence mode="wait">
          {revealed && (
            <motion.div
              key={revealed.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 160 }}
              className={`card text-center mt-14 ${TYPE_META[revealed.type]?.bg}`}
            >
              <div className="text-4xl mb-3">{TYPE_META[revealed.type]?.icon}</div>
              <span className="text-xs font-body bg-white/60 dark:bg-black/20 px-3 py-0.5 rounded-full
                                text-[var(--text-sub)] inline-block mb-4">
                {TYPE_META[revealed.type]?.label}
              </span>
              <p className="font-handwriting text-xl md:text-2xl leading-relaxed text-[var(--text-main)] mt-1 px-2">
                {revealed.text}
              </p>
              <p className="text-xs text-[var(--text-sub)] mt-5 font-body">
                📅 {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long' })}
              </p>
            </motion.div>
          )}

          {!canOpen && !revealed && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="card text-center mt-14"
            >
              <Clock size={36} className="mx-auto text-primary/50 mb-3" />
              <p className="font-heading text-lg font-bold text-[var(--text-main)]">Quay lại vào ngày mai nhé 💌</p>
              <p className="font-body text-[var(--text-sub)] text-sm mt-1">Còn</p>
              <p className="font-heading text-3xl font-bold text-primary mt-1">{countdown}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next open countdown (after opening) */}
        {!canOpen && revealed && (
          <p className="text-center text-xs text-[var(--text-sub)] font-body mt-5">
            Tờ tiếp theo sau: <span className="text-primary font-semibold">{countdown}</span>
          </p>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="mt-14">
            <h3 className="font-heading text-lg font-bold text-[var(--text-main)] mb-5 text-center">
              Những tờ đã mở trước đây
            </h3>
            <div className="space-y-3">
              {history.slice(1, 10).map((entry, i) => {
                const meta = TYPE_META[entry.message?.type]
                return (
                  <motion.div
                    key={entry.date}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`card p-4 ${meta?.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{meta?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-[var(--text-main)] leading-snug line-clamp-2">
                          {entry.message?.text}
                        </p>
                        <p className="text-[10px] text-[var(--text-sub)] font-body mt-1">{entry.date}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
