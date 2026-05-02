import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Heart, Camera, Plane, Star, Home, Music, Coffee, Gift, Plus, Trash2, Edit3, Upload, Loader2 } from 'lucide-react'
import { useAdmin } from '@/hooks/useAdmin'
import Modal from '@/components/shared/Modal'
import * as api from '@/services/api'

const ICONS = { heart: Heart, camera: Camera, plane: Plane, star: Star, home: Home, music: Music, coffee: Coffee, gift: Gift }
const ICON_OPTS = ['heart','camera','plane','star','home','music','coffee','gift']

const EMPTY_FORM = { date: '', title: '', description: '', image: '', icon: 'heart', highlight: false }

function TimelineItem({ item, index, isAdmin, onEdit, onDelete }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const isLeft = index % 2 === 0
  const Icon = ICONS[item.icon] || Heart

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
      className={`relative flex items-start gap-4 mb-14 flex-col
                  lg:flex-row ${!isLeft ? 'lg:flex-row-reverse' : ''}`}
    >
      {/* Card */}
      <div className="flex-1 card group hover:shadow-pink-lg transition-all duration-300 relative">
        {isAdmin && (
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg bg-[var(--surface-alt)] text-[var(--text-sub)] hover:text-primary transition-colors">
              <Edit3 size={14}/>
            </button>
            <button onClick={() => onDelete(item.id)}
              className="p-1.5 rounded-lg bg-[var(--surface-alt)] text-[var(--text-sub)] hover:text-red-500 transition-colors">
              <Trash2 size={14}/>
            </button>
          </div>
        )}

        {item.image && (
          <div className="overflow-hidden rounded-xl mb-4 -mx-2 -mt-2">
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.parentElement.innerHTML = '<div class="w-full h-52 bg-[var(--surface-alt)] flex items-center justify-center text-4xl rounded-xl">📷</div>' }}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-body text-[var(--text-sub)] bg-[var(--surface-alt)] px-2.5 py-0.5 rounded-full">
            {new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
          {item.highlight && (
            <span className="text-xs font-body text-white bg-primary px-2.5 py-0.5 rounded-full">⭐ Đặc biệt</span>
          )}
        </div>
        <h3 className="font-heading text-xl font-bold text-[var(--text-main)] mb-2 leading-snug">{item.title}</h3>
        <p className="font-body text-[var(--text-sub)] text-sm leading-relaxed">{item.description}</p>
      </div>

      {/* Center dot */}
      <div className="hidden lg:flex flex-col items-center self-start mt-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ type: 'spring', delay: 0.3 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-pink flex-shrink-0
                       ${item.highlight ? 'bg-primary' : 'bg-[var(--surface)] border-2 border-primary'}`}
        >
          <Icon size={20} className={item.highlight ? 'text-white' : 'text-primary'} />
        </motion.div>
      </div>

      <div className="flex-1 hidden lg:block" />
    </motion.div>
  )
}

function TimelineForm({ initial, onSave, onClose }) {
  const [form, setForm]           = useState(initial || EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await api.uploadImage(file)
      set('image', url)
    } catch (err) {
      alert('Lỗi tải ảnh: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.date || !form.title.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Ngày *</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                        text-[var(--text-main)] focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Icon</label>
          <select value={form.icon} onChange={e => set('icon', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                        text-[var(--text-main)] focus:outline-none focus:border-primary">
            {ICON_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Tiêu đề *</label>
        <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Tên sự kiện"
          className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                      text-[var(--text-main)] placeholder:text-[var(--text-sub)] focus:outline-none focus:border-primary" />
      </div>

      <div>
        <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Mô tả</label>
        <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Kể về kỷ niệm này..."
          className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                      text-[var(--text-main)] placeholder:text-[var(--text-sub)] resize-none focus:outline-none focus:border-primary" />
      </div>

      <div>
        <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Hình ảnh</label>
        <div className="flex gap-2 items-center">
          <label className={`cursor-pointer shrink-0 px-3 py-2 rounded-xl font-body text-xs font-semibold
                              flex items-center gap-1.5 transition-colors
                              ${uploading ? 'opacity-50 cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Đang tải...' : 'Chọn ảnh'}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
          </label>
          <input value={form.image || ''} onChange={e => set('image', e.target.value)}
            placeholder="Hoặc nhập URL https://..."
            className="flex-1 px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                        text-[var(--text-main)] placeholder:text-[var(--text-sub)] focus:outline-none focus:border-primary" />
        </div>
        {form.image && (
          <img src={form.image} alt="preview" className="mt-2 h-24 w-full object-cover rounded-xl" />
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <div onClick={() => set('highlight', !form.highlight)}
          className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center px-1
                       ${form.highlight ? 'bg-primary' : 'bg-[var(--surface-alt)]'}`}>
          <motion.div animate={{ x: form.highlight ? 16 : 0 }}
            className="w-4 h-4 rounded-full bg-white shadow-sm" />
        </div>
        <span className="text-sm font-body text-[var(--text-main)]">Đánh dấu là đặc biệt ⭐</span>
      </label>

      <div className="flex gap-2 pt-2">
        <button onClick={handleSave} disabled={saving || uploading || !form.date || !form.title.trim()}
          className="btn-primary flex-1 disabled:opacity-50">
          {saving ? 'Đang lưu...' : '💾 Lưu kỷ niệm'}
        </button>
        <button onClick={onClose} className="btn-outline px-4">Hủy</button>
      </div>
    </div>
  )
}

export default function Story() {
  const isAdmin = useAdmin()
  const [items,      setItems]      = useState([])
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState(null)

  useEffect(() => {
    api.getTimeline().then(data => {
      if (Array.isArray(data)) setItems(data.sort((a, b) => new Date(a.date) - new Date(b.date)))
    }).catch(() => {})
  }, [])

  const handleSave = async (form) => {
    if (editItem?.id) {
      const updated = await api.updateTimeline(editItem.id, form)
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
    } else {
      const created = await api.addTimeline(form)
      setItems(prev => [...prev, created].sort((a, b) => new Date(a.date) - new Date(b.date)))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa kỷ niệm này?')) return
    await api.deleteTimeline(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const openAdd  = () => { setEditItem(null); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); setModalOpen(true) }

  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="section-title">Không Gian Kỷ Niệm</h1>
          <p className="section-subtitle">Mỗi khoảnh khắc, mỗi câu chuyện — tất cả đều là của chúng mình 💕</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5
                           bg-gradient-to-b from-transparent via-primary/40 to-transparent -translate-x-1/2" />

          {items.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              index={index}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* End heart */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="flex justify-center mt-4"
        >
          <Heart size={32} className="text-primary animate-pulse-heart" fill="currentColor" />
        </motion.div>

        {/* Admin: Add button */}
        {isAdmin && (
          <motion.button
            onClick={openAdd}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-white
                        shadow-pink-lg flex items-center justify-center z-40"
            title="Thêm kỷ niệm mới"
          >
            <Plus size={24} />
          </motion.button>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? '✏️ Sửa kỷ niệm' : '➕ Thêm kỷ niệm mới'}
      >
        <TimelineForm
          initial={editItem}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
