import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Heart, MessageSquare } from 'lucide-react'
import * as api from '@/services/api'

const COLORS = ['#FFE8EE','#FFF3E0','#E8F5E9','#E3F2FD','#F3E5F5','#FFF9C4','#FCE4EC','#E0F7FA']

export default function Wishes() {
  const [wishes, setWishes]   = useState([])
  const [name, setName]       = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [localLikes, setLocalLikes] = useState({})

  useEffect(() => {
    api.getWishes().then(setWishes).catch(() => {})
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    try {
      const created = await api.addWish({
        name:    name.trim() || 'Ẩn danh',
        message: message.trim(),
        color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      })
      setWishes(prev => [created, ...prev])
      setName('')
      setMessage('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const handleLike = async (w) => {
    const key = `liked_${w.id}`
    if (localStorage.getItem(key) || localLikes[w.id]) return
    localStorage.setItem(key, '1')
    setLocalLikes(prev => ({ ...prev, [w.id]: true }))
    try {
      const updated = await api.likeWish(w.id)
      setWishes(prev => prev.map(x => x.id === updated.id ? updated : x))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="section-title">Sổ Lưu Bút</h1>
          <p className="section-subtitle">Để lại lời nhắn cho chúng mình 💌</p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card max-w-md mx-auto mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-primary" />
            <span className="font-heading font-bold text-[var(--text-main)]">Viết lời nhắn</span>
          </div>
          <div className="space-y-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tên của bạn (tùy chọn)"
              maxLength={30}
              className="w-full px-4 py-3 rounded-xl font-body text-sm
                          bg-[var(--surface-alt)] border border-[var(--border)]
                          text-[var(--text-main)] placeholder:text-[var(--text-sub)]
                          focus:outline-none focus:border-primary transition-colors"
            />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Viết điều gì đó đẹp... 💕"
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 rounded-xl font-body text-sm resize-none
                          bg-[var(--surface-alt)] border border-[var(--border)]
                          text-[var(--text-main)] placeholder:text-[var(--text-sub)]
                          focus:outline-none focus:border-primary transition-colors"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--text-sub)] font-body">{message.length}/200</span>
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16}/> {sending ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </div>
        </motion.form>

        {/* Sticky notes masonry */}
        {wishes.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-sub)]">
            <p className="font-body">Chưa có lời nhắn nào. Hãy là người đầu tiên! 💌</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            <AnimatePresence>
              {wishes.map((w, i) => {
                const alreadyLiked = localLikes[w.id] || !!localStorage.getItem(`liked_${w.id}`)
                return (
                  <motion.div
                    key={w.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: (i % 7 - 3) * 1.2 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.04, rotate: 0, zIndex: 10 }}
                    className="break-inside-avoid p-5 rounded-2xl shadow-pink cursor-default mb-4"
                    style={{ background: w.color || COLORS[i % COLORS.length] }}
                  >
                    <div className="flex justify-center mb-3">
                      <div className="w-3 h-3 rounded-full bg-primary/60 shadow-sm" />
                    </div>
                    <p className="font-handwriting text-base leading-relaxed text-[#4A1028] mb-4">
                      "{w.message}"
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-xs text-[#8B3A52] font-semibold">— {w.name}</span>
                      <button
                        onClick={() => handleLike(w)}
                        className={`flex items-center gap-1 text-xs font-body transition-all duration-200
                                     ${alreadyLiked ? 'text-primary scale-110' : 'text-[#8B3A52] hover:text-primary hover:scale-110'}`}
                      >
                        <Heart size={13} fill={alreadyLiked ? 'currentColor' : 'none'} />
                        {w.likes || 0}
                      </button>
                    </div>
                    {w.created_at && (
                      <p className="text-[10px] text-[#8B3A52]/60 font-body mt-2">
                        {new Date(w.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
