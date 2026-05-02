import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react'
import * as api from '@/services/api'

const ICON_OPTIONS = ['heart', 'camera', 'plane', 'star', 'home', 'music', 'coffee', 'gift']
const ICON_EMOJI = { heart:'❤️', camera:'📷', plane:'✈️', star:'⭐', home:'🏠', music:'🎵', coffee:'☕', gift:'🎁' }

export default function TabStory() {
  const [items, setItems]       = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ date:'', title:'', description:'', icon:'heart', image:'', highlight:false })
  const [saving, setSaving]     = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const load = () => api.getTimeline().then(setItems).catch(console.error)
  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.date || !form.title) return
    setSaving(true)
    try {
      await api.addTimeline({
        date: form.date, title: form.title, description: form.description,
        icon: form.icon, image: form.image || null, highlight: form.highlight,
      })
      setForm({ date:'', title:'', description:'', icon:'heart', image:'', highlight:false })
      setShowForm(false)
      await load()
    } catch (err) {
      alert('Lỗi lưu kỷ niệm: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa mốc kỷ niệm này?')) return
    await api.deleteTimeline(id)
    await load()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const { url } = await api.uploadImage(file)
      setForm(prev => ({ ...prev, image: url }))
    } catch (err) {
      alert('Lỗi tải ảnh: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(v => !v)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
        <Plus size={15} /> {showForm ? 'Đóng form' : 'Thêm kỷ niệm'}
      </button>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd} className="card card-form space-y-3 overflow-hidden relative"
          >
            {(isUploading || saving) && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                <div className="flex items-center gap-2 text-primary font-body font-semibold">
                  <Loader2 className="animate-spin" size={20} />
                  {isUploading ? 'Đang tải ảnh...' : 'Đang lưu...'}
                </div>
              </div>
            )}

            <p className="font-body font-semibold text-sm text-[var(--text-main)]">Thêm kỷ niệm mới</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Ngày *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required
                  className="input-field" />
              </div>
              <div>
                <label className="field-label">Icon</label>
                <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  className="input-field">
                  {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ICON_EMOJI[ic]} {ic}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="field-label">Tiêu đề *</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Lần đầu gặp nhau..." required
                className="input-field" />
            </div>
            <div>
              <label className="field-label">Mô tả</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Kể thêm về kỷ niệm này..."
                className="input-field resize-none" />
            </div>
            <div>
              <label className="field-label">Hình ảnh đính kèm (không bắt buộc)</label>
              <div className="flex gap-2 items-center">
                <label className="cursor-pointer shrink-0 px-3 py-2 rounded-xl font-body text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, rgba(255,107,157,0.15), rgba(255,51,102,0.10))', color: 'var(--primary)', border: '1px solid rgba(255,107,157,0.3)' }}>
                  <Upload size={13} /> Tải từ máy
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUploading} />
                </label>
                <input type="text" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="Hoặc nhập URL https://..."
                  className="input-field flex-1" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer font-body text-sm text-[var(--text-main)] mt-2">
              <input type="checkbox" checked={form.highlight} onChange={e => setForm(f => ({ ...f, highlight: e.target.checked }))} className="rounded" /> Đánh dấu nổi bật
            </label>
            <button type="submit" disabled={saving || isUploading} className="btn-primary px-5 py-2 rounded-xl text-sm font-body font-semibold disabled:opacity-60">
              Lưu kỷ niệm
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {items.length === 0 ? <p className="font-body text-sm text-center py-8 text-[var(--text-sub)]">Chưa có kỷ niệm nào</p> : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="card flex items-center gap-3">
              <span className="text-xl">{ICON_EMOJI[item.icon] || '❤️'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-sm truncate text-[var(--text-main)]">{item.title}</p>
                <p className="font-body text-xs text-[var(--text-sub)]">{item.date}</p>
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity flex-shrink-0 text-red-500" title="Xóa">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
