import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import * as api from '@/services/api'

export default function TabReasons() {
  const [items, setItems]       = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ id: null, text: '', special: false })
  const [saving, setSaving]     = useState(false)

  const load = () => api.getReasons().then(setItems).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.text.trim()) return
    setSaving(true)
    try {
      if (form.id) {
        await api.updateReason(form.id, { text: form.text, special: form.special })
      } else {
        await api.addReason({ text: form.text, special: form.special })
      }
      setForm({ id: null, text: '', special: false })
      setShowForm(false)
      await load()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa lý do này?')) return
    await api.deleteReason(id)
    await load()
  }

  const handleEdit = (item) => {
    setForm({ id: item.id, text: item.text, special: !!item.special })
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-[var(--text-sub)]">{items.length} lý do</p>
        <button onClick={() => { setForm({ id: null, text: '', special: false }); setShowForm(v => !v) }}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
          <Plus size={15} /> {showForm ? 'Đóng' : 'Thêm lý do'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave} className="card card-form space-y-3 overflow-hidden"
          >
            <p className="font-body font-semibold text-sm text-[var(--text-main)]">{form.id ? 'Sửa lý do' : 'Lý do mới'}</p>
            <textarea rows={3} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
              placeholder="Anh yêu em vì..." required
              className="input-field resize-none" />
            <label className="flex items-center gap-2 cursor-pointer font-body text-sm text-[var(--text-main)]">
              <input type="checkbox" checked={form.special} onChange={e => setForm(f => ({ ...f, special: e.target.checked }))} className="rounded" /> Đánh dấu đặc biệt ⭐
            </label>
            <button type="submit" disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm font-body font-semibold disabled:opacity-60">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="card flex items-start gap-3">
            <span className="text-sm mt-0.5 flex-shrink-0">{item.special ? '⭐' : '💕'}</span>
            <p className="flex-1 font-body text-sm leading-relaxed text-[var(--text-main)]">{item.text}</p>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity text-[var(--text-sub)]"><Edit2 size={14}/></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity text-red-500"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
