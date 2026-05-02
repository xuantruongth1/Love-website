import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, LayoutDashboard, Clock, Heart, MessageSquare, Settings, Image as ImageIcon, HelpCircle, Gamepad2, Music } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

import TabOverview from '@/components/admin/TabOverview'
import TabStory from '@/components/admin/TabStory'
import TabGallery from '@/components/admin/TabGallery'
import TabReasons from '@/components/admin/TabReasons'
import TabQuiz from '@/components/admin/TabQuiz'
import TabJar from '@/components/admin/TabJar'
import TabWheel from '@/components/admin/TabWheel'
import TabWishes from '@/components/admin/TabWishes'
import TabBucketList from '@/components/admin/TabBucketList'
import TabChallenges from '@/components/admin/TabChallenges'
import TabMusic from '@/components/admin/TabMusic'
import TabSettings from '@/components/admin/TabSettings'

const TABS = [
  { id: 'overview',    label: 'Tổng quan',    icon: <LayoutDashboard size={16} /> },
  { id: 'story',       label: 'Kỷ niệm',      icon: <Clock size={16} /> },
  { id: 'gallery',     label: 'Ảnh',          icon: <ImageIcon size={16} /> },
  { id: 'reasons',     label: '100 Lý do',    icon: <Heart size={16} /> },
  { id: 'quiz',        label: 'Quiz',         icon: <HelpCircle size={16} /> },
  { id: 'wheel',       label: 'Vòng quay',    icon: <Gamepad2 size={16} /> },
  { id: 'jar',         label: 'Hũ tình yêu',  icon: <Heart size={16} /> },
  { id: 'bucket',      label: 'Bucket List',  icon: <MessageSquare size={16} /> },
  { id: 'challenges',  label: 'Thử thách',    icon: <Gamepad2 size={16} /> },
  { id: 'wishes',      label: 'Sổ lưu bút',   icon: <MessageSquare size={16} /> },
  { id: 'music',       label: 'Nhạc & Phim',  icon: <Music size={16} /> },
  { id: 'settings',    label: 'Cài đặt',      icon: <Settings size={16} /> },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isLoggedIn, loading: authLoading, logout } = useAuth()
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoggedIn, authLoading, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen font-body" style={{ background: 'var(--background)', color: 'var(--text-main)', position: 'relative', zIndex: 10 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(255,107,157,0.08) 0%, var(--surface) 60%)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 2px 12px var(--shadow)',
        }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF3366)', boxShadow: '0 2px 8px rgba(255,107,157,0.4)' }}>
          <span className="text-sm">💕</span>
        </div>
        <div className="flex-1">
          <h1 className="font-heading font-bold text-base leading-tight" style={{ color: 'var(--text-main)' }}>
            Bảng Điều Khiển
          </h1>
          <p className="text-[10px] font-body" style={{ color: 'var(--text-sub)' }}>Quản lý nội dung website tình yêu</p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-body font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--surface-alt)', color: 'var(--text-sub)', border: '1px solid var(--border)' }}>
          <LogOut size={13} />
          Đăng xuất
        </button>
      </div>

      {/* Tab bar */}
      <div className="sticky top-[57px] z-20 overflow-x-auto"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex min-w-max px-3 py-2 gap-1 scrollbar-hide">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-semibold whitespace-nowrap rounded-xl transition-all duration-200"
              style={tab === t.id ? {
                background: 'linear-gradient(135deg, rgba(255,107,157,0.18) 0%, rgba(255,51,102,0.10) 100%)',
                color: 'var(--primary)',
                boxShadow: '0 1px 4px rgba(255,107,157,0.25)',
                border: '1px solid rgba(255,107,157,0.30)',
              } : {
                color: 'var(--text-sub)',
                border: '1px solid transparent',
              }}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'overview' && <TabOverview setTab={setTab} />}
            {tab === 'story'    && <TabStory />}
            {tab === 'gallery'  && <TabGallery />}
            {tab === 'reasons'  && <TabReasons />}
            {tab === 'quiz'     && <TabQuiz />}
            {tab === 'wheel'    && <TabWheel />}
            {tab === 'jar'      && <TabJar />}
            {tab === 'bucket'     && <TabBucketList />}
            {tab === 'challenges' && <TabChallenges />}
            {tab === 'wishes'     && <TabWishes />}
            {tab === 'music'      && <TabMusic />}
            {tab === 'settings'   && <TabSettings navigate={navigate} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
