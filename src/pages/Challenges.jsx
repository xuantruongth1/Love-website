import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Check, Plus, Trash2, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Modal from '@/components/shared/Modal'
import * as api from '@/services/api'

const TYPE_LABELS = { daily: '📅 Hàng ngày', weekly: '🗓️ Tuần này', special: '⭐ Đặc biệt' }

function ChallengeCard({ ch, myRole, isAdmin, onToggle, onDelete }) {
  const boyDone  = !!ch.boy_done
  const girlDone = !!ch.girl_done
  const bothDone = boyDone && girlDone
  const myDone   = myRole === 'boy' ? boyDone : girlDone

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`card p-4 relative transition-all duration-300
        ${bothDone ? 'border-2 border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10' : ''}`}
    >
      {/* Both done ribbon */}
      {bothDone && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          ✓ Cả hai xong!
        </span>
      )}

      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(ch.id, myDone)}
          className={`mt-0.5 w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all
            ${myDone
              ? 'bg-primary text-white shadow-pink'
              : 'border-2 border-[var(--border)] hover:border-primary'}`}
        >
          {myDone && <Check size={14} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-body text-[var(--text-sub)] bg-[var(--surface-alt)] px-2 py-0.5 rounded-full">
              {TYPE_LABELS[ch.type] || ch.type}
            </span>
          </div>
          <p className={`font-heading font-semibold text-[var(--text-main)] leading-snug
            ${myDone ? 'line-through opacity-60' : ''}`}>
            {ch.title}
          </p>
          {ch.description && (
            <p className="text-xs font-body text-[var(--text-sub)] mt-1 leading-relaxed">
              {ch.description}
            </p>
          )}

          {/* Status badges */}
          <div className="flex gap-2 mt-2">
            <span className={`flex items-center gap-1 text-[10px] font-body px-2 py-0.5 rounded-full
              ${boyDone ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-[var(--surface-alt)] text-[var(--text-sub)]'}`}>
              👦 {boyDone ? 'Anh xong ✓' : 'Anh chưa'}
            </span>
            <span className={`flex items-center gap-1 text-[10px] font-body px-2 py-0.5 rounded-full
              ${girlDone ? 'bg-pink-100 text-primary dark:bg-pink-900/20' : 'bg-[var(--surface-alt)] text-[var(--text-sub)]'}`}>
              👧 {girlDone ? 'Em xong ✓' : 'Em chưa'}
            </span>
          </div>
        </div>

        {isAdmin && (
          <button onClick={() => onDelete(ch.id)}
            className="p-1.5 rounded-lg text-[var(--text-sub)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

function AddChallengeModal({ onSave, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', type: 'daily' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Tiêu đề *</label>
        <input value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="VD: Hôm nay hãy gửi cho nhau một bức ảnh selfie"
          className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                      text-[var(--text-main)] placeholder:text-[var(--text-sub)] focus:outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Mô tả thêm</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Chi tiết thử thách..."
          rows={2}
          className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                      text-[var(--text-main)] placeholder:text-[var(--text-sub)] resize-none focus:outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-xs font-body text-[var(--text-sub)] mb-1">Loại</label>
        <select value={form.type} onChange={e => set('type', e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                      text-[var(--text-main)] focus:outline-none focus:border-primary">
          <option value="daily">📅 Hàng ngày</option>
          <option value="weekly">🗓️ Tuần này</option>
          <option value="special">⭐ Đặc biệt</option>
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={handleSave} disabled={!form.title.trim() || saving}
          className="btn-primary flex-1 disabled:opacity-50">
          {saving ? 'Đang lưu...' : '⚡ Thêm thử thách'}
        </button>
        <button onClick={onClose} className="btn-outline px-4">Hủy</button>
      </div>
    </div>
  )
}

export default function Challenges() {
  const { role, isAdmin } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)

  useEffect(() => {
    api.getChallenges()
      .then(data => { setChallenges(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleToggle = async (id, isDone) => {
    try {
      const updated = isDone
        ? await api.markChallUndone(id)
        : await api.markChallDone(id)
      setChallenges(prev => prev.map(c => c.id === id ? updated : c))
    } catch (e) { alert(e.message) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa thử thách này?')) return
    try {
      await api.deleteChallenge(id)
      setChallenges(prev => prev.filter(c => c.id !== id))
    } catch (e) { alert(e.message) }
  }

  const handleAdd = async (form) => {
    const created = await api.addChallenge(form)
    setChallenges(prev => [created, ...prev])
    setModalOpen(false)
  }

  const active    = challenges.filter(c => !(c.boy_done && c.girl_done))
  const completed = challenges.filter(c => c.boy_done && c.girl_done)

  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      <div className="max-w-xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="section-title">Thử Thách Tình Yêu</h1>
          <p className="section-subtitle">Cùng nhau hoàn thành những điều nhỏ xinh mỗi ngày ⚡</p>
        </motion.div>

        {/* Progress */}
        {challenges.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card mb-8 p-4 text-center">
            <p className="font-body text-sm text-[var(--text-sub)] mb-2">Đã hoàn thành cùng nhau</p>
            <p className="font-heading text-3xl font-bold text-primary">
              {completed.length}<span className="text-lg text-[var(--text-sub)]">/{challenges.length}</span>
            </p>
            <div className="w-full bg-[var(--surface-alt)] rounded-full h-2 mt-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${challenges.length ? (completed.length / challenges.length) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Active challenges */}
            <div className="mb-8">
              {active.length === 0 && completed.length === 0 ? (
                <div className="text-center py-16">
                  <Zap size={48} className="mx-auto text-[var(--text-sub)] mb-4 opacity-30" />
                  <p className="font-body text-[var(--text-sub)]">Chưa có thử thách nào</p>
                  {isAdmin && (
                    <button onClick={() => setModalOpen(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
                      <Plus size={16} /> Thêm thử thách đầu tiên
                    </button>
                  )}
                </div>
              ) : active.length > 0 ? (
                <div className="space-y-3">
                  <p className="font-heading font-semibold text-sm text-[var(--text-sub)] mb-3 uppercase tracking-wide">
                    Đang chờ — {active.length}
                  </p>
                  <AnimatePresence>
                    {active.map(ch => (
                      <ChallengeCard key={ch.id} ch={ch} myRole={role} isAdmin={isAdmin}
                        onToggle={handleToggle} onDelete={handleDelete} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : null}
            </div>

            {/* Completed */}
            {completed.length > 0 && (
              <div>
                <p className="font-heading font-semibold text-sm text-[var(--text-sub)] mb-3 uppercase tracking-wide">
                  Đã hoàn thành cùng nhau — {completed.length}
                </p>
                <div className="space-y-3">
                  <AnimatePresence>
                    {completed.map(ch => (
                      <ChallengeCard key={ch.id} ch={ch} myRole={role} isAdmin={isAdmin}
                        onToggle={handleToggle} onDelete={handleDelete} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isAdmin && (
        <motion.button
          onClick={() => setModalOpen(true)}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-white
                      shadow-pink-lg flex items-center justify-center z-40"
          title="Thêm thử thách">
          <Plus size={24} />
        </motion.button>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="⚡ Thêm thử thách mới">
        <AddChallengeModal onSave={handleAdd} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
