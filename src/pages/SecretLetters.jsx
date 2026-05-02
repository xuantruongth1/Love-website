import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mail, MailOpen, Trash2, Upload, X, Heart } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/services/api'

const MOODS = [
  { emoji: '💕', label: 'Yêu thương' },
  { emoji: '🥺', label: 'Nhớ nhung' },
  { emoji: '😊', label: 'Vui vẻ' },
  { emoji: '🌙', label: 'Bình yên' },
  { emoji: '🔥', label: 'Nóng bỏng' },
  { emoji: '😢', label: 'Buồn' },
]

const ROLE_INFO = {
  boy:  { name: 'Anh', emoji: '👦', color: '#4A90D9', bg: '#EBF4FF' },
  girl: { name: 'Em',  emoji: '👧', color: '#FF6B9D', bg: '#FFF0F5' },
}

export default function SecretLetters() {
  const { role, name, emoji, clearUnread } = useAuth()
  const [letters, setLetters] = useState([])
  const [tab, setTab]         = useState('inbox')   // 'inbox' | 'sent' | 'write'
  const [openId, setOpenId]   = useState(null)
  const [form, setForm]       = useState({ content: '', mood: '', image_url: '' })
  const [sending, setSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const partner = role === 'boy' ? ROLE_INFO.girl : ROLE_INFO.boy
  const me      = ROLE_INFO[role] || ROLE_INFO.boy

  useEffect(() => {
    api.getLetters().then(setLetters).catch(console.error)
  }, [])

  useEffect(() => {
    if (tab === 'inbox') clearUnread()
  }, [tab])

  const inbox = letters.filter(l => l.to_role === role)
  const sent  = letters.filter(l => l.from_role === role)

  const handleOpen = async (letter) => {
    setOpenId(letter.id)
    if (!letter.is_read && letter.to_role === role) {
      await api.markRead(letter.id)
      setLetters(prev => prev.map(l => l.id === letter.id ? { ...l, is_read: 1 } : l))
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!form.content.trim()) return
    setSending(true)
    try {
      const letter = await api.sendLetter(form)
      setLetters(prev => [letter, ...prev])
      setForm({ content: '', mood: '', image_url: '' })
      setTab('sent')
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa thư này?')) return
    await api.deleteLetter(id)
    setLetters(prev => prev.filter(l => l.id !== id))
    if (openId === id) setOpenId(null)
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const { url } = await api.uploadImage(file)
      setForm(f => ({ ...f, image_url: url }))
    } catch (err) {
      alert('Lỗi tải ảnh: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const openedLetter = letters.find(l => l.id === openId)

  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-5xl mb-3">💌</div>
          <h1 className="section-title">Hộp Thư Bí Mật</h1>
          <p className="section-subtitle">
            Chỉ có {me.name} và {partner.name} mới đọc được thư của nhau
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex rounded-2xl bg-[var(--surface-alt)] p-1 mb-6 gap-1">
          {[
            { key: 'inbox', label: `Thư đến`,  icon: Mail,     count: inbox.filter(l => !l.is_read).length },
            { key: 'sent',  label: `Đã gửi`,  icon: MailOpen, count: 0 },
            { key: 'write', label: `Viết thư`, icon: Send,    count: 0 },
          ].map(({ key, label, icon: Icon, count }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-body font-semibold transition-all relative
                ${tab === key ? 'bg-white dark:bg-[var(--surface)] shadow text-primary' : 'text-[var(--text-sub)] hover:text-primary'}`}>
              <Icon size={15} /> {label}
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* INBOX */}
          {tab === 'inbox' && (
            <motion.div key="inbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {inbox.length === 0 ? (
                <div className="text-center py-16">
                  <Mail size={48} className="mx-auto text-[var(--text-sub)] opacity-30 mb-3" />
                  <p className="font-body text-[var(--text-sub)]">Chưa có thư nào từ {partner.name}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inbox.map(letter => (
                    <motion.div key={letter.id} layout
                      className={`card cursor-pointer transition-all hover:scale-[1.01] ${!letter.is_read ? 'ring-2 ring-primary/30' : ''}`}
                      onClick={() => handleOpen(letter)}>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{partner.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-body font-semibold text-sm text-[var(--text-main)]">
                              Thu tu {partner.name} {letter.mood && <span>{letter.mood}</span>}
                            </p>
                            {!letter.is_read && (
                              <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-body">MỚI</span>
                            )}
                          </div>
                          <p className="font-body text-xs text-[var(--text-sub)] truncate">{letter.content}</p>
                          <p className="font-body text-[10px] text-[var(--text-sub)] mt-0.5">
                            {new Date(letter.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <Mail size={16} className={letter.is_read ? 'text-[var(--text-sub)]' : 'text-primary'} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* SENT */}
          {tab === 'sent' && (
            <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {sent.length === 0 ? (
                <div className="text-center py-16">
                  <Send size={48} className="mx-auto text-[var(--text-sub)] opacity-30 mb-3" />
                  <p className="font-body text-[var(--text-sub)]">Chưa gửi thư nào cho {partner.name}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sent.map(letter => (
                    <div key={letter.id} className="card flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-all"
                         onClick={() => handleOpen(letter)}>
                      <div className="text-2xl">{me.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-sm text-[var(--text-main)]">
                          Gui cho {partner.name} {letter.mood}
                        </p>
                        <p className="font-body text-xs text-[var(--text-sub)] truncate">{letter.content}</p>
                        <p className="font-body text-[10px] text-[var(--text-sub)] mt-0.5">
                          {letter.is_read ? '✓ Đã đọc' : '○ Chưa đọc'} · {new Date(letter.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(letter.id) }}
                        className="p-1.5 rounded-lg text-red-400 hover:opacity-70">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* WRITE */}
          {tab === 'write' && (
            <motion.form key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleSend} className="card space-y-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{me.emoji}</div>
                <div>
                  <p className="font-body font-semibold text-[var(--text-main)]">
                    {me.name} → {partner.name} {partner.emoji}
                  </p>
                  <p className="font-body text-xs text-[var(--text-sub)]">Chỉ {partner.name} mới đọc được</p>
                </div>
              </div>

              {/* Chon mood */}
              <div>
                <p className="font-body text-xs text-[var(--text-sub)] mb-2">Cảm xúc (tùy chọn)</p>
                <div className="flex gap-2 flex-wrap">
                  {MOODS.map(m => (
                    <button key={m.emoji} type="button"
                      onClick={() => setForm(f => ({ ...f, mood: f.mood === m.emoji ? '' : m.emoji }))}
                      className={`text-xl w-10 h-10 rounded-xl transition-all ${form.mood === m.emoji ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-[var(--surface-alt)] hover:scale-110'}`}>
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Noi dung */}
              <div>
                <label className="block font-body text-xs mb-1 text-[var(--text-sub)]">Nội dung thư *</label>
                <textarea rows={6} value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder={`Viết gì đó cho ${partner.name} nhé...`} required
                  className="w-full rounded-xl px-3 py-2 text-sm font-body outline-none resize-none bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-main)]" />
              </div>

              {/* Anh kem */}
              <div>
                <label className="block font-body text-xs mb-2 text-[var(--text-sub)]">Hình ảnh kèm (tùy chọn)</label>
                <label className="cursor-pointer inline-flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-xl font-body text-xs font-semibold transition-colors">
                  <Upload size={14} /> {isUploading ? 'Đang tải...' : 'Chọn ảnh'}
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={isUploading} />
                </label>
                {form.image_url && (
                  <div className="relative inline-block mt-2 ml-2">
                    <img src={form.image_url} alt="" className="w-20 h-20 object-cover rounded-xl" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              <button type="submit" disabled={sending || isUploading}
                className="btn-primary w-full py-3 rounded-xl font-body font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                <Send size={16} />
                {sending ? 'Đang gửi...' : `Gửi thư cho ${partner.name} ${partner.emoji}`}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Modal xem chi tiet thu */}
        <AnimatePresence>
          {openedLetter && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setOpenId(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="card max-w-md w-full space-y-4 max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {openedLetter.from_role === role ? me.emoji : partner.emoji}
                    </span>
                    <div>
                      <p className="font-body font-semibold text-sm text-[var(--text-main)]">
                        {openedLetter.from_role === role ? `${me.name} gui` : `${partner.name} gui`}
                        {openedLetter.mood && <span className="ml-1">{openedLetter.mood}</span>}
                      </p>
                      <p className="font-body text-xs text-[var(--text-sub)]">
                        {new Date(openedLetter.created_at).toLocaleDateString('vi-VN', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setOpenId(null)} className="p-1.5 rounded-lg text-[var(--text-sub)] hover:opacity-70">
                    <X size={18} />
                  </button>
                </div>

                {openedLetter.image_url && (
                  <img src={openedLetter.image_url} alt="" className="w-full rounded-xl object-cover max-h-60" />
                )}

                <p className="font-body text-sm leading-relaxed text-[var(--text-main)] whitespace-pre-wrap">
                  {openedLetter.content}
                </p>

                <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                  {openedLetter.from_role === role && (
                    <button onClick={() => handleDelete(openedLetter.id)}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:opacity-70 font-body">
                      <Trash2 size={13} /> Xóa thư
                    </button>
                  )}
                  <button onClick={() => setOpenId(null)}
                    className="ml-auto flex items-center gap-1.5 text-xs text-[var(--text-sub)] hover:opacity-70 font-body">
                    Dong
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
