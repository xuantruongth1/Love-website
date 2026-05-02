import { useState, useEffect, useRef } from 'react'
import { Check, Camera } from 'lucide-react'
import * as api from '@/services/api'
import { useAuth } from '@/context/AuthContext'

function AvatarUploader({ label, emoji, currentUrl, onUploaded }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const data = await api.uploadImage(file)
      onUploaded(data.url)
    } catch {
      alert('Upload thất bại, thử lại nhé!')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-body text-xs text-[var(--text-sub)]">{label}</p>
      <button type="button" onClick={() => inputRef.current?.click()}
        className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--border)] hover:border-primary transition-colors group">
        {currentUrl
          ? <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
          : <span className="flex items-center justify-center w-full h-full bg-[var(--surface-alt)] text-3xl">{emoji}</span>
        }
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Camera size={20} className="text-white" />
          }
        </div>
      </button>
      <p className="font-body text-[10px] text-[var(--text-sub)]">Nhấn để đổi ảnh</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

export default function TabSettings() {
  const { role, setAvatar } = useAuth()
  const [form, setForm]     = useState({})
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getConfig().then(data => { setForm(data); setLoading(false) }).catch(console.error)
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    await api.saveConfig(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarUploaded = async (field, url) => {
    const updated = { ...form, [field]: url }
    setForm(updated)
    await api.saveConfig(updated)
    if ((field === 'boyAvatar' && role === 'boy') || (field === 'girlAvatar' && role === 'girl')) {
      setAvatar(url)
    }
  }

  if (loading) return <p className="font-body text-sm text-center py-8 text-[var(--text-sub)]">Đang tải cài đặt...</p>

  return (
    <div className="space-y-4">
      {/* Avatar section */}
      <div className="card">
        <p className="font-body font-semibold text-sm text-[var(--text-main)] mb-4">Ảnh Đại Diện</p>
        <div className="flex justify-around">
          <AvatarUploader
            label="Anh (MaiTruongg)"
            emoji="👦"
            currentUrl={form.boyAvatar || ''}
            onUploaded={(url) => handleAvatarUploaded('boyAvatar', url)}
          />
          <AvatarUploader
            label="Em (PhLien)"
            emoji="👧"
            currentUrl={form.girlAvatar || ''}
            onUploaded={(url) => handleAvatarUploaded('girlAvatar', url)}
          />
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <p className="font-body font-semibold text-sm text-[var(--text-main)]">Cài đặt Trang</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Tên của Admin (Bạn)</label>
              <input type="text" value={form.boyName || ''} onChange={e => handleChange('boyName', e.target.value)} required
                className="input-field" />
            </div>
            <div>
              <label className="field-label">Tên Người Yêu</label>
              <input type="text" value={form.girlName || ''} onChange={e => handleChange('girlName', e.target.value)} required
                className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Ngày bắt đầu yêu</label>
              <input type="date" value={form.anniversaryDate || ''} onChange={e => handleChange('anniversaryDate', e.target.value)} required
                className="input-field" />
            </div>
            <div>
              <label className="field-label">Ngày sinh Người Yêu</label>
              <input type="date" value={form.girlBirthday || ''} onChange={e => handleChange('girlBirthday', e.target.value)} required
                className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Mật khẩu trang chính</label>
              <input type="text" value={form.password || ''} onChange={e => handleChange('password', e.target.value)} required
                className="input-field" />
            </div>
            <div>
              <label className="field-label">Mật khẩu Admin</label>
              <input type="text" value={form.adminPassword || ''} onChange={e => handleChange('adminPassword', e.target.value)} required
                className="input-field" />
            </div>
          </div>

          <div>
            <label className="field-label">Tagline trang chủ</label>
            <input type="text" value={form.landingTagline || ''} onChange={e => handleChange('landingTagline', e.target.value)}
              className="input-field" />
          </div>

          <div>
            <label className="field-label">Nội dung thư tình (Letter)</label>
            <textarea rows={6} value={form.letterContent || ''} onChange={e => handleChange('letterContent', e.target.value)}
              className="input-field resize-none" />
          </div>

          <button type="submit" className="btn-primary flex justify-center items-center gap-2 w-full py-3 rounded-xl text-sm font-body font-semibold">
            {saved ? <><Check size={18}/> Đã lưu thành công</> : 'Lưu cài đặt'}
          </button>
        </form>
      </div>

      <div className="rounded-xl p-3 font-body text-xs flex items-start gap-2"
        style={{ background: 'rgba(255,107,157,0.07)', border: '1px solid rgba(255,107,157,0.25)', color: 'var(--text-sub)' }}>
        <span className="text-sm flex-shrink-0">💡</span>
        Dữ liệu được lưu vào SQLite database trên server. Thay đổi có hiệu lực ngay lập tức.
      </div>
    </div>
  )
}
