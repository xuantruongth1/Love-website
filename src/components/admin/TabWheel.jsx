import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import * as api from '@/services/api'

const COLORS = ['#FF6B9D', '#FF3366', '#FF8C69', '#FFB347', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C']
const EMPTY_FORM = { id: '', label: '', options: [{ text: '', color: COLORS[0] }, { text: '', color: COLORS[1] }] }

export default function TabWheel() {
  const [items, setItems]       = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)

  const load = () => api.getWheel().then(data => { if (Array.isArray(data)) setItems(data) }).catch(() => {})
  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.label || form.options.length < 2 || form.options.some(o => !o.text.trim()))
      return alert('Vui lòng nhập tên và ít nhất 2 tùy chọn hợp lệ')
    setSaving(true)
    try {
      const validOpts = form.options.filter(o => o.text.trim())
      if (form.id && items.some(i => i.id === form.id)) {
        await api.updateWheel(form.id, { label: form.label, options: validOpts })
      } else {
        await api.addWheel({ id: `preset_${Date.now()}`, label: form.label, options: validOpts })
      }
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch (err) {
      alert('Lỗi lưu: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa chủ đề này?')) return
    await api.deleteWheel(id).catch(() => {})
    await load()
  }

  const updateOption = (index, field, value) => {
    const next = [...form.options]
    next[index] = { ...next[index], [field]: value }
    setForm(f => ({ ...f, options: next }))
  }
  const addOption    = () => setForm(f => ({ ...f, options: [...f.options, { text: '', color: COLORS[f.options.length % COLORS.length] }] }))
  const removeOption = (i) => { if (form.options.length > 2) setForm(f => ({ ...f, options: f.options.filter((_, idx) => idx !== i) })) }

  const getOptions = (item) => {
    try { return typeof item.options === 'string' ? JSON.parse(item.options) : item.options }
    catch { return [] }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button onClick={() => { setForm(EMPTY_FORM); setShowForm(v => !v) }}
                className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
          <Plus size={15} /> {showForm ? 'Đóng form' : 'Thêm chủ đề quay'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave} className="card space-y-4 overflow-hidden"
          >
            <p className="font-body font-semibold text-sm text-[var(--text-main)]">{form.id ? 'Sửa chủ đề' : 'Thêm chủ đề mới'}</p>
            <div>
              <label className="field-label">Tên chủ đề *</label>
              <input type="text" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required placeholder="Ví dụ: Hôm nay ăn gì?"
                className="input-field" />
            </div>

            <div className="space-y-2">
              <label className="block font-body text-xs text-[var(--text-sub)]">Các lựa chọn (Tối thiểu 2) *</label>
              {form.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="color" value={opt.color} onChange={e => updateOption(idx, 'color', e.target.value)} className="w-8 h-8 rounded shrink-0 cursor-pointer border-0 p-0" />
                  <input type="text" value={opt.text} onChange={e => updateOption(idx, 'text', e.target.value)} required placeholder={`Lựa chọn ${idx + 1}`}
                    className="input-field flex-1 py-1.5" />
                  {form.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(idx)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg shrink-0">
                      <Trash2 size={16}/>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addOption} className="text-xs text-primary font-body flex items-center gap-1 hover:underline mt-2">
                <Plus size={12}/> Thêm lựa chọn
              </button>
            </div>

            <button type="submit" disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm font-body font-semibold disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Lưu chủ đề'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="card">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-sm text-[var(--text-main)] mb-2">{item.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {getOptions(item).map((opt, i) => (
                    <span key={i} className="text-xs font-body px-2 py-1 rounded text-white" style={{ background: opt.color }}>
                      {opt.text}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => { setForm({ ...item, options: getOptions(item) }); setShowForm(true) }} className="p-1.5 rounded-lg text-[var(--text-sub)] hover:text-primary"><Edit2 size={15}/></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-[var(--text-sub)] hover:text-red-500"><Trash2 size={15}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
