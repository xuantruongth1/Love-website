import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import * as api from '@/services/api'

export default function TabJar() {
  const [custom, setCustom]     = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ type: 'love', text: '' })

  const load = () => api.getJar().then(setCustom).catch(console.error)
  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.text.trim()) return
    await api.addJar({ type: form.type, text: form.text.trim() })
    setForm({ type: 'love', text: '' })
    setShowForm(false)
    await load()
  }

  const handleDelete = async (id) => {
    await api.deleteJar(id)
    await load()
  }

  const TYPE_META = {
    love:   { label: 'Tình yêu', emoji: '💕' },
    reason: { label: 'Lý do',    emoji: '🌹' },
    memory: { label: 'Kỷ niệm', emoji: '✨' },
    wish:   { label: 'Ước muốn', emoji: '🌙' },
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(v => !v)}
        className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
        <Plus size={15} />
        {showForm ? 'Đóng form' : 'Thêm lời nhắn'}
      </button>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="jar-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd} className="card card-form space-y-3 overflow-hidden"
          >
            <p className="font-body font-semibold text-sm text-[var(--text-main)]">Lời nhắn mới</p>
            <div>
              <label className="field-label">Loại</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="input-field">
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Nội dung</label>
              <textarea rows={3} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Viết lời nhắn yêu thương..." required
                className="input-field resize-none" />
            </div>
            <button type="submit" className="btn-primary px-5 py-2 rounded-xl text-sm font-body font-semibold">
              Thêm vào hũ
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {custom.length === 0 ? <p className="font-body text-sm text-center py-6 text-[var(--text-sub)]">Chưa có lời nhắn nào</p> : (
        <div className="space-y-2">
          {custom.map(msg => {
            const meta = TYPE_META[msg.type] || TYPE_META.love
            return (
              <div key={msg.id} className="card flex items-start gap-3">
                <span className="text-sm px-2 py-0.5 rounded-full font-body flex-shrink-0 mt-0.5 bg-[var(--surface-alt)] text-[var(--text-sub)]">
                  {meta.emoji} {meta.label}
                </span>
                <p className="flex-1 font-body text-sm leading-relaxed text-[var(--text-main)]">{msg.text}</p>
                <button onClick={() => handleDelete(msg.id)} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity flex-shrink-0 text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
