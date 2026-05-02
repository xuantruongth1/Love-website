import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Zap } from 'lucide-react'
import * as api from '@/services/api'

const TYPE_META = {
  daily:   { label: 'Hàng ngày', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  weekly:  { label: 'Hàng tuần', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  special: { label: 'Đặc biệt',  color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300' },
}

export default function TabChallenges() {
  const [items, setItems]       = useState([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ title: '', description: '', type: 'daily', deadline: '' })

  const load = () => api.getChallenges().then(setItems).catch(console.error)
  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await api.addChallenge({
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        deadline: form.deadline || null,
      })
      setForm({ title: '', description: '', type: 'daily', deadline: '' })
      setShowForm(false)
      await load()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa thử thách này?')) return
    await api.deleteChallenge(id)
    await load()
  }

  const bothDone  = items.filter(i => i.boy_done && i.girl_done).length
  const inProgress = items.filter(i => !i.boy_done || !i.girl_done).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-[var(--text-sub)]">
          {items.length} thử thách — {bothDone} hoàn thành · {inProgress} đang làm
        </p>
        <button onClick={() => setShowForm(v => !v)}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
          <Plus size={15} /> {showForm ? 'Đóng' : 'Thêm thử thách'}
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
              placeholder="Tên thử thách *" required
              className="input-field"
            />
            <textarea
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả (tùy chọn)" rows={2}
              className="input-field resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="input-field">
                {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={saving}
              className="btn-primary px-5 py-2 rounded-xl text-sm font-body font-semibold disabled:opacity-60 w-full">
              {saving ? 'Đang lưu...' : 'Tạo thử thách'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {items.map(item => {
          const meta = TYPE_META[item.type] || TYPE_META.daily
          const both = item.boy_done && item.girl_done
          return (
            <motion.div key={item.id} layout
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`card flex items-start gap-3 ${both ? 'opacity-70' : ''}`}
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--surface-alt)] flex items-center justify-center flex-shrink-0">
                <Zap size={15} className={both ? 'text-green-500' : 'text-primary'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`font-body text-sm font-semibold text-[var(--text-main)] ${both ? 'line-through' : ''}`}>
                    {item.title}
                  </p>
                  <span className={`text-[10px] font-body px-1.5 py-0.5 rounded-full font-semibold ${meta.color}`}>
                    {meta.label}
                  </span>
                </div>
                {item.description && (
                  <p className="font-body text-xs text-[var(--text-sub)] mt-0.5 line-clamp-1">{item.description}</p>
                )}
                {item.deadline && (
                  <p className="font-body text-[10px] text-[var(--text-sub)] mt-0.5">📅 Hạn: {item.deadline}</p>
                )}
                {/* Completion badges */}
                <div className="flex gap-1.5 mt-1.5">
                  <span className={`text-[10px] font-body px-1.5 py-0.5 rounded-full
                    ${item.boy_done ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-[var(--surface-alt)] text-[var(--text-sub)]'}`}>
                    👦 {item.boy_done ? 'Xong' : 'Chưa'}
                  </span>
                  <span className={`text-[10px] font-body px-1.5 py-0.5 rounded-full
                    ${item.girl_done ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' : 'bg-[var(--surface-alt)] text-[var(--text-sub)]'}`}>
                    👧 {item.girl_done ? 'Xong' : 'Chưa'}
                  </span>
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg hover:opacity-70 text-red-400 flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </motion.div>
          )
        })}
      </div>

      {items.length === 0 && (
        <p className="text-center py-10 font-body text-sm text-[var(--text-sub)]">
          Chưa có thử thách nào. Tạo thử thách đầu tiên nào! ⚡
        </p>
      )}
    </div>
  )
}
