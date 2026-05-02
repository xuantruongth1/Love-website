import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import * as api from '@/services/api'

const STATUS_META = {
  todo:  { label: 'Muốn làm', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  doing: { label: 'Đang làm', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  done:  { label: 'Đã làm',   color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
}

const CATEGORIES = [
  { value: 'travel',     label: '✈️ Du lịch' },
  { value: 'food',       label: '🍜 Ẩm thực' },
  { value: 'experience', label: '🌟 Trải nghiệm' },
  { value: 'creative',   label: '🎨 Sáng tạo' },
  { value: 'challenge',  label: '💪 Thử thách' },
  { value: 'love',       label: '💕 Tình yêu' },
]

export default function TabBucketList() {
  const [items, setItems]       = useState([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ title: '', category: 'experience', status: 'todo' })

  const load = () => api.getBucket().then(setItems).catch(console.error)
  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await api.addBucket({ ...form, title: form.title.trim() })
      setForm({ title: '', category: 'experience', status: 'todo' })
      setShowForm(false)
      await load()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatus = async (item, newStatus) => {
    try {
      await api.updateBucket(item.id, { ...item, status: newStatus })
      await load()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa mục này?')) return
    await api.deleteBucket(id)
    await load()
  }

  const byStatus = (s) => items.filter(i => (i.status || 'todo') === s)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-[var(--text-sub)]">{items.length} mục — {byStatus('done').length} hoàn thành</p>
        <button onClick={() => setShowForm(v => !v)}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
          <Plus size={15} /> {showForm ? 'Đóng' : 'Thêm mục'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd} className="card card-form space-y-3 overflow-hidden"
          >
            <input
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Tên mục tiêu *" required
              className="input-field"
            />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="input-field">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="input-field">
                {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <button type="submit" disabled={saving}
              className="btn-primary px-5 py-2 rounded-xl text-sm font-body font-semibold disabled:opacity-60 w-full">
              {saving ? 'Đang lưu...' : 'Thêm vào danh sách'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Group by status */}
      {(['todo','doing','done'] ).map(status => {
        const group = byStatus(status)
        if (group.length === 0) return null
        const meta = STATUS_META[status]
        return (
          <div key={status}>
            <p className="font-body text-xs font-semibold text-[var(--text-sub)] mb-2 uppercase tracking-wide">
              {meta.label} ({group.length})
            </p>
            <div className="space-y-2">
              {group.map(item => (
                <motion.div key={item.id} layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="card flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className={`font-body text-sm text-[var(--text-main)] ${status === 'done' ? 'line-through opacity-60' : ''}`}>
                      {item.title}
                    </p>
                    {item.category && (
                      <p className="text-[10px] font-body text-[var(--text-sub)] mt-0.5">
                        {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                      </p>
                    )}
                  </div>
                  {/* Status cycle button */}
                  <div className="relative flex-shrink-0">
                    <select
                      value={item.status || 'todo'}
                      onChange={e => handleStatus(item, e.target.value)}
                      className={`text-[10px] font-body font-semibold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer
                                  appearance-none pr-5 ${meta.color}`}
                    >
                      {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>
                  <button onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg hover:opacity-70 text-red-400 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}

      {items.length === 0 && (
        <p className="text-center py-10 font-body text-sm text-[var(--text-sub)]">
          Chưa có mục tiêu nào. Hãy thêm điều đầu tiên! 🌟
        </p>
      )}
    </div>
  )
}
