import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Upload, Loader2 } from 'lucide-react'
import * as api from '@/services/api'

const ALBUMS = [
  { id: 'special', label: '⭐ Đặc biệt' },
  { id: 'date',    label: '❤️ Hẹn hò' },
  { id: 'travel',  label: '✈️ Du lịch' },
  { id: 'daily',   label: '☀️ Hàng ngày' },
  { id: 'tingu',   label: '💙 Tingu' },
]

export default function TabGallery() {
  const [items, setItems]       = useState([])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('special')
  const [form, setForm]         = useState({ id: null, src: '', srcs: [], caption: '', album: 'special', date: '' })
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedId, setDraggedId] = useState(null)

  const load = () => api.getPhotos().then(setItems).catch(console.error)
  useEffect(() => { load() }, [])

  const handleDragStart = (e, id) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    // Không cần set drag image, dùng ghost mặc định
  }

  const handleDragEnter = (e, targetId) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return

    setItems(prev => {
      const oldIdx = prev.findIndex(i => i.id === draggedId)
      const newIdx = prev.findIndex(i => i.id === targetId)
      const newItems = [...prev]
      const [removed] = newItems.splice(oldIdx, 1)
      newItems.splice(newIdx, 0, removed)
      return newItems
    })
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setItems(currentItems => {
      const orders = currentItems.map((item, idx) => ({ id: item.id, sort_order: idx }))
      api.reorderPhotos(orders).catch(err => alert('Lỗi lưu thứ tự: ' + err.message))
      return currentItems
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (form.id) {
        if (!form.src.trim()) { alert('Vui lòng chọn ảnh hoặc nhập link ảnh!'); setIsSaving(false); return }
        await api.updatePhoto(form.id, form)
      } else {
        const urlsToSave = form.srcs?.length > 0 ? form.srcs : (form.src.trim() ? [form.src] : [])
        if (!urlsToSave.length) { alert('Vui lòng chọn ảnh hoặc nhập link ảnh!'); setIsSaving(false); return }
        
        for (const url of urlsToSave) {
          await api.addPhoto({
            src: url,
            caption: form.caption,
            album: form.album,
            date: form.date
          })
        }
      }
      setForm({ id: null, src: '', srcs: [], caption: '', album: activeTab, date: '' })
      setShowForm(false)
      await load()
    } catch (err) {
      alert('Lỗi lưu ảnh: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa ảnh này?')) return
    await api.deletePhoto(id)
    await load()
  }

  const handleEdit = (item) => {
    setForm(item)
    setShowForm(true)
  }

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setIsUploading(true)
    const errors = []
    try {
      if (form.id) {
        const { url } = await api.uploadImage(files[0])
        setForm(prev => ({ ...prev, src: url }))
      } else {
        const newUrls = []
        for (const file of files) {
          try {
            const { url } = await api.uploadImage(file)
            newUrls.push(url)
          } catch (err) {
            errors.push(err.message)
          }
        }
        if (errors.length) {
          alert('Lỗi tải một số ảnh:\n' + errors.join('\n'))
        }
        if (newUrls.length) {
          setForm(prev => ({ ...prev, srcs: [...(prev.srcs || []), ...newUrls] }))
        }
      }
    } catch (err) {
      alert('Lỗi upload ảnh: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {ALBUMS.map(a => (
            <button key={a.id} onClick={() => setActiveTab(a.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-body whitespace-nowrap transition-all duration-200
                ${activeTab === a.id
                  ? 'bg-primary text-white shadow-pink scale-105'
                  : 'bg-[var(--surface-alt)] text-[var(--text-sub)] hover:text-primary'}`}>
              {a.label}
            </button>
          ))}
        </div>

        <button onClick={() => { setForm({ id: null, src: '', srcs: [], caption: '', album: activeTab, date: '' }); setShowForm(v => !v) }}
                className="btn-primary shrink-0 flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-xl">
          <Plus size={15} /> {showForm ? 'Đóng form' : 'Thêm ảnh mới'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave} className="card card-form space-y-3 overflow-hidden relative"
          >
            {(isUploading || isSaving) && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                <div className="flex items-center gap-2 text-primary font-body font-semibold">
                  <Loader2 className="animate-spin" size={20} />
                  {isUploading ? 'Đang tải ảnh lên...' : 'Đang lưu...'}
                </div>
              </div>
            )}

            <p className="font-body font-semibold text-sm text-[var(--text-main)]">{form.id ? 'Sửa thông tin ảnh' : 'Thêm ảnh mới'}</p>

            <div className="space-y-2">
              <label className="field-label">Hình ảnh * {(!form.id) && '(Có thể chọn nhiều)'}</label>
              <div className="flex gap-2 items-center">
                <label className="cursor-pointer shrink-0 px-3 py-2 rounded-xl font-body text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, rgba(255,107,157,0.15), rgba(255,51,102,0.10))', color: 'var(--primary)', border: '1px solid rgba(255,107,157,0.3)' }}>
                  <Upload size={13} /> Tải từ máy
                  <input type="file" multiple={!form.id} accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUploading} />
                </label>
                <span className="font-body text-xs" style={{ color: 'var(--text-sub)' }}>hoặc link:</span>
                <input type="text" value={form.src} onChange={e => setForm(f => ({ ...f, src: e.target.value }))} placeholder="https://..."
                  className="input-field flex-1" />
              </div>
            </div>

            {form.id ? (
              form.src && (
                <div className="flex justify-center">
                  <img src={form.src} alt="preview" className="w-24 h-24 object-cover rounded-xl"
                    style={{ border: '2px solid var(--border)' }}
                    onError={e => { e.target.style.display='none' }} />
                </div>
              )
            ) : (
              form.srcs && form.srcs.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                  {form.srcs.map((s, i) => (
                    <div key={i} className="relative shrink-0 group">
                      <img src={s} alt="preview" className="w-20 h-20 object-cover rounded-xl border border-[var(--border)]" />
                      <button type="button" onClick={() => setForm(f => ({ ...f, srcs: f.srcs.filter((_, idx) => idx !== i) }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                form.src && (
                  <div className="flex justify-center">
                    <img src={form.src} alt="preview" className="w-24 h-24 object-cover rounded-xl border border-[var(--border)]" />
                  </div>
                )
              )
            )}

            <div>
              <label className="field-label">Chú thích</label>
              <input type="text" value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Buổi hẹn hò đầu tiên..."
                className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Album</label>
                <select value={form.album} onChange={e => setForm(f => ({ ...f, album: e.target.value }))}
                  className="input-field">
                  {ALBUMS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Ngày</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="input-field" />
              </div>
            </div>

            <button type="submit" disabled={isUploading || isSaving} className="btn-primary px-5 py-2 rounded-xl text-sm font-body font-semibold mt-2 disabled:opacity-60">
              Lưu
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.filter(item => item.album === activeTab).map(item => (
          <motion.div 
            layout
            draggable={true}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragEnter={(e) => handleDragEnter(e, item.id)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={handleDragEnd}
            key={item.id} 
            className={`relative group rounded-xl overflow-hidden bg-[var(--surface-alt)] aspect-square border border-[var(--border)] cursor-grab active:cursor-grabbing ${draggedId === item.id ? 'opacity-50 scale-95 z-10' : 'opacity-100'}`}
          >
            <img src={item.src} alt="" className="w-full h-full object-cover pointer-events-none" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
              <button onClick={() => handleEdit(item)} className="p-2 rounded-full bg-white text-[#4A1028] hover:scale-110 transition-transform pointer-events-auto"><Edit2 size={16}/></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 rounded-full bg-red-500 text-white hover:scale-110 transition-transform pointer-events-auto"><Trash2 size={16}/></button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 pointer-events-none">
              <p className="text-white text-[10px] font-body truncate">{item.caption || 'Không có chú thích'}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
