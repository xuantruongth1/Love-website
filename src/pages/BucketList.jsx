import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import { CheckCircle, Circle, Plus, Edit3, Trash2 } from 'lucide-react'
import { useAdmin } from '@/hooks/useAdmin'

const categoryColors = {
  travel:      { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-300',   label: 'Du lịch' },
  home:        { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Ở nhà' },
  entertainment:{ bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Giải trí' },
  memory:      { bg: 'bg-pink-100 dark:bg-pink-900/30',   text: 'text-pink-700 dark:text-pink-300',   label: 'Kỷ niệm' },
  experience:  { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: 'Trải nghiệm' },
  growth:      { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: 'Phát triển' },
}
import Modal from '@/components/shared/Modal'
import * as api from '@/services/api'

const columns = [
  { id: 'todo',  label: '📋 Muốn làm' },
  { id: 'doing', label: '🔥 Đang làm' },
  { id: 'done',  label: '✅ Đã làm' },
]

const CATEGORIES = Object.entries(categoryColors).map(([key, val]) => ({ key, ...val }))

const EMPTY_FORM = { title: '', description: '', category: 'experience', status: 'todo', deadline: '' }

function BucketForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? {
    title: initial.title || '',
    description: initial.description || '',
    category: initial.category || 'experience',
    status: initial.status || 'todo',
    deadline: initial.deadline || '',
  } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Tiêu đề *</label>
        <input value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="VD: Đi Đà Lạt cùng nhau"
          className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                      text-[var(--text-main)] placeholder:text-[var(--text-sub)] focus:outline-none focus:border-primary" />
      </div>

      <div>
        <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Mô tả</label>
        <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Chi tiết thêm về điều này..."
          className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                      text-[var(--text-main)] placeholder:text-[var(--text-sub)] resize-none focus:outline-none focus:border-primary" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Danh mục</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                        text-[var(--text-main)] focus:outline-none focus:border-primary">
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Trạng thái</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                        text-[var(--text-main)] focus:outline-none focus:border-primary">
            <option value="todo">📋 Muốn làm</option>
            <option value="doing">🔥 Đang làm</option>
            <option value="done">✅ Đã làm</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Deadline (tùy chọn)</label>
        <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                      text-[var(--text-main)] focus:outline-none focus:border-primary" />
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={handleSave} disabled={saving || !form.title.trim()}
          className="btn-primary flex-1 disabled:opacity-50">
          {saving ? 'Đang lưu...' : '💾 Lưu'}
        </button>
        <button onClick={onClose} className="btn-outline px-4">Hủy</button>
      </div>
    </div>
  )
}

export default function BucketList() {
  const isAdmin = useAdmin()
  const [items, setItems]       = useState([])
  const [confetti, setConfetti] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  useEffect(() => {
    api.getBucket().then(data => {
      if (Array.isArray(data)) setItems(data)
    }).catch(() => {})
  }, [])

  const advance = async (item) => {
    const nextStatus = item.status === 'todo' ? 'doing' : 'done'
    if (nextStatus === 'done') {
      setConfetti(true)
      setTimeout(() => setConfetti(false), 4000)
      try {
        const updated = await api.markBucketDone(item.id)
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
      } catch (e) { alert(e.message) }
    } else {
      try {
        const updated = await api.updateBucket(item.id, { ...item, status: nextStatus })
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
      } catch (e) { alert(e.message) }
    }
  }

  const handleSave = async (form) => {
    try {
      if (editItem?.id) {
        const updated = await api.updateBucket(editItem.id, form)
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
      } else {
        const created = await api.addBucket(form)
        setItems(prev => [created, ...prev])
      }
    } catch (e) { alert(e.message) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa mục này?')) return
    try {
      await api.deleteBucket(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (e) { alert(e.message) }
  }

  const openAdd  = () => { setEditItem(null); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); setModalOpen(true) }

  const total = items.length
  const done  = items.filter(i => i.status === 'done').length

  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      {confetti && (
        <ReactConfetti
          recycle={false}
          numberOfPieces={200}
          colors={['#FF6B9D','#FF3366','#FFB3C6','#fff','#FFD700']}
        />
      )}

      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <h1 className="section-title">Couple's Bucket List</h1>
          <p className="section-subtitle">Những điều chúng mình muốn làm cùng nhau 🌟</p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-xs mx-auto mb-10"
        >
          <div className="flex justify-between text-sm font-body text-[var(--text-sub)] mb-1">
            <span>Đã hoàn thành</span>
            <span className="text-primary font-semibold">{done}/{total}</span>
          </div>
          <div className="h-3 bg-[var(--surface-alt)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              animate={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
              transition={{ duration: 0.8, type: 'spring' }}
            />
          </div>
          {done === total && total > 0 && (
            <p className="text-center text-xs text-primary font-body mt-1.5">
              🎉 Hoàn thành hết rồi! Thêm điều mới nhé!
            </p>
          )}
        </motion.div>

        {/* Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(col => {
            const colItems = items.filter(i => (i.status || 'todo') === col.id)
            return (
              <div key={col.id}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-heading text-lg font-bold text-[var(--text-main)]">{col.label}</h3>
                  <span className="text-xs font-body bg-[var(--surface-alt)] text-[var(--text-sub)] px-2 py-0.5 rounded-full">
                    {colItems.length}
                  </span>
                </div>
                <div className="space-y-3 min-h-32">
                  <AnimatePresence>
                    {colItems.map(item => {
                      const cat = categoryColors[item.category] || {}
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="card group hover:shadow-pink-lg transition-all duration-200"
                        >
                          {isAdmin && (
                            <div className="flex gap-1 justify-end mb-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEdit(item)}
                                className="p-1 rounded-lg bg-[var(--surface-alt)] text-[var(--text-sub)] hover:text-primary transition-colors"
                              >
                                <Edit3 size={12}/>
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 rounded-lg bg-[var(--surface-alt)] text-[var(--text-sub)] hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={12}/>
                              </button>
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => item.status !== 'done' && advance(item)}
                              disabled={item.status === 'done'}
                              className={`mt-0.5 flex-shrink-0 transition-transform
                                           ${item.status !== 'done' ? 'text-primary hover:scale-110' : 'text-primary cursor-default'}`}
                            >
                              {item.status === 'done'
                                ? <CheckCircle size={20} fill="currentColor" />
                                : <Circle size={20} />
                              }
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`font-body font-semibold text-[var(--text-main)] text-sm leading-snug
                                             ${item.status === 'done' ? 'line-through opacity-60' : ''}`}>
                                {item.title}
                              </p>
                              {item.description && (
                                <p className="font-body text-xs text-[var(--text-sub)] mt-1 leading-snug">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                                  {cat.label || item.category}
                                </span>
                                {item.deadline && (
                                  <span className="text-xs font-body text-[var(--text-sub)]">
                                    📅 {new Date(item.deadline).toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {item.status !== 'done' && (
                            <button
                              onClick={() => advance(item)}
                              className="mt-3 w-full text-xs font-body text-[var(--text-sub)] hover:text-primary
                                         border border-[var(--border)] hover:border-primary rounded-lg py-1.5
                                         transition-colors duration-200 md:opacity-0 md:group-hover:opacity-100"
                            >
                              {item.status === 'todo' ? '→ Chuyển sang Đang làm' : '✓ Đánh dấu hoàn thành!'}
                            </button>
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {colItems.length === 0 && (
                    <div className="border-2 border-dashed border-[var(--border)] rounded-2xl py-8 text-center">
                      <p className="text-sm font-body text-[var(--text-sub)] opacity-50">Trống</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {isAdmin && (
        <motion.button
          onClick={openAdd}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-white
                      shadow-pink-lg flex items-center justify-center z-40"
          title="Thêm mục mới"
        >
          <Plus size={24} />
        </motion.button>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? '✏️ Sửa mục' : '➕ Thêm điều muốn làm'}
      >
        <BucketForm
          initial={editItem}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
