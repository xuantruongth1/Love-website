import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Image, BookOpen, Mail, Send, CheckSquare, Zap, Star, Bell, Loader2 } from 'lucide-react'
import * as api from '@/services/api'

function daysSince(dateStr) {
  if (!dateStr) return 0
  const start = new Date(dateStr + 'T00:00:00')
  const now   = new Date()
  return Math.floor((now - start) / 86400000)
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card p-5 flex flex-col items-center text-center gap-2"
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-[var(--surface-alt)] ${color}`}>
        <Icon size={22} />
      </div>
      <p className="font-heading text-2xl font-bold text-[var(--text-main)]">{value}</p>
      <p className="font-body text-sm text-[var(--text-main)] font-semibold leading-tight">{label}</p>
      {sub && <p className="font-body text-xs text-[var(--text-sub)]">{sub}</p>}
    </motion.div>
  )
}

function CompareBar({ boyVal, girlVal, boyLabel = '👦 Anh', girlLabel = '👧 Em' }) {
  const total = boyVal + girlVal || 1
  const boyPct = Math.round((boyVal / total) * 100)
  const girlPct = 100 - boyPct

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-body text-[var(--text-sub)]">
        <span>{boyLabel} — {boyVal}</span>
        <span>{girlLabel} — {girlVal}</span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-[var(--surface-alt)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${boyPct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-blue-400 dark:bg-blue-500"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${girlPct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="bg-primary"
        />
      </div>
      <div className="flex justify-between text-[10px] font-body text-[var(--text-sub)]">
        <span>{boyPct}%</span>
        <span>{girlPct}%</span>
      </div>
    </div>
  )
}

export default function Stats() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getStats()
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page-wrapper min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="page-wrapper min-h-screen flex items-center justify-center">
        <p className="font-body text-[var(--text-sub)]">Không thể tải thống kê</p>
      </div>
    )
  }

  const days = daysSince(stats.anniversary)

  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="section-title">Thống Kê Tình Yêu</h1>
          <p className="section-subtitle">Nhìn lại những gì chúng mình đã xây dựng cùng nhau 💕</p>
        </motion.div>

        {/* Days together — hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card mb-8 p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
          <Heart size={32} className="mx-auto text-primary mb-3 animate-pulse" fill="currentColor" />
          <p className="font-heading text-6xl font-bold text-primary mb-2">{days}</p>
          <p className="font-body text-[var(--text-sub)]">ngày bên nhau</p>
          <p className="font-handwriting text-sm text-[var(--text-sub)] mt-1">
            Kể từ {new Date(stats.anniversary + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Grid stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Image}       label="Ảnh kỷ niệm"    value={stats.photos}        color="text-purple-500" delay={0.05} />
          <StatCard icon={BookOpen}    label="Kỷ niệm"        value={stats.timeline}      color="text-orange-400" delay={0.1} />
          <StatCard icon={Mail}        label="Nhật ký"        value={stats.diary_total}   color="text-pink-500"   delay={0.15} />
          <StatCard icon={Send}        label="Thư bí mật"     value={stats.letters_total} color="text-red-400"    delay={0.2} />
          <StatCard icon={CheckSquare} label="Bucket list"    value={`${stats.bucket_done}/${stats.bucket_total}`}
            sub={`${stats.bucket_total ? Math.round((stats.bucket_done/stats.bucket_total)*100) : 0}% hoàn thành`}
            color="text-green-500" delay={0.25} />
          <StatCard icon={Zap}         label="Thử thách đôi" value={stats.challenges_both_done}
            sub={`/ ${stats.challenges_total} thử thách`} color="text-yellow-500" delay={0.3} />
          <StatCard icon={Star}        label="Lý do yêu"     value={stats.reasons}       color="text-amber-400"  delay={0.35} />
          <StatCard icon={Bell}        label="Lần nhớ nhau"  value={stats.ping_boy + stats.ping_girl}
            sub="tổng ping đã gửi" color="text-rose-400" delay={0.4} />
        </div>

        {/* Comparison section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card p-6 space-y-5"
        >
          <h3 className="font-heading font-bold text-[var(--text-main)] text-center mb-4">Anh vs Em 💙🩷</h3>

          <div>
            <p className="font-body text-xs text-[var(--text-sub)] mb-2 font-semibold">Nhật ký đã viết</p>
            <CompareBar boyVal={stats.diary_boy} girlVal={stats.diary_girl} />
          </div>

          <div>
            <p className="font-body text-xs text-[var(--text-sub)] mb-2 font-semibold">Thư bí mật đã gửi</p>
            <CompareBar boyVal={stats.letters_boy} girlVal={stats.letters_girl} />
          </div>

          <div>
            <p className="font-body text-xs text-[var(--text-sub)] mb-2 font-semibold">Lần nhắn "Nhớ em/anh"</p>
            <CompareBar boyVal={stats.ping_boy} girlVal={stats.ping_girl} />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center font-handwriting text-lg text-[var(--text-sub)] mt-8"
        >
          Còn nhiều kỷ niệm đang chờ hai đứa tạo ra 🌸
        </motion.p>
      </div>
    </div>
  )
}
