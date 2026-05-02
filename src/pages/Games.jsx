import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, Smile } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/services/api'

// ── Vòng quay may mắn ──
function RandomWheel() {
  const [wheelPresets, setWheelPresets] = useState([])
  const [preset, setPreset] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [angle, setAngle] = useState(0)

  useEffect(() => {
    api.getWheel().then(data => {
      if (Array.isArray(data) && data.length > 0) setWheelPresets(data)
    }).catch(() => {})
  }, [])

  if (wheelPresets.length === 0) return (
    <div className="card flex items-center justify-center py-10">
      <p className="font-body text-sm text-[var(--text-sub)]">Đang tải vòng quay...</p>
    </div>
  )

  const options = wheelPresets[preset]?.options || []
  const sliceAngle = 360 / options.length

  const spin = () => {
    if (spinning || options.length === 0) return
    setSpinning(true)
    setResult(null)
    const extra = 1800 + Math.random() * 360
    const newAngle = angle + extra
    setAngle(newAngle)
    setTimeout(() => {
      const norm = ((newAngle % 360) + 360) % 360
      const idx = Math.floor(((270 - norm) % 360 + 360) % 360 / sliceAngle) % options.length
      setResult(options[idx])
      setSpinning(false)
    }, 3500)
  }

  return (
    <div className="card">
      <h3 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
        <Shuffle size={20} className="text-primary" /> Vòng Quay May Mắn
      </h3>

      <div className="flex flex-wrap gap-2 mb-6">
        {wheelPresets.map((p, i) => (
          <button key={p.id} onClick={() => { setPreset(i); setResult(null) }}
            className={`px-3 py-1.5 rounded-full text-sm font-body transition-all
                         ${preset === i
                          ? 'bg-primary text-white shadow-pink'
                          : 'bg-[var(--surface-alt)] text-[var(--text-sub)] hover:text-primary'
                         }`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative w-52 h-52">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-primary text-2xl drop-shadow">▼</div>

          <motion.svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-xl"
            animate={{ rotate: angle }}
            transition={{ duration: 3.5, ease: [0.17, 0.67, 0.16, 0.99] }}
          >
            {options.map((opt, i) => {
              const sa = (i * sliceAngle * Math.PI) / 180
              const ea = ((i + 1) * sliceAngle * Math.PI) / 180
              const x1 = 50 + 48 * Math.cos(sa), y1 = 50 + 48 * Math.sin(sa)
              const x2 = 50 + 48 * Math.cos(ea), y2 = 50 + 48 * Math.sin(ea)
              const mid = ((i + 0.5) * sliceAngle * Math.PI) / 180
              const tx = 50 + 33 * Math.cos(mid), ty = 50 + 33 * Math.sin(mid)
              return (
                <g key={i}>
                  <path
                    d={`M50,50 L${x1},${y1} A48,48 0 ${sliceAngle > 180 ? 1 : 0},1 ${x2},${y2} Z`}
                    fill={opt.color} stroke="white" strokeWidth="0.8"
                  />
                  <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                        fontSize="4.2" fill="white" fontWeight="700"
                        transform={`rotate(${(i + 0.5) * sliceAngle}, ${tx}, ${ty})`}>
                    {opt.text.slice(0, 8)}
                  </text>
                </g>
              )
            })}
            <circle cx="50" cy="50" r="5" fill="white" stroke="#FF6B9D" strokeWidth="1.5"/>
          </motion.svg>
        </div>

        <button
          onClick={spin}
          disabled={spinning}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
        >
          {spinning ? '🎯 Đang quay...' : '🎰 Quay ngay!'}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center p-5 rounded-2xl w-full"
              style={{ background: result.color + '22', border: `2px solid ${result.color}` }}
            >
              <p className="font-heading text-2xl font-bold" style={{ color: result.color }}>{result.text}</p>
              <p className="font-body text-sm text-[var(--text-sub)] mt-1">Kết quả đây rồi 🎉</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Mood Tracker ──
const MOODS = [
  { id: 'happy',  emoji: '😊', label: 'Vui',       color: '#FFD700' },
  { id: 'sad',    emoji: '😢', label: 'Buồn',      color: '#87CEEB' },
  { id: 'angry',  emoji: '😤', label: 'Dỗi',       color: '#FF6B6B' },
  { id: 'tired',  emoji: '😴', label: 'Mệt',       color: '#B0B0B0' },
  { id: 'miss',   emoji: '🥰', label: 'Nhớ em/anh', color: '#FF6B9D' },
]

const MOOD_MESSAGES = {
  boy: {
    angry:  { msg: 'Nhắn cho em đi, em sẽ dỗ anh liền thôi! 💕', color: '#FF6B6B' },
    sad:    { msg: 'Em ở đây với anh, anh không cần buồn một mình 💕', color: '#87CEEB' },
    tired:  { msg: 'Nghỉ ngơi đi anh, em luôn ở đây nhé 🌙', color: '#B0B0B0' },
    miss:   { msg: 'Em cũng nhớ anh lắm! 🥰', color: '#FF6B9D' },
    happy:  { msg: 'Thấy anh vui, em cũng vui lây rồi! ✨', color: '#FFD700' },
  },
  girl: {
    angry:  { msg: 'Nhắn cho anh đi, anh sẽ đi mua trà sữa cho em ngay! 🧋', color: '#FF6B6B' },
    sad:    { msg: 'Anh ở đây rồi, em không cần buồn một mình 💕', color: '#87CEEB' },
    tired:  { msg: 'Nghỉ ngơi đi em, anh luôn ở đây nhé 🌙', color: '#B0B0B0' },
    miss:   { msg: 'Anh cũng nhớ em lắm! 🥰', color: '#FF6B9D' },
    happy:  { msg: 'Thấy em vui, anh cũng vui theo rồi! ✨', color: '#FFD700' },
  },
}

function MoodTracker() {
  const { role: myRole, user } = useAuth()
  const boyName  = user?.name && myRole === 'boy'  ? user.name : 'Anh'
  const girlName = user?.name && myRole === 'girl' ? user.name : 'Em'
  const partnerName = myRole === 'girl' ? boyName  : girlName
  const selfName    = myRole === 'girl' ? girlName : boyName

  const [moods, setMoods]     = useState({ boy: null, girl: null })
  const [saving, setSaving]   = useState(false)

  const fetchMoods = () => {
    api.getMoods().then(data => setMoods(data)).catch(() => {})
  }

  useEffect(() => {
    fetchMoods()
    const id = setInterval(fetchMoods, 30000)
    return () => clearInterval(id)
  }, [])

  const myMoodData      = myRole === 'girl' ? moods.girl : moods.boy
  const partnerMoodData = myRole === 'girl' ? moods.boy  : moods.girl
  const displayMyMood   = myMoodData?.mood || null
  const partnerMood     = MOODS.find(m => m.id === partnerMoodData?.mood)
  const myMoodMessages  = MOOD_MESSAGES[myRole] || MOOD_MESSAGES.girl

  const selectMood = async (id) => {
    setMoods(prev => ({
      ...prev,
      [myRole]: { mood: id, updated_at: new Date().toISOString() },
    }))
    setSaving(true)
    await api.saveMood(myRole, id).catch(() => {})
    setSaving(false)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-heading text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
          <Smile size={20} className="text-primary" /> Mood Hôm Nay
        </h3>
      </div>
      <p className="font-body text-sm text-[var(--text-sub)] mb-5">
        Cả hai đều thấy mood của nhau real-time 💕
      </p>

      {/* My mood picker */}
      <div className="mb-4">
        <p className="font-body text-xs text-[var(--text-sub)] mb-2 font-semibold uppercase tracking-wide">
          {selfName} đang...
        </p>
        <div className="flex justify-around">
          {MOODS.map(m => (
            <button key={m.id} onClick={() => selectMood(m.id)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-200
                           ${displayMyMood === m.id
                            ? 'bg-primary/10 scale-110 ring-2 ring-primary/30'
                            : 'hover:bg-[var(--surface-alt)]'
                           }`}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="font-body text-[10px] text-[var(--text-sub)]">{m.label}</span>
            </button>
          ))}
        </div>
        {saving && <p className="text-xs text-[var(--text-sub)] text-center mt-1 font-body">Đang lưu...</p>}
      </div>

      {/* Partner mood */}
      <div className="mb-4 p-3 bg-[var(--surface-alt)] rounded-xl">
        <p className="font-body text-xs text-[var(--text-sub)] mb-2 font-semibold uppercase tracking-wide">
          {partnerName} đang...
        </p>
        {partnerMood ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl">{partnerMood.emoji}</span>
            <div>
              <p className="font-body font-semibold text-[var(--text-main)]">{partnerMood.label}</p>
              {partnerMoodData?.updated_at && (
                <p className="font-body text-xs text-[var(--text-sub)]">
                  Cập nhật {new Date(partnerMoodData.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--text-sub)] font-body italic">Chưa cập nhật hôm nay</p>
        )}
      </div>

      {/* Smart suggestion */}
      <AnimatePresence>
        {displayMyMood && (
          <motion.div
            key={displayMyMood}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl text-center"
            style={{ background: (myMoodMessages[displayMyMood]?.color || '#FF6B9D') + '18' }}
          >
            <p className="font-handwriting text-lg" style={{ color: myMoodMessages[displayMyMood]?.color }}>
              {myMoodMessages[displayMyMood]?.msg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main page ──
export default function Games() {
  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="section-title">Góc Giải Trí</h1>
          <p className="section-subtitle">Những trò chơi nhỏ cho hai đứa 🎮</p>
        </motion.div>
        <div className="space-y-8">
          <RandomWheel />
          <MoodTracker />
          <div className="card text-center py-8">
            <span className="text-4xl mb-3 block">🧠</span>
            <p className="font-heading text-lg font-bold text-[var(--text-main)] mb-1">Quiz Tình Yêu</p>
            <p className="font-body text-sm text-[var(--text-sub)] mb-4">Em hiểu anh bao nhiêu?</p>
            <a href="/quiz" className="btn-primary inline-block">Chơi Quiz ngay!</a>
          </div>
        </div>
      </div>
    </div>
  )
}
