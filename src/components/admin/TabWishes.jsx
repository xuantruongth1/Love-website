import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Heart } from 'lucide-react'
import * as api from '@/services/api'

export default function TabWishes() {
  const [wishes, setWishes] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => api.getWishes()
    .then(data => { setWishes(data); setLoading(false) })
    .catch(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa lời nhắn này?')) return
    await api.deleteWish(id)
    await load()
  }

  if (loading) return (
    <p className="font-body text-sm text-center py-8 text-[var(--text-sub)]">Đang tải...</p>
  )

  if (wishes.length === 0) return (
    <p className="font-body text-sm text-center py-8 text-[var(--text-sub)]">Chưa có lời nhắn nào.</p>
  )

  return (
    <div className="space-y-2">
      <p className="font-body text-sm text-[var(--text-sub)] mb-3">{wishes.length} lời nhắn</p>
      {wishes.map((w, i) => (
        <motion.div key={w.id} layout
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="card flex items-start gap-3"
        >
          <span className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
            style={{ background: w.color || '#FF6B9D' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-body font-semibold text-sm text-[var(--text-main)]">{w.name}</span>
              <span className="font-body text-xs text-[var(--text-sub)]">
                {w.created_at ? new Date(w.created_at).toLocaleDateString('vi-VN') : ''}
              </span>
              <span className="font-body text-xs text-[var(--text-sub)] ml-auto flex items-center gap-1">
                <Heart size={11} className="text-primary" /> {w.likes || 0}
              </span>
            </div>
            <p className="font-body text-sm text-[var(--text-sub)] leading-relaxed line-clamp-2">
              {w.message}
            </p>
          </div>
          <button onClick={() => handleDelete(w.id)}
            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity flex-shrink-0 text-red-500">
            <Trash2 size={15} />
          </button>
        </motion.div>
      ))}
    </div>
  )
}
