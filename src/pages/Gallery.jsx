import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import YALightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { Camera, Filter, Plus, Trash2, Upload, Loader2, X } from 'lucide-react'
import { useAdmin } from '@/hooks/useAdmin'
import Modal from '@/components/shared/Modal'
import * as api from '@/services/api'

const ALBUMS = [
  { id: 'all',     label: 'Tất cả' },
  { id: 'special', label: '⭐ Đặc biệt' },
  { id: 'date',    label: '❤️ Hẹn hò' },
  { id: 'travel',  label: '✈️ Du lịch' },
  { id: 'daily',   label: '☀️ Hàng ngày' },
  { id: 'tingu',   label: '💙 Tingu' },
]

// [mainSticker, secondarySticker] sets per album
const STICKER_SETS = {
  special: [['⭐','✨'],['💫','🌟'],['💎','✨'],['🏆','⭐'],['🌟','💫']],
  date:    [['❤️','💕'],['💖','🌹'],['💌','❤️'],['🥰','💕'],['🌹','💖']],
  travel:  [['✈️','🗺️'],['🌍','✈️'],['📸','🌄'],['🏔️','☁️'],['🌊','🏝️']],
  daily:   [['☀️','🌸'],['🌸','🌿'],['🎵','☀️'],['🧋','🌈'],['🌈','🌸']],
  tingu:   [['🤝','💙'],['🌱','☀️'],['✨','🤝'],['🌻','💙'],['🤗','💖']],
}

const ALBUM_STRIP = {
  special: '#fff9e0',
  date:    '#fff0f5',
  travel:  '#f0f8ff',
  daily:   '#f0fff5',
  tingu:   '#f0f5ff',
}

const TAPE_COLORS = {
  special: 'rgba(255,215,0,0.6)',
  date:    'rgba(255,107,157,0.55)',
  travel:  'rgba(74,158,255,0.55)',
  daily:   'rgba(74,214,138,0.55)',
  tingu:   'rgba(100,149,237,0.55)',
}

function seeded(id, max) {
  return ((id * 2654435761) >>> 0) % max
}
function getStickerSet(photo) {
  const sets = STICKER_SETS[photo.album] || STICKER_SETS.special
  return sets[seeded(photo.id, sets.length)]
}
function getRotation(photo) {
  const r = [-4, -3, -2, -1.5, -1, 0, 1, 1.5, 2, 3, 4]
  return r[seeded(photo.id + 7, r.length)]
}
function getTapeAngle(photo) {
  const a = [-18, -12, -6, 0, 6, 12, 18]
  return a[seeded(photo.id + 3, a.length)]
}

// ── Add Photo Modal ───────────────────────────────────────────────
function AddPhotoModal({ defaultAlbum, onSave, onClose }) {
  const [form, setForm]           = useState({ srcs: [], caption: '', album: defaultAlbum || 'special', date: '' })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const uploadedUrls = []
    const errors = []
    try { 
      for (const file of files) {
        try {
          const { url } = await api.uploadImage(file); 
          uploadedUrls.push(url)
        } catch (err) {
          errors.push(err.message)
        }
      }
      if (errors.length) {
        alert('Lỗi tải một số ảnh:\n' + errors.join('\n'))
      }
      if (uploadedUrls.length) {
        set('srcs', [...form.srcs, ...uploadedUrls])
      }
    } finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!form.srcs.length) return
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  const removeSrc = (idx) => {
    const newSrcs = [...form.srcs];
    newSrcs.splice(idx, 1);
    set('srcs', newSrcs);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Ảnh * (Có thể chọn nhiều)</label>
        <label className={`flex flex-col items-center justify-center gap-2 w-full py-8 rounded-2xl border-2 border-dashed cursor-pointer transition-colors
          ${form.srcs.length ? 'border-primary/40' : 'border-[var(--border)] hover:border-primary'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? (
            <><Loader2 size={20} className="animate-spin text-primary" /><span className="font-body text-sm text-[var(--text-sub)]">Đang tải...</span></>
          ) : (
            <><Upload size={20} className="text-[var(--text-sub)]" /><span className="font-body text-sm text-[var(--text-sub)]">Chọn ảnh từ máy</span></>
          )}
          <input type="file" multiple accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
        </label>
        {form.srcs.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {form.srcs.map((src, i) => (
              <div key={i} className="relative shrink-0 group">
                <img src={src} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-[var(--border)]" />
                <button onClick={() => removeSrc(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Chú thích chung</label>
        <input value={form.caption} onChange={e => set('caption', e.target.value)}
          placeholder="Mô tả khoảnh khắc này..."
          className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-main)] placeholder:text-[var(--text-sub)] focus:outline-none focus:border-primary" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Album</label>
          <select value={form.album} onChange={e => set('album', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-main)] focus:outline-none focus:border-primary">
            {ALBUMS.filter(a => a.id !== 'all').map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Ngày chụp</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-main)] focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={handleSave} disabled={!form.srcs.length || saving || uploading} className="btn-primary flex-1 disabled:opacity-50">
          {saving ? 'Đang lưu...' : `💾 Thêm ${form.srcs.length || ''} ảnh`}
        </button>
        <button onClick={onClose} className="btn-outline px-4">Hủy</button>
      </div>
    </div>
  )
}

// ── Polaroid Card ─────────────────────────────────────────────────
function PolaroidCard({ photo, index, isAdmin, onClick, onDelete }) {
  const [main, secondary] = getStickerSet(photo)
  const rotation  = getRotation(photo)
  const tapeAngle = getTapeAngle(photo)
  const stripBg   = ALBUM_STRIP[photo.album]  || ALBUM_STRIP.special
  const tapeColor = TAPE_COLORS[photo.album]  || TAPE_COLORS.special

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.75, rotate: rotation }}
      animate={{ opacity: 1, scale: 1,    rotate: rotation }}
      exit={{ opacity: 0, scale: 0.7 }}
      whileHover={{ scale: 1.08, rotate: 0, zIndex: 30 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22, delay: index * 0.04 }}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
        transformOrigin: 'center 20%',
        /* Extra padding so stickers outside the frame don't get clipped by grid */
        padding: '18px 14px 10px 14px',
        zIndex: 1,
      }}
    >
      {/* Washi tape */}
      <div style={{
        position: 'absolute',
        top: 2,
        left: '50%',
        transform: `translateX(-50%) rotate(${tapeAngle}deg)`,
        width: 56,
        height: 20,
        background: tapeColor,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        zIndex: 10,
        pointerEvents: 'none',
      }} />

      {/* Polaroid frame */}
      <div style={{
        background: 'linear-gradient(145deg, #fffef9 0%, #faf8f0 100%)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
        borderRadius: 4,
        overflow: 'visible',
      }}>
        {/* Photo with thick white border */}
        <div style={{ padding: '10px 10px 0 10px' }}>
          <div style={{ position: 'relative', paddingBottom: '100%', overflow: 'hidden', borderRadius: 2 }}>
            <img
              src={photo.src}
              alt={photo.caption || ''}
              loading="lazy"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.97) saturate(1.1)',
              }}
            />
            {/* vignette */}
            <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 18px rgba(0,0,0,0.15)', pointerEvents: 'none' }} />
            {/* gloss */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 60%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Caption strip */}
        <div style={{
          background: stripBg,
          padding: '8px 10px 10px',
          minHeight: 46,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          borderRadius: '0 0 4px 4px',
        }}>
          <p style={{
            fontFamily: '"Dancing Script", cursive',
            fontSize: 13,
            color: '#555',
            textAlign: 'center',
            lineHeight: 1.4,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {photo.caption || '📷'}
          </p>
          {photo.date && (
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, color: '#999', marginTop: 2, letterSpacing: '0.05em' }}>
              {new Date(photo.date).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      </div>

      {/* Main sticker — top right */}
      <motion.span
        style={{
          position: 'absolute',
          top: 0,
          right: 2,
          fontSize: 26,
          lineHeight: 1,
          zIndex: 20,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
        }}
        animate={{ rotate: [0, 10, -5, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.35 }}
      >
        {main}
      </motion.span>

      {/* Secondary sticker — bottom left */}
      <motion.span
        style={{
          position: 'absolute',
          bottom: 2,
          left: 2,
          fontSize: 17,
          lineHeight: 1,
          zIndex: 20,
          pointerEvents: 'none',
          opacity: 0.85,
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))',
        }}
        animate={{ rotate: [0, -6, 4, -3, 0], scale: [1, 1.12, 0.95, 1.06, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 + 1.2 }}
      >
        {secondary}
      </motion.span>

      {/* Admin delete */}
      {isAdmin && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(photo.id) }}
          style={{
            position: 'absolute', top: 16, left: 18,
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s, background 0.2s',
            border: 'none', cursor: 'pointer', zIndex: 40,
          }}
          className="group-hover-delete"
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0; e.currentTarget.style.background = 'rgba(0,0,0,0.55)' }}
        >
          <Trash2 size={12} />
        </button>
      )}
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function Gallery() {
  const isAdmin = useAdmin()
  const [photos, setPhotos]               = useState([])
  const [activeAlbum, setActiveAlbum]     = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [modalOpen, setModalOpen]         = useState(false)

  useEffect(() => { api.getPhotos().then(setPhotos).catch(console.error) }, [])

  const filtered = activeAlbum === 'all' ? photos : photos.filter(p => p.album === activeAlbum)

  const handleAdd = async (form) => {
    const newPhotos = []
    // Add sequentially to preserve order
    for (const src of form.srcs) {
      const created = await api.addPhoto({
        src,
        caption: form.caption,
        album: form.album,
        date: form.date
      })
      newPhotos.push(created)
    }
    // Reverse because we prepend to state so newest stays on top
    setPhotos(prev => [...newPhotos.reverse(), ...prev])
    setModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa ảnh này?')) return
    await api.deletePhoto(id)
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="section-title">Thư Viện Ảnh</h1>
          <p className="section-subtitle">Những khoảnh khắc đẹp của chúng mình 📸</p>
        </motion.div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
          <Filter size={16} className="text-[var(--text-sub)] flex-shrink-0" />
          {ALBUMS.map(album => (
            <button key={album.id} onClick={() => setActiveAlbum(album.id)}
              className={`px-4 py-2 rounded-full text-sm font-body whitespace-nowrap transition-all duration-200
                ${activeAlbum === album.id
                  ? 'bg-primary text-white shadow-pink scale-105'
                  : 'bg-[var(--surface-alt)] text-[var(--text-sub)] hover:text-primary hover:scale-105'}`}>
              {album.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Camera size={48} className="mx-auto text-[var(--text-sub)] mb-4 opacity-30" />
            <p className="font-body text-[var(--text-sub)]">Chưa có ảnh nào trong album này</p>
            {isAdmin && (
              <button onClick={() => setModalOpen(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
                <Plus size={16} /> Thêm ảnh đầu tiên
              </button>
            )}
          </div>
        ) : (
          /* Grid — overflow visible so stickers aren't clipped */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '2rem',
            /* Extra padding so rotated cards + stickers don't clip at edges */
            padding: '8px 8px 24px',
          }}>
            <AnimatePresence>
              {filtered.map((photo, idx) => (
                <PolaroidCard
                  key={photo.id}
                  photo={photo}
                  index={idx}
                  isAdmin={isAdmin}
                  onClick={() => setLightboxIndex(filtered.findIndex(p => p.id === photo.id))}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {isAdmin && (
        <motion.button
          onClick={() => setModalOpen(true)}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-pink-lg flex items-center justify-center z-40"
          title="Thêm ảnh mới">
          <Plus size={24} />
        </motion.button>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="📷 Thêm ảnh mới">
        <AddPhotoModal defaultAlbum={activeAlbum === 'all' ? 'special' : activeAlbum} onSave={handleAdd} onClose={() => setModalOpen(false)} />
      </Modal>

      <YALightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={filtered.map(p => ({ src: p.src, title: p.caption || '' }))}
      />
    </div>
  )
}
