import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PenLine, ChevronLeft, ChevronRight, Trash2, Edit3, Send, X, Check, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/services/api'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function fmtDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })
}

function fmtTime(isoStr) {
  return new Date(isoStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const ROLE_META = {
  boy:  { label: 'Anh', bg: 'bg-blue-100 dark:bg-blue-900/30',  text: 'text-blue-700 dark:text-blue-300',  border: 'border-blue-200 dark:border-blue-700' },
  girl: { label: 'Em',  bg: 'bg-pink-100 dark:bg-pink-900/20',  text: 'text-primary',                      border: 'border-pink-200 dark:border-pink-700' },
}

const REACTION_EMOJIS = ['❤️', '🥺', '😊', '😂', '🤗', '💕']

function ReactionBar({ entryId, myRole, initialReactions = [] }) {
  const [reactions, setReactions] = useState(initialReactions)
  const myReaction = reactions.find(r => r.role === myRole)

  const handleReact = async (emoji) => {
    try {
      const updated = await api.reactDiary(entryId, emoji)
      setReactions(updated)
    } catch (e) { console.error(e) }
  }

  return (
    <div className="flex items-center gap-1 mt-2 flex-wrap">
      {REACTION_EMOJIS.map(emoji => {
        const isActive = myReaction?.emoji === emoji
        const hasAny   = reactions.some(r => r.emoji === emoji)
        return (
          <button key={emoji} onClick={() => handleReact(emoji)}
            className={`text-sm px-1.5 py-0.5 rounded-full transition-all
              ${isActive
                ? 'bg-primary/20 scale-110 ring-1 ring-primary/40'
                : hasAny
                  ? 'bg-[var(--surface-alt)] opacity-80 hover:opacity-100'
                  : 'opacity-30 hover:opacity-70'}`}>
            {emoji}
          </button>
        )
      })}
      {reactions.length > 0 && (
        <span className="text-[10px] font-body text-[var(--text-sub)] ml-1">
          {reactions.map(r => r.emoji).join(' ')}
        </span>
      )}
    </div>
  )
}

function EntryCard({ entry, myRole, onEdit, onDelete }) {
  const meta = ROLE_META[entry.role] || ROLE_META.girl
  const isOwn = entry.role === myRole

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className={`relative rounded-2xl border p-4 ${meta.bg} ${meta.border}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-body font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 ${meta.text}`}>
          {meta.label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-body text-[var(--text-sub)]">{fmtTime(entry.created_at)}</span>
          {isOwn && (
            <div className="flex gap-1">
              <button onClick={() => onEdit(entry)}
                className="p-1 rounded-lg text-[var(--text-sub)] hover:text-primary transition-colors">
                <Edit3 size={13} />
              </button>
              <button onClick={() => onDelete(entry.id)}
                className="p-1 rounded-lg text-[var(--text-sub)] hover:text-red-500 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="font-handwriting text-base leading-relaxed text-[var(--text-main)] whitespace-pre-wrap">
        {entry.content}
      </p>
      <ReactionBar entryId={entry.id} myRole={myRole} initialReactions={entry.reactions || []} />
    </motion.div>
  )
}

// ── On This Day Banner ────────────────────────────────────────────
function OnThisDayBanner() {
  const [data, setData]       = useState(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    api.getMemoriesToday().then(d => {
      const hasAny = d.diary?.length || d.timeline?.length || d.photos?.length
      if (hasAny) setData(d)
    }).catch(() => {})
  }, [])

  if (!data || !visible) return null

  const items = [
    ...data.timeline.map(t => ({ type: 'timeline', icon: '🗓️', text: t.title, year: t.date?.slice(0, 4) })),
    ...data.diary.map(d    => ({ type: 'diary',    icon: '📔', text: d.content.slice(0, 60) + (d.content.length > 60 ? '...' : ''), year: d.date?.slice(0, 4) })),
    ...data.photos.map(p   => ({ type: 'photo',    icon: '📸', text: p.caption || 'Một bức ảnh kỷ niệm', year: p.date?.slice(0, 4) })),
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="card mb-6 p-4 border-2 border-primary/30 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
      <button onClick={() => setVisible(false)}
        className="absolute top-2 right-2 p-1 rounded-lg text-[var(--text-sub)] hover:text-[var(--text-main)]">
        <X size={14} />
      </button>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-primary" />
        <p className="font-heading font-bold text-sm text-[var(--text-main)]">Hôm nay trong quá khứ ✨</p>
      </div>
      <div className="space-y-2">
        {items.slice(0, 3).map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-sm flex-shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs text-[var(--text-main)] line-clamp-1">{item.text}</p>
              {item.year && (
                <p className="text-[10px] text-[var(--text-sub)] font-body">{item.year}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function Diary() {
  const { role } = useAuth()
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [entries, setEntries]           = useState([])
  const [datesWithEntries, setDatesWithEntries] = useState([])
  const [loading, setLoading]           = useState(true)
  const [text, setText]                 = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [editText, setEditText]         = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    api.getDiaryDates().then(dates => setDatesWithEntries(dates)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api.getDiary(selectedDate)
      .then(data => { setEntries(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedDate])

  const navigateDate = (delta) => {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return
    setSubmitting(true)
    try {
      const entry = await api.addDiary({ date: selectedDate, content: text.trim() })
      setEntries(prev => [...prev, entry])
      setText('')
      if (!datesWithEntries.includes(selectedDate)) {
        setDatesWithEntries(prev => [selectedDate, ...prev].sort((a, b) => b.localeCompare(a)))
      }
    } catch (e) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa mục nhật ký này?')) return
    try {
      await api.deleteDiary(id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (e) {
      alert(e.message)
    }
  }

  const startEdit = (entry) => {
    setEditingEntry(entry.id)
    setEditText(entry.content)
  }

  const saveEdit = async () => {
    try {
      const updated = await api.updateDiary(editingEntry, { content: editText.trim() })
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
      setEditingEntry(null)
    } catch (e) {
      alert(e.message)
    }
  }

  const isToday = selectedDate === todayStr()

  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      <div className="max-w-xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="section-title">Nhật Ký Chung</h1>
          <p className="section-subtitle">Nơi cả hai ghi lại những điều nhỏ nhặt mỗi ngày 💕</p>
        </motion.div>

        {/* On This Day — chỉ hiện khi xem ngày hôm nay */}
        {isToday && <OnThisDayBanner />}

        {/* Date navigator */}
        <div className="flex items-center justify-between mb-6 gap-2">
          <button onClick={() => navigateDate(-1)}
            className="p-2 rounded-xl text-[var(--text-sub)] hover:text-primary hover:bg-[var(--surface-alt)] transition-all">
            <ChevronLeft size={20} />
          </button>

          <div className="flex-1 text-center">
            <input
              type="date"
              value={selectedDate}
              max={todayStr()}
              onChange={e => e.target.value && setSelectedDate(e.target.value)}
              className="sr-only"
              id="diary-date-input"
            />
            <label htmlFor="diary-date-input"
              className="cursor-pointer font-heading font-bold text-base text-[var(--text-main)] hover:text-primary transition-colors">
              {isToday ? 'Hôm nay — ' : ''}{fmtDate(selectedDate)}
            </label>
            {datesWithEntries.includes(selectedDate) && !isToday && (
              <div className="text-xs text-primary font-body mt-0.5">📔 Có nhật ký</div>
            )}
          </div>

          <button onClick={() => navigateDate(1)}
            disabled={isToday}
            className="p-2 rounded-xl text-[var(--text-sub)] hover:text-primary hover:bg-[var(--surface-alt)] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Entries */}
        <div className="space-y-3 mb-6 min-h-[80px]">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-8 text-[var(--text-sub)] font-body text-sm">
                Đang tải...
              </motion.div>
            ) : entries.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-10 text-[var(--text-sub)] font-body text-sm">
                <PenLine size={32} className="mx-auto mb-3 opacity-30" />
                Chưa có gì ngày này. Hãy là người viết đầu tiên! 💌
              </motion.div>
            ) : (
              entries.map(entry => (
                editingEntry === entry.id ? (
                  <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    layout className="card p-4 space-y-2">
                    <textarea
                      autoFocus
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-xl text-sm font-handwriting bg-[var(--surface-alt)]
                                  border border-[var(--border)] text-[var(--text-main)] resize-none
                                  focus:outline-none focus:border-primary"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingEntry(null)}
                        className="p-1.5 rounded-lg text-[var(--text-sub)] hover:bg-[var(--surface-alt)]">
                        <X size={15} />
                      </button>
                      <button onClick={saveEdit}
                        className="p-1.5 rounded-lg text-white bg-primary hover:opacity-80">
                        <Check size={15} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    myRole={role}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                )
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Write new entry */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4 sticky bottom-20 lg:bottom-6">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit() }}
            placeholder="Hôm nay em muốn ghi gì không? ✨"
            rows={3}
            className="w-full px-3 py-2 rounded-xl text-sm font-handwriting bg-[var(--surface-alt)]
                        border border-[var(--border)] text-[var(--text-main)] resize-none
                        placeholder:text-[var(--text-sub)] focus:outline-none focus:border-primary mb-3"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-body text-[var(--text-sub)]">Ctrl + Enter để gửi</span>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
              <Send size={14} />
              {submitting ? 'Đang gửi...' : 'Ghi vào nhật ký'}
            </button>
          </div>
        </motion.div>

        {/* Recent dates */}
        {datesWithEntries.length > 1 && (
          <div className="mt-8">
            <p className="font-heading font-bold text-sm text-[var(--text-main)] mb-3 text-center">
              Những ngày đã viết
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {datesWithEntries.slice(0, 10).map(d => (
                <button key={d} onClick={() => setSelectedDate(d)}
                  className={`text-xs font-body px-3 py-1.5 rounded-full border transition-all
                    ${d === selectedDate
                      ? 'bg-primary text-white border-primary'
                      : 'border-[var(--border)] text-[var(--text-sub)] hover:border-primary hover:text-primary'}`}>
                  {new Date(d + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
