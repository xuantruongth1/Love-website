import { useState, useEffect } from 'react'
import {
  BookOpen, Image as ImageIcon, Heart, HelpCircle,
  Gamepad2, MessageSquare, ChevronRight, Clock,
  CheckSquare, Zap,
} from 'lucide-react'
import * as api from '@/services/api'

const QUICK_LINKS = [
  { id: 'story',      icon: Clock,          label: 'Kỷ niệm',      desc: 'Thêm / sửa timeline',     color: '#FF6B9D' },
  { id: 'gallery',    icon: ImageIcon,      label: 'Ảnh',           desc: 'Quản lý thư viện ảnh',    color: '#F472B6' },
  { id: 'reasons',    icon: Heart,          label: '100 Lý do',     desc: 'Chỉnh sửa lý do yêu',     color: '#FF3366' },
  { id: 'quiz',       icon: HelpCircle,     label: 'Quiz',          desc: 'Bộ câu hỏi đố vui',       color: '#C084FC' },
  { id: 'wheel',      icon: Gamepad2,       label: 'Vòng quay',     desc: 'Tùy chọn vòng quay',      color: '#FB923C' },
  { id: 'jar',        icon: MessageSquare,  label: 'Hũ tình yêu',   desc: 'Lời nhắn hàng ngày',      color: '#FF6B9D' },
  { id: 'bucket',     icon: CheckSquare,    label: 'Bucket List',   desc: 'Danh sách ước muốn',      color: '#34D399' },
  { id: 'challenges', icon: Zap,            label: 'Thử thách',     desc: 'Thử thách tình yêu',      color: '#FBBF24' },
  { id: 'wishes',     icon: BookOpen,       label: 'Sổ lưu bút',    desc: 'Quản lý lời nhắn',        color: '#60A5FA' },
]

const STATS = [
  { key: 'quiz',     label: 'Quiz',      emoji: '🧠', tab: 'quiz' },
  { key: 'jar',      label: 'Hũ',        emoji: '💌', tab: 'jar' },
  { key: 'reasons',  label: 'Lý do',     emoji: '💕', tab: 'reasons' },
  { key: 'timeline', label: 'Timeline',  emoji: '🕐', tab: 'story' },
  { key: 'photos',   label: 'Ảnh',       emoji: '🖼️', tab: 'gallery' },
]

export default function TabOverview({ setTab }) {
  const [counts, setCounts] = useState(null)

  useEffect(() => {
    api.getCounts().then(setCounts).catch(() => {})
  }, [])

  return (
    <div className="space-y-5">

      {/* Welcome banner */}
      <div className="rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,107,157,0.15) 0%, rgba(255,51,102,0.08) 100%)',
          border: '1px solid var(--border)',
        }}>
        <p className="font-heading font-bold text-base" style={{ color: 'var(--text-main)' }}>
          Chào mừng trở lại! 💕
        </p>
        <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>
          Hãy thêm kỷ niệm mới hoặc cập nhật nội dung ngay nào.
        </p>
        <div className="absolute -right-3 -bottom-3 text-5xl opacity-10 select-none pointer-events-none">❤️</div>
      </div>

      {/* Data counts */}
      {counts && (
        <div>
          <p className="font-body text-xs font-semibold mb-2" style={{ color: 'var(--text-sub)' }}>Thống kê nội dung</p>
          <div className="grid grid-cols-5 gap-2">
            {STATS.map(({ key, label, emoji, tab }) => (
              <button key={key} onClick={() => setTab(tab)} className="card-stat cursor-pointer">
                <div className="text-lg mb-0.5">{emoji}</div>
                <p className={`font-heading text-xl font-bold ${counts[key] === 0 ? 'text-amber-500' : ''}`}
                  style={counts[key] !== 0 ? { color: 'var(--primary)' } : {}}>
                  {counts[key]}
                </p>
                <p className="font-body text-[10px] leading-tight mt-0.5" style={{ color: 'var(--text-sub)' }}>{label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div>
        <p className="font-body text-xs font-semibold mb-2" style={{ color: 'var(--text-sub)' }}>Truy cập nhanh</p>
        <div className="grid grid-cols-1 gap-2">
          {QUICK_LINKS.map(({ id, icon: Icon, label, desc, color }) => (
            <button key={id} onClick={() => setTab(id)}
              className="card flex items-center gap-3 text-left hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 w-full py-3 px-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{label}</p>
                <p className="font-body text-xs" style={{ color: 'var(--text-sub)' }}>{desc}</p>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-sub)' }} className="flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
