import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Calendar, Plus, Trash2 } from 'lucide-react'
import { useConfig } from '@/context/ConfigContext'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/services/api'

// ── Countdown hooks ──
function useTimeElapsed(startDate) {
  const [elapsed, setElapsed] = useState({})
  useEffect(() => {
    const calc = () => {
      const diff = Date.now() - new Date(startDate).getTime()
      const s = Math.floor(diff / 1000)
      const m = Math.floor(s / 60)
      const h = Math.floor(m / 60)
      const d = Math.floor(h / 24)
      setElapsed({
        years: Math.floor(d / 365.25),
        months: Math.floor((d % 365.25) / 30.44),
        days: d % 30, hours: h % 24,
        minutes: m % 60, seconds: s % 60,
        totalDays: d,
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [startDate])
  return elapsed
}

function useNextEventCountdown(dateStr) {
  const [cd, setCd] = useState({})
  useEffect(() => {
    const calc = () => {
      const [, mo, da] = dateStr.split('-')
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const t = new Date(now.getFullYear(), +mo - 1, +da)
      if (t < todayStart) t.setFullYear(t.getFullYear() + 1)
      const diff = t - now
      if (diff < 0) { setCd({ d: 0, h: 0, m: 0, s: 0 }); return }
      setCd({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [dateStr])
  return cd
}

// ── Sub-components ──
function CountUnit({ value, label }) {
  return (
    <div className="card text-center p-4">
      <motion.div
        key={value}
        initial={{ y: -6, opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-heading text-4xl md:text-5xl font-bold text-primary"
      >
        {String(value ?? 0).padStart(2, '0')}
      </motion.div>
      <div className="font-body text-xs text-[var(--text-sub)] mt-1">{label}</div>
    </div>
  )
}

function MilestoneCard({ label, emoji, cd, accent, delay = 0 }) {
  const isToday = cd.d === 0 && cd.h === 0
  const isSoon  = cd.d !== undefined && cd.d <= 7 && !isToday
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card relative overflow-hidden"
    >
      {(isToday || isSoon) && (
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
      )}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{emoji}</span>
        <p className="font-heading text-sm font-semibold text-[var(--text-main)] leading-tight flex-1">{label}</p>
        {isSoon && (
          <span className="text-[10px] font-body px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: `${accent}22`, color: accent }}>
            Sắp tới!
          </span>
        )}
      </div>

      {isToday ? (
        <div className="text-center py-3">
          <p className="font-heading text-2xl font-bold" style={{ color: accent }}>🎉 Hôm nay!</p>
          <p className="font-body text-xs text-[var(--text-sub)] mt-1">Chúc mừng nha 💕</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1.5">
          {[['d','Ngày'],['h','Giờ'],['m','Phút'],['s','Giây']].map(([k, l]) => (
            <div key={l} className="rounded-xl py-2 text-center"
              style={{ background: `${accent}15` }}>
              <motion.div
                key={cd[k]}
                initial={{ y: -3, opacity: 0.6 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-heading text-lg font-bold"
                style={{ color: accent }}
              >
                {String(cd[k] ?? 0).padStart(2, '0')}
              </motion.div>
              <div className="font-body text-[10px] text-[var(--text-sub)]">{l}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

const EVENT_COLORS = ['#FF6B9D', '#FF3366', '#87CEEB', '#98FB98', '#DDA0DD', '#FFB347']

function LoveCalendar({ events, onAdd, onDelete, isAdmin }) {
  const [year, setYear]   = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]   = useState({ title: '', note: '', color: EVENT_COLORS[0] })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const eventsOnDay = (d) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return events.filter(e => e.date === key)
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const handleAdd = async () => {
    if (!form.title.trim() || !selected) return
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selected).padStart(2, '0')}`
    await onAdd({ date: dateStr, title: form.title.trim(), note: form.note.trim(), color: form.color })
    setForm({ title: '', note: '', color: EVENT_COLORS[0] })
    setShowForm(false)
  }

  const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                      'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
  const dayLabels = ['CN','T2','T3','T4','T5','T6','T7']

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-primary" />
          <h2 className="font-heading text-xl font-bold text-[var(--text-main)]">Lịch Hẹn Hò</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-[var(--surface-alt)] flex items-center
                                                  justify-center text-[var(--text-sub)] hover:text-primary transition-colors">‹</button>
          <span className="font-body text-sm font-semibold text-[var(--text-main)] min-w-[90px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-[var(--surface-alt)] flex items-center
                                                  justify-center text-[var(--text-sub)] hover:text-primary transition-colors">›</button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {dayLabels.map(d => (
          <div key={d} className="text-center font-body text-xs font-semibold text-[var(--text-sub)] py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const dayEvents = eventsOnDay(d)
          const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year
          const isSel = selected === d

          return (
            <button
              key={d}
              onClick={() => { setSelected(d === selected ? null : d); setShowForm(false) }}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-start pt-1
                           text-xs font-body transition-all duration-150
                           ${isToday ? 'bg-primary text-white font-bold' : ''}
                           ${isSel && !isToday ? 'bg-primary/15 ring-2 ring-primary' : ''}
                           ${!isToday && !isSel ? 'hover:bg-[var(--surface-alt)] text-[var(--text-main)]' : ''}
                         `}
            >
              {d}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: e.color || '#FF6B9D' }} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="pt-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-sm font-semibold text-[var(--text-main)]">
                  {String(selected).padStart(2,'0')} {monthNames[month]}
                </span>
                {isAdmin && (
                  <button onClick={() => setShowForm(p => !p)}
                    className="flex items-center gap-1 text-xs font-body text-primary hover:text-accent transition-colors">
                    <Plus size={14}/> Thêm sự kiện
                  </button>
                )}
              </div>

              {/* Event list */}
              {eventsOnDay(selected).length > 0 ? (
                <div className="space-y-2 mb-3">
                  {eventsOnDay(selected).map(e => (
                    <div key={e.id} className="flex items-start gap-2 p-2 rounded-lg bg-[var(--surface-alt)]">
                      <span className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                            style={{ background: e.color || '#FF6B9D' }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-semibold text-[var(--text-main)] truncate">{e.title}</p>
                        {e.note && <p className="font-body text-xs text-[var(--text-sub)]">{e.note}</p>}
                      </div>
                      {isAdmin && (
                        <button onClick={() => onDelete(e.id)}
                          className="text-[var(--text-sub)] hover:text-red-500 transition-colors flex-shrink-0">
                          <Trash2 size={14}/>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-body text-[var(--text-sub)] mb-3">Chưa có sự kiện hôm này</p>
              )}

              {/* Add form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-2 p-3 bg-[var(--surface-alt)] rounded-xl"
                  >
                    <input
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Tên sự kiện *"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--surface)] border border-[var(--border)]
                                  text-[var(--text-main)] placeholder:text-[var(--text-sub)]
                                  focus:outline-none focus:border-primary font-body"
                    />
                    <input
                      value={form.note}
                      onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                      placeholder="Ghi chú (tùy chọn)"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--surface)] border border-[var(--border)]
                                  text-[var(--text-main)] placeholder:text-[var(--text-sub)]
                                  focus:outline-none focus:border-primary font-body"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-body text-[var(--text-sub)]">Màu:</span>
                      {EVENT_COLORS.map(c => (
                        <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                          className={`w-5 h-5 rounded-full border-2 transition-all
                                       ${form.color === c ? 'border-[var(--text-main)] scale-110' : 'border-transparent'}`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAdd} className="btn-primary text-sm py-2 flex-1">Lưu</button>
                      <button onClick={() => setShowForm(false)}
                        className="px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--text-sub)] text-sm font-body hover:border-primary transition-colors">
                        Hủy
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main page ──
export default function Countdown() {
  const config = useConfig()
  const elapsed = useTimeElapsed(config.anniversaryDate)
  const [calEvents, setCalEvents] = useState([])
  const { isLoggedIn: isAdmin } = useAuth()

  // One hook per milestone — hooks must be called unconditionally at top level
  const cdGirlBday  = useNextEventCountdown(config.girlBirthday)
  const cdGirlBday2 = useNextEventCountdown('2000-08-11')
  const cdBoyBday   = useNextEventCountdown(config.boyBirthday)
  const cdAnniv     = useNextEventCountdown(config.anniversaryDate)
  const cdWomens    = useNextEventCountdown('2000-03-08')
  const cdVnWomens  = useNextEventCountdown('2000-10-20')
  const cdValentine = useNextEventCountdown('2000-02-14')
  const cdWhiteVal  = useNextEventCountdown('2000-03-14')
  const cdNoel      = useNextEventCountdown('2000-12-24')

  useEffect(() => {
    api.getCalendar().then(data => { if (Array.isArray(data)) setCalEvents(data) }).catch(() => {})
  }, [])

  // Sort milestones by nearest upcoming (total seconds remaining)
  const toSec = (cd) => (cd.d ?? 999) * 86400 + (cd.h ?? 0) * 3600 + (cd.m ?? 0) * 60 + (cd.s ?? 0)

  const milestones = [
    { label: `Sinh nhật ${config.girlName} (4/8)`,  emoji: '🎂', cd: cdGirlBday,  accent: '#FF6B9D' },
    { label: `Sinh nhật ${config.girlName} (11/8)`, emoji: '🎀', cd: cdGirlBday2, accent: '#fb7185' },
    { label: `Sinh nhật ${config.boyName}`,  emoji: '🎂', cd: cdBoyBday,   accent: '#60a5fa' },
    { label: 'Kỷ niệm yêu nhau ❤️',          emoji: '💑', cd: cdAnniv,     accent: '#FF3366' },
    { label: 'Valentine 14/2',               emoji: '💘', cd: cdValentine, accent: '#e11d48' },
    { label: 'Valentine Trắng 14/3',         emoji: '🤍', cd: cdWhiteVal,  accent: '#a78bfa' },
    { label: 'Quốc tế Phụ nữ 8/3',           emoji: '💐', cd: cdWomens,    accent: '#f472b6' },
    { label: 'Phụ nữ Việt Nam 20/10',         emoji: '🌸', cd: cdVnWomens,  accent: '#c084fc' },
    { label: 'Noel 24/12',                   emoji: '🎄', cd: cdNoel,      accent: '#22c55e' },
  ].sort((a, b) => toSec(a.cd) - toSec(b.cd))

  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="section-title">Bộ Đếm Tình Yêu</h1>
          <p className="section-subtitle">Chúng mình đã bên nhau được...</p>
        </motion.div>

        {/* Main counter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { v: elapsed.years,   l: 'Năm' },
              { v: elapsed.months,  l: 'Tháng' },
              { v: elapsed.days,    l: 'Ngày' },
              { v: elapsed.hours,   l: 'Giờ' },
              { v: elapsed.minutes, l: 'Phút' },
              { v: elapsed.seconds, l: 'Giây' },
            ].map(({ v, l }) => <CountUnit key={l} value={v} label={l} />)}
          </div>
          {elapsed.totalDays > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center font-handwriting text-xl text-primary mt-5"
            >
              Tương đương {elapsed.totalDays.toLocaleString('vi-VN')} ngày bên nhau 🥰
            </motion.p>
          )}
        </motion.div>

        {/* Milestones grid */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-5"
          >
            <Heart size={18} className="text-primary" fill="currentColor" />
            <h2 className="font-heading text-xl font-bold text-[var(--text-main)]">Những Mốc Quan Trọng</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {milestones.map((m, i) => (
              <MilestoneCard key={m.label} {...m} delay={0.3 + i * 0.07} />
            ))}
          </div>
        </div>

        {/* Love Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <LoveCalendar
            events={calEvents}
            onAdd={async (data) => {
              const ev = await api.addCalendarEvent(data)
              setCalEvents(prev => [...prev, ev].sort((a, b) => a.date.localeCompare(b.date)))
            }}
            onDelete={async (id) => {
              await api.deleteCalendarEvent(id)
              setCalEvents(prev => prev.filter(e => e.id !== id))
            }}
            isAdmin={isAdmin}
          />
        </motion.div>

      </div>
    </div>
  )
}
