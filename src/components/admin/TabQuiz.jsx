import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, ListChecks, X, Save, CheckCircle } from 'lucide-react'
import * as api from '@/services/api'

// ── Bulk-edit row ────────────────────────────────────────────────────
function BulkRow({ idx, draft, onChange }) {
  const opts = draft.options

  return (
    <div className="border border-[var(--border)] rounded-xl p-3 bg-[var(--surface)] space-y-2">
      {/* Question */}
      <div className="flex items-start gap-2">
        <span className="font-body text-xs text-[var(--text-sub)] mt-2 w-6 flex-shrink-0 text-right">#{idx+1}</span>
        <input
          value={draft.question}
          onChange={e => onChange({ ...draft, question: e.target.value })}
          className="flex-1 rounded-lg px-2 py-1.5 text-sm font-body bg-[var(--surface-alt)] border border-[var(--border)]
                     text-[var(--text-main)] focus:outline-none focus:border-primary"
        />
      </div>

      {/* Options — 2×2 grid, radio = correct answer */}
      <div className="grid grid-cols-2 gap-1.5 ml-8">
        {opts.map((opt, i) => (
          <label
            key={i}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 cursor-pointer transition-colors
                         ${draft.answer === i
                           ? 'bg-green-100 dark:bg-green-900/30 ring-1 ring-green-400'
                           : 'bg-[var(--surface-alt)] hover:bg-primary/5'
                         }`}
          >
            <input
              type="radio"
              name={`answer-${draft.id}`}
              checked={draft.answer === i}
              onChange={() => onChange({ ...draft, answer: i })}
              className="accent-green-500 flex-shrink-0"
            />
            <input
              value={opt}
              onChange={e => {
                const o = [...opts]; o[i] = e.target.value
                onChange({ ...draft, options: o })
              }}
              placeholder={`Đáp án ${String.fromCharCode(65+i)}`}
              className={`flex-1 min-w-0 text-xs font-body bg-transparent outline-none
                           ${draft.answer === i ? 'text-green-700 dark:text-green-300 font-semibold' : 'text-[var(--text-main)]'}`}
            />
          </label>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────
export default function TabQuiz() {
  const [items,     setItems]     = useState([])
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState({ id: null, question: '', options: ['','','',''], answer: 0 })
  const [saving,    setSaving]    = useState(false)

  // Bulk-edit state
  const [bulkMode,   setBulkMode]   = useState(false)
  const [drafts,     setDrafts]     = useState([])   // copy of items for editing
  const [bulkSaving, setBulkSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(null)

  const load = () => api.getQuiz().then(setItems).catch(console.error)
  useEffect(() => { load() }, [])

  // ── Single-edit ────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.question.trim() || form.options.some(o => !o.trim())) {
      alert('Điền đầy đủ câu hỏi và 4 đáp án!'); return
    }
    setSaving(true)
    try {
      const payload = { question: form.question, options: form.options, answer: Number(form.answer) }
      if (form.id) {
        await api.updateQuiz(form.id, payload)
      } else {
        await api.addQuiz(payload)
      }
      setForm({ id: null, question: '', options: ['','','',''], answer: 0 })
      setShowForm(false)
      await load()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa câu hỏi này?')) return
    await api.deleteQuiz(id)
    await load()
  }

  const handleEdit = (item) => {
    setForm({ id: item.id, question: item.question, options: [...item.options], answer: item.answer })
    setShowForm(true)
    setBulkMode(false)
  }

  // ── Bulk-edit ──────────────────────────────────────────────────
  const enterBulk = () => {
    setDrafts(items.map(it => ({ ...it, options: [...it.options] })))
    setBulkMode(true)
    setShowForm(false)
    setSavedCount(null)
  }

  const exitBulk = () => { setBulkMode(false); setDrafts([]) }

  const updateDraft = useCallback((id, newDraft) => {
    setDrafts(prev => prev.map(d => d.id === id ? newDraft : d))
  }, [])

  const handleBulkSave = async () => {
    setBulkSaving(true)
    setSavedCount(null)
    try {
      // Only save rows that actually changed
      const changed = drafts.filter(d => {
        const orig = items.find(i => i.id === d.id)
        if (!orig) return true
        return orig.question !== d.question
          || orig.answer !== d.answer
          || orig.options.some((o, i) => o !== d.options[i])
      })

      await Promise.all(changed.map(d =>
        api.updateQuiz(d.id, { question: d.question, options: d.options, answer: d.answer })
      ))

      setSavedCount(changed.length)
      await load()
      setTimeout(() => { setBulkMode(false); setDrafts([]) }, 1200)
    } catch (err) {
      alert('Lỗi lưu: ' + err.message)
    } finally {
      setBulkSaving(false)
    }
  }

  // ── Bulk-edit mode render ──────────────────────────────────────
  if (bulkMode) return (
    <div className="space-y-3">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 bg-[var(--background)] py-2 flex items-center justify-between gap-3 border-b border-[var(--border)]">
        <p className="font-body text-sm text-[var(--text-sub)]">
          Đang sửa <span className="font-semibold text-[var(--text-main)]">{drafts.length}</span> câu hỏi
          <span className="ml-1 text-xs opacity-70">— radio xanh = đáp án đúng</span>
        </p>
        <div className="flex gap-2">
          <button onClick={exitBulk}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-body font-semibold
                       border border-[var(--border)] text-[var(--text-sub)] hover:border-primary transition-colors">
            <X size={13}/> Hủy
          </button>
          <button onClick={handleBulkSave} disabled={bulkSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-body font-semibold
                       bg-primary text-white hover:bg-accent transition-colors disabled:opacity-60">
            {bulkSaving
              ? <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> Đang lưu...</>
              : <><Save size={13}/> Lưu tất cả</>
            }
          </button>
        </div>
      </div>

      {/* Success flash */}
      <AnimatePresence>
        {savedCount !== null && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-300 text-green-700 dark:text-green-300"
          >
            <CheckCircle size={15}/> <span className="font-body text-sm font-semibold">Đã lưu {savedCount} câu thay đổi!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All rows */}
      <div className="space-y-2">
        {drafts.map((draft, idx) => (
          <BulkRow
            key={draft.id}
            idx={idx}
            draft={draft}
            onChange={(updated) => updateDraft(draft.id, updated)}
          />
        ))}
      </div>

      {/* Bottom save button */}
      <button onClick={handleBulkSave} disabled={bulkSaving}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-body font-semibold
                   bg-primary text-white hover:bg-accent transition-colors disabled:opacity-60">
        {bulkSaving ? 'Đang lưu...' : <><Save size={15}/> Lưu tất cả</>}
      </button>
    </div>
  )

  // ── Normal mode render ────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-body text-sm text-[var(--text-sub)]">{items.length} câu hỏi</p>
        <div className="flex gap-2">
          <button onClick={enterBulk}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body font-semibold
                       border border-primary text-primary hover:bg-primary/10 transition-colors">
            <ListChecks size={15}/> Sửa tất cả
          </button>
          <button onClick={() => { setForm({ id:null, question:'', options:['','','',''], answer:0 }); setShowForm(v => !v) }}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
            <Plus size={15} /> {showForm ? 'Đóng' : 'Thêm câu hỏi'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave} className="card card-form space-y-3 overflow-hidden"
          >
            <p className="font-body font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{form.id ? 'Sửa câu hỏi' : 'Câu hỏi mới'}</p>
            <div>
              <label className="field-label">Câu hỏi *</label>
              <input type="text" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                placeholder="Em có biết anh thích gì không?" required
                className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="field-label">4 Đáp án — radio xanh = đáp án đúng</label>
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" name="answer" value={i} checked={form.answer === i}
                    onChange={() => setForm(f => ({ ...f, answer: i }))} className="accent-primary" />
                  <input type="text" value={opt} onChange={e => setForm(f => { const o = [...f.options]; o[i] = e.target.value; return { ...f, options: o } })}
                    placeholder={`Đáp án ${String.fromCharCode(65+i)}`} required
                    className="input-field flex-1" />
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm font-body font-semibold disabled:opacity-60">
              {saving ? 'Đang lưu...' : 'Lưu câu hỏi'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item.id} className="card">
            <div className="flex items-start gap-2">
              <span className="font-body text-xs text-[var(--text-sub)] mt-0.5 flex-shrink-0">#{idx+1}</span>
              <p className="flex-1 font-body text-sm font-semibold text-[var(--text-main)]">{item.question}</p>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => handleEdit(item)} className="p-1 rounded hover:opacity-70 text-[var(--text-sub)]"><Edit2 size={13}/></button>
                <button onClick={() => handleDelete(item.id)} className="p-1 rounded hover:opacity-70 text-red-500"><Trash2 size={13}/></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {item.options.map((opt, i) => (
                <span key={i} className={`text-xs font-body px-2 py-1 rounded-lg ${i === item.answer ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold' : 'bg-[var(--surface-alt)] text-[var(--text-sub)]'}`}>
                  {String.fromCharCode(65+i)}. {opt}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
