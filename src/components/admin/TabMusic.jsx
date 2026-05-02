import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Music2, Film } from 'lucide-react'
import * as api from '@/services/api'

// ── Songs section ──────────────────────────────────────────────────────
function SongsSection() {
  const [items, setItems]       = useState([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ id: null, title: '', artist: '', note: '', youtube_id: '', spotify_url: '' })

  const load = () => api.getSongs().then(setItems).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (form.id) {
        await api.updateSong(form.id, form)
      } else {
        await api.addSong(form)
      }
      setForm({ id: null, title: '', artist: '', note: '', youtube_id: '', spotify_url: '' })
      setShowForm(false)
      await load()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item) => {
    setForm({ id: item.id, title: item.title, artist: item.artist, note: item.note, youtube_id: item.youtube_id, spotify_url: item.spotify_url })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bài hát này?')) return
    await api.deleteSong(id)
    await load()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-body text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>{items.length} bài hát</p>
        <button onClick={() => { setForm({ id: null, title: '', artist: '', note: '', youtube_id: '', spotify_url: '' }); setShowForm(v => !v) }}
          className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl">
          <Plus size={13} /> {showForm ? 'Đóng' : 'Thêm bài hát'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="song-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave} className="card card-form space-y-3 overflow-hidden"
          >
            <p className="font-body font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{form.id ? 'Sửa bài hát' : 'Thêm bài hát mới'}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="field-label">Tên bài hát *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Tên bài hát" required className="input-field" />
              </div>
              <div>
                <label className="field-label">Ca sĩ</label>
                <input value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))}
                  placeholder="Tên ca sĩ" className="input-field" />
              </div>
            </div>
            <div>
              <label className="field-label">Ghi chú cá nhân</label>
              <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Bài này nghe lần đầu khi..." className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="field-label">YouTube ID</label>
                <input value={form.youtube_id} onChange={e => setForm(f => ({ ...f, youtube_id: e.target.value }))}
                  placeholder="dQw4w9WgXcQ" className="input-field" />
              </div>
              <div>
                <label className="field-label">Spotify URL</label>
                <input value={form.spotify_url} onChange={e => setForm(f => ({ ...f, spotify_url: e.target.value }))}
                  placeholder="https://open.spotify.com/..." className="input-field" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm font-body font-semibold disabled:opacity-60">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div key={item.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="card flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,107,157,0.12)', border: '1px solid rgba(255,107,157,0.2)' }}>
              <Music2 size={14} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-sm truncate" style={{ color: 'var(--text-main)' }}>{item.title}</p>
              <p className="font-body text-xs" style={{ color: 'var(--text-sub)' }}>{item.artist || 'Chưa có ca sĩ'}</p>
              {item.note && <p className="font-body text-xs italic mt-0.5" style={{ color: 'var(--primary)' }}>"{item.note}"</p>}
              <div className="flex gap-2 mt-1 flex-wrap">
                {item.youtube_id && (
                  <span className="text-[10px] font-body px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600">▶ YouTube</span>
                )}
                {item.spotify_url && (
                  <span className="text-[10px] font-body px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600">♫ Spotify</span>
                )}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--text-sub)' }}><Edit2 size={13}/></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity text-red-500"><Trash2 size={13}/></button>
            </div>
          </motion.div>
        ))}
        {items.length === 0 && <p className="font-body text-sm text-center py-6" style={{ color: 'var(--text-sub)' }}>Chưa có bài hát nào</p>}
      </div>
    </div>
  )
}

// ── Movies section ─────────────────────────────────────────────────────
function MoviesSection() {
  const [items, setItems]       = useState([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ id: null, title: '', year: '', genre: '', note: '' })

  const load = () => api.getMovies().then(setItems).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = { ...form, year: Number(form.year) || 0 }
      if (form.id) {
        await api.updateMovie(form.id, payload)
      } else {
        await api.addMovie(payload)
      }
      setForm({ id: null, title: '', year: '', genre: '', note: '' })
      setShowForm(false)
      await load()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item) => {
    setForm({ id: item.id, title: item.title, year: item.year || '', genre: item.genre, note: item.note })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa phim này?')) return
    await api.deleteMovie(id)
    await load()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-body text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>{items.length} phim</p>
        <button onClick={() => { setForm({ id: null, title: '', year: '', genre: '', note: '' }); setShowForm(v => !v) }}
          className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl">
          <Plus size={13} /> {showForm ? 'Đóng' : 'Thêm phim'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="movie-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave} className="card card-form space-y-3 overflow-hidden"
          >
            <p className="font-body font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{form.id ? 'Sửa phim' : 'Thêm phim mới'}</p>
            <div>
              <label className="field-label">Tên phim *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Tên phim" required className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="field-label">Năm</label>
                <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                  placeholder="2024" className="input-field" />
              </div>
              <div>
                <label className="field-label">Thể loại</label>
                <input value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                  placeholder="Tình cảm / Hoạt hình" className="input-field" />
              </div>
            </div>
            <div>
              <label className="field-label">Ghi chú cá nhân</label>
              <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Cùng xem lần đầu ở..." className="input-field" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm font-body font-semibold disabled:opacity-60">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div key={item.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="card flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.2)' }}>
              <Film size={14} style={{ color: '#a855f7' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-sm truncate" style={{ color: 'var(--text-main)' }}>{item.title}</p>
              <p className="font-body text-xs" style={{ color: 'var(--text-sub)' }}>
                {item.year ? `${item.year} · ` : ''}{item.genre || 'Chưa có thể loại'}
              </p>
              {item.note && <p className="font-body text-xs italic mt-0.5" style={{ color: 'var(--primary)' }}>"{item.note}"</p>}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--text-sub)' }}><Edit2 size={13}/></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity text-red-500"><Trash2 size={13}/></button>
            </div>
          </motion.div>
        ))}
        {items.length === 0 && <p className="font-body text-sm text-center py-6" style={{ color: 'var(--text-sub)' }}>Chưa có phim nào</p>}
      </div>
    </div>
  )
}

// ── Main tab ───────────────────────────────────────────────────────────
export default function TabMusic() {
  const [sub, setSub] = useState('songs')

  return (
    <div className="space-y-4">
      {/* Sub-tab bar */}
      <div className="flex gap-2">
        {[
          { id: 'songs',  icon: <Music2 size={14}/>, label: 'Nhạc' },
          { id: 'movies', icon: <Film size={14}/>,   label: 'Phim' },
        ].map(t => (
          <button key={t.id} onClick={() => setSub(t.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all duration-200"
            style={sub === t.id ? {
              background: 'linear-gradient(135deg, rgba(255,107,157,0.18), rgba(255,51,102,0.10))',
              color: 'var(--primary)',
              border: '1px solid rgba(255,107,157,0.30)',
            } : {
              background: 'var(--surface-alt)',
              color: 'var(--text-sub)',
              border: '1px solid var(--border)',
            }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {sub === 'songs'  && <SongsSection />}
          {sub === 'movies' && <MoviesSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
