import { useState, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, BookOpen, Image, Star, Mail,
  Clock, Gift, CheckSquare, Gamepad2,
  Music, HelpCircle, MessageSquare, Menu, X, Sparkles,
  Send, LogOut, PenLine, LayoutDashboard, Zap, BarChart2
} from 'lucide-react'
import ReactConfetti from 'react-confetti'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/services/api'

const BASE_NAV = [
  { to: '/story',      icon: BookOpen,      label: 'Kỷ Niệm' },
  { to: '/gallery',    icon: Image,         label: 'Gallery' },
  { to: '/reasons',    icon: Star,          label: '100 Lý Do' },
  { to: '/letter',     icon: Mail,          label: 'Thư Tình' },
  { to: '/countdown',  icon: Clock,         label: 'Đếm Ngày' },
  { to: '/jar',        icon: Gift,          label: 'Hũ Tình Yêu' },
  { to: '/bucket',     icon: CheckSquare,   label: 'Bucket List' },
  { to: '/games',      icon: Gamepad2,      label: 'Vui Chơi' },
  { to: '/music',      icon: Music,         label: 'Nhạc & Phim' },
  { to: '/quiz',       icon: HelpCircle,    label: 'Quiz' },
  { to: '/wishes',     icon: MessageSquare, label: 'Lưu Bút' },
  { to: '/letters',    icon: Send,          label: 'Thư Bí Mật', badge: true },
  { to: '/diary',      icon: PenLine,       label: 'Nhật Ký' },
  { to: '/challenges', icon: Zap,           label: 'Thử Thách' },
  { to: '/stats',      icon: BarChart2,       label: 'Thống Kê' },
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Quản Lý', adminOnly: true },
]

const EASTER_MSGS = [
  'Anh yêu Em nhiều lắm! 💖',
  'Em là điều đặc biệt nhất trong cuộc đời anh 🌟',
  'Mỗi ngày có em là một ngày hạnh phúc 🥰',
  'Em đã tìm thấy bí mật nhỏ của anh rồi! 💌',
]

function EasterEgg({ onClose }) {
  const msg = EASTER_MSGS[Math.floor(Math.random() * EASTER_MSGS.length)]
  return (
    <>
      <ReactConfetti recycle={false} numberOfPieces={250}
        colors={['#FF6B9D', '#FF3366', '#FFB3C6', '#FFF5F7', '#FFD700']}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.5, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-[var(--surface)] rounded-3xl p-10 text-center max-w-sm shadow-pink-lg border-2 border-primary">
          <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }} className="text-6xl mb-5">💝</motion.div>
          <Sparkles size={20} className="text-primary mx-auto mb-3" />
          <p className="font-handwriting text-2xl text-[#4A1028] dark:text-[#FFE4EE] leading-snug mb-6">{msg}</p>
          <button onClick={onClose} className="btn-primary w-full">Yêu anh luôn! 💕</button>
        </motion.div>
      </motion.div>
    </>
  )
}

// ── Ping toast banner ─────────────────────────────────────────────
function PingBanner() {
  const { ping, dismissPing, role } = useAuth()
  if (!ping) return null

  const fromLabel = ping.from_role === 'boy' ? '👦 Anh' : '👧 Em'
  const timeAgo   = () => {
    const diff = Math.floor((Date.now() - new Date(ping.created_at).getTime()) / 60000)
    if (diff < 1) return 'vừa xong'
    if (diff < 60) return `${diff} phút trước`
    return `${Math.floor(diff / 60)} giờ trước`
  }

  return (
    <AnimatePresence>
      <motion.div
        key={ping.id}
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="fixed top-16 lg:top-4 left-1/2 -translate-x-1/2 z-[9990]
                    bg-white dark:bg-[var(--surface)] border-2 border-primary/40
                    rounded-2xl shadow-pink-lg px-5 py-3 flex items-center gap-3 max-w-xs w-full mx-4"
      >
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: 3, duration: 0.5 }}
          className="text-2xl flex-shrink-0"
        >
          💕
        </motion.span>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-sm text-[var(--text-main)]">
            {fromLabel} đang nhớ {role === 'boy' ? 'em' : 'anh'}!
          </p>
          <p className="text-[10px] font-body text-[var(--text-sub)]">{timeAgo()}</p>
        </div>
        <button onClick={dismissPing}
          className="p-1 rounded-lg text-[var(--text-sub)] hover:text-[var(--text-main)] flex-shrink-0">
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Nho Em floating button ────────────────────────────────────────
function PingButton() {
  const { isLoggedIn } = useAuth()
  const [sent, setSent] = useState(false)

  if (!isLoggedIn) return null

  const handlePing = async () => {
    if (sent) return
    try {
      await api.sendPing()
      setSent(true)
      setTimeout(() => setSent(false), 5000)
    } catch (e) { console.error(e) }
  }

  return (
    <motion.button
      onClick={handlePing}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={sent ? 'Đã gửi!' : 'Nhắn "Nhớ em" '}
      className={`fixed bottom-40 right-6 w-12 h-12 rounded-full flex items-center justify-center z-40
                  shadow-pink-lg transition-all duration-300
                  ${sent ? 'bg-green-400 text-white' : 'bg-white dark:bg-[var(--surface)] border-2 border-primary text-primary'}`}
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.span key="sent" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className="text-lg">✓</motion.span>
        ) : (
          <motion.span key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className="text-xl">💕</motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ── UserBadge (mobile top bar — có dropdown) ──────────────────────
function UserBadge() {
  const { name, emoji, avatar, role, unread, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  if (!name) return null

  const bgColor   = role === 'boy' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-pink-100 dark:bg-pink-900/30'
  const textColor = role === 'boy' ? 'text-blue-700 dark:text-blue-300' : 'text-primary'

  return (
    <div className="relative">
      <button onClick={() => setShowMenu(v => !v)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-xl ${bgColor} ${textColor} font-body text-xs font-semibold relative`}>
        {avatar
          ? <img src={avatar} alt={name} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
          : <span>{emoji}</span>
        }
        <span>{name}</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-[998]" onClick={() => setShowMenu(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 top-9 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-pink-lg p-2 min-w-40 z-[999]">
              {unread > 0 && (
                <button onClick={() => { navigate('/letters'); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-body text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold">
                  <Send size={12} /> {unread} thư chưa đọc
                </button>
              )}
              <button onClick={() => { navigate('/stats'); setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-body text-[var(--text-sub)] hover:bg-[var(--surface-alt)]">
                <BarChart2 size={12} /> Thống kê tình yêu
              </button>
              {role === 'boy' && (
                <button onClick={() => { navigate('/dashboard'); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-body text-[var(--text-sub)] hover:bg-[var(--surface-alt)]">
                  <LayoutDashboard size={12} /> Quản lý nội dung
                </button>
              )}
              <div className="border-t border-[var(--border)] my-1" />
              <button onClick={async () => { await logout(); navigate('/'); setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-body text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut size={12} /> Đăng xuất
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── SidebarUserInfo (desktop sidebar — không dùng dropdown để tránh overflow-hidden) ──
function SidebarUserInfo() {
  const { name, emoji, avatar, role, unread, logout } = useAuth()
  const navigate = useNavigate()

  if (!name) return null

  const bgColor   = role === 'boy' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-pink-100 dark:bg-pink-900/30'
  const textColor = role === 'boy' ? 'text-blue-700 dark:text-blue-300' : 'text-primary'

  return (
    <div className="flex items-center gap-2 w-full min-w-0 px-1">
      {/* Avatar / Icon badge — luôn hiện */}
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0 relative ${bgColor} ${textColor}`}>
        {avatar
          ? <img src={avatar} alt={name} className="w-7 h-7 rounded-xl object-cover" />
          : <span>{emoji}</span>
        }
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </div>
      {/* Tên — chỉ hiện khi sidebar mở rộng */}
      <span className={`font-body text-xs font-semibold ${textColor} truncate flex-1
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap`}>
        {name}
      </span>
      {/* Nút đăng xuất — chỉ hiện khi sidebar mở rộng */}
      <button
        onClick={async () => { await logout(); navigate('/') }}
        title="Đăng xuất"
        className="flex-shrink-0 p-1.5 rounded-lg text-[var(--text-sub)] hover:text-red-500
                   hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
                   opacity-0 group-hover:opacity-100 duration-200"
      >
        <LogOut size={14} />
      </button>
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [eggCount, setEggCount] = useState(0)
  const [showEgg, setShowEgg]   = useState(false)
  const eggTimer = useRef(null)
  const location = useLocation()
  const { unread, role } = useAuth()
  const visibleNav = BASE_NAV.filter(n => !n.adminOnly || role === 'boy')

  if (location.pathname === '/') return null

  const handleLogoClick = () => {
    const next = eggCount + 1
    setEggCount(next)
    if (next >= 7) { setShowEgg(true); setEggCount(0) }
    clearTimeout(eggTimer.current)
    eggTimer.current = setTimeout(() => setEggCount(0), 3000)
  }

  return (
    <>
      <AnimatePresence>
        {showEgg && <EasterEgg onClose={() => setShowEgg(false)} />}
      </AnimatePresence>

      {/* Global ping toast */}
      <PingBanner />

      {/* Floating Nho Em button */}
      <PingButton />

      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-20 hover:w-60
                       border-r border-[var(--border)] z-40 glass-sidebar
                       transition-all duration-300 group overflow-hidden shadow-pink"
           style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <button onClick={handleLogoClick}
          className="flex items-center gap-3 px-4 py-5 border-b border-[var(--border)] w-full"
          style={{ background: 'linear-gradient(135deg, rgba(255,107,157,0.12) 0%, transparent 100%)' }}>
          <motion.div whileTap={{ scale: 0.8 }}>
            <Heart size={28} className="text-primary flex-shrink-0 animate-heartbeat" fill="currentColor" />
          </motion.div>
          <span className="font-heading font-bold whitespace-nowrap text-sm
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'linear-gradient(135deg,#FF6B9D,#FF3366)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Nhật ký chúng mình
          </span>
        </button>

        <div className="flex-1 py-4 overflow-y-auto">
          {visibleNav.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 relative
                 ${isActive ? 'text-primary font-semibold shadow-pink'
                   : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'}`}
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, rgba(255,107,157,0.18) 0%, rgba(255,51,102,0.08) 100%)',
                borderLeft: '3px solid #FF6B9D',
              } : {}}>
              <div className="relative flex-shrink-0">
                <Icon size={20} />
                {badge && unread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
              <span className="font-body text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {label}
              </span>
            </NavLink>
          ))}
        </div>

        <div className="p-3 border-t border-[var(--border)] flex flex-col items-center gap-2">
          <SidebarUserInfo />
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-sidebar
                          border-b border-[var(--border)] px-4 py-3
                          flex items-center justify-between shadow-pink"
              style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <button onClick={handleLogoClick} className="flex items-center gap-2">
          <motion.div whileTap={{ scale: 0.8 }}>
            <Heart size={22} className="text-primary" fill="currentColor" />
          </motion.div>
          <span className="font-heading font-bold text-[var(--text-main)] text-sm">Chúng mình</span>
        </button>
        <div className="flex items-center gap-2">
          <UserBadge />
          <ThemeToggle />
          <button onClick={() => setOpen(true)}
            className="p-2 rounded-xl text-[var(--text-sub)] hover:text-primary transition-colors">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="lg:hidden fixed right-0 top-0 h-full w-72
                          border-l border-[var(--border)]
                          z-50 flex flex-col shadow-pink-lg"
              style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <span className="font-heading font-bold text-[var(--text-main)]">Menu</span>
                <button onClick={() => setOpen(false)}
                  className="text-[var(--text-sub)] hover:text-primary p-1.5 rounded-lg hover:bg-[var(--surface-alt)]">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 py-3 overflow-y-auto">
                {visibleNav.map(({ to, icon: Icon, label, badge }) => (
                  <NavLink key={to} to={to} onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-5 py-3.5 transition-all duration-200 relative
                       ${isActive ? 'bg-primary/10 text-primary font-semibold'
                         : 'text-[var(--text-sub)] hover:bg-[var(--surface-alt)] hover:text-[var(--text-main)]'}`}>
                    <div className="relative">
                      <Icon size={20} />
                      {badge && unread > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                    <span className="font-body">{label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
