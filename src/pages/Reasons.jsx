import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import { Heart, Lock, X, CheckCircle, XCircle } from 'lucide-react'
import * as api from '@/services/api'

// ── Flip card ────────────────────────────────────────────────────────
function FlipCard({ reason, isFlipped, onFlip }) {
  return (
    <div className="perspective h-32 cursor-pointer" onClick={onFlip}>
      <motion.div
        className="w-full h-full preserve-3d relative"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s ease',
        }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden rounded-xl bg-[var(--surface)]
                         border-2 border-[var(--border)] hover:border-primary
                         flex flex-col items-center justify-center gap-1 shadow-pink
                         transition-all duration-200 hover:shadow-pink-lg">
          <Lock size={14} className="text-primary/30" />
          <Heart size={16} className="text-primary/40" />
          <span className="font-heading text-xl font-bold text-[var(--text-sub)]">#{reason.id}</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center p-3 text-center shadow-pink-lg"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            background: reason.special
              ? 'linear-gradient(135deg, #FF6B9D, #FF3366)'
              : 'linear-gradient(135deg, #FFE8EE, #FFC8D8)',
          }}
        >
          <p className={`font-body text-xs leading-snug ${reason.special ? 'text-white font-semibold' : 'text-[#4A1028]'}`}>
            {reason.text}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ── Quiz Gate Modal ──────────────────────────────────────────────────
function QuizGate({ gate, onCorrect, onClose }) {
  const [selected, setSelected] = useState(null)
  const [shake, setShake]       = useState(false)

  const q = gate.question

  function handleAnswer(i) {
    if (selected !== null) return
    setSelected(i)

    if (i === q.answer) {
      setTimeout(onCorrect, 700)
    } else {
      setShake(true)
      setTimeout(() => { setSelected(null); setShake(false) }, 1100)
    }
  }

  const getState = (i) => {
    if (selected === null) return 'idle'
    if (i === q.answer) return 'correct'
    if (i === selected) return 'wrong'
    return 'dim'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
         style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : { scale: 1, opacity: 1 }}
        transition={shake ? { duration: 0.4 } : { type: 'spring', stiffness: 200 }}
        className="bg-[var(--surface)] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-body text-xs text-[var(--text-sub)] mb-0.5">
              🔒 Mở khóa lý do <span className="font-bold text-primary">#{gate.reasonId}</span>
            </p>
            <p className="font-heading text-base font-bold text-[var(--text-main)] leading-snug">
              {q.question}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--surface-alt)] text-[var(--text-sub)] flex-shrink-0 mt-0.5">
            <X size={16} />
          </button>
        </div>

        {/* Hint */}
        <p className="px-5 pb-2 font-body text-xs text-[var(--text-sub)] opacity-70">
          Trả lời đúng để khám phá lý do yêu em nhé 💕
        </p>

        {/* Options */}
        <div className="px-4 pb-5 space-y-2">
          {q.options.map((opt, i) => {
            const state = getState(i)
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selected !== null}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-body text-sm font-medium
                             border-2 transition-all duration-300 flex items-center gap-3
                             ${state === 'idle'
                               ? 'border-[var(--border)] bg-[var(--surface-alt)] hover:border-primary text-[var(--text-main)]'
                               : state === 'correct'
                                 ? 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                 : state === 'wrong'
                                   ? 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                   : 'border-[var(--border)] bg-[var(--surface-alt)] opacity-40 text-[var(--text-sub)]'
                             }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                                   ${state === 'idle'    ? 'bg-[var(--border)] text-[var(--text-sub)]'
                                   : state === 'correct' ? 'bg-green-400 text-white'
                                   : state === 'wrong'   ? 'bg-red-400 text-white'
                                   : 'bg-[var(--border)] text-[var(--text-sub)]'}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {state === 'correct' && <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
                {state === 'wrong'   && <XCircle     size={16} className="text-red-500  flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────
export default function Reasons() {
  const [reasons,  setReasons]  = useState([])
  const [quizPool, setQuizPool] = useState([])

  useEffect(() => {
    api.getReasons().then(data => {
      if (Array.isArray(data) && data.length > 0) setReasons(data)
    }).catch(() => {})
    api.getQuiz().then(data => {
      if (Array.isArray(data) && data.length > 0) setQuizPool(data)
    }).catch(() => {})
  }, [])

  const [flipped, setFlipped] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flipped_reasons') || '[]') }
    catch { return [] }
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const [gate, setGate] = useState(null) // { reasonId, question }

  useEffect(() => {
    localStorage.setItem('flipped_reasons', JSON.stringify(flipped))
    if (reasons.length > 0 && flipped.length === reasons.length) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 6000)
    }
  }, [flipped, reasons.length])

  function handleCardClick(reasonId) {
    if (flipped.includes(reasonId)) {
      // Already unlocked — allow re-flip freely
      setFlipped(prev => prev.filter(x => x !== reasonId))
      return
    }
    if (quizPool.length === 0) {
      // No questions loaded yet — unlock directly
      setFlipped(prev => [...prev, reasonId])
      return
    }
    const q = quizPool[Math.floor(Math.random() * quizPool.length)]
    setGate({ reasonId, question: q })
  }

  function handleCorrect() {
    setFlipped(prev => [...prev, gate.reasonId])
    setGate(null)
  }

  const progress = reasons.length > 0 ? Math.round((flipped.length / reasons.length) * 100) : 0

  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      {showConfetti && (
        <ReactConfetti recycle={false} numberOfPieces={300} colors={['#FF6B9D','#FF3366','#FFB3C6','#fff']} />
      )}

      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="section-title">100 Lý Do Yêu Em</h1>
          <p className="section-subtitle">Trả lời đúng câu hỏi để khám phá từng lý do 💕</p>

          {/* Progress */}
          <div className="max-w-xs mx-auto mt-4">
            <div className="flex justify-between text-xs font-body text-[var(--text-sub)] mb-1">
              <span>Đã khám phá</span>
              <span>{flipped.length}/{reasons.length}</span>
            </div>
            <div className="h-2 bg-[var(--surface-alt)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
            >
              <FlipCard
                reason={reason}
                isFlipped={flipped.includes(reason.id)}
                onFlip={() => handleCardClick(reason.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {gate && (
          <QuizGate
            key="quiz-gate"
            gate={gate}
            onCorrect={handleCorrect}
            onClose={() => setGate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
