import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import { HelpCircle, RotateCcw, Trophy } from 'lucide-react'
import * as api from '@/services/api'

const quizResults = [
  { min: 9, max: 10, emoji: '🏆', title: 'Thiên tài tình yêu!',       message: 'Em hiểu anh quá chuẩn rồi, anh không giấu được gì cả 💕' },
  { min: 7, max: 8,  emoji: '🥰', title: 'Hiểu anh rất nhiều!',        message: 'Em biết anh đến từng chi tiết, anh thấy được yêu thật sự.' },
  { min: 5, max: 6,  emoji: '😊', title: 'Hiểu anh khá ổn!',           message: 'Còn nhiều điều hay ho để khám phá thêm về nhau nữa nhé.' },
  { min: 3, max: 4,  emoji: '🤔', title: 'Còn nhiều bí ẩn lắm!',       message: 'Anh và em vẫn còn nhiều thứ để hiểu nhau hơn — cùng cố nhé!' },
  { min: 0, max: 2,  emoji: '😅', title: 'Cần tìm hiểu anh thêm nha!', message: 'Không sao, mình sẽ có nhiều thời gian để biết nhau hơn 💪' },
]

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function Quiz() {
  const [allQuestions, setAllQuestions] = useState([])
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [finished, setFinished] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    api.getQuiz().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setAllQuestions(data)
        setQuestions(shuffle(data).slice(0, Math.min(10, data.length)))
      }
    }).catch(() => {})
  }, [])

  const restart = () => {
    setQuestions(shuffle(allQuestions).slice(0, Math.min(10, allQuestions.length)))
    setCurrent(0)
    setScore(0)
    setSelected(null)
    setFinished(false)
    setShowConfetti(false)
    setStarted(false)
  }

  const handleAnswer = (i) => {
    if (selected !== null) return
    setSelected(i)
    const correct = i === questions[current].answer
    if (correct) setScore(s => s + 1)
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setFinished(true)
        if (score + (correct ? 1 : 0) >= 8) setShowConfetti(true)
      } else {
        setCurrent(c => c + 1)
        setSelected(null)
      }
    }, 900)
  }

  const result = quizResults.find(r => score >= r.min && score <= r.max) || quizResults[0]
  const percentage = Math.round((score / questions.length) * 100)

  if (!started) return (
    <div className="page-wrapper min-h-screen py-16 px-4 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
          className="text-7xl mb-6"
        >
          🧠
        </motion.div>
        <h1 className="section-title mb-3">Quiz Tình Yêu</h1>
        <p className="font-body text-[var(--text-sub)] mb-2">
          Em hiểu anh bao nhiêu? 10 câu hỏi — hãy chứng minh nào!
        </p>
        <p className="font-body text-xs text-[var(--text-sub)] mb-8 opacity-70">
          Câu hỏi ngẫu nhiên mỗi lần chơi
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8 text-center">
          {[['10', 'Câu hỏi'], ['⏱️', 'Thoải mái'], ['🏆', 'Xếp hạng'], ['💕', 'Về anh']].map(([v, l]) => (
            <div key={l} className="card py-4">
              <div className="font-heading text-2xl font-bold text-primary">{v}</div>
              <div className="font-body text-xs text-[var(--text-sub)] mt-1">{l}</div>
            </div>
          ))}
        </div>

        <button onClick={() => setStarted(true)} disabled={allQuestions.length === 0}
                className="btn-primary w-full text-lg py-4 disabled:opacity-50">
          {allQuestions.length === 0 ? 'Đang tải câu hỏi...' : 'Bắt đầu Quiz! 🎯'}
        </button>
      </motion.div>
    </div>
  )

  if (finished) return (
    <div className="page-wrapper min-h-screen py-16 px-4 flex flex-col items-center justify-center">
      {showConfetti && (
        <ReactConfetti
          recycle={false}
          numberOfPieces={300}
          colors={['#FF6B9D', '#FF3366', '#FFB3C6', '#fff', '#FFE8EE']}
        />
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 150 }}
        className="max-w-md w-full"
      >
        <div className="card text-center">
          <div className="text-6xl mb-4">
            {percentage === 100 ? '🥰' : percentage >= 80 ? '😍' : percentage >= 60 ? '😊' : '🤔'}
          </div>

          {/* Score circle */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--surface-alt)" strokeWidth="3"/>
              <motion.circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#FF6B9D" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${percentage} 100`}
                initial={{ strokeDasharray: '0 100' }}
                animate={{ strokeDasharray: `${percentage} 100` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-3xl font-bold text-primary">{score}</span>
              <span className="font-body text-xs text-[var(--text-sub)]">/{questions.length}</span>
            </div>
          </div>

          <h2 className="font-heading text-2xl font-bold text-[var(--text-main)] mb-2">{result.title}</h2>
          <p className="font-body text-[var(--text-sub)] mb-8">{result.desc}</p>

          {/* Score bars */}
          <div className="space-y-2 mb-8 text-left">
            <div className="flex justify-between text-xs font-body text-[var(--text-sub)]">
              <span>Điểm số</span>
              <span className="text-primary font-semibold">{percentage}%</span>
            </div>
            <div className="h-3 bg-[var(--surface-alt)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          <button onClick={restart} className="btn-primary w-full flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Chơi lại với bộ câu mới
          </button>
        </div>
      </motion.div>
    </div>
  )

  const q = questions[current]

  return (
    <div className="page-wrapper min-h-screen py-16 px-4 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-primary" />
            <span className="font-body text-sm text-[var(--text-sub)]">
              Câu {current + 1} / {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy size={16} className="text-yellow-500" />
            <span className="font-body text-sm font-semibold text-[var(--text-main)]">{score} điểm</span>
          </div>
        </motion.div>

        {/* Progress */}
        <div className="h-2 bg-[var(--surface-alt)] rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            animate={{ width: `${(current / questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card mb-6">
              <p className="font-heading text-xl font-bold text-[var(--text-main)] leading-snug">
                {q.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt, i) => {
                let state = 'idle'
                if (selected !== null) {
                  if (i === q.answer) state = 'correct'
                  else if (i === selected) state = 'wrong'
                  else state = 'dim'
                }

                return (
                  <motion.button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                    whileHover={selected === null ? { scale: 1.02 } : {}}
                    whileTap={selected === null ? { scale: 0.98 } : {}}
                    className={`p-4 rounded-xl text-left font-body font-medium transition-all duration-300 border-2
                      ${state === 'idle'
                        ? 'border-[var(--border)] bg-[var(--surface)] hover:border-primary hover:bg-primary/5 text-[var(--text-main)]'
                        : state === 'correct'
                          ? 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : state === 'wrong'
                            ? 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'border-[var(--border)] bg-[var(--surface)] opacity-40 text-[var(--text-sub)]'
                      }`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                        ${state === 'idle' ? 'bg-[var(--surface-alt)] text-[var(--text-sub)]'
                          : state === 'correct' ? 'bg-green-400 text-white'
                          : state === 'wrong' ? 'bg-red-400 text-white'
                          : 'bg-[var(--surface-alt)] text-[var(--text-sub)]'
                        }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
