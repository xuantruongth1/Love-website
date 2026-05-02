import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { Mail, RotateCcw } from 'lucide-react'
import { useConfig } from '@/context/ConfigContext'

export default function Letter() {
  const config = useConfig()
  const letterContent = config.letterContent
  const [opened, setOpened] = useState(false)
  const [key, setKey] = useState(0)

  const replay = () => { setOpened(false); setTimeout(() => { setOpened(true); setKey(k => k + 1) }, 300) }

  return (
    <div className="page-wrapper min-h-screen py-16 px-4 flex flex-col items-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="section-title">Thư Tình</h1>
        <p className="section-subtitle">Một bức thư từ trái tim anh 💌</p>
      </motion.div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {!opened ? (
            /* Envelope */
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ type: 'spring', stiffness: 150 }}
              className="cursor-pointer mx-auto"
              onClick={() => setOpened(true)}
              style={{ perspective: 1000 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-white dark:bg-[var(--surface)] rounded-2xl p-12
                           shadow-pink-lg border-2 border-[var(--border)]
                           flex flex-col items-center gap-6 select-none"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                  <Mail size={64} className="text-primary" strokeWidth={1.5} />
                </motion.div>
                <div className="text-center">
                  <p className="font-handwriting text-2xl text-[var(--text-main)]">
                    Gửi {config.girlName} yêu 💌
                  </p>
                  <p className="font-body text-sm text-[var(--text-sub)] mt-2">
                    Click để mở thư
                  </p>
                </div>
                {/* Wax seal */}
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-pink">
                  <span className="text-white text-lg">❤</span>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* Letter */
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120 }}
            >
              <div className="bg-[#FFFAF0] dark:bg-[#2a0d14] rounded-2xl shadow-pink-lg
                              border border-[var(--border)] overflow-hidden">
                {/* Letter header */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-8 py-4
                                border-b border-[var(--border)] flex items-center justify-between">
                  <span className="font-handwriting text-lg text-[var(--text-main)]">
                    {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={replay} className="flex items-center gap-1 text-xs text-[var(--text-sub)]
                                                        hover:text-primary transition-colors">
                    <RotateCcw size={14} /> Đọc lại
                  </button>
                </div>

                {/* Paper lines */}
                <div className="paper-texture p-8 min-h-96">
                  <TypeAnimation
                    key={key}
                    sequence={[letterContent]}
                    wrapper="p"
                    speed={92}
                    cursor={true}
                    className="font-handwriting text-lg leading-[1.9] text-[#4A1028] dark:text-[#FFE4EE]
                               whitespace-pre-wrap"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
